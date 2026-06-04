# 📦 Orders Table Schema & Order Confirmation Flow

## 🗃️ Orders Table Schema

### Database: `public.orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unique order identifier |
| `business_id` | uuid | NOT NULL, FOREIGN KEY → `businesses(id)` ON DELETE CASCADE | Owner business |
| `customer_id` | uuid | FOREIGN KEY → `customers(id)` ON DELETE SET NULL | Customer who placed order |
| `status` | text | NOT NULL, DEFAULT `'pending'` | Order status (enum) |
| `total_amount` | numeric(12,2) | NOT NULL, DEFAULT `0` | Total order amount |
| `payment_method` | text | NOT NULL, DEFAULT `'cod'` | Payment method (cod, jazzcash, easypaisa, sadapay) |
| `notes` | text | NULLABLE | Customer notes |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` | Order creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT `now()` | Last update timestamp |

### Related Tables

#### `public.customers`
- `id` (uuid, PK)
- `business_id` (uuid, FK → businesses)
- `name` (text)
- `email` (text)
- `phone` (text)
- `address` (text)
- `created_at` (timestamptz)

#### `public.order_items`
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders ON DELETE CASCADE)
- `product_id` (uuid, FK → products ON DELETE RESTRICT)
- `quantity` (integer)
- `unit_price` (numeric(12,2))
- `total_price` (numeric(12,2))

---

## 🔄 Order Confirmation Flow

### Flow Diagram
```
Customer Cart → Checkout Modal → Place Order → Database Insert → Stock Update → Google Sheets Sync → Success View
```

### Step-by-Step Flow

#### Step 1: Customer Adds Items to Cart
**Component:** `CartSidebar.tsx`
- User browses products
- Adds items to cart (stored in Zustand store)
- Cart data: `{ businessSlug, product, quantity }`

#### Step 2: Customer Clicks "Checkout"
**Component:** `CheckoutModal.tsx`
- Modal opens with:
  - Order summary (items + total)
  - Payment method selector (COD, JazzCash, Easypaisa, SadaPay)
  - Delivery details form (name, phone, email, address, notes)

#### Step 3: Customer Submits Order
**Component:** `CheckoutModal.handleSubmit()`
```typescript
const result = await placeOrder({
  businessId,
  customerName: form.name,
  customerEmail: form.email,
  customerPhone: form.phone,
  customerAddress: form.address,
  notes: form.notes,
  paymentMethod,
  items: items.map(({ product, quantity }) => ({
    productId: product.id,
    quantity,
    unitPrice: product.price,
  })),
})
```

#### Step 4: Server-Side Order Processing
**Action:** `lib/actions/order.ts` → `placeOrder()`

**Validation Checks:**
1. ✅ Business exists and is active
2. ✅ All products belong to this business
3. ✅ All products are active
4. ✅ Sufficient stock available

**Database Operations:**
1. **Upsert Customer** (prevent duplicates by phone):
   ```typescript
   .from('customers')
   .upsert({ business_id, phone, name, email, address })
   .select('id')
   .single()
   ```

2. **Create Order**:
   ```typescript
   .from('orders')
   .insert({
     business_id,
     customer_id,
     status: 'pending',
     total_amount: calculatedTotal,
     notes: notes?.trim() || null,
     payment_method: paymentMethod ?? 'cod',
   })
   ```

3. **Insert Order Items**:
   ```typescript
   .from('order_items')
   .insert(payload.items.map(item => ({
     order_id: order.id,
     product_id: item.productId,
     quantity: item.quantity,
     unit_price: item.unitPrice,
     total_price: item.unitPrice * item.quantity,
   })))
   ```

4. **Update Product Stock** (optimized):
   ```typescript
   for (const update of stockUpdates) {
     await supabase
       .from('products')
       .update({ stock_quantity: update.stock_quantity })
       .eq('id', update.id)
   }
   ```

5. **Background: Google Sheets Sync** (async, non-blocking):
   ```typescript
   syncOrderToGoogleSheetsBackground(
     orderId,
     customerName,
     totalAmount,
     business.owner_id,
     business.currency,
     itemsCount,
     customerEmail,
     customerPhone,
     deliveryAddress
   )
   ```

#### Step 5: Return Success Response
```typescript
return { 
  orderId: order.id, 
  orderNumber: order.id.slice(0, 8).toUpperCase() 
}
```

#### Step 6: Show Success View
**Component:** `CheckoutModal.SuccessView()`
- Shows confirmation:
  - ✅ Order placed!
  - Order number (e.g., `#A1B2C3D4`)
  - Total amount
  - Payment method
  - Payment instructions (if not COD)
  - WhatsApp confirmation button

#### Step 7: WhatsApp Confirmation (Optional)
If business has WhatsApp number:
- User can click "Confirm on WhatsApp"
- Pre-filled message with:
  - Order items list
  - Total amount
  - Order number
  - Payment info
  - Business account number (if applicable)

---

## 📊 Order Status Enum

The `status` field accepts these values:
- `'pending'` - Order just placed, awaiting confirmation
- `'confirmed'` - Business confirmed the order
- `'processing'` - Order is being prepared
- `'shipped'` - Order shipped
- `'delivered'` - Order delivered
- `'cancelled'` - Order cancelled

---

## 🔐 Security & RLS Policies

### Orders Table RLS
```sql
-- Business owners can do everything
CREATE POLICY "orders: owner all" ON public.orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id 
      AND b.owner_id = auth.uid()
    )
  );

-- Anonymous users can insert (for storefront checkout)
CREATE POLICY "orders: anon insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id 
      AND b.is_active = true
    )
  );
```

---

## 📋 Order Creation Response

### Success Response
```json
{
  "orderId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "orderNumber": "A1B2C3D4"
}
```

### Error Response
```json
{
  "error": "Store not found (ID: abc12345)."
}
```

---

## 🔄 Update Order Status Flow

### Dashboard: Status Changes
**Action:** `updateOrderStatus()`

```typescript
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  businessSlug: string
)
```

**Steps:**
1. Authenticate user
2. Verify order belongs to user's business
3. Update status in database
4. Background sync to Google Sheets
5. Revalidate relevant paths:
   - `/${businessSlug}/orders`
   - `/${businessSlug}/orders/${orderId}`
   - `/${businessSlug}`

---

## 📊 Google Sheets Sync (Background)

### Triggered On:
- ✅ New order placement
- ✅ Order status change

### Data Sent:
```typescript
{
  order_id: string,
  customer_name: string,
  total: number,
  status: string,
  created_at: string,
  items_count: number,
  currency: string,
  customer_email?: string,
  customer_phone?: string,
  delivery_address?: string
}
```

### Retry Logic:
- Max 3 retries on failure
- Asynchronous (doesn't block order creation)
- Errors logged but don't affect order

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `lib/actions/order.ts` | Main order processing logic |
| `lib/actions/orders.ts` | Order management (status updates, sync) |
| `components/store/CheckoutModal.tsx` | Checkout UI |
| `components/store/StorefrontShell.tsx` | Storefront wrapper |
| `supabase/migrations/001_initial_schema.sql` | Orders table schema |
| `supabase/setup.sql` | Full database setup |
| `supabase/FULL_SETUP.sql` | Complete setup with all features |

---

## 🔍 Order Flow Summary

```
1. Customer adds products to cart
   ↓
2. Customer clicks "Checkout"
   ↓
3. Customer fills form:
   - Name, Phone, Email (optional)
   - Delivery Address
   - Notes (optional)
   - Payment Method
   ↓
4. Server validates:
   - Business exists & active
   - Products belong to business
   - Products active & in stock
   ↓
5. Server creates:
   - Customer record (upsert by phone)
   - Order record (status: pending)
   - Order items records
   - Updates product stock
   ↓
6. Background:
   - Sync to Google Sheets
   ↓
7. Success!
   - Returns orderId & orderNumber
   - Clears cart
   - Shows success modal
   - User can confirm via WhatsApp
```

---

## 💡 Important Notes

### Stock Management
- Stock is **automatically decremented** on order placement
- No separate stock reservation step
- If stock runs out during checkout, error is shown before order is created

### Payment Methods
- **COD (Cash on Delivery)**: Most common, no pre-payment
- **JazzCash**: User sends payment to business account
- **Easypaisa**: User sends payment to business account  
- **SadaPay**: User sends payment to business account

### Customer Upsert
- Customers are upserted by `business_id + phone`
- Prevents duplicate customers
- Updates address if changed

### Order Number
- Format: First 8 characters of UUID, uppercase
- Example: `A1B2C3D4`
- Used for WhatsApp confirmation

---

## 🧪 Testing Checklist

### Test Order Flow:
- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Fill customer details
- [ ] Select payment method
- [ ] Submit order
- [ ] Verify success modal shows
- [ ] Check cart is cleared
- [ ] Verify order in dashboard
- [ ] Verify stock decremented
- [ ] Check Google Sheets updated (check logs)

### Test Error Cases:
- [ ] Business inactive → Error shown
- [ ] Product out of stock → Error shown
- [ ] Product not found → Error shown
- [ ] Invalid business ID → Error shown
- [ ] Missing customer info → Error shown

---

**This is your complete order system! 🎉**
