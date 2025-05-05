
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

const suggestedUsers: SuggestedUser[] = [
  {
    id: 1,
    name: "Alex Kim",
    username: "alex_beats",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Electronic music producer",
  },
  {
    id: 2,
    name: "Mia Johnson",
    username: "mia_vibes",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Indie artist & songwriter",
  },
  {
    id: 3,
    name: "Jordan Lee",
    username: "jlee_music",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    bio: "DJ & music enthusiast",
  },
];

export function SuggestedUsers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
