import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, LayoutDashboard, ArrowRightLeft, Users, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminStats from "@/components/admin/AdminStats";
import AdminTransfers from "@/components/admin/AdminTransfers";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminLoans from "@/components/admin/AdminLoans";

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

interface Profile {
  user_id: string;
  full_name: string;
}

interface DashboardStats {
  totalUsers: number;
  totalCheckingBalance: number;
  totalSavingsBalance: number;
  pendingTransactions: number;
  completedTransactions: number;
  rejectedTransactions: number;
  pendingLoans: number;
  activeLoans: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [allLoans, setAllLoans] = useState<PendingLoan[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCheckingBalance: 0,
    totalSavingsBalance: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    rejectedTransactions: 0,
    pendingLoans: 0,
    activeLoans: 0,
  });

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
    await fetchAllData();
    setLoading(false);
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const [
        txPendingRes,
        txCompletedRes,
        txRejectedRes,
        loansRes,
        profilesRes,
      ] = await Promise.all([
        supabase.from("transactions").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("loans").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);

      const profilesMap = new Map<string, string>();
      const usersList: UserProfile[] = [];
      let totalChecking = 0;
      let totalSavings = 0;

      if (profilesRes.data) {
        profilesRes.data.forEach((p) => {
          profilesMap.set(p.user_id, p.full_name);
          usersList.push({
            ...p,
            checking_balance: Number(p.checking_balance) || 0,
            savings_balance: Number(p.savings_balance) || 0,
          });
          totalChecking += Number(p.checking_balance) || 0;
          totalSavings += Number(p.savings_balance) || 0;
        });
      }

      if (txPendingRes.data) {
        const transactions = txPendingRes.data.map((tx) => ({
          ...tx,
          userName: profilesMap.get(tx.user_id) || "Unknown User",
        })) as PendingTransaction[];
        setPendingTransactions(transactions);
      }

      if (loansRes.data) {
        const loans = loansRes.data.map((loan) => ({
          ...loan,
          userName: profilesMap.get(loan.user_id) || "Unknown User",
        })) as PendingLoan[];
        setAllLoans(loans);
      }

      setUsers(usersList);

      setStats({
        totalUsers: usersList.length,
        totalCheckingBalance: totalChecking,
        totalSavingsBalance: totalSavings,
        pendingTransactions: txPendingRes.data?.length || 0,
        completedTransactions: txCompletedRes.count || 0,
        rejectedTransactions: txRejectedRes.count || 0,
        pendingLoans: loansRes.data?.filter((l) => l.status === "pending").length || 0,
        activeLoans: loansRes.data?.filter((l) => l.status === "active").length || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTransactionAction = async (id: string, action: "approve" | "reject", notes?: string) => {
    setActionLoading(id);
    try {
      const response = await supabase.functions.invoke("admin-action", {
        body: { action, transactionId: id, notes },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Action failed");
      }

      toast({ title: `Transaction ${action}d successfully` });
      await fetchAllData();
    } catch (error: unknown) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoanAction = async (id: string, action: "approve" | "reject", notes?: string) => {
    setActionLoading(id);
    try {
      const response = await supabase.functions.invoke("admin-action", {
        body: { action, loanId: id, notes },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Action failed");
      }

      toast({ title: `Loan ${action}d successfully` });
      await fetchAllData();
    } catch (error: unknown) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFreezeToggle = async (userId: string, freeze: boolean) => {
    toast({ 
      title: freeze ? "Account Frozen" : "Account Unfrozen", 
      description: `User account has been ${freeze ? "frozen" : "unfrozen"}` 
    });
    // Update local state
    setUsers(users.map(u => u.user_id === userId ? { ...u, is_frozen: freeze } : u));
  };

  const handleViewTransactions = async (userId: string) => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return data || [];
  };

  const handleAdjustBalance = async (
    userId: string,
    accountType: "checking" | "savings",
    amount: number,
    operation: "add" | "subtract",
    reason: string
  ): Promise<boolean> => {
    try {
      const response = await supabase.functions.invoke("admin-action", {
        body: {
          action: "adjust_balance",
          targetUserId: userId,
          accountType,
          amount,
          operation,
          notes: reason,
        },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Balance adjustment failed");
      }

      toast({ title: "Balance adjusted successfully" });
      await fetchAllData();
      return true;
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Balance adjustment failed",
        variant: "destructive",
      });
      return false;
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-6 h-6 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-bold text-primary-foreground">Admin Panel</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchAllData}
            disabled={refreshing}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-1 text-xs">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Transfers</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 text-xs">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-1 text-xs">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Loans</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStats {...stats} />
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recent Pending Transfers</h3>
              <AdminTransfers
                transactions={pendingTransactions.slice(0, 3)}
                actionLoading={actionLoading}
                onAction={handleTransactionAction}
              />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recent Pending Loans</h3>
              <AdminLoans
                loans={allLoans.filter(l => l.status === "pending").slice(0, 3)}
                actionLoading={actionLoading}
                onAction={handleLoanAction}
              />
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            <h2 className="text-lg font-semibold mb-3">
              Pending Transfers ({pendingTransactions.length})
            </h2>
            <AdminTransfers
              transactions={pendingTransactions}
              actionLoading={actionLoading}
              onAction={handleTransactionAction}
            />
          </TabsContent>

          <TabsContent value="users">
            <h2 className="text-lg font-semibold mb-3">
              All Users ({users.length})
            </h2>
            <AdminUsers
              users={users}
              onFreezeToggle={handleFreezeToggle}
              onViewTransactions={handleViewTransactions}
              onAdjustBalance={handleAdjustBalance}
            />
          </TabsContent>

          <TabsContent value="loans">
            <h2 className="text-lg font-semibold mb-3">
              All Loans ({allLoans.length})
            </h2>
            <AdminLoans
              loans={allLoans}
              actionLoading={actionLoading}
              onAction={handleLoanAction}
              showAll
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
