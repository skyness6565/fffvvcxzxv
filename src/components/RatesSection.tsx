import { useState } from "react";
import { ChevronUp, ChevronDown, PiggyBank, CreditCard, HandCoins, Home } from "lucide-react";

const rates = [
  {
    rate: "3.75%",
    type: "APY",
    title: "HIGH YIELD SAVINGS ACCOUNT",
    link: "High Yield Savings Rate",
  },
  {
    rate: "3.65%",
    type: "APY",
    title: "18 MONTH CERTIFICATE",
    link: "Monexa Standard Certificate Rates",
  },
  {
    rate: "4.00%",
    type: "APY",
    title: "36 MONTH CERTIFICATE",
    link: "Monexa Standard Certificate Rates",
  },
  {
    rate: "15.49%",
    type: "APR",
    prefix: "AS LOW AS",
    title: "CASH REWARDS MASTERCARD",
    link: "Mastercard",
    subtitle: "variable APR",
  },
];

const featuredItems = [
  { icon: PiggyBank, label: "SAVINGS" },
  { icon: CreditCard, label: "CREDIT CARDS" },
  { icon: HandCoins, label: "LOANS" },
  { icon: Home, label: "MORTGAGES" },
];

const RatesSection = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-primary text-primary-foreground py-4 px-6 flex items-center justify-center gap-2 font-semibold text-lg rounded-t-lg"
        >
          RATES
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isOpen && (
          <div className="bg-card border border-border rounded-b-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Rates Column */}
              <div className="p-6 space-y-6">
                {rates.map((item, index) => (
                  <div key={index} className="text-center md:text-left">
                    {item.prefix && (
                      <p className="text-sm text-muted-foreground mb-1">{item.prefix}</p>
                    )}
                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                      <span className="text-4xl md:text-5xl font-bold text-monexa-teal">
                        {item.rate}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.type}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1">{item.title}</p>
                    <a href="#" className="text-sm text-primary hover:underline">
                      {item.link}
                    </a>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Featured Column */}
              <div className="p-6 bg-secondary/50">
                <h3 className="text-monexa-teal font-semibold text-center mb-6">FEATURED</h3>
                <div className="grid grid-cols-2 gap-6">
                  {featuredItems.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <div className="w-16 h-16 rounded-lg border-2 border-monexa-teal flex items-center justify-center group-hover:bg-monexa-teal/10 transition-colors">
                        <item.icon className="w-8 h-8 text-monexa-teal" />
                      </div>
                      <span className="text-xs font-semibold text-monexa-teal text-center">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RatesSection;
