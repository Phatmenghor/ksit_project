// QRCodeSection.tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { baseAPI } from "@/constants/api";
import {
  Maximize2,
  RefreshCw,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface QRCodeSectionProps {
  sessionId?: number;
  onQRStatusChange?: (status: "active" | "generating") => void;
}

export function QRCodeSection({
  sessionId = 6,
  onQRStatusChange,
}: QRCodeSectionProps) {
  // Core QR state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Status tracking
  const [status, setStatus] = useState<
    "idle" | "active" | "generating"
  >("idle");

  // QR code generation function
  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    setStatus("generating");

    try {
      const qrUrl = `/api/images/generate-qr-image/${sessionId}`;
      const urlWithTimestamp = `${qrUrl}?t=${new Date().getTime()}`;

      // Set QR code image URL
      setQrImageUrl(urlWithTimestamp);

      setQrGenerated(true);
      setStatus("active");

      // Notify parent component
      onQRStatusChange?.("active");

      toast.success("QR code generated successfully");
    } catch (error) {
      toast.error("Failed to generate QR code");
      setStatus("idle");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onQRStatusChange]);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "generating":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "generating":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Attendance - QR Code
          </CardTitle>
          <div className={`flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm capitalize">{status}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Main action button */}
          <Button
            variant="outline"
            className="bg-blue-500 hover:bg-blue-700 text-white hover:text-white border-0"
            onClick={generateQRCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {qrGenerated ? "Refresh" : "Generate"} QR Code
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {qrGenerated && (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center py-8">
              <div
                className="border border-dashed border-gray-300 inline-block cursor-pointer relative"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="relative">
                  {qrImageUrl && (
                    <div className="relative">
                      <img
                        src={baseAPI.BASE_IMAGE + qrImageUrl}
                        alt="Attendance QR Code"
                        width={200}
                        height={200}
                        className="transition-opacity"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-white rounded-full h-6 w-6 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsModalOpen(true);
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status information */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active Session
                  </Badge>
                  <span>Scan this code to mark attendance</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Enhanced Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Attendance QR Code - Full View
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="border border-dashed border-gray-300 inline-block">
              {qrImageUrl && (
                <div className="relative">
                  <img
                    src={baseAPI.BASE_IMAGE + qrImageUrl}
                    alt="Attendance QR Code"
                    width={400}
                    height={400}
                    className="transition-opacity"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>Session ID: {sessionId}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </div>

            {/* Modal Action Button */}
            <div className="flex items-center gap-2 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={generateQRCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Refresh QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
