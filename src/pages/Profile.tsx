import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Save, X, GraduationCap, Hash, Building, Upload, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    email: "",
    rollNumber: "",
    collegeName: "",
    profileImage: "",
    profileImagePublicId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        fullName: user.fullName || "",
        email: user.email || "",
        rollNumber: user.rollNumber || "",
        collegeName: user.collegeName || "",
        profileImage: user.profileImage || "",
        profileImagePublicId: user.profileImagePublicId || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadResult = await apiService.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        profileImage: uploadResult.secure_url,
        profileImagePublicId: uploadResult.public_id
      }));
      toast({
        title: "Image uploaded",
        description: "Your profile image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await apiService.updateProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      // Refresh the page to get updated user data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      rollNumber: user?.rollNumber || "",
      collegeName: user?.collegeName || "",
      profileImage: user?.profileImage || "",
      profileImagePublicId: user?.profileImagePublicId || "",
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">User not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{user.fullName || user.name}</CardTitle>
            <CardDescription className="text-lg">{user.email}</CardDescription>
            <div className="mt-2 space-y-1">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Roll Number:</span> {user.rollNumber}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">College:</span> {user.collegeName}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'admin' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-secondary/10 text-secondary-foreground'
              }`}>
                {user.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      {formData.profileImage ? (
                        <AvatarImage src={formData.profileImage} alt="Profile" />
                      ) : (
                        <AvatarFallback className="text-lg">
                          {formData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image-upload"
                        disabled={isUploadingImage}
                      />
                      <Label 
                        htmlFor="profile-image-upload" 
                        className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-dashed border-muted-foreground rounded-lg hover:bg-muted transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isUploadingImage ? "Uploading..." : "Upload Image"}</span>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your roll number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="collegeName"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your college name"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.fullName}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.rollNumber}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>College Name</Label>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.collegeName}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
