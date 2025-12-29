import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WireTransfer from "./pages/WireTransfer";
import LocalTransfer from "./pages/LocalTransfer";
import InternalTransfer from "./pages/InternalTransfer";
import BuyCrypto from "./pages/BuyCrypto";
import PayBills from "./pages/PayBills";
import AddBeneficiary from "./pages/AddBeneficiary";
import Statement from "./pages/Statement";
import Alerts from "./pages/Alerts";
import Loans from "./pages/Loans";
import Investments from "./pages/Investments";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wire-transfer" element={<WireTransfer />} />
          <Route path="/local-transfer" element={<LocalTransfer />} />
          <Route path="/internal-transfer" element={<InternalTransfer />} />
          <Route path="/buy-crypto" element={<BuyCrypto />} />
          <Route path="/pay-bills" element={<PayBills />} />
          <Route path="/add-beneficiary" element={<AddBeneficiary />} />
          <Route path="/statement" element={<Statement />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
