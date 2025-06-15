
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

  const handleGetStarted = () => {
    if (user) {
      navigate('/feed');
    } else {
      navigate('/login');
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
    <div className="min-h-screen bg-gradient-to-br from-resonance-green/10 to-resonance-orange/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-resonance-green animate-pulse"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-resonance-green to-resonance-orange bg-clip-text text-transparent">
              Resonance
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
            {user ? (
              <Button onClick={() => navigate('/feed')} className="bg-resonance-green hover:bg-resonance-green/90">
                Go to Feed
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button onClick={() => navigate('/signup')} className="bg-resonance-green hover:bg-resonance-green/90">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-resonance-green to-resonance-orange bg-clip-text text-transparent">
            Connect Through Music
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join a vibrant community of music lovers, discover new artists, and share your passion for music with like-minded people.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-resonance-green hover:bg-resonance-green/90 text-lg px-8 py-3"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Get Started"}
            </Button>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={signInWithGoogle}
                className="text-lg px-8 py-3"
                disabled={isLoading}
              >
                Sign in with Google
              </Button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-resonance-green/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-resonance-green" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Admin Login Button - Almost at bottom */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/admin/login')}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Log in as Admin
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Resonance. Connecting music lovers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
