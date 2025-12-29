import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Home, Car, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const loanTypes = [
  { id: "personal", name: "Personal Loan", icon: DollarSign, rate: "8.99%" },
  { id: "home", name: "Home Loan", icon: Home, rate: "5.25%" },
  { id: "auto", name: "Auto Loan", icon: Car, rate: "6.49%" },
  { id: "education", name: "Education Loan", icon: GraduationCap, rate: "4.99%" },
  { id: "business", name: "Business Loan", icon: Briefcase, rate: "9.99%" },
];

const Loans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApply = (loanType: string) => {
    toast({
      title: "Application Started",
      description: `Your ${loanType} application has been initiated. A representative will contact you shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Monexa Loans</h1>
        </div>
      </header>

      <div className="p-4">
        <p className="text-muted-foreground mb-6">
          Choose from our variety of loan options with competitive rates.
        </p>

        <div className="space-y-4">
          {loanTypes.map((loan) => (
            <div key={loan.id} className="bg-card rounded-xl p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-primary">
                  <loan.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{loan.name}</h3>
                  <p className="text-sm text-muted-foreground">Starting at {loan.rate} APR</p>
                </div>
              </div>
              <Button
                onClick={() => handleApply(loan.name)}
                variant="outline"
                className="w-full"
              >
                Apply Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loans;
