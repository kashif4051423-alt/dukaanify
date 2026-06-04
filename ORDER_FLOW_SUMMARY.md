# 🛍️ Order Flow - Quick Summary

## 2 Ways to Place Orders

---

## **Way 1: Customer Orders Online (Public Store)**

### 🌐 URL
```
http://localhost:3000/store/[business-slug]
```

### Example
```
http://localhost:3000/store/ali-bakery
http://localhost:3000/store/pizza-hut
http://localhost:3000/store/tech-store
```

### Steps
1. Customer visits store URL
2. Browses products
3. Adds products to cart
4. Clicks checkout
5. Fills customer details
6. Places order
7. ✅ Order synced to Google Sheets

---

## **Way 2: Business Owner Creates Order (Dashboard)**

### 📊 URL
```
http://localhost:3000/dashboard/[business-slug]/orders
```

### Steps
1. Owner logs in to dashboard
2. Goes to Orders section
3. Clicks "Create Order"
4. Fills order details
5. Clicks "Create Order"
6. ✅ Order synced to Google Sheets

---

## 🎯 Order Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER PLACES ORDER                 │
└─────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
   PUBLIC STORE                          DASHBOARD
   (Customer)                            (Owner)
        ↓                                       ↓
   Browse Products                    Create Order
        ↓                                       ↓
   Add to Cart                         Fill Details
        ↓                                       ↓
   Checkout                            Submit
        ↓                                       ↓
   Fill Details                               ↓
        ↓                                       ↓
   Place Order                                ↓
        ↓                                       ↓
        └───────────────────┬───────────────────┘
                            ↓
                  ORDER CREATED IN DB
                            ↓
                  ✅ GOOGLE SHEETS SYNC
                            ↓
                  ORDER APPEARS IN SHEET
```

---

## 📍 Key URLs

| Purpose | URL |
|---------|-----|
| **Customer Store** | `http://localhost:3000/store/[slug]` |
| **Dashboard** | `http://localhost:3000/dashboard` |
| **Orders** | `http://localhost:3000/dashboard/[slug]/orders` |
| **Admin** | `http://localhost:3000/admin` |
| **Pricing** | `http://localhost:3000/pricing` |

---

## 🔍 How to Find Business Slug

1. Go to Dashboard: `http://localhost:3000/dashboard`
2. Select your business
3. Look at URL: `http://localhost:3000/dashboard/[slug]/...`
4. The `[slug]` is your business slug

Example:
- If URL is: `http://localhost:3000/dashboard/ali-bakery/orders`
- Then slug is: `ali-bakery`
- Store URL is: `http://localhost:3000/store/ali-bakery`

---

## 📊 What Gets Synced to Google Sheets

✅ Order ID  
✅ Customer Name  
✅ Total Amount  
✅ Order Status  
✅ Timestamp  
✅ Items Count  
✅ Currency  
✅ Customer Email  
✅ Customer Phone  
✅ Delivery Address  

---

## 🎯 Quick Test

### Test 1: Create Order via Store
1. Go to: `http://localhost:3000/store/[your-slug]`
2. Add product to cart
3. Checkout
4. Fill details
5. Place order
6. ✅ Check Google Sheets

### Test 2: Create Order via Dashboard
1. Go to: `http://localhost:3000/dashboard/[slug]/orders`
2. Click "Create Order"
3. Fill details
4. Submit
5. ✅ Check Google Sheets

---

## 🚀 Production URLs

When deployed to production, replace `localhost:3000` with your domain:

```
https://yourdomain.com/store/[slug]
https://yourdomain.com/dashboard
https://yourdomain.com/admin
```

---

## 📱 Mobile Friendly

Both order methods work on:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

---

## 🔒 Security

- ✅ Multi-tenant (each user's data isolated)
- ✅ Secure checkout
- ✅ Authentication required
- ✅ HTTPS ready

---

## 💡 Tips

1. **Share Store Link** - Share `http://localhost:3000/store/[slug]` with customers
2. **Track Orders** - Check Google Sheets for all orders
3. **Update Status** - Update order status in dashboard
4. **Retry Sync** - If sync fails, manually retry from admin panel

---

## 🎉 That's It!

Your customers can now place orders and they'll automatically appear in Google Sheets!

**Start selling! 🚀**
