import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminActionRequest {
  action: "approve" | "reject";
  transactionId?: string;
  loanId?: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || userRole.role !== "admin") {
      throw new Error("Admin access required");
    }

    const body: AdminActionRequest = await req.json();
    console.log("Admin action:", { adminId: user.id, ...body });

    if (body.transactionId) {
      // Handle transaction approval/rejection
      const { data: transaction, error: txError } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("id", body.transactionId)
        .single();

      if (txError || !transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status !== "pending") {
        throw new Error("Transaction is not pending");
      }

      const balanceField = transaction.account_type === "savings" ? "savings_balance" : "checking_balance";

      if (body.action === "approve") {
        // Update transaction status
        await supabaseAdmin
          .from("transactions")
          .update({
            status: "completed",
            admin_action_by: user.id,
            admin_action_at: new Date().toISOString(),
            admin_notes: body.notes,
          })
          .eq("id", body.transactionId);

        // Create notification
        await supabaseAdmin.from("notifications").insert({
          user_id: transaction.user_id,
          title: "Transfer Approved",
          message: `Your transfer of $${transaction.amount.toFixed(2)} has been approved`,
          type: "success",
          related_transaction_id: transaction.id,
        });

        console.log("Transaction approved:", body.transactionId);

      } else if (body.action === "reject") {
        // Refund the amount
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("checking_balance, savings_balance")
          .eq("user_id", transaction.user_id)
          .single();

        const profileData = profile as { checking_balance: number; savings_balance: number } | null;
        const currentBalance = transaction.account_type === "savings" 
          ? Number(profileData?.savings_balance) || 0
          : Number(profileData?.checking_balance) || 0;
        const refundedBalance = currentBalance + Number(transaction.amount);

        await supabaseAdmin
          .from("profiles")
          .update({ [balanceField]: refundedBalance })
          .eq("user_id", transaction.user_id);

        // Update transaction status
        await supabaseAdmin
          .from("transactions")
          .update({
            status: "failed",
            admin_action_by: user.id,
            admin_action_at: new Date().toISOString(),
            admin_notes: body.notes,
          })
          .eq("id", body.transactionId);

        // Create refund transaction
        await supabaseAdmin.from("transactions").insert({
          user_id: transaction.user_id,
          type: "credit",
          category: "refund",
          description: `Refund: ${transaction.description}`,
          amount: transaction.amount,
          status: "completed",
          reference: `REF-${transaction.reference}`,
          balance_before: currentBalance,
          balance_after: refundedBalance,
          account_type: transaction.account_type,
        });

        // Create notification
        await supabaseAdmin.from("notifications").insert({
          user_id: transaction.user_id,
          title: "Transfer Rejected",
          message: `Your transfer of $${transaction.amount.toFixed(2)} was rejected. Funds have been refunded.${body.notes ? ` Reason: ${body.notes}` : ""}`,
          type: "error",
          related_transaction_id: transaction.id,
        });

        console.log("Transaction rejected and refunded:", body.transactionId);
      }

      return new Response(
        JSON.stringify({ success: true, message: `Transaction ${body.action}d successfully` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (body.loanId) {
      // Handle loan approval/rejection
      const { data: loan, error: loanError } = await supabaseAdmin
        .from("loans")
        .select("*")
        .eq("id", body.loanId)
        .single();

      if (loanError || !loan) {
        throw new Error("Loan not found");
      }

      if (loan.status !== "pending") {
        throw new Error("Loan is not pending");
      }

      if (body.action === "approve") {
        // Get user profile
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("checking_balance")
          .eq("user_id", loan.user_id)
          .single();

        const currentBalance = Number(profile?.checking_balance) || 0;
        const newBalance = currentBalance + Number(loan.amount);

        // Add loan amount to checking balance
        await supabaseAdmin
          .from("profiles")
          .update({ checking_balance: newBalance })
          .eq("user_id", loan.user_id);

        // Update loan status
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        await supabaseAdmin
          .from("loans")
          .update({
            status: "active",
            admin_action_by: user.id,
            admin_action_at: new Date().toISOString(),
            admin_notes: body.notes,
            next_payment_date: nextPaymentDate.toISOString().split("T")[0],
          })
          .eq("id", body.loanId);

        // Create transaction
        await supabaseAdmin.from("transactions").insert({
          user_id: loan.user_id,
          type: "credit",
          category: "loan_disbursement",
          description: `Loan disbursement - ${loan.purpose || "Personal loan"}`,
          amount: loan.amount,
          status: "completed",
          reference: `LOAN-${body.loanId.slice(0, 8).toUpperCase()}`,
          balance_before: currentBalance,
          balance_after: newBalance,
          account_type: "checking",
        });

        // Create notification
        await supabaseAdmin.from("notifications").insert({
          user_id: loan.user_id,
          title: "Loan Approved",
          message: `Your loan of $${loan.amount.toFixed(2)} has been approved and credited to your account`,
          type: "success",
        });

        console.log("Loan approved:", body.loanId);

      } else if (body.action === "reject") {
        await supabaseAdmin
          .from("loans")
          .update({
            status: "rejected",
            admin_action_by: user.id,
            admin_action_at: new Date().toISOString(),
            admin_notes: body.notes,
          })
          .eq("id", body.loanId);

        await supabaseAdmin.from("notifications").insert({
          user_id: loan.user_id,
          title: "Loan Rejected",
          message: `Your loan application for $${loan.amount.toFixed(2)} was rejected.${body.notes ? ` Reason: ${body.notes}` : ""}`,
          type: "error",
        });

        console.log("Loan rejected:", body.loanId);
      }

      return new Response(
        JSON.stringify({ success: true, message: `Loan ${body.action}d successfully` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("No transaction or loan ID provided");

  } catch (error: unknown) {
    console.error("Admin action error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
