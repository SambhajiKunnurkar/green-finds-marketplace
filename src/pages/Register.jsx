
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, demoMode, enableDemoMode, error } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const passwordHasMinLength = password.length >= 8;
  const passwordHasLetter = /[a-zA-Z]/.test(password);
  const passwordHasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;

  const isPasswordValid = passwordHasMinLength && passwordHasLetter && passwordHasNumber;
  const canSubmit = name && email && isPasswordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await register(name, email, password);
      if (success) {
        // Registration successful - redirect handled in AuthContext
      } else {
        // Error already handled in AuthContext
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleDemoMode = (e) => {
    e.preventDefault();
    enableDemoMode();
    navigate("/");
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center text-sm">
      {isValid ? (
        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400 mr-2" />
      )}
      <span className={isValid ? "text-green-600" : "text-gray-500"}>{text}</span>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 px-4">
        <Card>
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="bg-eco-green/10 p-2 rounded-full mb-2">
              <Leaf className="h-6 w-6 text-eco-green" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Join EcoCart and start shopping sustainably
            </CardDescription>
          </CardHeader>
          <CardContent>
            {demoMode && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-800">
                  Demo mode is active. API connection is unavailable.
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password validation feedback */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <ValidationItem isValid={passwordHasMinLength} text="At least 8 characters" />
                    <ValidationItem isValid={passwordHasLetter} text="Contains a letter" />
                    <ValidationItem isValid={passwordHasNumber} text="Contains a number" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                
                {/* Confirm password validation feedback */}
                {confirmPassword.length > 0 && (
                  <div className="mt-2">
                    <ValidationItem isValid={passwordsMatch} text="Passwords match" />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-eco-green hover:bg-eco-green/90"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoMode}
              >
                Continue in Demo Mode
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-eco-green hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
