import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

// This is the landing page component
const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Connect Through Music
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Share your musical journey, discover new artists, and connect with others who share your passion for sound.
                </p>
              </div>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/signup">
                  <Button size="lg" className="bg-resonance-green hover:bg-resonance-green/90">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">Log In</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div 
                className="flex flex-col items-center text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-muted p-4 rounded-full">
                  <svg
                    className=" h-6 w-6"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Connect with Artists & Fans</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow your favorite artists and connect with fans who share your musical taste.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-muted p-4 rounded-full">
                  <svg
                    className=" h-6 w-6"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 17 17 2" />
                    <path d="m2 14 8 8" />
                    <path d="m5 14 3.5 2" />
                    <path d="M10 16c.5.6 1.1 1.1 1.7 1.7M14 12c.6.5 1.1 1.1 1.7 1.7M16 10c.6.5 1.1 1.1 1.7 1.7M20 7c.5.6 1.1 1.1 1.7 1.7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Share Your Music</h3>
                  <p className="text-sm text-muted-foreground">
                    Post your tracks, albums, and musical journey for others to enjoy and discover.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-muted p-4 rounded-full">
                  <svg
                    className=" h-6 w-6"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m9 12 2 2 4-4" />
                    <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
                    <path d="M22 19H2" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Discover New Music</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore a curated feed of music based on your preferences and connections.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Admin Access Button - Hidden on mobile */}
        <section className="py-8 border-t hidden md:block">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <Link to="/admin/login">
                <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  Log in as Admin
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
