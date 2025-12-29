import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "XRP", name: "Ripple" },
];

const BuyCrypto = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    crypto: "BTC",
    amount: "",
    walletAddress: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Order Submitted",
      description: "Your crypto purchase order has been submitted for processing.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Buy Crypto</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-card rounded-xl p-4 mb-4 flex items-center gap-3">
          <Bitcoin className="w-10 h-10 text-orange-500" />
          <div>
            <p className="font-semibold text-foreground">Buy Cryptocurrency</p>
            <p className="text-sm text-muted-foreground">Purchase crypto with your account balance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <select
              id="crypto"
              value={formData.crypto}
              onChange={(e) => setFormData({ ...formData, crypto: e.target.value })}
              className="w-full p-3 rounded-md border border-input bg-background"
            >
              {cryptoOptions.map((crypto) => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              placeholder="Enter your wallet address"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6">
            Buy Now
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BuyCrypto;
