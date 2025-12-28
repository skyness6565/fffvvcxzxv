import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
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
    { icon: ArrowUpRight, label: "Wire\nTransfer", color: "bg-primary" },
    { icon: ArrowDownLeft, label: "Local\nTransfer", color: "bg-primary" },
    { icon: RefreshCw, label: "Internal\nTransfer", color: "bg-primary" },
    { icon: Bitcoin, label: "Buy\nCrypto", color: "bg-primary" },
    { icon: Receipt, label: "Pay\nBills", color: "bg-primary" },
    { icon: UserPlus, label: "Add\nBeneficiary", color: "bg-primary" },
    { icon: FileText, label: "Savings\nStatement", color: "bg-primary" },
    { icon: FileText, label: "Checking\nStatement", color: "bg-primary" },
    { icon: Mail, label: "Monexa\nAlerts", color: "bg-primary" },
    { icon: DollarSign, label: "Monexa\nLoans", color: "bg-primary" },
    { icon: BarChart3, label: "Monexa\nInvestments", color: "bg-primary" },
    { icon: MessageCircle, label: "Monexa\nSupport", color: "bg-primary" },
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
          <button className="flex items-center gap-1 text-primary text-sm font-medium border border-primary rounded-full px-3 py-1">
            Add New <UserPlus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-muted-foreground">
          No Beneficiary. <span className="text-primary cursor-pointer">Add New</span>
        </p>
      </div>

      {/* Monexa Cards */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Monexa Cards</h3>
        
        {/* ATM Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-2xl p-6 text-primary-foreground shadow-xl aspect-[1.6/1] relative overflow-hidden">
          {/* Card chip */}
          <div className="absolute top-6 left-6">
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md" />
          </div>
          
          {/* Logo */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/80 rounded flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-bold text-lg">MONEXA</span>
          </div>
          
          {/* Card Number */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/4">
            <p className="text-xl font-mono tracking-widest">
              {formatCardNumber(profile?.card_number)}
            </p>
          </div>
          
          {/* Expiry and Name */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70">VALID THRU</p>
                <p className="text-sm font-mono">{profile?.card_expiry || "XX/XX"}</p>
                <p className="text-lg font-bold uppercase mt-2">
                  {profile?.full_name || "CARD HOLDER"}
                </p>
              </div>
            </div>
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
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Mail className="w-5 h-5" />
            <span className="text-xs">Notifications</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
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
