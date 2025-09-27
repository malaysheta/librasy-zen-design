import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Search, Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-library.jpg";

const LibraryHero = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">LibraSys</span>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.fullName || user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>Welcome, {user.fullName || user.name}</span>
                {isAdmin && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    Admin
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Modern Library
                <span className="text-primary block">Management</span>
                <span className="text-accent">System</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Streamline your library operations with our intuitive, professional platform designed for modern institutions.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/student/catalog">
                <Button size="lg" className="px-8">
                  Browse Books
                </Button>
              </Link>
              <Button variant="accent" size="lg" className="px-8">
                View Demo
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-full card-shadow">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Multi-User Support</span>
              </div>
              <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-full card-shadow">
                <Search className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Smart Search</span>
              </div>
              <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-full card-shadow">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Secure & Reliable</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden card-shadow-hover">
              <img 
                src={heroImage} 
                alt="Modern library interior with students studying" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything you need to manage your library
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools for administrators and seamless experience for students
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BookOpen className="w-8 h-8 text-primary" />}
            title="Digital Catalog"
            description="Comprehensive book management with search, categorization, and availability tracking."
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-accent" />}
            title="User Management"
            description="Separate dashboards for administrators and students with role-based permissions."
          />
          <FeatureCard 
            icon={<Search className="w-8 h-8 text-success" />}
            title="Advanced Search"
            description="Find books quickly with intelligent search filters and recommendations."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => {
  return (
    <Card className="p-8 card-shadow hover:card-shadow-hover transition-all duration-300 border-0">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};

export default LibraryHero;