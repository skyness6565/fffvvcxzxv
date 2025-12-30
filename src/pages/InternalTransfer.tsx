import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TransferPinDialog from "@/components/TransferPinDialog";
import TransferReceipt, { TransferReceiptData } from "@/components/TransferReceipt";

interface Profile {
  checking_balance: number | null;
  savings_balance: number | null;
  pin: string | null;
}

const InternalTransfer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinMode, setPinMode] = useState<"create" | "verify">("verify");
  const [pinVerified, setPinVerified] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<TransferReceiptData | null>(null);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    recipientAccountNumber: "",
    searchType: "email",
    accountType: "checking",
    amount: "",
    description: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("checking_balance, savings_balance, pin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      }
    };

    fetchProfile();
  }, []);

  const getAvailableBalance = () => {
    if (!profile) return 0;
    return formData.accountType === "savings" 
      ? Number(profile.savings_balance) || 0
      : Number(profile.checking_balance) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user needs to create or verify PIN
    if (!pinVerified) {
      if (!profile?.pin) {
        setPinMode("create");
      } else {
        setPinMode("verify");
      }
      setShowPinDialog(true);
      return;
    }

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (amount > getAvailableBalance()) {
        throw new Error(`Insufficient balance. Available: $${getAvailableBalance().toFixed(2)}`);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please log in to continue");
      }

      const response = await supabase.functions.invoke("process-transfer", {
        body: {
          type: "internal",
          amount,
          accountType: formData.accountType,
          recipientEmail: formData.searchType === "email" ? formData.recipientEmail : undefined,
          recipientAccountNumber: formData.searchType === "account" ? formData.recipientAccountNumber : undefined,
          description: formData.description,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      // Show receipt
      setReceiptData({
        type: "internal",
        status: "completed",
        reference: response.data.reference,
        amount,
        recipientName: formData.searchType === "email" ? formData.recipientEmail : formData.recipientAccountNumber,
        bankName: "Monexa Bank",
        description: formData.description,
        date: new Date(),
      });
      setShowReceipt(true);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Transfer failed";
      toast({
        title: "Transfer Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setPinVerified(true);
    if (!profile?.pin) {
      setProfile(prev => prev ? { ...prev, pin: "set" } : null);
    }
    toast({ title: "PIN Verified", description: "You can now proceed with your transfer" });
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

      <div className="p-4">
        <div className="bg-card rounded-xl p-4 mb-4">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold text-foreground">
            ${getAvailableBalance().toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground capitalize">{formData.accountType} Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountType">From Account</Label>
            <select
              id="accountType"
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full p-3 rounded-md border border-input bg-background"
            >
              <option value="checking">Checking Account</option>
              <option value="savings">Savings Account</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Find Recipient By</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.searchType === "email" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, searchType: "email" })}
                className="flex-1"
              >
                Email
              </Button>
              <Button
                type="button"
                variant={formData.searchType === "account" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, searchType: "account" })}
                className="flex-1"
              >
                Account Number
              </Button>
            </div>
          </div>

          {formData.searchType === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="Enter recipient's email"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recipientAccountNumber">Recipient Account Number</Label>
              <Input
                id="recipientAccountNumber"
                value={formData.recipientAccountNumber}
                onChange={(e) => setFormData({ ...formData, recipientAccountNumber: e.target.value })}
                placeholder="Enter account number"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Transfer description"
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Transfer Now"
            )}
          </Button>
        </form>
      </div>

      <TransferPinDialog
        open={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handlePinSuccess}
        mode={pinMode}
        userId={userId}
      />

      <TransferReceipt
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={receiptData}
      />
    </div>
  );
};

export default InternalTransfer;
