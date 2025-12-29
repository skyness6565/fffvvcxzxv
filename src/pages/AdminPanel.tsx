import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingTransaction {
  id: string;
  user_id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  bank_name: string | null;
  account_number: string | null;
  created_at: string;
  userName?: string;
}

interface PendingLoan {
  id: string;
  user_id: string;
  amount: number;
  term_months: number;
  purpose: string | null;
  created_at: string;
  userName?: string;
}

interface Profile {
  user_id: string;
  full_name: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!role || role.role !== "admin") {
      toast({ title: "Access Denied", description: "Admin access required", variant: "destructive" });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    await fetchPendingItems();
    setLoading(false);
  };

  const fetchPendingItems = async () => {
    // Fetch transactions and loans without join
    const [txRes, loanRes, profilesRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("loans")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("user_id, full_name"),
    ]);

    const profilesMap = new Map<string, string>();
    if (profilesRes.data) {
      (profilesRes.data as Profile[]).forEach(p => profilesMap.set(p.user_id, p.full_name));
    }

    if (txRes.data) {
      const transactions = txRes.data.map(tx => ({
        ...tx,
        userName: profilesMap.get(tx.user_id) || "Unknown User",
      })) as PendingTransaction[];
      setPendingTransactions(transactions);
    }

    if (loanRes.data) {
      const loans = loanRes.data.map(loan => ({
        ...loan,
        userName: profilesMap.get(loan.user_id) || "Unknown User",
      })) as PendingLoan[];
      setPendingLoans(loans);
    }
  };

  const handleTransactionAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const response = await supabase.functions.invoke("admin-action", {
        body: { action, transactionId: id },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Action failed");
      }

      toast({ title: `Transaction ${action}d successfully` });
      await fetchPendingItems();
    } catch (error: unknown) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoanAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const response = await supabase.functions.invoke("admin-action", {
        body: { action, loanId: id },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Action failed");
      }

      toast({ title: `Loan ${action}d successfully` });
      await fetchPendingItems();
    } catch (error: unknown) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-red-600 to-red-800 p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
      </header>

      <div className="p-4">
        {/* Pending Transactions */}
        <h2 className="text-lg font-semibold mb-3">Pending Transfers ({pendingTransactions.length})</h2>
        {pendingTransactions.length === 0 ? (
          <p className="text-muted-foreground mb-6">No pending transfers</p>
        ) : (
          <div className="space-y-3 mb-6">
            {pendingTransactions.map((tx) => (
              <div key={tx.id} className="bg-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg">${tx.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{tx.userName}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded text-xs">
                    {tx.category.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm">{tx.description}</p>
                {tx.bank_name && <p className="text-xs text-muted-foreground">Bank: {tx.bank_name}</p>}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleTransactionAction(tx.id, "approve")}
                    disabled={actionLoading === tx.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleTransactionAction(tx.id, "reject")}
                    disabled={actionLoading === tx.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending Loans */}
        <h2 className="text-lg font-semibold mb-3">Pending Loans ({pendingLoans.length})</h2>
        {pendingLoans.length === 0 ? (
          <p className="text-muted-foreground">No pending loans</p>
        ) : (
          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <div key={loan.id} className="bg-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg">${loan.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{loan.userName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{loan.term_months} months</span>
                </div>
                {loan.purpose && <p className="text-sm">Purpose: {loan.purpose}</p>}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleLoanAction(loan.id, "approve")}
                    disabled={actionLoading === loan.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === loan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleLoanAction(loan.id, "reject")}
                    disabled={actionLoading === loan.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
