
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/lib/supabase-provider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileData {
  id: string;
  full_name?: string;
  username?: string;
  bio?: string;
  user_type?: 'musician' | 'listener';
}

interface ProfileEditorProps {
  profileData: ProfileData;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileEditor({ profileData, onSave, onCancel }: ProfileEditorProps) {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profileData.full_name || '',
    username: profileData.username || '',
    bio: profileData.bio || '',
    user_type: profileData.user_type || 'listener'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Check if username is already taken (if changed)
      if (formData.username !== profileData.username && formData.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          toast({
            title: "Username taken",
            description: "This username is already in use. Please choose another.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          user_type: formData.user_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update auth metadata if needed
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          user_type: formData.user_type
        }
      });

      if (authError) {
        console.warn('Could not update auth metadata:', authError);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      onSave();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="user_type" className="block text-sm font-medium mb-2">
              Account Type
            </label>
            <Select
              value={formData.user_type}
              onValueChange={(value: 'musician' | 'listener') => 
                setFormData({ ...formData, user_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="listener">Listener</SelectItem>
                <SelectItem value="musician">Musician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
