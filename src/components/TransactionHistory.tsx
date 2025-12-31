import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  category: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setTransactions(data as Transaction[]);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  // Subscribe to realtime updates filtered by user
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("transactions-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New transaction:", payload);
          const newTx = payload.new as Transaction;
          setTransactions((prev) => [newTx, ...prev.slice(0, 9)]);
          toast({
            title: newTx.type === "credit" ? "Money Received!" : "Transfer Sent",
            description: `${newTx.type === "credit" ? "+" : "-"}$${newTx.amount.toFixed(2)} - ${newTx.description}`,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          const updatedTx = payload.new as Transaction;
          setTransactions((prev) =>
            prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
    return type === "credit" ? `+${formatted}` : `-${formatted}`;
  };

  if (loading) {
    return (
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="bg-card rounded-2xl p-4 shadow-lg">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-1/2" />
                  <div className="h-3 bg-secondary rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h3>
      <div className="bg-card rounded-2xl p-4 shadow-lg">
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No recent transactions
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div
                  className={`p-2 rounded-full ${
                    tx.type === "credit"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category} • {formatDate(tx.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.type === "credit" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {formatAmount(tx.amount, tx.type)}
                  </p>
                  <p
                    className={`text-xs capitalize ${
                      tx.status === "completed"
                        ? "text-green-500"
                        : tx.status === "pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
