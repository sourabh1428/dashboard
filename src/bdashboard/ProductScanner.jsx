import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const ProductScanner = ({ onProductScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isScanMode, setIsScanMode] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        console.log('Camera started');
        
        // Wait for video metadata
        videoRef.current.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loaded');
          console.log('Video Width:', videoRef.current.videoWidth);
          console.log('Video Height:', videoRef.current.videoHeight);

          // Start scanning once metadata is available
          scanQRCode();
        });
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');

    const processFrame = () => {
      if (!videoRef.current || !isScanning) return;

      // Ensure canvas is the correct size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame on the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.log('Captured Image Data:', imageData); // Log image data for debugging

      // Process the image data with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      console.log('jsQR Result:', code); // Log the result for debugging

      // If a QR code is found
      if (code) {
        console.log('QR Code found:', code.data);
        setScannedData(code.data);
        onProductScanned(code.data);
        stopScanner();
      } else {
        // If no QR code is found, keep scanning
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(processFrame); // Start the frame processing loop
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Switch
                checked={isScanMode}
                onCheckedChange={setIsScanMode}
                className="data-[state=checked]:bg-black"
                aria-label="Toggle scan mode"
              />
              <Label className="text-lg">
                {isScanMode ? 'Scanner Mode' : 'Manual Mode'}
              </Label>
            </div>
            {isScanMode && (
              <Button
                onClick={startScanner}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Product
              </Button>
            )}
          </div>

          <Dialog open={isScanning} onOpenChange={setIsScanning}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  Scan Product
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopScanner}
                    aria-label="Close scanner"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setError('')}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </Alert>
              )}

              <video ref={videoRef} autoPlay playsInline className="w-full" />
              <canvas ref={canvasRef} className="w-full" style={{ display: 'none' }} />
              <div className="mt-4 text-sm text-gray-500 text-center">
                {scannedData ? `Scanned Data: ${scannedData}` : 'Position the QR code within the frame'}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductScanner;