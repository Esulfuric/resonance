
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ProfileEditProps {
  profileData: {
    id: string;
    full_name: string;
    username: string;
    bio: string;
    user_type?: 'musician' | 'listener';
    avatar_url?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileEditor({ profileData, onSave, onCancel }: ProfileEditProps) {
  const [formData, setFormData] = useState(profileData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, user_type: value as 'musician' | 'listener' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          user_type: formData.user_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileData.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      onSave();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input 
          id="full_name"
          name="full_name"
          value={formData.full_name} 
          onChange={handleChange}
          placeholder="Your full name" 
        />
      </div>
      
      <div>
        <Label htmlFor="username">Username</Label>
        <Input 
          id="username"
          name="username"
          value={formData.username} 
          onChange={handleChange}
          placeholder="Your username" 
        />
      </div>
      
      <div>
        <Label htmlFor="user_type">I am a</Label>
        <Select 
          value={formData.user_type} 
          onValueChange={handleUserTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="musician">Musician</SelectItem>
            <SelectItem value="listener">Listener</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio"
          name="bio"
          value={formData.bio} 
          onChange={handleChange}
          placeholder="Tell us about yourself"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
