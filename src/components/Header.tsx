import { useState } from "react";
import { Lock, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-primary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-destructive w-10 h-10 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <div className="text-primary-foreground">
              <div className="font-bold text-lg leading-tight">MONEXA</div>
              <div className="text-xs tracking-widest opacity-80">BANK</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button className="text-primary-foreground hover:opacity-80 transition-opacity">
              <Lock className="w-5 h-5" />
            </button>
            
            <button className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity">
              <div className="w-6 h-4 bg-gradient-to-b from-blue-600 via-white to-red-600 rounded-sm" />
              <span className="text-sm">English</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary/80">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary border-primary">
              <nav className="flex flex-col gap-4 mt-8">
                <a href="#" className="text-primary-foreground text-lg hover:opacity-80 transition-opacity">
                  Savings
                </a>
                <a href="#" className="text-primary-foreground text-lg hover:opacity-80 transition-opacity">
                  Credit Cards
                </a>
                <a href="#" className="text-primary-foreground text-lg hover:opacity-80 transition-opacity">
                  Loans
                </a>
                <a href="#" className="text-primary-foreground text-lg hover:opacity-80 transition-opacity">
                  Mortgages
                </a>
                <a href="#" className="text-primary-foreground text-lg hover:opacity-80 transition-opacity">
                  Business Banking
                </a>
                <a href="#" className="text-primary-foreground text-lg hover:opacity-80 transition-opacity">
                  About Monexa
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
