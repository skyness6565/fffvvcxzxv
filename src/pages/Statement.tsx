import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Statement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountType = searchParams.get("type") || "savings";
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your statement is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground capitalize">
            {accountType} Statement
          </h1>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-card rounded-xl p-6 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Statements Available</h2>
          <p className="text-muted-foreground mb-6">
            Your {accountType} account statements will appear here once transactions are made.
          </p>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download Latest Statement
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Statements</h3>
          <div className="space-y-3">
            <div className="bg-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">December 2025</p>
                  <p className="text-sm text-muted-foreground">No transactions</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statement;
