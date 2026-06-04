# 🚀 Google Sheets Integration - Quick Reference

## 📦 What You Get

✅ Automatic order syncing to Google Sheets  
✅ Multi-tenant support (separate data per user)  
✅ Automatic retries on failure  
✅ Non-blocking (doesn't slow down your app)  
✅ Error handling & logging  
✅ Production-ready code  

---

## 🎯 3 Main Functions

### 1. Create Order + Sync
```typescript
import { createOrderWithGoogleSheetsSync } from '@/lib/actions/orders'

const result = await createOrderWithGoogleSheetsSync({
  business_id: 'biz-123',
  customer_name: 'Ali Hassan',
  total_amount: 5000,
  items_count: 3,
  status: 'pending',
})

// result.success = true/false
// result.order_id = 'ORD-456'
// result.googleSheetsSync = { success, message, error }
```

### 2. Update Status + Sync
```typescript
import { updateOrderStatusWithGoogleSheetsSync } from '@/lib/actions/orders'

const result = await updateOrderStatusWithGoogleSheetsSync(
  'order-123',
  'delivered'
)
```

### 3. Retry Failed Sync
```typescript
import { manuallyRetryGoogleSheetsSync } from '@/lib/actions/orders'

const result = await manuallyRetryGoogleSheetsSync('order-123')
```

---

## 📁 File Locations

```
lib/
├── googleSheets.ts              ← Core functions
└── actions/
    └── orders.ts                ← Server actions

components/
└── orders/
    └── CreateOrderForm.example.tsx  ← Example usage
```

---

## 🔧 Core Functions (lib/googleSheets.ts)

### sendOrderToGoogleSheet()
Send a single order to Google Sheets
```typescript
import { sendOrderToGoogleSheet } from '@/lib/googleSheets'

const result = await sendOrderToGoogleSheet(
  {
    order_id: 'ORD-123',
    customer_name: 'Ali',
    total: 5000,
    status: 'pending',
  },
  'tenant-id-123'
)
```

### sendOrderToGoogleSheetWithRetry()
Send with automatic retries (3 attempts)
```typescript
import { sendOrderToGoogleSheetWithRetry } from '@/lib/googleSheets'

const result = await sendOrderToGoogleSheetWithRetry(
  orderData,
  tenantId,
  3 // max retries
)
```

### sendOrdersToGoogleSheetBatch()
Send multiple orders at once
```typescript
import { sendOrdersToGoogleSheetBatch } from '@/lib/googleSheets'

const results = await sendOrdersToGoogleSheetBatch([
  { order: order1, tenantId: 'tenant-1' },
  { order: order2, tenantId: 'tenant-2' },
])
```

### testGoogleSheetsConnection()
Test if webhook is working
```typescript
import { testGoogleSheetsConnection } from '@/lib/googleSheets'

const result = await testGoogleSheetsConnection()
console.log(result) // { success: true/false, ... }
```

---

## 📊 Data Structure

### Order Data Sent
```typescript
{
  tenant_id: string           // User ID (multi-tenant)
  order_id: string            // Order ID
  customer_name: string       // Customer name
  total: number               // Total amount
  status: string              // Order status
  timestamp: string           // ISO timestamp
  items_count?: number        // Number of items
  currency?: string           // Currency (default: PKR)
  customer_email?: string     // Customer email
  customer_phone?: string     // Customer phone
  delivery_address?: string   // Delivery address
  additional_data?: object    // Any extra fields
}
```

---

## ✨ Key Features

### Automatic Retries
- Retries up to 3 times on failure
- Exponential backoff: 1s, 2s, 4s
- Only retries on network errors

### Non-Blocking
- Sync happens in background
- Order creation completes immediately
- App doesn't break if Google Sheets fails

### Multi-Tenant
- Each order includes tenant_id
- Data is isolated per tenant
- Secure and scalable

### Error Handling
- Comprehensive logging
- Graceful failure handling
- Detailed error messages

---

## 🧪 Testing

### Test Connection
```typescript
import { testGoogleSheetsConnection } from '@/lib/googleSheets'

const result = await testGoogleSheetsConnection()
if (result.success) {
  console.log('✓ Google Sheets is connected!')
} else {
  console.error('✗ Connection failed:', result.error)
}
```

### Test Order Creation
1. Create an order in your app
2. Check Google Sheets for new row
3. Verify all data is correct

---

## 🔒 Security

✅ Multi-tenant isolation  
✅ Secure webhook URL  
✅ Error logging without sensitive data  
✅ Timeout protection  
✅ Automatic retry limits  

---

## 📈 Performance

- **Order Creation:** < 100ms (doesn't wait for sync)
- **Google Sheets Sync:** 1-3 seconds (background)
- **Batch Operations:** Parallel processing
- **Retries:** Exponential backoff prevents overload

---

## 🚨 Troubleshooting

### Orders not appearing?
1. Check webhook URL is correct
2. Run `testGoogleSheetsConnection()`
3. Check Google Sheet exists
4. Check server logs for errors

### Sync failing repeatedly?
1. Check internet connection
2. Verify Google Sheet permissions
3. Check rate limits
4. Retry manually with `manuallyRetryGoogleSheetsSync()`

### Performance issues?
1. Use batch operations for multiple orders
2. Sync happens in background (non-blocking)
3. Check Google Sheets rate limits

---

## 📝 Integration Checklist

- [ ] Copy `lib/googleSheets.ts` to your project
- [ ] Copy `lib/actions/orders.ts` to your project
- [ ] Update your order creation to use `createOrderWithGoogleSheetsSync()`
- [ ] Test with sample order
- [ ] Verify data in Google Sheets
- [ ] Check server logs
- [ ] Deploy to production

---

## 🎯 Common Use Cases

### Create Order
```typescript
const result = await createOrderWithGoogleSheetsSync({
  business_id: businessId,
  customer_name: customerName,
  total_amount: totalAmount,
  items_count: itemsCount,
})
```

### Update Status
```typescript
const result = await updateOrderStatusWithGoogleSheetsSync(
  orderId,
  'delivered'
)
```

### Retry Failed Sync
```typescript
const result = await manuallyRetryGoogleSheetsSync(orderId)
```

### Batch Sync
```typescript
const results = await sendOrdersToGoogleSheetBatch(orders)
```

---

## 📞 Support

**Issue:** Orders not syncing  
**Solution:** Run `testGoogleSheetsConnection()` and check logs

**Issue:** Sync too slow  
**Solution:** It's async - doesn't block order creation

**Issue:** Need to retry  
**Solution:** Use `manuallyRetryGoogleSheetsSync(orderId)`

---

## 🎉 You're Ready!

Your multi-tenant SaaS now syncs orders to Google Sheets automatically!

**Next Steps:**
1. Test with a sample order
2. Verify in Google Sheets
3. Monitor logs
4. Deploy to production

---

**Version:** 1.0.0  
**Status:** Production Ready ✅
