
import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  username?: string | null;
  userId: string;
  isOwnProfile: boolean;
  onAvatarChange?: (newUrl: string) => void;
}

export function ProfileAvatar({ 
  avatarUrl, 
  fullName, 
  username, 
  userId,
  isOwnProfile,
  onAvatarChange
}: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    try {
      setIsUploading(true);
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL of the uploaded file
      const { data: urlData } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = urlData.publicUrl;
      console.log("Avatar uploaded successfully:", avatarUrl);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });
      
      if (updateError) throw updateError;
      
      if (onAvatarChange) {
        onAvatarChange(avatarUrl);
      }
          
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const displayName = fullName || username || 'User';
  const initials = (displayName[0] || 'U').toUpperCase();
  
  return (
    <div className="relative group">
      <Avatar className={`h-24 w-24 md:h-32 md:w-32 avatar-ring ${isUploading ? 'opacity-50' : ''}`}
        onClick={handleAvatarClick}>
        <AvatarImage 
          src={avatarUrl || undefined} 
          alt={displayName}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      {isOwnProfile && (
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleAvatarClick}
        >
          <Camera className="h-6 w-6 text-white" />
          {isUploading && <span className="absolute inset-0 flex items-center justify-center text-white text-xs">Uploading...</span>}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarUpload} 
        accept="image/*" 
        className="hidden" 
        disabled={isUploading}
      />
    </div>
  );
}
