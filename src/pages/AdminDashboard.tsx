import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  LogOut, 
  Trash2, 
  Ban, 
  Music, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Users,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_removed: boolean;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  } | null;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_banned: boolean;
  user_type: string;
}

interface MusicUploadWithProfile {
  id: string;
  title: string;
  artist_id: string;
  composer_full_name: string;
  status: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [musicUploads, setMusicUploads] = useState<MusicUploadWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch posts with profiles
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          is_removed,
          profiles!posts_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_banned, user_type')
        .order('username');

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Fetch music uploads with profiles
      const { data: musicData, error: musicError } = await supabase
        .from('music_uploads')
        .select(`
          id,
          title,
          artist_id,
          composer_full_name,
          status,
          created_at,
          profiles!music_uploads_artist_id_fkey (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (musicError) {
        console.error('Error fetching music:', musicError);
      }

      // Transform and set the data with proper type safety
      setPosts((postsData || []).map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user_id: post.user_id,
        is_removed: post.is_removed,
        profiles: post.profiles ? {
          username: post.profiles.username || '',
          full_name: post.profiles.full_name || '',
          avatar_url: post.profiles.avatar_url || ''
        } : null
      })));

      setUsers((usersData || []).map(user => ({
        id: user.id,
        username: user.username || '',
        full_name: user.full_name || '',
        avatar_url: user.avatar_url || '',
        is_banned: user.is_banned,
        user_type: user.user_type || 'listener'
      })));

      setMusicUploads((musicData || []).map(upload => ({
        id: upload.id,
        title: upload.title,
        artist_id: upload.artist_id,
        composer_full_name: upload.composer_full_name,
        status: upload.status,
        created_at: upload.created_at,
        profiles: upload.profiles ? {
          username: upload.profiles.username || '',
          full_name: upload.profiles.full_name || ''
        } : null
      })));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/');
  };

  const handleRemovePost = async (postId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          is_removed: true,
          removal_reason: reason,
          removed_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post removed successfully');
      fetchData();
    } catch (error) {
      console.error('Error removing post:', error);
      toast.error('Failed to remove post');
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: reason,
          banned_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User banned successfully');
      fetchData();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleApproveMusicUpload = async (uploadId: string) => {
    try {
      const { error } = await supabase
        .from('music_uploads')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', uploadId);

      if (error) throw error;

      toast.success('Music upload approved');
      fetchData();
    } catch (error) {
      console.error('Error approving music:', error);
      toast.error('Failed to approve music');
    }
  };

  const handleRejectMusicUpload = async (uploadId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('music_uploads')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', uploadId);

      if (error) throw error;

      toast.success('Music upload rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting music:', error);
      toast.error('Failed to reject music');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingMusicCount = musicUploads.filter(upload => upload.status === 'pending').length;
  const totalUsers = users.length;
  const bannedUsers = users.filter(user => user.is_banned).length;
  const removedPosts = posts.filter(post => post.is_removed).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{totalUsers}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{bannedUsers}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Removed Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{removedPosts}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Music</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-500">{pendingMusicCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts">Posts Management</TabsTrigger>
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="music">Music Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Posts Management</CardTitle>
                <CardDescription>
                  Manage and moderate user posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.profiles?.avatar_url} />
                              <AvatarFallback>
                                {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {post.profiles?.full_name || post.profiles?.username || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {post.content}
                        </TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {post.is_removed ? (
                            <Badge variant="destructive">Removed</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!post.is_removed && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the post for violating content policies. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemovePost(post.id, "Content policy violation")}
                                  >
                                    Remove Post
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  Manage and moderate users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {user.full_name || user.username || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.user_type || 'listener'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.is_banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!user.is_banned && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ban User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will ban the user from accessing the platform. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleBanUser(user.id, "Content policy violation")}
                                  >
                                    Ban User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="music">
            <Card>
              <CardHeader>
                <CardTitle>Music Approval</CardTitle>
                <CardDescription>
                  Review and approve music submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Composer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {musicUploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell className="font-medium">
                          {upload.title}
                        </TableCell>
                        <TableCell>
                          {upload.profiles?.full_name || upload.profiles?.username || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {upload.composer_full_name}
                        </TableCell>
                        <TableCell>
                          {new Date(upload.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              upload.status === 'approved' ? 'default' :
                              upload.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {upload.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {upload.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveMusicUpload(upload.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Music Upload</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reject the music upload. The artist will be notified.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRejectMusicUpload(upload.id, "Quality standards not met")}
                                    >
                                      Reject Upload
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
