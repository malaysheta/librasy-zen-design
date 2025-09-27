import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, AlertCircle, Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // Create a new reader instance
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get available video input devices
      const videoInputDevices = await reader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found");
      }

      // Use the first available camera (usually the default one)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Start decoding from the video element
      if (videoRef.current) {
        await reader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText();
              console.log("QR Code detected:", text);
              onScan(text);
              stopScanning();
            }
            
            if (error && !error.message.includes("No MultiFormat Readers")) {
              console.error("Scanning error:", error);
            }
          }
        );
        
        setHasPermission(true);
      }
    } catch (err: any) {
      console.error("Error starting QR scanner:", err);
      
      if (err.name === "NotAllowedError" || err.message.includes("permission")) {
        setError("Camera permission denied. Please allow camera access and try again.");
        setHasPermission(false);
      } else if (err.name === "NotFoundError" || err.message.includes("No camera")) {
        setError("No camera found. Please connect a camera and try again.");
        setHasPermission(false);
      } else if (err.message.includes("No camera devices found")) {
        setError("No camera devices found. Please connect a camera and try again.");
        setHasPermission(false);
      } else {
        setError(`Failed to start camera: ${err.message}`);
        setHasPermission(false);
      }
      
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    setError(null);
    setHasPermission(null);
    startScanning();
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan QR Code
            </h3>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <CameraOff className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Camera Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Point camera at QR code</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Permission denied message */}
            {hasPermission === false && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Camera access is required to scan QR codes. Please allow camera permission and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              {error && (
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground text-center">
              <p>Position the QR code within the camera view to scan automatically.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
