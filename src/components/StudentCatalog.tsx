import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiService, Book } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

// Import book cover images for fallback
import mockingbirdCover from "@/assets/book-covers/mockingbird.jpg";
import cover1984 from "@/assets/book-covers/1984.jpg";
import pridePrejudiceCover from "@/assets/book-covers/pride-prejudice.jpg";
import gatsbyCover from "@/assets/book-covers/gatsby.jpg";
import mobyDickCover from "@/assets/book-covers/moby-dick.jpg";
import physicsCover from "@/assets/book-covers/physics.jpg";

// Fallback cover images mapping
const coverImages: { [key: string]: string } = {
  "To Kill a Mockingbird": mockingbirdCover,
  "1984": cover1984,
  "Pride and Prejudice": pridePrejudiceCover,
  "The Great Gatsby": gatsbyCover,
  "Moby Dick": mobyDickCover,
  "Introduction to Physics": physicsCover,
};

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Fiction", value: "fiction" },
  { label: "Non-Fiction", value: "non-fiction" },
  { label: "Science", value: "science" }
];

const StudentHeader = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border card-shadow sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">LibraSys</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-background border-input focus:border-primary rounded-xl"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/student/my-books">
              <Button variant="ghost" className="text-base font-medium">
                My Books
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-3 hover:bg-accent/50"
            >
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.fullName || user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
              )}
              <span className="text-sm font-medium text-foreground">
                {user?.fullName || user?.name || 'User'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

const BookStatusBadge = ({ status }: { status: string }) => {
  const isAvailable = status === "Available";
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isAvailable ? "bg-success" : "bg-warning"}`} />
      <span className={`text-sm font-medium ${isAvailable ? "text-success" : "text-warning"}`}>
        {status}
      </span>
    </div>
  );
};

const BookCard = ({ book }: { book: Book }) => {
  // Get cover image - use database coverImage if available, otherwise fallback to local images
  const getCoverImage = (book: Book) => {
    if (book.coverImage) {
      return book.coverImage;
    }
    // Fallback to local images based on title
    return coverImages[book.title] || mockingbirdCover; // Default fallback
  };

  return (
    <Card className="overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 group">
      <div className="aspect-[3/4] overflow-hidden">
        <img 
          src={getCoverImage(book)} 
          alt={`${book.title} cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-muted-foreground">by {book.author}</p>
        </div>
        <BookStatusBadge status={book.status} />
      </div>
    </Card>
  );
};

export function StudentCatalog() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from database
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getBooks({ limit: 100 });
        
        setBooks(response.books);
        setFilteredBooks(response.books);
      } catch (error) {
        console.error('StudentCatalog: Error fetching books:', error);
        setError('Failed to load books. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleFilterChange = (filterValue: string) => {
    setActiveFilter(filterValue);
    
    let filtered = books;
    
    if (filterValue === "available") {
      filtered = books.filter(book => book.status === "Available");
    } else if (filterValue === "fiction") {
      filtered = books.filter(book => book.genre === "Fiction");
    } else if (filterValue === "science") {
      filtered = books.filter(book => book.genre === "Science");
    } else if (filterValue === "non-fiction") {
      filtered = books.filter(book => book.genre === "Non-Fiction");
    }
    
    setFilteredBooks(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />

      {/* Filter Bar */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-2">
            {filterOptions.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "ghost"}
                size="sm"
                onClick={() => handleFilterChange(filter.value)}
                className="rounded-full px-6"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Catalog</h1>
          <p className="text-muted-foreground">
            Discover your next great read from our extensive collection
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading books...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-destructive mb-4">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error loading books</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}

        {/* No Books Found */}
        {!isLoading && !error && filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No books found</h3>
            <p className="text-muted-foreground">Try adjusting your filter or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}