import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, CheckCircle2 } from "lucide-react";
import type { CreatedCredentials } from "@/lib/authApi";
import { downloadCredentialsPdf, printCredentials } from "@/lib/credentialsPdf";

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: CreatedCredentials | null;
  type: "patient" | "doctor";
  displayName?: string;
}

export default function CredentialsDialog({
  open,
  onOpenChange,
  credentials,
  type,
  displayName,
}: CredentialsDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!credentials || !open) return;

    const hospitalUrl = `${window.location.origin}/login?username=${encodeURIComponent(credentials.username)}&role=${type}`;

    QRCode.toDataURL(hospitalUrl, { width: 180, margin: 2 })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [credentials, open]);

  if (!credentials) return null;

  const idLabel = type === "patient" ? "Patient ID" : "Doctor ID";
  const idValue = credentials.patientId ?? credentials.doctorId ?? "";

  const handleDownload = () => {
    downloadCredentialsPdf({
      type,
      id: idValue,
      username: credentials.username,
      password: credentials.temporaryPassword,
      displayName,
      qrDataUrl,
    });
  };

  const handlePrint = () => {
    printCredentials({
      type,
      id: idValue,
      username: credentials.username,
      password: credentials.temporaryPassword,
      displayName,
      qrDataUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <DialogTitle className="text-center">
            {type === "patient" ? "Patient Registered Successfully" : "Doctor Registered Successfully"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Save these credentials securely. The password will not be shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{idLabel}</span>
              <span className="font-bold text-foreground">{idValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-bold text-foreground">{credentials.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temporary Password</span>
              <span className="font-bold text-primary">{credentials.temporaryPassword}</span>
            </div>
          </div>

          {qrDataUrl && (
            <div className="flex flex-col items-center gap-2">
              <img src={qrDataUrl} alt="Login QR Code" className="rounded-lg border border-border" width={180} height={180} />
              <p className="text-xs text-muted-foreground text-center">
                Scan to open login page with credentials
              </p>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Credentials PDF
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
