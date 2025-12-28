import { MessageCircle } from "lucide-react";

const BottomBar = () => {
  return (
    <>
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="grid grid-cols-2">
          <button className="py-4 text-center font-semibold text-foreground hover:bg-secondary transition-colors border-r border-border">
            Login
          </button>
          <button className="py-4 text-center font-semibold text-foreground hover:bg-secondary transition-colors">
            Open Account
          </button>
        </div>
        <div className="h-1 bg-gradient-to-r from-monexa-teal to-monexa-blue" />
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-monexa-teal rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50">
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Spacer for fixed bottom bar */}
      <div className="h-16" />
    </>
  );
};

export default BottomBar;
