import { useState } from "react";
import { Search, Eye, Lock, Unlock, User, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  checking_balance: number;
  savings_balance: number;
  account_number: string | null;
  card_number: string | null;
  created_at: string;
  is_frozen?: boolean;
}

interface UserTransaction {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

interface AdminUsersProps {
  users: UserProfile[];
  onFreezeToggle: (userId: string, freeze: boolean) => void;
  onViewTransactions: (userId: string) => Promise<UserTransaction[]>;
  onAdjustBalance: (userId: string, accountType: "checking" | "savings", amount: number, operation: "add" | "subtract", reason: string) => Promise<boolean>;
}

const AdminUsers = ({ users, onFreezeToggle, onViewTransactions, onAdjustBalance }: AdminUsersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactionDialog, setTransactionDialog] = useState<{ open: boolean; userId: string | null; userName: string }>({ 
    open: false, 
    userId: null, 
    userName: "" 
  });
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Balance adjustment state
  const [balanceDialog, setBalanceDialog] = useState<{ 
    open: boolean; 
    userId: string | null; 
    userName: string;
    currentChecking: number;
    currentSavings: number;
  }>({ 
    open: false, 
    userId: null, 
    userName: "",
    currentChecking: 0,
    currentSavings: 0,
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    accountType: "checking" as "checking" | "savings",
    operation: "add" as "add" | "subtract",
    amount: "",
    reason: "",
  });
  const [adjustingBalance, setAdjustingBalance] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.account_number?.includes(searchTerm) ||
      user.phone?.includes(searchTerm)
  );

  const handleViewTransactions = async (user: UserProfile) => {
    setTransactionDialog({ open: true, userId: user.user_id, userName: user.full_name });
    setLoadingTransactions(true);
    try {
      const txs = await onViewTransactions(user.user_id);
      setTransactions(txs);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleOpenBalanceDialog = (user: UserProfile) => {
    setBalanceDialog({
      open: true,
      userId: user.user_id,
      userName: user.full_name,
      currentChecking: user.checking_balance,
      currentSavings: user.savings_balance,
    });
    setAdjustmentForm({
      accountType: "checking",
      operation: "add",
      amount: "",
      reason: "",
    });
  };

  const handleBalanceAdjustment = async () => {
    if (!balanceDialog.userId || !adjustmentForm.amount || !adjustmentForm.reason.trim()) return;
    
    setAdjustingBalance(true);
    try {
      const success = await onAdjustBalance(
        balanceDialog.userId,
        adjustmentForm.accountType,
        parseFloat(adjustmentForm.amount),
        adjustmentForm.operation,
        adjustmentForm.reason
      );
      if (success) {
        setBalanceDialog({ open: false, userId: null, userName: "", currentChecking: 0, currentSavings: 0 });
      }
    } finally {
      setAdjustingBalance(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, account number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.account_number || "No account"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.is_frozen && (
                    <span className="px-2 py-0.5 bg-destructive/20 text-destructive rounded text-xs">
                      Frozen
                    </span>
                  )}
                  {expandedId === user.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {expandedId === user.id && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Checking Balance</p>
                    <p className="font-bold text-lg">
                      ${user.checking_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Savings Balance</p>
                    <p className="font-bold text-lg">
                      ${user.savings_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium">{user.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Location</p>
                    <p className="font-medium">
                      {user.city && user.country ? `${user.city}, ${user.country}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Card Number</p>
                    <p className="font-medium">
                      {user.card_number ? `****${user.card_number.slice(-4)}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Joined</p>
                    <p className="font-medium">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewTransactions(user)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Transactions
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenBalanceDialog(user)}
                    className="flex-1"
                  >
                    <DollarSign className="w-4 h-4 mr-1" /> Adjust
                  </Button>
                  <Button
                    size="sm"
                    variant={user.is_frozen ? "default" : "destructive"}
                    onClick={() => onFreezeToggle(user.user_id, !user.is_frozen)}
                    className="flex-1"
                  >
                    {user.is_frozen ? (
                      <>
                        <Unlock className="w-4 h-4 mr-1" /> Unfreeze
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1" /> Freeze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={transactionDialog.open} onOpenChange={(open) => setTransactionDialog({ ...transactionDialog, open })}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transactions - {transactionDialog.userName}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {loadingTransactions ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} • {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                        {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        tx.status === "completed" ? "bg-green-500/20 text-green-600" :
                        tx.status === "pending" ? "bg-yellow-500/20 text-yellow-600" :
                        "bg-destructive/20 text-destructive"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceDialog.open} onOpenChange={(open) => setBalanceDialog({ ...balanceDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Balance - {balanceDialog.userName}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Current Checking</p>
                <p className="font-bold">${balanceDialog.currentChecking.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Savings</p>
                <p className="font-bold">${balanceDialog.currentSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Account Type</Label>
                <Select
                  value={adjustmentForm.accountType}
                  onValueChange={(value: "checking" | "savings") => setAdjustmentForm({ ...adjustmentForm, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operation</Label>
                <Select
                  value={adjustmentForm.operation}
                  onValueChange={(value: "add" | "subtract") => setAdjustmentForm({ ...adjustmentForm, operation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Funds</SelectItem>
                    <SelectItem value="subtract">Subtract Funds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={adjustmentForm.amount}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label>Reason (Required)</Label>
              <Textarea
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                placeholder="Explain the reason for this adjustment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialog({ ...balanceDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleBalanceAdjustment}
              disabled={!adjustmentForm.amount || !adjustmentForm.reason.trim() || adjustingBalance}
            >
              {adjustingBalance ? "Processing..." : "Confirm Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;
