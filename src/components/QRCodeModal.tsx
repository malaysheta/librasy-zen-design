import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, QrCode, Copy, Check } from "lucide-react";
import { apiService } from "@/services/api";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    qrCode?: string;
  };
  onQRGenerated?: () => void;
}

export function QRCodeModal({ open, onOpenChange, book, onQRGenerated }: QRCodeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(book.qrCode || null);
  const [copied, setCopied] = useState(false);

  const handleGenerateQR = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.generateQRCode(book._id);
      setQrCodeUrl(result.qrCodeUrl);
      onQRGenerated?.();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyURL = async () => {
    if (qrCodeUrl) {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code for {book.title}
          </DialogTitle>
          <DialogDescription>
            Book metadata: {book.author} | ISBN: {book.isbn}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900">{book.title}</h4>
            <p className="text-sm text-gray-600">by {book.author}</p>
            <Badge variant="secondary" className="mt-1">
              ISBN: {book.isbn}
            </Badge>
          </div>

          {/* QR Code Display */}
          {qrCodeUrl ? (
            <div className="text-center space-y-3">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${book.title}`}
                  className="w-48 h-48 mx-auto object-contain"
                />
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyURL}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No QR code generated yet</p>
              <Button
                onClick={handleGenerateQR}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <QrCode className="w-4 h-4" />
                )}
                {isLoading ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          )}

          {/* QR Code Info */}
          {qrCodeUrl && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-medium text-sm text-blue-900 mb-2">QR Code Information</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Contains book metadata (title, author, ISBN)</li>
                <li>• Stored in Cloudinary for fast access</li>
                <li>• Can be scanned to view book details</li>
                <li>• Automatically generated for new books</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
