import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Building2, User, DollarSign, FileText, Hash, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface TransferReceiptData {
  type: "wire" | "local" | "internal";
  status: "completed" | "pending";
  reference: string;
  amount: number;
  recipientName?: string;
  bankName?: string;
  accountNumber?: string;
  description?: string;
  date: Date;
}

interface TransferReceiptProps {
  open: boolean;
  onClose: () => void;
  data: TransferReceiptData | null;
}

const TransferReceipt = ({ open, onClose, data }: TransferReceiptProps) => {
  const navigate = useNavigate();

  if (!data) return null;

  const handleDone = () => {
    onClose();
    navigate("/dashboard");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "wire": return "Wire Transfer";
      case "local": return "Local Transfer";
      case "internal": return "Internal Transfer";
      default: return "Transfer";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {data.status === "completed" ? (
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            ) : (
              <div className="p-4 rounded-full bg-yellow-500/10">
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            )}
            <DialogTitle className="text-center text-xl">
              {data.status === "completed" ? "Transfer Successful!" : "Transfer Pending"}
            </DialogTitle>
            <p className="text-3xl font-bold text-foreground">
              ${data.amount.toFixed(2)}
            </p>
          </div>
        </DialogHeader>

        <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Transfer Type</p>
              <p className="font-medium text-foreground">{getTypeLabel(data.type)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Reference Number</p>
              <p className="font-medium text-foreground font-mono">{data.reference}</p>
            </div>
          </div>

          {data.recipientName && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="font-medium text-foreground">{data.recipientName}</p>
              </div>
            </div>
          )}

          {data.bankName && (
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="font-medium text-foreground">{data.bankName}</p>
              </div>
            </div>
          )}

          {data.accountNumber && (
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Account Number</p>
                <p className="font-medium text-foreground">****{data.accountNumber.slice(-4)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="font-medium text-foreground">{formatDate(data.date)}</p>
            </div>
          </div>

          {data.description && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm text-foreground mt-1">{data.description}</p>
            </div>
          )}
        </div>

        {data.status === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
              Your transfer is pending admin approval and will be processed within 1-3 business days.
            </p>
          </div>
        )}

        <Button onClick={handleDone} className="w-full mt-2">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReceipt;
