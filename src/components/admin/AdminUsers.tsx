import { useState } from "react";
import { Search, Eye, Lock, Unlock, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

const AdminUsers = ({ users, onFreezeToggle, onViewTransactions }: AdminUsersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactionDialog, setTransactionDialog] = useState<{ open: boolean; userId: string | null; userName: string }>({ 
    open: false, 
    userId: null, 
    userName: "" 
  });
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

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

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewTransactions(user)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View Transactions
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
    </>
  );
};

export default AdminUsers;
