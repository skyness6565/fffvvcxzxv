import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Wifi, Droplets, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const billTypes = [
  { id: "electricity", name: "Electricity", icon: Zap },
  { id: "internet", name: "Internet", icon: Wifi },
  { id: "water", name: "Water", icon: Droplets },
  { id: "phone", name: "Phone", icon: Phone },
];

const PayBills = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accountNumber: "",
    amount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Successful",
      description: "Your bill payment has been processed.",
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
          <h1 className="text-xl font-bold text-primary-foreground">Pay Bills</h1>
        </div>
      </header>

      <div className="p-4">
        <p className="text-muted-foreground mb-4">Select bill type</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {billTypes.map((bill) => (
            <button
              key={bill.id}
              onClick={() => setSelectedBill(bill.id)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                selectedBill === bill.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <bill.icon className={`w-8 h-8 ${selectedBill === bill.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-foreground font-medium">{bill.name}</span>
            </button>
          ))}
        </div>

        {selectedBill && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Enter account number"
                required
              />
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

            <Button type="submit" className="w-full mt-6">
              Pay Bill
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PayBills;
