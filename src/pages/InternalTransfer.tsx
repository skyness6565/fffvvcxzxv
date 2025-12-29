import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const InternalTransfer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fromAccount: "savings",
    toAccount: "checking",
    amount: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Transfer Complete",
      description: "Your internal transfer has been processed successfully.",
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
          <h1 className="text-xl font-bold text-primary-foreground">Internal Transfer</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">From Account</Label>
          <select
            id="fromAccount"
            value={formData.fromAccount}
            onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
            className="w-full p-3 rounded-md border border-input bg-background"
          >
            <option value="savings">Savings Account</option>
            <option value="checking">Checking Account</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAccount">To Account</Label>
          <select
            id="toAccount"
            value={formData.toAccount}
            onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
            className="w-full p-3 rounded-md border border-input bg-background"
          >
            <option value="checking">Checking Account</option>
            <option value="savings">Savings Account</option>
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Transfer description"
          />
        </div>

        <Button type="submit" className="w-full mt-6">
          Transfer Now
        </Button>
      </form>
    </div>
  );
};

export default InternalTransfer;
