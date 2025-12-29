import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Mail, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState({
    email: true,
    sms: false,
    push: true,
    transactions: true,
    security: true,
    promotions: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Monexa Alerts</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Channels
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Email Notifications</span>
              </div>
              <Switch
                checked={alerts.email}
                onCheckedChange={(checked) => setAlerts({ ...alerts, email: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">SMS Notifications</span>
              </div>
              <Switch
                checked={alerts.sms}
                onCheckedChange={(checked) => setAlerts({ ...alerts, sms: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Push Notifications</span>
              </div>
              <Switch
                checked={alerts.push}
                onCheckedChange={(checked) => setAlerts({ ...alerts, push: checked })}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Alert Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Transaction Alerts</span>
              <Switch
                checked={alerts.transactions}
                onCheckedChange={(checked) => setAlerts({ ...alerts, transactions: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-foreground">Security Alerts</span>
              <Switch
                checked={alerts.security}
                onCheckedChange={(checked) => setAlerts({ ...alerts, security: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-foreground">Promotions & Offers</span>
              <Switch
                checked={alerts.promotions}
                onCheckedChange={(checked) => setAlerts({ ...alerts, promotions: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
