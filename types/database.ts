// Auto-generated types from Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          currency: string
          is_active: boolean
          whatsapp_number: string | null
          jazzcash_number: string | null
          easypaisa_number: string | null
          sadapay_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          currency?: string
          is_active?: boolean
          whatsapp_number?: string | null
          jazzcash_number?: string | null
          easypaisa_number?: string | null
          sadapay_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          currency?: string
          is_active?: boolean
          whatsapp_number?: string | null
          jazzcash_number?: string | null
          easypaisa_number?: string | null
          sadapay_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          price: number
          compare_price: number | null
          sku: string | null
          stock_quantity: number
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          price: number
          compare_price?: number | null
          sku?: string | null
          stock_quantity?: number
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          compare_price?: number | null
          sku?: string | null
          stock_quantity?: number
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          business_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          business_id: string
          customer_id: string | null
          status: string
          total_amount: number
          payment_method: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id?: string | null
          status?: string
          total_amount: number
          payment_method?: string
          notes?: string | null
        }
        Update: {
          status?: string
          payment_method?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
          total_price?: number
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          plan_name: string
          plan_price: string
          payment_method: string
          transaction_id: string
          screenshot_url: string
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          plan_name: string
          plan_price: string
          payment_method: string
          transaction_id: string
          screenshot_url: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          admin_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    }
    CompositeTypes: Record<string, never>
  }
}
