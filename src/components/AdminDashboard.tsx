import { useState, useEffect } from "react";
import { Search, Bell, Plus, Edit, Trash2, BookOpen, UserCheck, AlertTriangle, Loader2, QrCode, BookMarked, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AddBookDialog } from "./AddBookDialog";
import { QRCodeModal } from "./QRCodeModal";
import { IssueBookDialog } from "./IssueBookDialog";
import { ReturnBookDialog } from "./ReturnBookDialog";
import { apiService, Book, BookStats } from "@/services/api";

// Sample data for fallback
const defaultStatsData = [
  {
    title: "Total Books",
    value: "0",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    title: "Books on Loan",
    value: "0",
    icon: UserCheck,
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    title: "Books Overdue",
    value: "0",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10"
  }
];

const StatCard = ({ title, value, icon: Icon, color, bgColor }: {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
}) => {
  return (
    <Card className="p-6 card-shadow hover:card-shadow-hover transition-all duration-300 border-0">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Card>
  );
};

const BookStatusBadge = ({ status }: { status: string }) => {
  const variant = status === "Available" ? "success" : "warning";
  const className = status === "Available" 
    ? "bg-success/10 text-success border-success/20" 
    : "bg-warning/10 text-warning border-warning/20";
  
  return (
    <Badge className={`${className} font-medium`}>
      {status}
    </Badge>
  );
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<BookStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const [isReturnBookOpen, setIsReturnBookOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch books and stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [booksResponse, statsResponse] = await Promise.all([
          apiService.getBooks({ limit: 50 }),
          apiService.getBookStats()
        ]);
        
        setBooks(booksResponse.books);
        setStats(statsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle book search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, fetch all books
      try {
        const response = await apiService.getBooks({ limit: 50 });
        setBooks(response.books);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
      return;
    }

    try {
      const response = await apiService.getBooks({ 
        search: searchQuery,
        limit: 50 
      });
      setBooks(response.books);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  // Handle book added
  const handleBookAdded = async () => {
    try {
      const [booksResponse, statsResponse] = await Promise.all([
        apiService.getBooks({ limit: 50 }),
        apiService.getBookStats()
      ]);
      
      setBooks(booksResponse.books);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Handle book issued
  const handleBookIssued = async () => {
    try {
      const [booksResponse, statsResponse] = await Promise.all([
        apiService.getBooks({ limit: 50 }),
        apiService.getBookStats()
      ]);
      
      setBooks(booksResponse.books);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error refreshing data after book issue:', error);
    }
  };

  // Handle book returned
  const handleBookReturned = async () => {
    try {
      const [booksResponse, statsResponse] = await Promise.all([
        apiService.getBooks({ limit: 50 }),
        apiService.getBookStats()
      ]);
      
      setBooks(booksResponse.books);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error refreshing data after book return:', error);
    }
  };

  // Handle QR code display
  const handleShowQRCode = (book: Book) => {
    setSelectedBook(book);
    setIsQRModalOpen(true);
  };

  const handleQRGenerated = () => {
    // Refresh books to get updated QR code data
    handleBookAdded();
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      console.log('Deleting book with ID:', bookId);
      console.log('User token:', localStorage.getItem('token'));
      await apiService.deleteBook(bookId);
      console.log('Book deleted successfully');
      
      // Refresh all data from database
      const [booksResponse, statsResponse] = await Promise.all([
        apiService.getBooks({ limit: 50 }),
        apiService.getBookStats()
      ]);
      
      setBooks(booksResponse.books);
      setStats(statsResponse);
      
      console.log('Data refreshed from database');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(`Failed to delete book: ${error.message || 'Please try again.'}`);
    }
  };

  // Prepare stats data
  const statsData = stats ? [
    {
      title: "Total Books",
      value: stats.totalBooks.toString(),
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Books on Loan",
      value: stats.borrowedBooks.toString(),
      icon: UserCheck,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Books Overdue",
      value: stats.overdueBooks.toString(),
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ] : defaultStatsData;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-6 card-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Welcome back, Admin!</h1>
                  <p className="text-muted-foreground">Manage your library efficiently</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books or students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 w-80 bg-background border-input focus:border-primary"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsIssueBookOpen(true)}
                  className="flex items-center gap-2"
                >
                  <BookMarked className="w-4 h-4" />
                  Issue Book
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsReturnBookOpen(true)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Return Book
                </Button>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full text-xs"></span>
                </Button>
                
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.fullName || user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Book Management Table */}
            <Card className="card-shadow border-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Book Management</h2>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Filter Books
                  </Button>
                </div>

                <div className="rounded-lg overflow-hidden border border-border">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading books...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-destructive">
                      <span>{error}</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Book Title & Author</TableHead>
                          <TableHead className="font-semibold">ISBN</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No books found. {searchQuery ? 'Try adjusting your search.' : 'Add your first book using the + button.'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          books.map((book) => (
                            <TableRow key={book._id} className="hover:bg-muted/30 transition-colors">
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">{book.title}</p>
                                  <p className="text-sm text-muted-foreground">by {book.author}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                              <TableCell>
                                <BookStatusBadge status={book.status} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleShowQRCode(book)}
                                    title="View QR Code"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteBook(book._id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Floating Action Button */}
          <Button
            variant="accent"
            size="lg"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setIsAddBookOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>

          {/* Add Book Dialog */}
          <AddBookDialog
            open={isAddBookOpen}
            onOpenChange={setIsAddBookOpen}
            onBookAdded={handleBookAdded}
          />

          {/* QR Code Modal */}
          {selectedBook && (
            <QRCodeModal
              open={isQRModalOpen}
              onOpenChange={setIsQRModalOpen}
              book={selectedBook}
              onQRGenerated={handleQRGenerated}
            />
          )}

          {/* Issue Book Dialog */}
          <IssueBookDialog
            open={isIssueBookOpen}
            onOpenChange={setIsIssueBookOpen}
            onBookIssued={handleBookIssued}
          />

          {/* Return Book Dialog */}
          <ReturnBookDialog
            open={isReturnBookOpen}
            onOpenChange={setIsReturnBookOpen}
            onBookReturned={handleBookReturned}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}