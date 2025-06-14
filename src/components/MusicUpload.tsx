
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";
import { MusicUploadForm } from "./music/MusicUploadForm";

export function MusicUpload() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-resonance-orange" />
          Upload Music
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MusicUploadForm />
      </CardContent>
    </Card>
  );
}
