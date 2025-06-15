
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminMusicReview } from "@/components/admin/AdminMusicReview";
import { AdminPostModeration } from "@/components/admin/AdminPostModeration";
import { AdminUserModeration } from "@/components/admin/AdminUserModeration";
import { LogOut, Music, MessageSquare, Users, Shield } from "lucide-react";
import type { AdminUser } from "@/services/adminService";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    try {
      const adminData = JSON.parse(adminSession);
      setAdmin(adminData);
    } catch (error) {
      localStorage.removeItem('admin_session');
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/');
  };

  if (!admin) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {admin.username}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="music" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music Review
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Post Moderation
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="music" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Music Uploads</CardTitle>
                <p className="text-sm text-gray-600">
                  Review and approve or reject music submissions from artists
                </p>
              </CardHeader>
              <CardContent>
                <AdminMusicReview adminId={admin.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Moderation</CardTitle>
                <p className="text-sm text-gray-600">
                  Moderate user posts and remove content that violates policies
                </p>
              </CardHeader>
              <CardContent>
                <AdminPostModeration adminId={admin.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage user accounts and handle policy violations
                </p>
              </CardHeader>
              <CardContent>
                <AdminUserModeration adminId={admin.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
