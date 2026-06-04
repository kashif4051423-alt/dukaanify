# 🛍️ How Customers Place Orders - Complete Guide

## 📍 Where Can Customers Order?

Your Dukaanify SaaS has **2 ways** for customers to place orders:

---

## **Option 1: Public Store (Recommended for Customers)**

### 🌐 Store URL Format
```
http://localhost:3000/store/[business-slug]
```

### Example URLs
- `http://localhost:3000/store/ali-bakery`
- `http://localhost:3000/store/pizza-hut`
- `http://localhost:3000/store/tech-store`

### How It Works

1. **Customer visits the store**
   - Goes to: `http://localhost:3000/store/[business-slug]`
   - Sees business name, logo, and products

2. **Browse Products**
   - Sees all active products
   - Can view product details
   - Can see prices and descriptions

3. **Add to Cart**
   - Click "Add to Cart" button
   - Product added to shopping cart
   - Cart icon shows item count

4. **View Cart**
   - Click cart icon (top right)
   - See all items in cart
   - Can update quantities
   - Can remove items

5. **Checkout**
   - Click "Proceed to Checkout"
   - Fill in customer details:
     - Name
     - Email
     - Phone
     - Delivery address
     - Order notes
   - Select payment method
   - Place order

6. **Order Confirmation**
   - Order created successfully
   - **Automatically synced to Google Sheets** ✅
   - Customer receives confirmation

---

## **Option 2: Dashboard (For Business Owners)**

### 📊 Dashboard URL
```
http://localhost:3000/dashboard/[business-slug]/orders
```

### How Business Owners Create Orders

1. **Login to Dashboard**
   - Go to: `http://localhost:3000/dashboard`
   - Select their business

2. **Go to Orders**
   - Click "Orders" in sidebar
   - See all orders

3. **Create New Order**
   - Click "Create Order" button
   - Fill in:
     - Customer name
     - Customer email
     - Customer phone
     - Total amount
     - Items count
     - Delivery address
     - Notes
   - Click "Create Order"

4. **Order Created**
   - Order appears in list
   - **Automatically synced to Google Sheets** ✅

---

## 🎯 Complete Customer Order Flow

```
Customer Visits Store
    ↓
http://localhost:3000/store/[business-slug]
    ↓
Browse Products
    ↓
Add Products to Cart
    ↓
Click Cart Icon
    ↓
Review Cart Items
    ↓
Click "Proceed to Checkout"
    ↓
Fill Customer Details
    ↓
Select Payment Method
    ↓
Place Order
    ↓
Order Created in Database
    ↓
✅ Automatically Synced to Google Sheets
    ↓
Order Confirmation
```

---

## 📝 Order Details Sent to Google Sheets

When a customer places an order, these details are automatically sent to Google Sheets:

| Field | Example |
|-------|---------|
| Tenant ID | user-123 |
| Order ID | ORD-456 |
| Customer Name | Ali Hassan |
| Total | 5000 |
| Status | pending |
| Timestamp | 2024-05-19 10:30:00 |
| Items Count | 3 |
| Currency | PKR |
| Email | ali@example.com |
| Phone | +92 300 1234567 |
| Address | House 123, Street, City |

---

## 🔗 Store Links for Your Businesses

### How to Get Store Link

1. **Go to Dashboard**
   - `http://localhost:3000/dashboard`

2. **Select Business**
   - Click on your business

3. **Get Store Link**
   - Store link is: `http://localhost:3000/store/[business-slug]`
   - Example: `http://localhost:3000/store/ali-bakery`

### Share Store Link

- Share with customers via WhatsApp
- Share on social media
- Add to website
- Send via email

---

## 🛒 Store Features

### For Customers

✅ Browse products  
✅ View product details  
✅ Add to cart  
✅ Update quantities  
✅ Remove items  
✅ Checkout  
✅ Fill delivery details  
✅ Select payment method  
✅ Place order  
✅ Order confirmation  

### For Business Owners

✅ Manage products  
✅ View all orders  
✅ Update order status  
✅ Track revenue  
✅ Manage customers  
✅ View analytics  

---

## 📱 Mobile Responsive

The store is fully responsive:
- ✅ Works on desktop
- ✅ Works on tablet
- ✅ Works on mobile
- ✅ Touch-friendly buttons
- ✅ Optimized images

---

## 🔒 Security

- ✅ Secure checkout
- ✅ Customer data protected
- ✅ Multi-tenant isolation
- ✅ HTTPS ready
- ✅ Supabase authentication

---

## 💳 Payment Methods

Customers can select from:
- Bank Transfer
- Cash on Delivery
- JazzCash
- EasyPaisa
- Credit Card

---

## 📊 Order Status Tracking

Orders can have these statuses:
- **pending** - Order received
- **processing** - Being prepared
- **shipped** - On the way
- **delivered** - Delivered
- **cancelled** - Cancelled

---

## 🔄 Google Sheets Integration

### Automatic Sync

When a customer places an order:
1. ✅ Order saved to database
2. ✅ Automatically sent to Google Sheets
3. ✅ Appears in real-time
4. ✅ All details included

### Manual Retry

If sync fails:
1. Go to admin panel
2. Find the order
3. Click "Retry Sync"
4. Order synced to Google Sheets

---

## 🧪 Test Order Flow

### Step 1: Create a Test Business
1. Go to dashboard
2. Create a new business
3. Get the business slug

### Step 2: Add Test Products
1. Go to Products
2. Add 2-3 test products
3. Set prices

### Step 3: Visit Store
1. Go to: `http://localhost:3000/store/[your-slug]`
2. See products displayed

### Step 4: Place Test Order
1. Add products to cart
2. Click checkout
3. Fill in details
4. Place order

### Step 5: Verify Google Sheets
1. Check Google Sheets
2. See new order row
3. Verify all data

---

## 🎯 Common Scenarios

### Scenario 1: Customer Orders Online
```
Customer → Store → Add to Cart → Checkout → Order Created → Google Sheets
```

### Scenario 2: Business Owner Creates Order
```
Owner → Dashboard → Orders → Create Order → Order Created → Google Sheets
```

### Scenario 3: Order Status Update
```
Owner → Dashboard → Update Status → Google Sheets Updated
```

### Scenario 4: Retry Failed Sync
```
Owner → Admin → Find Order → Retry Sync → Google Sheets Updated
```

---

## 📞 Troubleshooting

### Store Not Loading
1. Check business slug is correct
2. Verify business is active
3. Check products exist

### Cart Not Working
1. Refresh page
2. Clear browser cache
3. Check browser console for errors

### Checkout Not Working
1. Fill all required fields
2. Check internet connection
3. Verify Supabase is connected

### Order Not in Google Sheets
1. Check order was created
2. Run `testGoogleSheetsConnection()`
3. Check Google Sheet permissions
4. Manually retry sync

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Store URLs**
   - Change from `localhost:3000` to your domain
   - Example: `https://yourdomain.com/store/[slug]`

2. **Share Store Links**
   - Share with customers
   - Add to marketing materials
   - Post on social media

3. **Monitor Orders**
   - Check Google Sheets regularly
   - Update order statuses
   - Track revenue

4. **Customer Support**
   - Respond to inquiries
   - Update order status
   - Handle returns/refunds

---

## 📈 Analytics

Track your orders:
- Total orders
- Total revenue
- Average order value
- Popular products
- Customer trends

---

## 🎉 You're Ready!

Your customers can now:
1. ✅ Visit your store
2. ✅ Browse products
3. ✅ Place orders
4. ✅ Orders sync to Google Sheets automatically

**Start selling! 🚀**

---

## 📝 Quick Links

| Page | URL |
|------|-----|
| Store | `http://localhost:3000/store/[slug]` |
| Dashboard | `http://localhost:3000/dashboard` |
| Admin | `http://localhost:3000/admin` |
| Orders | `http://localhost:3000/dashboard/[slug]/orders` |

---

**Version:** 1.0.0  
**Status:** Production Ready ✅
