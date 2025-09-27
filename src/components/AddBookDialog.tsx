import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { apiService } from "@/services/api";
import { ImageUpload } from "./ImageUpload";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: () => void;
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  description: string;
  genre: string;
  publicationYear: string;
  publisher: string;
  totalCopies: string;
  coverImage: string;
  coverImageFile: File | null;
}

const initialFormData: BookFormData = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  genre: "",
  publicationYear: "",
  publisher: "",
  totalCopies: "1",
  coverImage: "",
  coverImageFile: null,
};

const genres = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Science",
  "Philosophy",
  "Poetry",
  "Drama",
  "Comedy",
  "Adventure",
  "Horror",
  "Self-Help",
  "Business",
  "Technology",
  "Art",
  "Music",
  "Sports",
  "Travel",
  "Cooking",
  "Health",
  "Education",
  "Reference",
  "Children's",
  "Young Adult",
  "Other"
];

export function AddBookDialog({ open, onOpenChange, onBookAdded }: AddBookDialogProps) {
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BookFormData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof BookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, coverImage: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImage: 'Image size must be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, coverImageFile: file, coverImage: '' }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coverImage;
        return newErrors;
      });
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, coverImageFile: null }));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (value: string) => {
    setFormData(prev => ({ ...prev, coverImage: value, coverImageFile: null }));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    // Clear any cover image errors when URL is entered
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.coverImage;
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BookFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    } else if (!/^[\d-]+$/.test(formData.isbn)) {
      newErrors.isbn = "ISBN must contain only numbers and hyphens";
    }

    if (formData.publicationYear && (isNaN(Number(formData.publicationYear)) || Number(formData.publicationYear) < 1000 || Number(formData.publicationYear) > new Date().getFullYear())) {
      newErrors.publicationYear = "Please enter a valid publication year";
    }

    if (formData.totalCopies && (isNaN(Number(formData.totalCopies)) || Number(formData.totalCopies) < 1)) {
      newErrors.totalCopies = "Total copies must be at least 1";
    }

    // Clear any cover image errors since we now allow file uploads
    if (errors.coverImage) {
      delete newErrors.coverImage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let coverImageUrl = formData.coverImage.trim();
      
      let cloudinaryPublicId = '';

      // If a file is selected, upload it to Cloudinary
      if (formData.coverImageFile && !coverImageUrl) {
        console.log('Uploading image to Cloudinary...');
        const uploadResult = await apiService.uploadImage(formData.coverImageFile);
        coverImageUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
        console.log('Image uploaded successfully:', uploadResult.secure_url);
      }

      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        description: formData.description.trim(),
        genre: formData.genre.trim(),
        publicationYear: formData.publicationYear ? Number(formData.publicationYear) : undefined,
        publisher: formData.publisher.trim(),
        totalCopies: Number(formData.totalCopies),
        coverImage: coverImageUrl,
        cloudinaryPublicId: cloudinaryPublicId,
      };

      await apiService.createBook(bookData);
      
      // Reset form and close dialog
      setFormData(initialFormData);
      setErrors({});
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      onOpenChange(false);
      onBookAdded();
    } catch (error: any) {
      console.error("Error creating book:", error);
      // Handle specific error messages from the API
      if (error.message?.includes("ISBN already exists")) {
        setErrors({ isbn: "A book with this ISBN already exists" });
      } else {
        setErrors({ title: "Failed to create book. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData(initialFormData);
      setErrors({});
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Book
          </DialogTitle>
          <DialogDescription>
            Fill in the details to add a new book to the library.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter book title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                placeholder="Enter author name"
                className={errors.author ? "border-destructive" : ""}
              />
              {errors.author && (
                <p className="text-sm text-destructive mt-1">{errors.author}</p>
              )}
            </div>

            {/* ISBN */}
            <div>
              <Label htmlFor="isbn">ISBN *</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => handleInputChange("isbn", e.target.value)}
                placeholder="978-0-06-112008-4"
                className={errors.isbn ? "border-destructive" : ""}
              />
              {errors.isbn && (
                <p className="text-sm text-destructive mt-1">{errors.isbn}</p>
              )}
            </div>

            {/* Genre */}
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(value) => handleInputChange("genre", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Publication Year */}
            <div>
              <Label htmlFor="publicationYear">Publication Year</Label>
              <Input
                id="publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={(e) => handleInputChange("publicationYear", e.target.value)}
                placeholder="2023"
                min="1000"
                max={new Date().getFullYear()}
                className={errors.publicationYear ? "border-destructive" : ""}
              />
              {errors.publicationYear && (
                <p className="text-sm text-destructive mt-1">{errors.publicationYear}</p>
              )}
            </div>

            {/* Publisher */}
            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => handleInputChange("publisher", e.target.value)}
                placeholder="Enter publisher name"
              />
            </div>

            {/* Total Copies */}
            <div>
              <Label htmlFor="totalCopies">Total Copies *</Label>
              <Input
                id="totalCopies"
                type="number"
                value={formData.totalCopies}
                onChange={(e) => handleInputChange("totalCopies", e.target.value)}
                placeholder="1"
                min="1"
                className={errors.totalCopies ? "border-destructive" : ""}
              />
              {errors.totalCopies && (
                <p className="text-sm text-destructive mt-1">{errors.totalCopies}</p>
              )}
            </div>


            {/* Cover Image */}
            <div className="md:col-span-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="space-y-4">
                {/* URL Input */}
                <div>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/book-cover.jpg"
                    className={errors.coverImage ? "border-destructive" : ""}
                  />
                  {errors.coverImage && (
                    <p className="text-sm text-destructive mt-1">{errors.coverImage}</p>
                  )}
                </div>
                
                {/* File Upload Component */}
                <ImageUpload
                  onImageSelect={(file) => {
                    setFormData(prev => ({ ...prev, coverImageFile: file, coverImage: '' }));
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.coverImage;
                      return newErrors;
                    });
                  }}
                  onImageRemove={handleRemoveFile}
                  selectedFile={formData.coverImageFile}
                  previewUrl={imagePreview}
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter book description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
