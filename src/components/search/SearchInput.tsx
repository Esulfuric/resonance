
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e?: React.FormEvent) => void;
  isSearching: boolean;
}

export const SearchInput = ({ searchQuery, setSearchQuery, onSearch, isSearching }: SearchInputProps) => {
  return (
    <form onSubmit={onSearch} className="relative mb-6 max-w-lg">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search for users, music, or posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-20 py-6"
      />
      <Button 
        type="submit"
        variant="default" 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-resonance-green hover:bg-resonance-green/90" 
        disabled={isSearching || !searchQuery.trim()}
      >
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </form>
  );
};
