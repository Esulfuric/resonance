
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getAllUsersForModeration, banUser } from "@/services/adminService";
import { Ban, Calendar, User } from "lucide-react";

interface AdminUserModerationProps {
  adminId: string;
}

export const AdminUserModeration = ({ adminId }: AdminUserModerationProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsersForModeration();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt("Please provide a reason for banning this user:");
    if (!reason) return;

    setActionLoading(userId);
    try {
      const result = await banUser(userId, adminId, reason);
      if (result.success) {
        toast({
          title: "User Banned",
          description: "The user has been banned for policy violation",
        });
        await fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to ban user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while banning the user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {users.map((user) => (
        <Card key={user.id} className={user.is_banned ? "border-l-4 border-l-red-500 opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.full_name || user.username || "Unknown User"}</h3>
                  <p className="text-sm text-gray-500">@{user.username || "no-username"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.user_type && (
                  <Badge variant="secondary" className="capitalize">
                    {user.user_type}
                  </Badge>
                )}
                {user.is_banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Button
                    onClick={() => handleBanUser(user.id)}
                    disabled={actionLoading === user.id}
                    variant="destructive"
                    size="sm"
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    {actionLoading === user.id ? "Banning..." : "Ban"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {user.is_banned ? (
              <div className="text-red-600 font-medium">
                This user has been banned because they don't follow the content policies
                <p className="text-sm text-gray-600 mt-1">Reason: {user.ban_reason}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Banned on: {new Date(user.banned_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <>
                {user.bio && (
                  <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(user.updated_at).toLocaleDateString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
