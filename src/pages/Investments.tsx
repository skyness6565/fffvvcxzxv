import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const investmentOptions = [
  { id: "stocks", name: "Stocks", icon: TrendingUp, description: "Invest in top companies" },
  { id: "bonds", name: "Bonds", icon: BarChart3, description: "Fixed income securities" },
  { id: "mutual", name: "Mutual Funds", icon: PieChart, description: "Diversified portfolios" },
  { id: "gold", name: "Gold", icon: Coins, description: "Precious metals investment" },
];

const Investments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInvest = (option: string) => {
    toast({
      title: "Investment Interest",
      description: `Thank you for your interest in ${option}. An investment advisor will contact you shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Monexa Investments</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-gradient-to-br from-monexa-blue to-monexa-teal rounded-xl p-6 text-primary-foreground mb-6">
          <h2 className="text-2xl font-bold mb-2">Start Investing Today</h2>
          <p className="opacity-90">Grow your wealth with our expert-curated investment options.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {investmentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleInvest(option.name)}
              className="bg-card rounded-xl p-4 text-left hover:shadow-lg transition-shadow"
            >
              <div className="p-3 rounded-xl bg-primary w-fit mb-3">
                <option.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">{option.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-2">Your Portfolio</h3>
          <p className="text-muted-foreground text-sm">
            You don't have any investments yet. Start your investment journey today!
          </p>
          <Button className="w-full mt-4">
            Open Investment Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Investments;
