export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Business {
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

export interface Product {
  id: string
  business_id: string     // FK → businesses.id (scoped to tenant)
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

export interface Customer {
  id: string
  business_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'sadapay'

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  business_id: string
  customer_id: string | null
  status: OrderStatus
  payment_method: PaymentMethod
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected'

export interface PaymentRequest {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  plan_price: string
  payment_method: string
  transaction_id: string
  screenshot_url: string
  status: PaymentRequestStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}
