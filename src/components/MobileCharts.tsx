
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileCharts = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="text-center text-muted-foreground p-4">
        <p className="text-sm">Charts are now available in the Music section</p>
      </div>
    </div>
  );
};
