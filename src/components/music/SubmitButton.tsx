
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { LoadingGif } from "@/components/ui/loading-gif";

interface SubmitButtonProps {
  isUploading: boolean;
}

export function SubmitButton({ isUploading }: SubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isUploading}
      className="w-full bg-resonance-orange hover:bg-resonance-orange/90"
    >
      {isUploading ? (
        <div className="flex items-center gap-2">
          <LoadingGif size="sm" />
          Uploading...
        </div>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-2" />
          Submit for Review
        </>
      )}
    </Button>
  );
}
