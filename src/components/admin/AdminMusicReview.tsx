
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getPendingMusicUploads, approveMusicUpload, rejectMusicUpload } from "@/services/adminService";
import { Check, X, Music, User, Calendar } from "lucide-react";
import type { PendingMusicUpload } from "@/services/adminService";

interface AdminMusicReviewProps {
  adminId: string;
}

export const AdminMusicReview = ({ adminId }: AdminMusicReviewProps) => {
  const [uploads, setUploads] = useState<PendingMusicUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const fetchPendingUploads = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingMusicUploads();
      setUploads(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending uploads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (uploadId: string) => {
    setActionLoading(uploadId);
    try {
      const result = await approveMusicUpload(uploadId, adminId);
      if (result.success) {
        toast({
          title: "Music Approved",
          description: "The music upload has been approved and the artist has been notified",
        });
        await fetchPendingUploads();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve music",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving the music",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uploadId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setActionLoading(uploadId);
    try {
      const result = await rejectMusicUpload(uploadId, adminId, reason);
      if (result.success) {
        toast({
          title: "Music Rejected",
          description: "The music upload has been rejected",
        });
        await fetchPendingUploads();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject music",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while rejecting the music",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading pending uploads...</div>;
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No pending music uploads to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {uploads.map((upload) => (
        <Card key={upload.id} className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{upload.title}</CardTitle>
                {upload.album_name && (
                  <p className="text-sm text-gray-600">Album: {upload.album_name}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {upload.artist_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(upload.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {upload.upload_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Composer: {upload.composer_full_name}</p>
              {upload.tracks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tracks:</p>
                  <ul className="space-y-1">
                    {upload.tracks.map((track) => (
                      <li key={track.id} className="text-sm text-gray-600">
                        {track.track_number ? `${track.track_number}. ` : ''}{track.track_title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {upload.cover_art_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cover Art:</p>
                <img 
                  src={upload.cover_art_url} 
                  alt="Cover art" 
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApprove(upload.id)}
                disabled={actionLoading === upload.id}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {actionLoading === upload.id ? "Approving..." : "Approve"}
              </Button>
              <Button
                onClick={() => handleReject(upload.id)}
                disabled={actionLoading === upload.id}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                {actionLoading === upload.id ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
