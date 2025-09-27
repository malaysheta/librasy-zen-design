import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await login(email, password);
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      
      // Redirect based on user role
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student/catalog");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await register(name, email, password);
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      
      navigate("/student/catalog");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Signup failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm 
      onLogin={handleLogin} 
      onSignup={handleSignup}
      isLoading={isLoading}
    />
  );
};

export default Login;
