import { useState, useEffect } from "react";
import { QrCode, BookOpen, User, Calendar, AlertCircle, CheckCircle, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService, Book } from "@/services/api";
import { QRScanner } from "@/components/QRScanner";
import { useAuth } from "@/hooks/useAuth";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  collegeName: string;
  email: string;
}

interface IssueBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookIssued?: () => void;
}

export function IssueBookDialog({ open, onOpenChange, onBookIssued }: IssueBookDialogProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Manual issue form
  const [isbn, setIsbn] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // QR scan form
  const [qrData, setQrData] = useState("");
  const [qrRollNumber, setQrRollNumber] = useState("");
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const [qrBook, setQrBook] = useState<Book | null>(null);
  const [qrIssueDate, setQrIssueDate] = useState("");
  const [qrDueDate, setQrDueDate] = useState("");
  
  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActiveTab("manual");
      setIsbn("");
      setRollNumber("");
      setStudent(null);
      setBook(null);
      setIssueDate("");
      setDueDate("");
      setQrData("");
      setQrRollNumber("");
      setQrStudent(null);
      setQrBook(null);
      setQrIssueDate("");
      setQrDueDate("");
      setShowQRScanner(false);
      setError(null);
      setSuccess(null);
    } else {
      // Set default dates when dialog opens
      const today = new Date().toISOString().split('T')[0];
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      const dueDateStr = defaultDueDate.toISOString().split('T')[0];
      
      setIssueDate(today);
      setDueDate(dueDateStr);
      setQrIssueDate(today);
      setQrDueDate(dueDateStr);
    }
  }, [open]);

  // Fetch student by roll number
  const fetchStudent = async (rollNum: string) => {
    if (!rollNum.trim()) return;
    
    if (!isAdmin) {
      setError("Admin privileges required to fetch student details");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/roll/${rollNum}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudent(data.data);
      } else {
        setStudent(null);
        setError("Student not found with this roll number");
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setStudent(null);
      setError("Failed to fetch student details");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student by roll number for QR section
  const fetchQRStudent = async (rollNum: string) => {
    if (!rollNum.trim()) return;
    
    if (!isAdmin) {
      setError("Admin privileges required to fetch student details");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/roll/${rollNum}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrStudent(data.data);
      } else {
        setQrStudent(null);
        setError("Student not found with this roll number");
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setQrStudent(null);
      setError("Failed to fetch student details");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch book by ISBN
  const fetchBookByISBN = async (isbnCode: string) => {
    if (!isbnCode.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching book with ISBN:", isbnCode);
      
      // Search for book by ISBN
      const books = await apiService.getBooks({ search: isbnCode });
      if (books.books.length > 0) {
        setBook(books.books[0]);
        console.log("Book found by ISBN:", books.books[0].title);
      } else {
        setBook(null);
        setError("Book not found with this ISBN");
      }
    } catch (error) {
      console.error('Error fetching book from ISBN:', error);
      setBook(null);
      setError("Failed to fetch book from ISBN");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle QR scan result
  const handleQRScanResult = (result: string) => {
    setQrData(result);
    setShowQRScanner(false);
    setQrBook(null);
    setError(null);
    
    if (result.trim()) {
      // Handle ISBN directly - no JSON parsing needed
      const isbn = result.trim();
      console.log("QR Code detected ISBN:", isbn);
      
      // Validate ISBN format (basic check)
      if (isbn.length >= 10) {
        fetchQRBookByISBN(isbn);
      } else {
        setError("Invalid ISBN format - ISBN should be at least 10 characters");
      }
    }
  };

  // Parse QR data and fetch book
  const handleQRDataChange = (data: string) => {
    setQrData(data);
    setQrBook(null);
    setError(null);
    
    if (data.trim()) {
      // New format: QR code contains only ISBN number
      const isbn = data.trim();
      console.log("QR data (ISBN):", isbn);
      
      // Validate ISBN format (basic check)
      if (isbn.length >= 10) {
        fetchQRBookByISBN(isbn);
      } else {
        setError("Invalid ISBN format - ISBN should be at least 10 characters");
      }
    }
  };

  const fetchQRBookByISBN = async (isbn: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching book with ISBN:", isbn);
      
      // Search for book by ISBN
      const books = await apiService.getBooks({ search: isbn });
      if (books.books.length > 0) {
        setQrBook(books.books[0]);
        console.log("Book found by ISBN:", books.books[0].title);
      } else {
        setError("Book not found with this ISBN");
      }
    } catch (error) {
      console.error('Error fetching book from ISBN:', error);
      setQrBook(null);
      setError("Failed to fetch book from ISBN");
    } finally {
      setIsLoading(false);
    }
  };

  // Issue book manually
  const handleManualIssue = async () => {
    if (!isbn || !rollNumber || !student || !book || !issueDate || !dueDate) {
      setError("Please fill in all required fields including dates");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/issues/issue-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bookId: book._id,
          rollNumber,
          issueMethod: 'manual',
          issueDate,
          dueDate
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Book issued successfully!");
        setTimeout(() => {
          onOpenChange(false);
          onBookIssued?.();
        }, 2000);
      } else {
        setError(data.message || "Failed to issue book");
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      setError("Failed to issue book");
    } finally {
      setIsLoading(false);
    }
  };

  // Issue book by QR
  const handleQRIssue = async () => {
    if (!qrData || !qrRollNumber || !qrStudent || !qrBook || !qrIssueDate || !qrDueDate) {
      setError("Please fill in all required fields including dates");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/issues/issue-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bookId: qrBook._id,
          rollNumber: qrRollNumber,
          issueMethod: 'qr',
          issueDate: qrIssueDate,
          dueDate: qrDueDate
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Book issued successfully via QR scan!");
        setTimeout(() => {
          onOpenChange(false);
          onBookIssued?.();
        }, 2000);
      } else {
        setError(data.message || "Failed to issue book");
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      setError("Failed to issue book");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Issue Book
          </DialogTitle>
          <DialogDescription>
            Issue a book to a student either manually or by scanning QR code
          </DialogDescription>
          {!isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Admin privileges required to issue books</span>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Issue</TabsTrigger>
            <TabsTrigger value="qr">QR Scan</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Book Selection */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Book Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="Enter ISBN (e.g., 978-0-306-40615-0)"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      onBlur={() => fetchBookByISBN(isbn)}
                    />
                  </div>
                  
                  {book && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        {book.coverImage && (
                          <img 
                            src={book.coverImage} 
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={book.availableCopies > 0 ? "default" : "destructive"}>
                              {book.availableCopies} available
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Student Selection */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Student Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      placeholder="Enter roll number"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      onBlur={() => fetchStudent(rollNumber)}
                    />
                  </div>
                  
                  {student && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
                      <p className="text-sm text-muted-foreground">{student.collegeName}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Issue Summary */}
            {book && student && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Issue Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Book:</strong> {book.title}</p>
                    <p><strong>Student:</strong> {student.name}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="issueDate" className="text-xs font-medium">Issue Date</Label>
                      <Input
                        id="issueDate"
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate" className="text-xs font-medium">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleManualIssue}
                disabled={!book || !student || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Issue Book
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Data */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code Data
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qrData">QR Code Data</Label>
                    <div className="flex gap-2">
                      <Input
                        id="qrData"
                        placeholder="Scan or paste QR code data"
                        value={qrData}
                        onChange={(e) => handleQRDataChange(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowQRScanner(true)}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Scan
                      </Button>
                    </div>
                  </div>
                  
                  {qrBook && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        {qrBook.coverImage && (
                          <img 
                            src={qrBook.coverImage} 
                            alt={qrBook.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{qrBook.title}</h4>
                          <p className="text-sm text-muted-foreground">by {qrBook.author}</p>
                          <p className="text-xs text-muted-foreground">ISBN: {qrBook.isbn}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={qrBook.availableCopies > 0 ? "default" : "destructive"}>
                              {qrBook.availableCopies} available
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Student Selection for QR */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Student Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qrRollNumber">Roll Number</Label>
                    <Input
                      id="qrRollNumber"
                      placeholder="Enter roll number"
                      value={qrRollNumber}
                      onChange={(e) => setQrRollNumber(e.target.value)}
                      onBlur={() => {
                        if (qrRollNumber.trim()) {
                          fetchQRStudent(qrRollNumber);
                        }
                      }}
                    />
                  </div>
                  
                  {qrStudent && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">{qrStudent.name}</h4>
                      <p className="text-sm text-muted-foreground">Roll: {qrStudent.rollNumber}</p>
                      <p className="text-sm text-muted-foreground">{qrStudent.collegeName}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Issue Summary for QR */}
            {qrBook && qrStudent && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Issue Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Book:</strong> {qrBook.title}</p>
                    <p><strong>Student:</strong> {qrStudent.name}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="qrIssueDate" className="text-xs font-medium">Issue Date</Label>
                      <Input
                        id="qrIssueDate"
                        type="date"
                        value={qrIssueDate}
                        onChange={(e) => setQrIssueDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="qrDueDate" className="text-xs font-medium">Due Date</Label>
                      <Input
                        id="qrDueDate"
                        type="date"
                        value={qrDueDate}
                        onChange={(e) => setQrDueDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Error/Success Messages for QR */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            {/* Action Buttons for QR */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleQRIssue}
                disabled={!qrBook || !qrStudent || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Issue Book
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={showQRScanner}
          onScan={handleQRScanResult}
          onClose={() => setShowQRScanner(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
