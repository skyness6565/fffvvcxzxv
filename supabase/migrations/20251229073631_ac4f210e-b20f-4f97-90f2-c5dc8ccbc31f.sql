-- Update profiles to have separate checking and savings balances
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS checking_balance NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS savings_balance NUMERIC DEFAULT 0.00;

-- Migrate existing balance to checking_balance
UPDATE public.profiles SET checking_balance = COALESCE(balance, 0) WHERE checking_balance = 0;

-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  beneficiary_type TEXT NOT NULL DEFAULT 'local' CHECK (beneficiary_type IN ('local', 'wire', 'internal')),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_number, bank_name)
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own beneficiaries"
ON public.beneficiaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own beneficiaries"
ON public.beneficiaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beneficiaries"
ON public.beneficiaries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beneficiaries"
ON public.beneficiaries FOR DELETE
USING (auth.uid() = user_id);

-- Update transactions table to support all transaction types
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS recipient_user_id UUID,
ADD COLUMN IF NOT EXISTS beneficiary_id UUID REFERENCES public.beneficiaries(id),
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS swift_code TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS routing_number TEXT,
ADD COLUMN IF NOT EXISTS balance_before NUMERIC,
ADD COLUMN IF NOT EXISTS balance_after NUMERIC,
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
ADD COLUMN IF NOT EXISTS admin_action_by UUID,
ADD COLUMN IF NOT EXISTS admin_action_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Drop old check constraint and add new one
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_category_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_category_check 
CHECK (category IN ('internal_transfer', 'wire_transfer', 'local_transfer', 'bill_payment', 'crypto_purchase', 'loan_disbursement', 'loan_repayment', 'investment', 'deposit', 'withdrawal', 'refund'));

-- Create loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL DEFAULT 5.0,
  term_months INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_repayment NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  purpose TEXT,
  admin_action_by UUID,
  admin_action_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  next_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans"
ON public.loans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
ON public.loans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  roi_percentage NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  expected_return NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matured', 'withdrawn')),
  maturity_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investments"
ON public.investments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
ON public.investments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create crypto wallets table
CREATE TABLE public.crypto_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  currency TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crypto wallets"
ON public.crypto_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crypto wallets"
ON public.crypto_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto wallets"
ON public.crypto_wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Create notifications/alerts table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  related_transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for transactions (view all)
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for loans
CREATE POLICY "Admins can view all loans"
ON public.loans FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update loans"
ON public.loans FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for profiles (to update balances)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert notifications for any user
CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.beneficiaries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_wallets;

-- Create trigger for loans updated_at
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for investments updated_at
CREATE TRIGGER update_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for crypto_wallets updated_at
CREATE TRIGGER update_crypto_wallets_updated_at
BEFORE UPDATE ON public.crypto_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();