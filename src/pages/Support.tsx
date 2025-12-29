import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  { question: "How do I reset my PIN?", answer: "Go to Settings > Security > Reset PIN" },
  { question: "How long do transfers take?", answer: "Local transfers: 1-2 business days. Wire transfers: 3-5 business days." },
  { question: "What are the transfer limits?", answer: "Daily limit: $10,000. Monthly limit: $50,000." },
];

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Our support team will respond within 24 hours.",
    });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Monexa Support</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-card rounded-xl p-4 flex flex-col items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            <span className="text-xs text-foreground">Call Us</span>
          </button>
          <button className="bg-card rounded-xl p-4 flex flex-col items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            <span className="text-xs text-foreground">Email</span>
          </button>
          <button className="bg-card rounded-xl p-4 flex flex-col items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            <span className="text-xs text-foreground">Live Chat</span>
          </button>
        </div>

        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border pb-3 last:border-0">
                <p className="font-medium text-foreground text-sm">{faq.question}</p>
                <p className="text-muted-foreground text-sm mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows={4}
              required
            />
            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
