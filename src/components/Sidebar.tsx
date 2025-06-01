
import { BillboardChart } from "@/components/BillboardChart";
import { LocationChart } from "@/components/LocationChart";

export const Sidebar = () => {
  return (
    <div className="space-y-6">
      <BillboardChart />
      <LocationChart />
    </div>
  );
};
