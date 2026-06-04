# 🔗 Google Sheets Integration Guide

## Overview

This guide explains how to use the Google Sheets integration in your multi-tenant SaaS. Every order created in your system will automatically be sent to Google Sheets in real-time.

---

## 📁 Files Created

### 1. **`lib/googleSheets.ts`** - Core Integration
- `sendOrderToGoogleSheet()` - Send single order
- `sendOrdersToGoogleSheetBatch()` - Send multiple orders
- `sendOrderToGoogleSheetWithRetry()` - Send with automatic retries
- `testGoogleSheetsConnection()` - Test the webhook

### 2. **`lib/actions/orders.ts`** - Server Actions
- `createOrderWithGoogleSheetsSync()` - Create order + sync
- `updateOrderStatusWithGoogleSheetsSync()` - Update status + sync
- `manuallyRetryGoogleSheetsSync()` - Retry failed syncs

---

## 🚀 Quick Start

### 1. Create an Order (with automatic Google Sheets sync)

```typescript
'use client'

import { createOrderWithGoogleSheetsSync } from '@/lib/actions/orders'

export default function CreateOrderPage() {
  const handleCreateOrder = async () => {
    const result = await createOrderWithGoogleSheetsSync({
      business_id: 'biz-123',
      customer_name: 'Ali Hassan',
      customer_email: 'ali@example.com',
      customer_phone: '+92 300 1234567',
      total_amount: 5000,
      items_count: 3,
      status: 'pending',
      delivery_address: 'House 123, Street, City',
      notes: 'Deliver after 5 PM',
    })

    if (result.success) {
      console.log('Order created:', result.order_id)
      console.log('Google Sheets sync:', result.googleSheetsSync)
    } else {
      console.error('Error:', result.error)
    }
  }

  return <button onClick={handleCreateOrder}>Create Order</button>
}
```

### 2. Update Order Status (with automatic sync)

```typescript
import { updateOrderStatusWithGoogleSheetsSync } from '@/lib/actions/orders'

const result = await updateOrderStatusWithGoogleSheetsSync(
  'order-123',
  'delivered'
)
```

### 3. Manually Retry Failed Sync

```typescript
import { manuallyRetryGoogleSheetsSync } from '@/lib/actions/orders'

const result = await manuallyRetryGoogleSheetsSync('order-123')
```

---

## 📊 Data Sent to Google Sheets

Each order sends the following data:

```json
{
  "tenant_id": "user-123",
  "order_id": "ORD-456",
  "customer_name": "Ali Hassan",
  "total": 5000,
  "status": "pending",
  "timestamp": "2024-05-19T10:30:00Z",
  "items_count": 3,
  "currency": "PKR",
  "customer_email": "ali@example.com",
  "customer_phone": "+92 300 1234567",
  "delivery_address": "House 123, Street, City",
  "additional_data": {
    "notes": "Deliver after 5 PM"
  }
}
```

---

## 🔧 Configuration

### Google Apps Script Webhook URL

```typescript
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz_fIk2WLKdVGc74xn35Vk2rtBh3yAra-FB1MBPdEFGNPI14sreynzar0H1RYLhphgy2w/exec'
```

**DO NOT CHANGE THIS URL** - It's configured to receive your order data.

### Request Timeout

```typescript
const REQUEST_TIMEOUT = 5000 // 5 seconds
```

If Google Sheets takes longer than 5 seconds, the request will timeout and retry.

---

## ✨ Features

### ✅ Automatic Retries
- Automatically retries failed requests up to 3 times
- Uses exponential backoff (1s, 2s, 4s delays)
- Only retries on network errors, not validation errors

### ✅ Non-Blocking
- Google Sheets sync happens in the background
- Order creation completes immediately
- App doesn't break if Google Sheets fails

### ✅ Multi-Tenant Support
- Each order includes `tenant_id` (user ID)
- Separates data by tenant in Google Sheets
- Secure and isolated per user

### ✅ Error Handling
- Comprehensive error logging
- Graceful failure handling
- Returns detailed error messages

### ✅ Batch Operations
- Send multiple orders at once
- Useful for syncing historical orders
- Parallel processing for speed

---

## 🧪 Testing

### Test the Connection

```typescript
import { testGoogleSheetsConnection } from '@/lib/googleSheets'

const result = await testGoogleSheetsConnection()
console.log(result)
// Output: { success: true, message: 'Order synced to Google Sheets', ... }
```

### Test in Your App

1. Create a test order
2. Check Google Sheets for the new row
3. Verify all data is correct

---

## 📝 Integration Points

### When Creating an Order

```typescript
// In your order creation endpoint/action
const result = await createOrderWithGoogleSheetsSync({
  business_id: businessId,
  customer_name: customerName,
  total_amount: totalAmount,
  items_count: itemsCount,
  // ... other fields
})

if (result.success) {
  // Order created successfully
  // Google Sheets sync is happening in background
}
```

### When Updating Order Status

```typescript
// When order status changes
const result = await updateOrderStatusWithGoogleSheetsSync(
  orderId,
  'delivered'
)
```

### Manual Retry

```typescript
// If sync failed, retry manually
const result = await manuallyRetryGoogleSheetsSync(orderId)
```

---

## 🔒 Security

### Multi-Tenant Isolation
- Each order includes `tenant_id`
- Google Sheets can filter by tenant
- No cross-tenant data leakage

### Error Logging
- Errors are logged with context
- No sensitive data in logs
- Helps with debugging

### Timeout Protection
- 5-second timeout prevents hanging
- Automatic retry on timeout
- App remains responsive

---

## 📊 Google Sheets Setup

### Expected Sheet Structure

Your Google Sheet should have these columns:

| Column | Type | Example |
|--------|------|---------|
| Tenant ID | Text | user-123 |
| Order ID | Text | ORD-456 |
| Customer Name | Text | Ali Hassan |
| Total | Number | 5000 |
| Status | Text | pending |
| Timestamp | DateTime | 2024-05-19 10:30:00 |
| Items Count | Number | 3 |
| Currency | Text | PKR |
| Email | Text | ali@example.com |
| Phone | Text | +92 300 1234567 |
| Address | Text | House 123, Street, City |

---

## 🚨 Troubleshooting

### Orders Not Appearing in Google Sheets

1. **Check webhook URL** - Verify it's correct
2. **Check logs** - Look for error messages
3. **Test connection** - Run `testGoogleSheetsConnection()`
4. **Check Google Sheet** - Verify sheet exists and is accessible
5. **Check permissions** - Ensure Apps Script has write access

### Sync Failing Repeatedly

1. **Check network** - Verify internet connection
2. **Check timeout** - Increase `REQUEST_TIMEOUT` if needed
3. **Check Google Sheets** - Verify sheet is not locked
4. **Check quota** - Google Sheets has rate limits
5. **Retry manually** - Use `manuallyRetryGoogleSheetsSync()`

### Performance Issues

1. **Batch operations** - Use `sendOrdersToGoogleSheetBatch()` for multiple orders
2. **Async processing** - Sync happens in background, doesn't block UI
3. **Retry strategy** - Exponential backoff prevents overwhelming Google Sheets

---

## 📈 Monitoring

### Check Sync Status

```typescript
// In your admin dashboard
const result = await manuallyRetryGoogleSheetsSync(orderId)
console.log(result.googleSheetsSync)
```

### View Logs

Check your server logs for:
- `Order synced to Google Sheets successfully`
- `Failed to sync order to Google Sheets`
- `Google Sheets request timeout`

---

## 🎯 Best Practices

1. **Always use server actions** - Don't call Google Sheets from client
2. **Handle errors gracefully** - Don't break order creation if sync fails
3. **Use retries** - Automatic retries handle temporary failures
4. **Monitor logs** - Check logs for sync issues
5. **Test regularly** - Use `testGoogleSheetsConnection()` periodically
6. **Batch operations** - Use batch for syncing historical orders
7. **Set appropriate timeout** - 5 seconds is good for most cases

---

## 🔄 Workflow

```
User Creates Order
        ↓
Order Saved to Supabase
        ↓
Google Sheets Sync Triggered (Background)
        ↓
Data Sent to Google Apps Script
        ↓
Google Apps Script Writes to Sheet
        ↓
Order Appears in Google Sheets
```

---

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review error logs
3. Test the connection
4. Verify Google Sheet setup
5. Check webhook URL

---

## 🎉 You're All Set!

Your multi-tenant SaaS now automatically syncs orders to Google Sheets. Every new order will appear in real-time!

**Next Steps:**
1. Test with a sample order
2. Verify data in Google Sheets
3. Monitor logs for any issues
4. Deploy to production

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Status:** Production Ready ✅
