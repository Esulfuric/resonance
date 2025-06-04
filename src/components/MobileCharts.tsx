
import { useIsMobile } from "@/hooks/use-mobile";
import { BillboardChart } from "@/components/BillboardChart";
import { LocationChart } from "@/components/LocationChart";

export const MobileCharts = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      <BillboardChart />
      <LocationChart />
    </div>
  );
};
