import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Bell, Shield, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const settingsItems = [
  { icon: User, label: "Profile Settings", path: "/settings/profile" },
  { icon: Lock, label: "Change Password", path: "/settings/password" },
  { icon: Shield, label: "Security & PIN", path: "/settings/security" },
  { icon: Bell, label: "Notifications", path: "/alerts" },
  { icon: CreditCard, label: "Card Management", path: "/settings/cards" },
  { icon: HelpCircle, label: "Help & Support", path: "/support" },
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Settings</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-card rounded-xl overflow-hidden">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={() => toast({ title: "Coming Soon", description: `${item.label} will be available soon.` })}
              className="w-full p-4 flex items-center gap-4 border-b border-border last:border-0 hover:bg-secondary transition-colors text-left"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 p-4 bg-destructive/10 rounded-xl flex items-center justify-center gap-2 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
