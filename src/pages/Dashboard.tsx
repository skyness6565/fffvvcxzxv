import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import TransactionHistory from "@/components/TransactionHistory";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Bitcoin,
  Receipt,
  UserPlus,
  FileText,
  Mail,
  DollarSign,
  BarChart3,
  MessageCircle,
  Settings,
  Home,
  LogOut,
  PiggyBank,
  Wallet,
  HouseIcon,
  ShieldAlert,
} from "lucide-react";

interface Profile {
  full_name: string;
  account_number: string | null;
  card_number: string | null;
  card_expiry: string | null;
  balance: number | null;
  account_currency: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, account_number, card_number, card_expiry, balance, account_currency")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/auth");
  };

  const formatCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return "XXXX XXXX XXXX XXXX";
    return `${cardNumber.slice(0, 4)} XXXX XXXX ${cardNumber.slice(-4)}`;
  };

  const formatAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return "•••• 0000";
    return `•••• ${accountNumber.slice(-4)}`;
  };

  const formatBalance = (balance: number | null, currency: string | null) => {
    const amount = balance ?? 0;
    const curr = currency ?? "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const quickActions = [
    { icon: ArrowUpRight, label: "Wire\nTransfer", color: "bg-primary", path: "/wire-transfer" },
    { icon: ArrowDownLeft, label: "Local\nTransfer", color: "bg-primary", path: "/local-transfer" },
    { icon: RefreshCw, label: "Internal\nTransfer", color: "bg-primary", path: "/internal-transfer" },
    { icon: Bitcoin, label: "Buy\nCrypto", color: "bg-primary", path: "/buy-crypto" },
    { icon: Receipt, label: "Pay\nBills", color: "bg-primary", path: "/pay-bills" },
    { icon: UserPlus, label: "Add\nBeneficiary", color: "bg-primary", path: "/add-beneficiary" },
    { icon: FileText, label: "Savings\nStatement", color: "bg-primary", path: "/statement?type=savings" },
    { icon: FileText, label: "Checking\nStatement", color: "bg-primary", path: "/statement?type=checking" },
    { icon: Mail, label: "Monexa\nAlerts", color: "bg-primary", path: "/alerts" },
    { icon: DollarSign, label: "Monexa\nLoans", color: "bg-primary", path: "/loans" },
    { icon: BarChart3, label: "Monexa\nInvestments", color: "bg-primary", path: "/investments" },
    { icon: MessageCircle, label: "Monexa\nSupport", color: "bg-primary", path: "/support" },
  ];

  const tips = [
    {
      icon: PiggyBank,
      color: "text-yellow-500",
      title: "Auto Save",
      description: "Set a goal, save automatically with Monexa Bank's Auto Save and track your progress.",
    },
    {
      icon: Wallet,
      color: "text-green-500",
      title: "Budget",
      description: "Check in with your budget and stay on top of your spending.",
    },
    {
      icon: HouseIcon,
      color: "text-teal-500",
      title: "Home Option",
      description: "Your home purchase, refinance and insights right under one roof.",
    },
    {
      icon: ShieldAlert,
      color: "text-pink-500",
      title: "Security Tip",
      description: "We will NEVER ask you to provide your security details such as COT Code or any sensitive details of your account.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-monexa-blue to-monexa-blue-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-foreground border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-foreground">🇺🇸 English</span>
          </div>
          <h1 className="text-xl font-bold text-primary-foreground font-display">
            MONEXA<span className="text-monexa-gold">.</span>
          </h1>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
            <span className="text-primary-foreground font-bold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </header>

      {/* Account Card */}
      <div className="px-4 -mt-2">
        <div className="bg-gradient-to-br from-monexa-blue via-monexa-teal-dark to-monexa-blue-dark rounded-2xl p-6 text-primary-foreground shadow-xl border border-primary-foreground/10">
          <p className="text-sm opacity-80 uppercase tracking-wider">Savings</p>
          <h2 className="text-3xl font-bold mt-1">
            {formatBalance(profile?.balance, profile?.account_currency)}
          </h2>
          
          <div className="mt-4">
            <p className="text-xs opacity-70 uppercase tracking-wider">Account Number</p>
            <p className="text-lg font-mono mt-1">{formatAccountNumber(profile?.account_number)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs opacity-70 uppercase tracking-wider">Total Credit</p>
              <p className="text-xs opacity-70">DEC. 2025</p>
              <p className="text-lg font-bold mt-1">$0.00</p>
            </div>
            <div>
              <p className="text-xs opacity-70 uppercase tracking-wider">Total Debit</p>
              <p className="text-xs opacity-70">DEC. 2025</p>
              <p className="text-lg font-bold mt-1">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <div className="bg-card rounded-2xl p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4">
            {quickActions.slice(0, 6).map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className={`${action.color} p-3 rounded-xl`}>
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs text-center text-foreground font-medium whitespace-pre-line">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="border-t border-border my-4" />
          
          <div className="grid grid-cols-3 gap-4">
            {quickActions.slice(6).map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className={`${action.color} p-3 rounded-xl`}>
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs text-center text-foreground font-medium whitespace-pre-line">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Beneficiaries</h3>
          <button 
            onClick={() => navigate("/add-beneficiary")}
            className="flex items-center gap-1 text-primary text-sm font-medium border border-primary rounded-full px-3 py-1"
          >
            Add New <UserPlus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-muted-foreground">
          No Beneficiary. <span onClick={() => navigate("/add-beneficiary")} className="text-primary cursor-pointer">Add New</span>
        </p>
      </div>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Monexa Cards */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Monexa Cards</h3>
        
        {/* ATM Card - Premium Design */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl aspect-[1.586/1] relative overflow-hidden">
          {/* Background pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          {/* Top Row: Chip and Logo */}
          <div className="flex justify-between items-start relative z-10">
            {/* EMV Chip */}
            <div className="w-12 h-10 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-lg shadow-md relative overflow-hidden">
              <div className="absolute inset-0.5 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md">
                <div className="grid grid-cols-3 gap-0.5 p-1 h-full">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-amber-600/40 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Monexa Logo */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-wide font-display">
                MONEXA<span className="text-amber-400">.</span>
              </span>
            </div>
          </div>
          
          {/* Card Number - Center */}
          <div className="mt-6 relative z-10">
            <p className="text-[22px] font-mono tracking-[0.2em] text-white/95 drop-shadow-sm">
              {profile?.card_number 
                ? `${profile.card_number.slice(0, 4)} ${profile.card_number.slice(4, 8)} ${profile.card_number.slice(8, 12)} ${profile.card_number.slice(12, 16)}`
                : "•••• •••• •••• ••••"
              }
            </p>
          </div>
          
          {/* Bottom Row: Expiry, CVV and Cardholder Name */}
          <div className="absolute bottom-5 left-6 right-6 z-10">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                {/* Cardholder Name */}
                <p className="text-base font-semibold uppercase tracking-wider text-white/95 truncate max-w-[180px]">
                  {profile?.full_name || "CARD HOLDER"}
                </p>
              </div>
              
              {/* Expiry Date */}
              <div className="text-right">
                <p className="text-[10px] uppercase text-white/50 tracking-wider">Valid Thru</p>
                <p className="text-base font-mono text-white/95 tracking-wider">
                  {profile?.card_expiry || "MM/YY"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Contactless icon */}
          <div className="absolute top-16 right-6 z-10">
            <svg className="w-8 h-8 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 12c0-4 2-6 6-6" strokeLinecap="round" />
              <path d="M10 12c0-2 1-3 3-3" strokeLinecap="round" />
              <path d="M14 12c0-0.5 0.2-1 0.5-1" strokeLinecap="round" />
            </svg>
          </div>
          
          {/* Card Network Logo (Mastercard-style circles) */}
          <div className="absolute bottom-5 right-6 flex z-10">
            <div className="w-8 h-8 bg-red-500 rounded-full opacity-90" />
            <div className="w-8 h-8 bg-amber-400 rounded-full -ml-3 opacity-90" />
          </div>
        </div>
      </div>

      {/* Monexa Tips */}
      <div className="px-4 mt-6 pb-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Monexa Tips</h3>
        
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl bg-secondary`}>
                <tip.icon className={`w-8 h-8 ${tip.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{tip.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
          <button 
            onClick={() => navigate("/notifications")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="text-xs">Notifications</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button 
            onClick={() => navigate("/support")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
