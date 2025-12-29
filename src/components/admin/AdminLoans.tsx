import { useState } from "react";
import { Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PendingLoan {
  id: string;
  user_id: string;
  amount: number;
  term_months: number;
  interest_rate: number;
  monthly_payment: number;
  total_repayment: number;
  purpose: string | null;
  status: string;
  created_at: string;
  userName?: string;
}

interface AdminLoansProps {
  loans: PendingLoan[];
  actionLoading: string | null;
  onAction: (id: string, action: "approve" | "reject", notes?: string) => void;
  showAll?: boolean;
}

const AdminLoans = ({ loans, actionLoading, onAction, showAll = false }: AdminLoansProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [rejectNotes, setRejectNotes] = useState("");

  const handleReject = () => {
    if (rejectDialog.id && rejectNotes.trim()) {
      onAction(rejectDialog.id, "reject", rejectNotes);
      setRejectDialog({ open: false, id: null });
      setRejectNotes("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-600";
      case "active":
        return "bg-green-500/20 text-green-600";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      case "completed":
        return "bg-primary/20 text-primary";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const displayLoans = showAll ? loans : loans.filter((l) => l.status === "pending");

  if (displayLoans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{showAll ? "No loans found" : "No pending loans"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {displayLoans.map((loan) => (
          <div key={loan.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">
                      ${loan.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{loan.userName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(loan.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {expandedId === loan.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {expandedId === loan.id && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Purpose</p>
                    <p className="font-medium">{loan.purpose || "Personal"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Term</p>
                    <p className="font-medium">{loan.term_months} months</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Interest Rate</p>
                    <p className="font-medium">{loan.interest_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Monthly Payment</p>
                    <p className="font-medium">
                      ${loan.monthly_payment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Total Repayment</p>
                    <p className="font-bold text-lg">
                      ${loan.total_repayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {loan.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAction(loan.id, "approve")}
                      disabled={actionLoading === loan.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === loan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectDialog({ open: true, id: loan.id })}
                      disabled={actionLoading === loan.id}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, id: open ? rejectDialog.id : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Please provide a reason for rejection (required):</p>
            <Textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectNotes.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLoans;
