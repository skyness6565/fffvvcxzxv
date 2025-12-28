import { MessageCircle, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const BottomBar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  return (
    <>
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="grid grid-cols-2">
          {user ? (
            <>
              <div className="py-4 text-center font-semibold text-foreground border-r border-border truncate px-2">
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="py-4 text-center font-semibold text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="py-4 text-center font-semibold text-foreground hover:bg-secondary transition-colors border-r border-border"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="py-4 text-center font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Open Account
              </Link>
            </>
          )}
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
