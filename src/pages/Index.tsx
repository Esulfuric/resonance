
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/lib/supabase-provider";
import { Music, Users, MessageCircle, Search, Shield } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, isLoading } = useSupabase();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/feed');
    } else {
      navigate('/login');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const features = [
    {
      icon: Music,
      title: "Discover Music",
      description: "Find new artists and tracks that match your taste"
    },
    {
      icon: Users,
      title: "Connect with Artists",
      description: "Follow your favorite musicians and interact with their content"
    },
    {
      icon: MessageCircle,
      title: "Share Your Thoughts",
      description: "Post about your favorite songs and engage with the community"
    },
    {
      icon: Search,
      title: "Explore & Search",
      description: "Search for users, posts, and discover trending content"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-resonance-green/10 to-resonance-green/5">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 py-4 sm:py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/32701c00-5314-407f-936e-f04c9aa95edf.png" 
                alt="Resonance Logo" 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageToggle />
              <ThemeToggle />
              {!user && (
                <div className="flex gap-1 sm:gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')}
                    disabled={isLoading}
                    size="sm"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    Log In
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')} 
                    className="bg-resonance-green hover:bg-resonance-green/90 text-xs sm:text-sm px-2 sm:px-4"
                    disabled={isLoading}
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full px-4 sm:px-6 py-8 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-resonance-green to-resonance-green/80 bg-clip-text text-transparent leading-tight">
              Connect Through Music
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join a vibrant community of music lovers, discover new artists, and share your passion for music with like-minded people.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-resonance-green hover:bg-resonance-green/90 text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Get Started"}
              </Button>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleGoogleSignIn}
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
                  disabled={googleLoading || isLoading}
                >
                  {googleLoading ? "Signing in..." : "Sign in with Google"}
                </Button>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20 px-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-2 sm:pb-4">
                    <div className="mx-auto mb-2 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 bg-resonance-green/10 rounded-full flex items-center justify-center">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-resonance-green" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center text-sm sm:text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Admin Login Button */}
      <div className="w-full px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/admin/login')}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 text-xs sm:text-sm"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              Log in as Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-muted/50 py-6 sm:py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <p className="text-muted-foreground text-sm sm:text-base">
            © 2024 Sulfuric Creations. Music made social. Connections made meaningful.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
