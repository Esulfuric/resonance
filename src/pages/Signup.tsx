
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { useSupabase } from "@/lib/supabase-provider";

const Signup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("listener"); // Default to listener
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Generate a bio based on user type selection
      const bio = userType === "musician" 
        ? "Musician sharing their musical journey." 
        : "Music enthusiast exploring new sounds.";

      const { error } = await signUp(email, password, {
        full_name: name,
        username: username,
        user_type: userType,
        bio: bio
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Welcome to Resonance! Check your email for confirmation.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center resonance-hero p-4 md:p-0">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/">
            <Logo className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold">Join Resonance</h1>
          <p className="text-gray-500">Create your account to get started</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>I am a:</Label>
                <RadioGroup defaultValue="listener" onValueChange={setUserType} value={userType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="musician" id="musician" />
                    <Label htmlFor="musician" className="cursor-pointer">Musician</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="listener" id="listener" />
                    <Label htmlFor="listener" className="cursor-pointer">Listener</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link to="/terms" className="text-resonance-green hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-resonance-green hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-resonance-green hover:bg-resonance-green/90"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-resonance-green hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
