export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          account_number: string
          bank_name: string
          beneficiary_type: string
          created_at: string
          email: string | null
          iban: string | null
          id: string
          name: string
          routing_number: string | null
          swift_code: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          bank_name: string
          beneficiary_type?: string
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          name: string
          routing_number?: string | null
          swift_code?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          beneficiary_type?: string
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          name?: string
          routing_number?: string | null
          swift_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          current_value: number
          duration_months: number
          expected_return: number
          id: string
          maturity_date: string
          plan_name: string
          roi_percentage: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          current_value: number
          duration_months: number
          expected_return: number
          id?: string
          maturity_date: string
          plan_name: string
          roi_percentage: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_value?: number
          duration_months?: number
          expected_return?: number
          id?: string
          maturity_date?: string
          plan_name?: string
          roi_percentage?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          admin_action_at: string | null
          admin_action_by: string | null
          admin_notes: string | null
          amount: number
          amount_paid: number
          created_at: string
          id: string
          interest_rate: number
          monthly_payment: number
          next_payment_date: string | null
          purpose: string | null
          status: string
          term_months: number
          total_repayment: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_action_at?: string | null
          admin_action_by?: string | null
          admin_notes?: string | null
          amount: number
          amount_paid?: number
          created_at?: string
          id?: string
          interest_rate?: number
          monthly_payment: number
          next_payment_date?: string | null
          purpose?: string | null
          status?: string
          term_months: number
          total_repayment: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_action_at?: string | null
          admin_action_by?: string | null
          admin_notes?: string | null
          amount?: number
          amount_paid?: number
          created_at?: string
          id?: string
          interest_rate?: number
          monthly_payment?: number
          next_payment_date?: string | null
          purpose?: string | null
          status?: string
          term_months?: number
          total_repayment?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_transaction_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_transaction_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_transaction_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_currency: string | null
          account_number: string | null
          address: string | null
          balance: number | null
          card_expiry: string | null
          card_number: string | null
          checking_balance: number | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          id: string
          id_document_url: string | null
          next_of_kin_address: string | null
          next_of_kin_email: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          occupation: string | null
          passport_photo_url: string | null
          phone: string | null
          pin: string | null
          savings_balance: number | null
          ssn_tax_id: string | null
          updated_at: string
          user_id: string
          zip: string | null
        }
        Insert: {
          account_currency?: string | null
          account_number?: string | null
          address?: string | null
          balance?: number | null
          card_expiry?: string | null
          card_number?: string | null
          checking_balance?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_document_url?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          occupation?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          pin?: string | null
          savings_balance?: number | null
          ssn_tax_id?: string | null
          updated_at?: string
          user_id: string
          zip?: string | null
        }
        Update: {
          account_currency?: string | null
          account_number?: string | null
          address?: string | null
          balance?: number | null
          card_expiry?: string | null
          card_number?: string | null
          checking_balance?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_document_url?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          occupation?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          pin?: string | null
          savings_balance?: number | null
          ssn_tax_id?: string | null
          updated_at?: string
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_number: string | null
          account_type: string | null
          admin_action_at: string | null
          admin_action_by: string | null
          admin_notes: string | null
          amount: number
          balance_after: number | null
          balance_before: number | null
          bank_name: string | null
          beneficiary_id: string | null
          category: string
          created_at: string
          description: string
          iban: string | null
          id: string
          recipient_user_id: string | null
          reference: string | null
          routing_number: string | null
          status: string
          swift_code: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          admin_action_at?: string | null
          admin_action_by?: string | null
          admin_notes?: string | null
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          bank_name?: string | null
          beneficiary_id?: string | null
          category: string
          created_at?: string
          description: string
          iban?: string | null
          id?: string
          recipient_user_id?: string | null
          reference?: string | null
          routing_number?: string | null
          status?: string
          swift_code?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          admin_action_at?: string | null
          admin_action_by?: string | null
          admin_notes?: string | null
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          bank_name?: string | null
          beneficiary_id?: string | null
          category?: string
          created_at?: string
          description?: string
          iban?: string | null
          id?: string
          recipient_user_id?: string | null
          reference?: string | null
          routing_number?: string | null
          status?: string
          swift_code?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
