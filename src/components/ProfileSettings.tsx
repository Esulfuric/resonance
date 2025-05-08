
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase-provider";
import { ProfilePasswordChange } from "./ProfilePasswordChange";

export function ProfileSettings() {
  const { user: supabaseUser } = useSupabase();

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium">Account Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your account preferences and settings.</p>
      </div>
      <div className="border rounded-lg divide-y">
        <div className="p-4">
          <h4 className="font-medium">Profile Information</h4>
          <p className="text-sm text-muted-foreground mt-1">Update how others see you on the platform</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2"
            onClick={() => document.getElementById("edit-profile-btn")?.click()}
          >
            Edit Profile
          </Button>
        </div>
        <div className="p-4">
          <h4 className="font-medium">Email & Password</h4>
          <p className="text-sm text-muted-foreground mt-1">Current email: {supabaseUser?.email}</p>
          <div className="mt-2">
            <ProfilePasswordChange />
          </div>
        </div>
      </div>
    </div>
  );
}
