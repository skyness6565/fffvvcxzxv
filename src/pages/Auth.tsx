import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Upload } from "lucide-react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Netherlands", "Switzerland", "Japan", 
  "South Korea", "Singapore", "Nigeria", "South Africa", "Ghana", "Kenya"
];

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "ZAR", "GHS", "KES"];

const genders = ["Male", "Female", "Other", "Prefer not to say"];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    // Login fields
    email: "",
    password: "",
    
    // Personal Information
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    ssnTaxId: "",
    occupation: "",
    
    // Contact Information
    country: "",
    city: "",
    zip: "",
    address: "",
    
    // Next of Kin
    nextOfKinName: "",
    nextOfKinEmail: "",
    nextOfKinPhone: "",
    nextOfKinRelationship: "",
    nextOfKinAddress: "",
    
    // Account Information
    accountCurrency: "",
    confirmPassword: "",
    pin: "",
  });

  // File state
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.pin || formData.pin.length < 4) {
        newErrors.pin = "PIN must be at least 4 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file: File, userId: string, type: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (signUpError) throw signUpError;

        if (authData.user) {
          // Upload KYC documents
          let passportPhotoUrl = null;
          let idDocumentUrl = null;

          if (passportPhoto) {
            passportPhotoUrl = await uploadFile(passportPhoto, authData.user.id, 'passport');
          }
          if (idDocument) {
            idDocumentUrl = await uploadFile(idDocument, authData.user.id, 'id-document');
          }

          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              full_name: formData.fullName,
              phone: formData.phone,
              date_of_birth: formData.dateOfBirth || null,
              gender: formData.gender,
              ssn_tax_id: formData.ssnTaxId,
              occupation: formData.occupation,
              country: formData.country,
              city: formData.city,
              zip: formData.zip,
              address: formData.address,
              next_of_kin_name: formData.nextOfKinName,
              next_of_kin_email: formData.nextOfKinEmail,
              next_of_kin_phone: formData.nextOfKinPhone,
              next_of_kin_relationship: formData.nextOfKinRelationship,
              next_of_kin_address: formData.nextOfKinAddress,
              account_currency: formData.accountCurrency,
              pin: formData.pin,
              passport_photo_url: passportPhotoUrl,
              id_document_url: idDocumentUrl,
            });

          if (profileError) throw profileError;
        }

        toast({
          title: "Account created!",
          description: "Your enrollment has been completed successfully.",
        });
      }
    } catch (error: any) {
      let message = error.message;
      if (error.message.includes("User already registered")) {
        message = "This email is already registered. Please login instead.";
      } else if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please try again.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'id') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      if (type === 'passport') {
        setPassportPhoto(file);
      } else {
        setIdDocument(file);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-monexa-blue via-monexa-blue-dark to-monexa-teal-dark flex flex-col">
      {/* Header */}
      <header className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8 pt-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-foreground font-display">
              MONEXA<span className="text-monexa-gold">.</span>
            </h1>
            <p className="text-primary-foreground/80 mt-2">
              {isLogin ? "Welcome back! Sign in to continue." : "Complete Your Enrollment"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 shadow-xl max-h-[75vh] overflow-y-auto">
            {/* Tab Switcher */}
            <div className="flex mb-6 bg-secondary rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                  isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                  !isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isLogin ? (
                // Login Form
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1"
                      required
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        placeholder="Enter your password"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                </div>
              ) : (
                // Enrollment Form
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => updateFormData('fullName', e.target.value)}
                          placeholder="Enter your full name"
                          className="mt-1"
                          required
                        />
                        {errors.fullName && (
                          <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="signupEmail">Email *</Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="Enter your email"
                          className="mt-1"
                          required
                        />
                        {errors.email && (
                          <p className="text-destructive text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => updateFormData('gender', v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {genders.map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ssnTaxId">Social Security Number/Tax ID</Label>
                        <Input
                          id="ssnTaxId"
                          value={formData.ssnTaxId}
                          onChange={(e) => updateFormData('ssnTaxId', e.target.value)}
                          placeholder="Enter SSN/Tax ID"
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => updateFormData('occupation', e.target.value)}
                          placeholder="Enter your occupation"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select value={formData.country} onValueChange={(v) => updateFormData('country', v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => updateFormData('city', e.target.value)}
                          placeholder={formData.country ? "Enter city" : "Select Country First"}
                          className="mt-1"
                          disabled={!formData.country}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP</Label>
                        <Input
                          id="zip"
                          value={formData.zip}
                          onChange={(e) => updateFormData('zip', e.target.value)}
                          placeholder="Enter ZIP code"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                          placeholder="Enter your address"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Next of Kin Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Next of Kin Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nextOfKinName">Name</Label>
                        <Input
                          id="nextOfKinName"
                          value={formData.nextOfKinName}
                          onChange={(e) => updateFormData('nextOfKinName', e.target.value)}
                          placeholder="Enter name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nextOfKinEmail">Email</Label>
                        <Input
                          id="nextOfKinEmail"
                          type="email"
                          value={formData.nextOfKinEmail}
                          onChange={(e) => updateFormData('nextOfKinEmail', e.target.value)}
                          placeholder="Enter email"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nextOfKinPhone">Phone</Label>
                        <Input
                          id="nextOfKinPhone"
                          type="tel"
                          value={formData.nextOfKinPhone}
                          onChange={(e) => updateFormData('nextOfKinPhone', e.target.value)}
                          placeholder="Enter phone"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nextOfKinRelationship">Relationship</Label>
                        <Input
                          id="nextOfKinRelationship"
                          value={formData.nextOfKinRelationship}
                          onChange={(e) => updateFormData('nextOfKinRelationship', e.target.value)}
                          placeholder="e.g: Brother"
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="nextOfKinAddress">Address</Label>
                        <Input
                          id="nextOfKinAddress"
                          value={formData.nextOfKinAddress}
                          onChange={(e) => updateFormData('nextOfKinAddress', e.target.value)}
                          placeholder="Enter address"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountCurrency">Account Currency</Label>
                        <Select value={formData.accountCurrency} onValueChange={(v) => updateFormData('accountCurrency', v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pin">PIN *</Label>
                        <Input
                          id="pin"
                          type="password"
                          value={formData.pin}
                          onChange={(e) => updateFormData('pin', e.target.value)}
                          placeholder="Enter 4-digit PIN"
                          className="mt-1"
                          maxLength={6}
                          required
                        />
                        {errors.pin && (
                          <p className="text-destructive text-sm mt-1">{errors.pin}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="signupPassword">Password *</Label>
                        <div className="relative mt-1">
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            placeholder="Enter password"
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-destructive text-sm mt-1">{errors.password}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Repeat Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                          placeholder="Confirm password"
                          className="mt-1"
                          required
                        />
                        {errors.confirmPassword && (
                          <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* KYC Verification */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      KYC Verification
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="passportPhoto">Passport Photograph</Label>
                        <div className="mt-1 flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Choose File</span>
                            <input
                              id="passportPhoto"
                              type="file"
                              accept=".png,.jpg,.jpeg,.gif"
                              onChange={(e) => handleFileChange(e, 'passport')}
                              className="hidden"
                            />
                          </label>
                          <span className="text-sm text-muted-foreground">
                            {passportPhoto ? passportPhoto.name : "No file chosen"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted File Type: png, jpg, gif (max: 5mb)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="idDocument">Means of Identification</Label>
                        <div className="mt-1 flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Choose File</span>
                            <input
                              id="idDocument"
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.gif"
                              onChange={(e) => handleFileChange(e, 'id')}
                              className="hidden"
                            />
                          </label>
                          <span className="text-sm text-muted-foreground">
                            {idDocument ? idDocument.name : "No file chosen"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted Documents: Passport ID, National ID, Bank Statement, Utility Bill
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Accepted File Type: PDF, png, jpg, gif (max: 5mb)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-monexa-teal to-monexa-blue hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Complete Enrollment"}
              </Button>
            </form>

            {isLogin && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-monexa-teal font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            )}

            {!isLogin && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-monexa-teal font-medium hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;