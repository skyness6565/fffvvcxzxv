import { Users, DollarSign, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface AdminStatsProps {
  totalUsers: number;
  totalCheckingBalance: number;
  totalSavingsBalance: number;
  pendingTransactions: number;
  completedTransactions: number;
  rejectedTransactions: number;
  pendingLoans: number;
  activeLoans: number;
}

const AdminStats = ({
  totalUsers,
  totalCheckingBalance,
  totalSavingsBalance,
  pendingTransactions,
  completedTransactions,
  rejectedTransactions,
  pendingLoans,
  activeLoans,
}: AdminStatsProps) => {
  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Checking",
      value: `$${totalCheckingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "Total Savings",
      value: `$${totalSavingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Pending Transfers",
      value: pendingTransactions,
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      label: "Completed",
      value: completedTransactions,
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Rejected",
      value: rejectedTransactions,
      icon: XCircle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: "Pending Loans",
      value: pendingLoans,
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Active Loans",
      value: activeLoans,
      icon: CheckCircle,
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
