
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="resonance-hero py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Logo className="h-16 md:h-20 mx-auto mb-4" />
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Music Lives Here
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Connect with friends, share your favorite tracks, and discover new music from around the world.
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/signup">
                  <Button className="bg-resonance-green hover:bg-resonance-green/90">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-resonance-green p-3 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Share Your Music</h3>
                  <p className="text-gray-500">
                    Post your favorite songs, albums, and playlists for friends to discover.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-resonance-green p-3 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Connect with Friends</h3>
                  <p className="text-gray-500">
                    Follow your friends and favorite artists to see what they're listening to.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-resonance-green p-3 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Discover New Sounds</h3>
                  <p className="text-gray-500">
                    Explore trending music and get personalized recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                  Join the Community
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Join thousands of music lovers sharing their passion every day.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Link to="/signup">
                  <Button className="w-full bg-resonance-green hover:bg-resonance-green/90">
                    Sign Up Now
                  </Button>
                </Link>
                <p className="text-xs text-gray-500">
                  Already have an account?{" "}
                  <Link to="/login" className="text-resonance-green underline underline-offset-2">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm text-gray-500 md:text-left">
            © 2025 Resonance. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-sm text-gray-500 underline underline-offset-2">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 underline underline-offset-2">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
