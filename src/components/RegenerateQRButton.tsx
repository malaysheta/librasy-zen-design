import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface RegenerateQRButtonProps {
  bookId: string;
  bookTitle: string;
  onQRRegenerated?: (qrCodeUrl: string) => void;
}

export function RegenerateQRButton({ bookId, bookTitle, onQRRegenerated }: RegenerateQRButtonProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateQR = async () => {
    try {
      setIsRegenerating(true);
      
      const response = await fetch(`/api/qr/generate/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`QR code regenerated for "${bookTitle}"`);
        onQRRegenerated?.(data.data.qrCodeUrl);
      } else {
        toast.error(data.message || 'Failed to regenerate QR code');
      }
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      toast.error('Failed to regenerate QR code');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Button
      onClick={handleRegenerateQR}
      disabled={isRegenerating}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isRegenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {isRegenerating ? 'Regenerating...' : 'Regenerate QR'}
    </Button>
  );
}
