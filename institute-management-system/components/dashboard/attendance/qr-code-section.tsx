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
  Clock,
  AlertCircle,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface QRCodeSectionProps {
  sessionId?: number;
  onQRStatusChange?: (status: "active" | "expired" | "generating") => void;
}

export function QRCodeSection({
  sessionId = 6,
  onQRStatusChange,
}: QRCodeSectionProps) {
  // Core QR state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("15:00");
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Status tracking
  const [status, setStatus] = useState<
    "idle" | "active" | "expired" | "generating"
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

      // Set expiry time to 15 minutes from now
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15);
      setExpiryTime(expiry);

      setQrGenerated(true);
      setIsExpired(false);
      setStatus("active");

      // Notify parent component
      onQRStatusChange?.("active");

      toast.success("QR code generated successfully (expires in 15 minutes)");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
      setStatus("idle");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onQRStatusChange]);

  // Timer effect
  useEffect(() => {
    if (!expiryTime || isExpired) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.max(
        0,
        Math.floor((expiryTime.getTime() - now.getTime()) / 1000)
      );

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining("00:00");
        setStatus("expired");
        onQRStatusChange?.("expired");
        clearInterval(intervalId);
        toast.warning("QR code has expired");
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeRemaining(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );

        // Warn when 2 minutes remaining
        if (diff === 120) {
          toast.warning("QR code will expire in 2 minutes");
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiryTime, isExpired, onQRStatusChange]);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "expired":
        return "text-red-600";
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
      case "expired":
        return <AlertCircle className="h-4 w-4" />;
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
            className={`${
              isExpired || !qrGenerated ? "bg-amber-500" : "bg-blue-500"
            } ${
              !qrGenerated ? "hover:bg-amber-400" : "hover:bg-blue-700"
            } text-white hover:text-white border-0`}
            onClick={generateQRCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {isExpired ? "Regenerate" : qrGenerated ? "Refresh" : "Generate"} QR
            Code
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
                        className={`${
                          isExpired ? "opacity-30" : ""
                        } transition-opacity`}
                      />
                      {isExpired && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Badge
                            variant="destructive"
                            className="animate-pulse"
                          >
                            Expired
                          </Badge>
                        </div>
                      )}
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

              {/* Timer and Status */}
              <div className="mt-4 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>QR code will expire in:</span>
                  <span
                    className={`${
                      isExpired
                        ? "text-red-500"
                        : timeRemaining.startsWith("00") ||
                          timeRemaining.startsWith("01")
                        ? "text-orange-500"
                        : "text-green-500"
                    } font-medium`}
                  >
                    {timeRemaining}
                  </span>
                </div>
              </div>

              {/* Quick Regenerate for Expired */}
              {isExpired && (
                <Button
                  variant="outline"
                  className="mt-3 bg-amber-500 hover:bg-amber-600 text-white border-0"
                  onClick={generateQRCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Generate New QR Code
                </Button>
              )}
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
                    className={`${
                      isExpired ? "opacity-30" : ""
                    } transition-opacity`}
                  />
                  {isExpired && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Badge
                        variant="destructive"
                        className="text-lg px-4 py-2"
                      >
                        Expired
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Expires in:</span>
                <span className={`${getStatusColor()} font-medium`}>
                  {timeRemaining}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>Session ID: {sessionId}</span>
                <span>Duration: 15 minutes</span>
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
                {isExpired ? "Generate New" : "Refresh"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
