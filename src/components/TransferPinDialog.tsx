import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TransferPinDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "verify";
  userId: string;
}

const TransferPinDialog = ({ open, onClose, onSuccess, mode, userId }: TransferPinDialogProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreatePin = async () => {
    if (step === "enter") {
      if (pin.length !== 4) {
        toast({ title: "Error", description: "Please enter a 4-digit PIN", variant: "destructive" });
        return;
      }
      setStep("confirm");
      return;
    }

    if (confirmPin !== pin) {
      toast({ title: "Error", description: "PINs do not match", variant: "destructive" });
      setConfirmPin("");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ pin })
        .eq("user_id", userId);

      if (error) throw error;

      toast({ title: "Success", description: "Transfer PIN created successfully" });
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create PIN", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      toast({ title: "Error", description: "Please enter your 4-digit PIN", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("pin")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data.pin !== pin) {
        toast({ title: "Error", description: "Incorrect PIN", variant: "destructive" });
        setPin("");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: "Failed to verify PIN", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setConfirmPin("");
    setStep("enter");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {mode === "create" 
              ? step === "enter" ? "Create Transfer PIN" : "Confirm Your PIN"
              : "Enter Transfer PIN"
            }
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "create"
              ? step === "enter" 
                ? "Create a 4-digit PIN to secure your transfers"
                : "Re-enter your PIN to confirm"
              : "Enter your 4-digit PIN to proceed with the transfer"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP
            maxLength={4}
            value={mode === "create" && step === "confirm" ? confirmPin : pin}
            onChange={(value) => {
              if (mode === "create" && step === "confirm") {
                setConfirmPin(value);
              } else {
                setPin(value);
              }
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>

          <Button 
            onClick={mode === "create" ? handleCreatePin : handleVerifyPin}
            disabled={loading || (mode === "create" && step === "confirm" ? confirmPin.length !== 4 : pin.length !== 4)}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Verifying..."}
              </>
            ) : (
              mode === "create" 
                ? step === "enter" ? "Continue" : "Create PIN"
                : "Verify PIN"
            )}
          </Button>

          {mode === "create" && step === "confirm" && (
            <Button 
              variant="ghost" 
              onClick={() => { setStep("enter"); setConfirmPin(""); }}
            >
              Go Back
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferPinDialog;
