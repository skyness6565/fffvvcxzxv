-- Add card_number and account_number columns to profiles for ATM card
ALTER TABLE public.profiles 
ADD COLUMN card_number TEXT,
ADD COLUMN account_number TEXT,
ADD COLUMN balance DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN card_expiry TEXT;

-- Create a function to generate random card number on profile creation
CREATE OR REPLACE FUNCTION public.generate_card_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Generate 16-digit card number (first 4 always 4716)
  NEW.card_number := '4716' || LPAD(FLOOR(RANDOM() * 1000000000000)::TEXT, 12, '0');
  -- Generate 10-digit account number
  NEW.account_number := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
  -- Set card expiry to 3 years from now
  NEW.card_expiry := TO_CHAR(NOW() + INTERVAL '3 years', 'MM/YY');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate card details on profile insert
CREATE TRIGGER on_profile_created_generate_card
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_card_details();