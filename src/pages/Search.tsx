
import { UserSearch } from "@/components/UserSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";

const SearchPage = () => {
  const { isLoading } = useAuthGuard();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Find People</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSearch />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-secondary rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">#NewMusic</div>
              <div className="px-3 py-1 bg-secondary rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Pop</div>
              <div className="px-3 py-1 bg-secondary rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Hip Hop</div>
              <div className="px-3 py-1 bg-secondary rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Rock</div>
              <div className="px-3 py-1 bg-secondary rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Indie</div>
              <div className="px-3 py-1 bg-secondary rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Electronic</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;
