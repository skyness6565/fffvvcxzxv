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

interface PendingTransaction {
  id: string;
  user_id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  bank_name: string | null;
  account_number: string | null;
  routing_number: string | null;
  swift_code: string | null;
  iban: string | null;
  balance_before: number | null;
  balance_after: number | null;
  account_type: string | null;
  created_at: string;
  userName?: string;
}

interface AdminTransfersProps {
  transactions: PendingTransaction[];
  actionLoading: string | null;
  onAction: (id: string, action: "approve" | "reject", notes?: string) => void;
}

const AdminTransfers = ({ transactions, actionLoading, onAction }: AdminTransfersProps) => {
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No pending transfers</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 rounded text-xs font-medium">
                      {tx.category.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{tx.userName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {expandedId === tx.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {expandedId === tx.id && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Description</p>
                    <p className="font-medium">{tx.description}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Account Type</p>
                    <p className="font-medium capitalize">{tx.account_type || "Checking"}</p>
                  </div>
                  {tx.bank_name && (
                    <div>
                      <p className="text-muted-foreground text-xs">Bank Name</p>
                      <p className="font-medium">{tx.bank_name}</p>
                    </div>
                  )}
                  {tx.account_number && (
                    <div>
                      <p className="text-muted-foreground text-xs">Account Number</p>
                      <p className="font-medium">{tx.account_number}</p>
                    </div>
                  )}
                  {tx.routing_number && (
                    <div>
                      <p className="text-muted-foreground text-xs">Routing Number</p>
                      <p className="font-medium">{tx.routing_number}</p>
                    </div>
                  )}
                  {tx.swift_code && (
                    <div>
                      <p className="text-muted-foreground text-xs">SWIFT Code</p>
                      <p className="font-medium">{tx.swift_code}</p>
                    </div>
                  )}
                  {tx.iban && (
                    <div>
                      <p className="text-muted-foreground text-xs">IBAN</p>
                      <p className="font-medium">{tx.iban}</p>
                    </div>
                  )}
                  {tx.balance_before !== null && (
                    <div>
                      <p className="text-muted-foreground text-xs">Balance Before</p>
                      <p className="font-medium">${tx.balance_before.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                  {tx.balance_after !== null && (
                    <div>
                      <p className="text-muted-foreground text-xs">Balance After</p>
                      <p className="font-medium">${tx.balance_after.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAction(tx.id, "approve")}
                    disabled={actionLoading === tx.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === tx.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setRejectDialog({ open: true, id: tx.id })}
                    disabled={actionLoading === tx.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, id: open ? rejectDialog.id : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
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

export default AdminTransfers;
