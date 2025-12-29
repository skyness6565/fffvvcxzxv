import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferRequest {
  type: "internal" | "wire" | "local";
  amount: number;
  accountType: "checking" | "savings";
  recipientEmail?: string;
  recipientAccountNumber?: string;
  bankName?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  description?: string;
  beneficiaryId?: string;
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

    // Create client with user's auth
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Create admin client for balance updates
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body: TransferRequest = await req.json();
    console.log("Transfer request:", { userId: user.id, type: body.type, amount: body.amount });

    // Validate amount
    if (!body.amount || body.amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Get sender's profile
    const { data: senderProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !senderProfile) {
      throw new Error("Profile not found");
    }

    const balanceField = body.accountType === "savings" ? "savings_balance" : "checking_balance";
    const currentBalance = Number(senderProfile[balanceField]) || 0;

    // Check sufficient balance
    if (currentBalance < body.amount) {
      throw new Error(`Insufficient ${body.accountType} balance. Available: $${currentBalance.toFixed(2)}`);
    }

    const newBalance = currentBalance - body.amount;
    const transactionRef = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    if (body.type === "internal") {
      // Internal transfer - instant completion
      if (!body.recipientEmail && !body.recipientAccountNumber) {
        throw new Error("Recipient email or account number required");
      }

      // Find recipient
      let recipientQuery = supabaseAdmin.from("profiles").select("*");
      if (body.recipientEmail) {
        // Get user by email from auth
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const recipientUser = users?.users?.find(u => u.email === body.recipientEmail);
        if (!recipientUser) {
          throw new Error("Recipient not found");
        }
        recipientQuery = recipientQuery.eq("user_id", recipientUser.id);
      } else if (body.recipientAccountNumber) {
        recipientQuery = recipientQuery.eq("account_number", body.recipientAccountNumber);
      }

      const { data: recipientProfile, error: recipientError } = await recipientQuery.single();
      if (recipientError || !recipientProfile) {
        throw new Error("Recipient not found");
      }

      if (recipientProfile.user_id === user.id) {
        throw new Error("Cannot transfer to yourself");
      }

      const recipientCurrentBalance = Number(recipientProfile[balanceField]) || 0;
      const recipientNewBalance = recipientCurrentBalance + body.amount;

      // Update sender balance
      const { error: senderUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ [balanceField]: newBalance })
        .eq("user_id", user.id);

      if (senderUpdateError) {
        throw new Error("Failed to update sender balance");
      }

      // Update recipient balance
      const { error: recipientUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ [balanceField]: recipientNewBalance })
        .eq("user_id", recipientProfile.user_id);

      if (recipientUpdateError) {
        // Rollback sender balance
        await supabaseAdmin
          .from("profiles")
          .update({ [balanceField]: currentBalance })
          .eq("user_id", user.id);
        throw new Error("Failed to update recipient balance");
      }

      // Create sender transaction (debit)
      const { data: senderTx, error: senderTxError } = await supabaseAdmin
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "debit",
          category: "internal_transfer",
          description: body.description || `Transfer to ${recipientProfile.full_name}`,
          amount: body.amount,
          status: "completed",
          reference: transactionRef,
          recipient_user_id: recipientProfile.user_id,
          balance_before: currentBalance,
          balance_after: newBalance,
          account_type: body.accountType,
        })
        .select()
        .single();

      if (senderTxError) {
        console.error("Sender transaction error:", senderTxError);
      }

      // Create recipient transaction (credit)
      await supabaseAdmin
        .from("transactions")
        .insert({
          user_id: recipientProfile.user_id,
          type: "credit",
          category: "internal_transfer",
          description: body.description || `Transfer from ${senderProfile.full_name}`,
          amount: body.amount,
          status: "completed",
          reference: transactionRef,
          recipient_user_id: user.id,
          balance_before: recipientCurrentBalance,
          balance_after: recipientNewBalance,
          account_type: body.accountType,
        });

      // Create notifications
      await supabaseAdmin.from("notifications").insert([
        {
          user_id: user.id,
          title: "Transfer Sent",
          message: `$${body.amount.toFixed(2)} sent to ${recipientProfile.full_name}`,
          type: "success",
          related_transaction_id: senderTx?.id,
        },
        {
          user_id: recipientProfile.user_id,
          title: "Money Received",
          message: `$${body.amount.toFixed(2)} received from ${senderProfile.full_name}`,
          type: "success",
        },
      ]);

      console.log("Internal transfer completed:", transactionRef);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Transfer completed successfully",
          reference: transactionRef,
          newBalance,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      // Wire or Local transfer - requires admin approval
      // Deduct balance immediately (locked funds)
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ [balanceField]: newBalance })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error("Failed to lock funds");
      }

      // Create pending transaction
      const { data: transaction, error: txError } = await supabaseAdmin
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "debit",
          category: body.type === "wire" ? "wire_transfer" : "local_transfer",
          description: body.description || `${body.type === "wire" ? "Wire" : "Local"} transfer to ${body.bankName}`,
          amount: body.amount,
          status: "pending",
          reference: transactionRef,
          bank_name: body.bankName,
          account_number: body.recipientAccountNumber,
          routing_number: body.routingNumber,
          swift_code: body.swiftCode,
          iban: body.iban,
          beneficiary_id: body.beneficiaryId,
          balance_before: currentBalance,
          balance_after: newBalance,
          account_type: body.accountType,
        })
        .select()
        .single();

      if (txError) {
        // Rollback balance
        await supabaseAdmin
          .from("profiles")
          .update({ [balanceField]: currentBalance })
          .eq("user_id", user.id);
        throw new Error("Failed to create transaction");
      }

      // Create notification
      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        title: "Transfer Pending",
        message: `Your ${body.type} transfer of $${body.amount.toFixed(2)} is pending approval`,
        type: "info",
        related_transaction_id: transaction.id,
      });

      console.log("Pending transfer created:", transactionRef);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Transfer submitted for approval",
          reference: transactionRef,
          status: "pending",
          newBalance,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: unknown) {
    console.error("Transfer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
