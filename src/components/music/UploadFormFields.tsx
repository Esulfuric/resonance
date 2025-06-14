
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  title: string;
  albumName: string;
  composerFullName: string;
  coverArt: File | null;
}

interface UploadFormFieldsProps {
  uploadType: 'single' | 'album';
  setUploadType: (type: 'single' | 'album') => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function UploadFormFields({ uploadType, setUploadType, formData, setFormData }: UploadFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="uploadType">Upload Type</Label>
        <Select value={uploadType} onValueChange={(value: 'single' | 'album') => setUploadType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select upload type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="album">Album</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          {uploadType === 'album' ? 'Album Title' : 'Song Title'} *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={uploadType === 'album' ? 'Enter album title' : 'Enter song title'}
          required
        />
      </div>

      {uploadType === 'album' && (
        <div className="space-y-2">
          <Label htmlFor="albumName">Album Name *</Label>
          <Input
            id="albumName"
            value={formData.albumName}
            onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
            placeholder="Enter album name"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="composerFullName">Composer Full Name *</Label>
        <Input
          id="composerFullName"
          value={formData.composerFullName}
          onChange={(e) => setFormData({ ...formData, composerFullName: e.target.value })}
          placeholder="Enter composer's full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverArt">
          {uploadType === 'album' ? 'Album' : 'Song'} Cover Art
        </Label>
        <Input
          id="coverArt"
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, coverArt: e.target.files?.[0] || null })}
        />
      </div>
    </>
  );
}
