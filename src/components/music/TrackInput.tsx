
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  file: File | null;
}

interface TrackInputProps {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  uploadType: 'single' | 'album';
}

export function TrackInput({ tracks, setTracks, uploadType }: TrackInputProps) {
  const addTrack = () => {
    if (tracks.length < 20) {
      setTracks([...tracks, { id: Date.now().toString(), title: '', file: null }]);
    }
  };

  const removeTrack = (id: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(track => track.id !== id));
    }
  };

  const updateTrack = (id: string, field: 'title' | 'file', value: string | File) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, [field]: value } : track
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Tracks</Label>
        {uploadType === 'album' && tracks.length < 20 && (
          <Button type="button" variant="outline" size="sm" onClick={addTrack}>
            <Plus className="h-4 w-4 mr-2" />
            Add Track
          </Button>
        )}
      </div>

      {tracks.map((track, index) => (
        <div key={track.id} className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <Label>Track {index + 1}</Label>
            {tracks.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTrack(track.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Input
            placeholder="Track title"
            value={track.title}
            onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
          />
          
          <Input
            type="file"
            accept=".mp3"
            onChange={(e) => updateTrack(track.id, 'file', e.target.files?.[0] || null)}
          />
        </div>
      ))}
    </div>
  );
}
