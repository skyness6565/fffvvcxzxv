import { useState } from "react";
import { ChevronUp, ChevronDown, FileText, CreditCard, HandCoins, Building2, TrendingUp, Info } from "lucide-react";

const serviceItems = [
  { icon: FileText, label: "INSTANT ACCOUNTS" },
  { icon: CreditCard, label: "CREDIT CARDS" },
  { icon: HandCoins, label: "LOANS" },
  { icon: Building2, label: "BUSINESS BANKING" },
  { icon: TrendingUp, label: "WEALTH & RETIRE" },
  { icon: Info, label: "ABOUT MONEXA" },
];

const MemberCareSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-primary text-primary-foreground py-4 px-6 flex items-center justify-center gap-2 font-semibold text-lg rounded-lg"
        >
          MEMBER CARE
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isOpen && (
          <div className="bg-primary mt-2 rounded-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {serviceItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-3 cursor-pointer group">
                  <div className="w-20 h-20 rounded-lg border-2 border-monexa-teal bg-primary flex items-center justify-center group-hover:bg-monexa-teal/20 transition-colors">
                    <item.icon className="w-10 h-10 text-monexa-teal" />
                  </div>
                  <span className="text-sm font-semibold text-primary-foreground text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MemberCareSection;
