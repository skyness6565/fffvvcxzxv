import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  checking_balance: number | null;
  savings_balance: number | null;
}

interface Beneficiary {
  id: string;
  name: string;
  bank_name: string;
  account_number: string;
  swift_code: string | null;
  iban: string | null;
}

const WireTransfer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [useBeneficiary, setUseBeneficiary] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryId: "",
    recipientName: "",
    bankName: "",
    accountNumber: "",
    swiftCode: "",
    iban: "",
    accountType: "checking",
    amount: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, beneficiariesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("checking_balance, savings_balance")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("beneficiaries")
          .select("*")
          .eq("user_id", user.id)
          .eq("beneficiary_type", "wire"),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }
      if (beneficiariesRes.data) {
        setBeneficiaries(beneficiariesRes.data as Beneficiary[]);
      }
    };

    fetchData();
  }, []);

  const getAvailableBalance = () => {
    if (!profile) return 0;
    return formData.accountType === "savings" 
      ? Number(profile.savings_balance) || 0
      : Number(profile.checking_balance) || 0;
  };

  const handleBeneficiarySelect = (beneficiaryId: string) => {
    const beneficiary = beneficiaries.find(b => b.id === beneficiaryId);
    if (beneficiary) {
      setFormData({
        ...formData,
        beneficiaryId,
        recipientName: beneficiary.name,
        bankName: beneficiary.bank_name,
        accountNumber: beneficiary.account_number,
        swiftCode: beneficiary.swift_code || "",
        iban: beneficiary.iban || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          type: "wire",
          amount,
          accountType: formData.accountType,
          bankName: formData.bankName,
          recipientAccountNumber: formData.accountNumber,
          swiftCode: formData.swiftCode,
          iban: formData.iban,
          description: formData.description || `Wire transfer to ${formData.recipientName}`,
          beneficiaryId: formData.beneficiaryId || undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Transfer Submitted",
        description: `Your wire transfer of $${amount.toFixed(2)} is pending approval. Ref: ${response.data.reference}`,
      });
      navigate("/dashboard");

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Wire Transfer</h1>
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

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ Wire transfers require admin approval and may take 1-3 business days to process.
          </p>
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

          {beneficiaries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useBeneficiary"
                  checked={useBeneficiary}
                  onChange={(e) => setUseBeneficiary(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useBeneficiary">Use saved beneficiary</Label>
              </div>
              
              {useBeneficiary && (
                <select
                  value={formData.beneficiaryId}
                  onChange={(e) => handleBeneficiarySelect(e.target.value)}
                  className="w-full p-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select beneficiary</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - {b.bank_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="Enter recipient name"
              required
              disabled={useBeneficiary && !!formData.beneficiaryId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="Enter bank name"
              required
              disabled={useBeneficiary && !!formData.beneficiaryId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number / IBAN</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="Enter account number"
              required
              disabled={useBeneficiary && !!formData.beneficiaryId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
            <Input
              id="swiftCode"
              value={formData.swiftCode}
              onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
              placeholder="Enter SWIFT code"
              required
              disabled={useBeneficiary && !!formData.beneficiaryId}
            />
          </div>

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
              "Submit Transfer"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WireTransfer;
