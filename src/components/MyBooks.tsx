import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, User, Calendar, Clock, AlertCircle, ArrowRight, Loader2, Bell, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import { useState, useEffect } from "react";

// Import book cover images
import mockingbirdCover from "@/assets/book-covers/mockingbird.jpg";
import cover1984 from "@/assets/book-covers/1984.jpg";

const StudentHeader = () => {
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
                className="pl-12 pr-4 py-3 text-lg bg-background border-input focus:border-primary rounded-xl"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/student/catalog">
              <Button variant="ghost" className="text-base font-medium">
                Book Catalog
              </Button>
            </Link>
            <Button variant="ghost" className="text-base font-medium text-primary">
              My Books
            </Button>
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

const BorrowedBookItem = ({ book }: { book: any }) => {
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDueDateStatus = () => {
    if (book.isOverdue) {
      return "text-destructive";
    }
    if (book.isNearDue) {
      return "text-warning";
    }
    return "text-foreground";
  };

  return (
    <Card className="p-6 card-shadow border-0">
      <div className="flex items-start space-x-6">
        {/* Book Cover */}
        <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={book.cover || '/placeholder.svg'} 
            alt={`${book.title} cover`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Book Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{book.title}</h3>
            <p className="text-muted-foreground">by {book.author}</p>
            {book.isbn && (
              <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
            )}
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Borrowed:</span>
              <span className="font-medium">{formatDate(book.dateBorrowed)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className={`font-medium ${getDueDateStatus()}`}>
                {formatDate(book.dueDate)}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {book.isOverdue && (
            <div className="flex items-center space-x-3">
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="w-3 h-3 mr-1" />
                OVERDUE
              </Badge>
              <span className="text-sm text-destructive font-medium flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Fine: ₹{book.fineAmount || 0}
              </span>
            </div>
          )}

          {book.isNearDue && !book.isOverdue && (
            <Badge className="bg-warning/10 text-warning border-warning/20 w-fit">
              <Clock className="w-3 h-3 mr-1" />
              Due Soon
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button variant="default" className="px-6" disabled>
          Return Book
        </Button>
      </div>
    </Card>
  );
};

const HistoryItem = ({ book }: { book: any }) => {
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="space-y-1">
        <h4 className="font-medium text-foreground">{book.title}</h4>
        <p className="text-sm text-muted-foreground">by {book.author}</p>
        {book.isbn && (
          <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
        )}
      </div>
      <div className="text-right space-y-1">
        <p className="text-sm text-muted-foreground">
          {formatDate(book.dateBorrowed)} - {formatDate(book.returnDate)}
        </p>
        <Badge className="bg-success/10 text-success border-success/20">
          Returned
        </Badge>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification }: { notification: any }) => {
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <Card className="p-4 card-shadow border-0">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={notification.bookCover || '/placeholder.svg'} 
            alt={`${notification.bookTitle} cover`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-foreground">{notification.bookTitle}</h4>
              <p className="text-sm text-muted-foreground">by {notification.bookAuthor}</p>
            </div>
            <Badge className={getPriorityColor(notification.priority)}>
              {notification.priority === 'high' ? 'URGENT' : 
               notification.priority === 'medium' ? 'DUE SOON' : 'INFO'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">{formatDate(notification.dueDate)}</span>
            </div>
            
            {notification.isOverdue && (
              <div className="flex items-center space-x-1 text-destructive">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">Fine: ₹{notification.fineAmount}</span>
              </div>
            )}
            
            {notification.daysUntilDue > 0 && notification.daysUntilDue <= 3 && (
              <div className="flex items-center space-x-1 text-warning">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{notification.daysUntilDue} days left</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const EmptyState = () => {
  return (
    <Card className="p-12 text-center card-shadow border-0">
      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-foreground mb-3">
        You have no books on loan
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Go find your next adventure! Browse our extensive catalog and discover amazing books waiting for you.
      </p>
      <Link to="/student/catalog">
        <Button variant="accent" size="lg" className="px-8">
          Browse Book Catalog
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </Card>
  );
};

export function MyBooks() {
  const [currentBooks, setCurrentBooks] = useState<any[]>([]);
  const [returnedBooks, setReturnedBooks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMyBooks();
      setCurrentBooks(data.currentBooks);
      setReturnedBooks(data.returnedBooks);
      
      // Fetch notifications
      try {
        const notificationData = await apiService.getNotifications();
        setNotifications(notificationData);
      } catch (notificationErr) {
        console.error('Error fetching notifications:', notificationErr);
        // Don't fail the whole request if notifications fail
      }
    } catch (err) {
      console.error('Error fetching my books:', err);
      setError('Failed to load your books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasBorrowedBooks = currentBooks.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading your books...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <StudentHeader />
        <div className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center card-shadow border-0">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Error Loading Books
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {error}
            </p>
            <Button onClick={fetchMyBooks} variant="default">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Borrowed Books</h1>
          <p className="text-muted-foreground">
            Track your borrowed books and due dates
          </p>
        </div>

        {!hasBorrowedBooks ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Notifications Section */}
            {notifications.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Bell className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">Notifications</h2>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {notifications.length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
                <Separator className="my-8" />
              </div>
            )}

            {/* Currently Borrowed Section */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Currently Borrowed</h2>
              <div className="space-y-4">
                {currentBooks.map((book) => (
                  <BorrowedBookItem key={book.id} book={book} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Borrowing History Section */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Borrowing History</h2>
              <Card className="p-6 card-shadow border-0">
                {returnedBooks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No borrowing history yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {returnedBooks.map((book) => (
                      <HistoryItem key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}