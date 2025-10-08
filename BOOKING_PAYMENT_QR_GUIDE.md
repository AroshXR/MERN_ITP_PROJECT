# 🎫 Booking Payment & QR Code System - Complete Guide

## 📋 Table of Contents
1. [Features Overview](#features-overview)
2. [Setup Instructions](#setup-instructions)
3. [Testing Guide](#testing-guide)
4. [API Endpoints](#api-endpoints)
5. [Frontend Routes](#frontend-routes)
6. [Database Changes](#database-changes)
7. [Troubleshooting](#troubleshooting)

---

## ✨ Features Overview

### Feature 1: Automatic Payment Status Update
When a customer completes payment for a booking:
- ✅ Booking payment status automatically updates from "unpaid" to "paid"
- ✅ Works seamlessly with the existing payment flow
- ✅ No manual intervention required

### Feature 2: Pay on Return with QR Code
When a customer chooses "Pay on Return":
- ✅ QR code contains all booking details
- ✅ Customer can scan QR at return time
- ✅ Staff can view complete booking info
- ✅ Payment collected at return

### Feature 4: QR Code Viewing Page
- ✅ Dedicated page to view booking details from QR scan
- ✅ **Outfit image displayed at the top**
- ✅ Mobile-friendly and print-optimized
- ✅ Color-coded status badges
- ✅ Complete booking information display

---

## 🚀 Setup Instructions

### Step 1: Backend Package Installation
{{ ... }}
The qrcode package has already been installed. Verify by checking:
```bash
cd backend
cat package.json
# Should see "qrcode": "^1.5.4" in dependencies
```

### Step 2: Email Configuration
Ensure your `.env` file in the backend folder has:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important:** For Gmail, you need to create an App Password:
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App Passwords
4. Generate new password for "Mail"
5. Use that 16-character password in `.env`

### Step 3: Restart Backend Server
```bash
cd backend
npm start
```

### Step 4: Start Frontend (if not running)
```bash
cd frontend
npm start
```

---

## 🧪 Testing Guide

### Test 1: Payment Status Update (Pay Now Flow)

**Prerequisites:**
- Have a confirmed booking with payment status "unpaid"

**Steps:**
1. Navigate to `/my-bookings`
2. Find a confirmed, unpaid booking
3. Click **"Pay Now"** button
4. You should see the booking added to cart
5. Navigate to `/orderManagement`
6. Verify booking appears with:
   - ✅ Outfit image
   - ✅ "Rental Booking" badge
   - ✅ Rental period details
   - ✅ Pickup location
7. Click **"Proceed to Payment"**
8. Fill in payment details
9. Complete payment successfully
10. Go back to `/my-bookings`
11. **Verify:** Booking payment status changed to "paid" ✅

**Expected Result:**
- Booking moves from "unpaid" to "paid" status
- Payment badge shows "PAID" in blue

---

### Test 2: Pay on Return with QR Code

**Prerequisites:**
- Have a confirmed booking with payment status "unpaid"
- Valid email configuration in backend `.env`

**Steps:**
1. Navigate to `/my-bookings`
2. Find a confirmed, unpaid booking
3. Click **"Pay on Return"** button
4. Confirm the dialog that appears
5. Wait for success message
6. Check the email address associated with the booking

**Expected Email Contents:**
- ✅ Subject: "Outfit Rental Booking - Pay on Return - [Outfit Name]"
- ✅ Beautiful gradient header
- ✅ QR code image (300x300px)
- ✅ Complete booking details table
- ✅ Payment instructions
- ✅ Contact information

**Email Verification:**
1. Open the email
2. Verify QR code is visible
3. Verify all booking details are correct
4. Screenshot or save the email

---

### Test 3: QR Code Scanning & Viewing

**Option A: Using QR Code from Email**
1. Open the email with QR code
2. Use your phone's camera to scan the QR code
3. It should open a URL like: `http://localhost:3000/booking-qr-view?data=...`
4. Browser opens the BookingQRView page

**Option B: Direct URL**
1. Copy the URL from QR code or email
2. Paste in browser
3. Page should display booking details

**Expected Results on QR View Page:**
- ✅ Gradient header with "🎫 Booking Details"
- ✅ **Outfit image displayed prominently at the top**
- ✅ All booking information displayed:
  - Booking ID
  - Outfit name and category
  - Location
  - Rental period (dates)
  - Total price
  - Payment method
  - Payment status
  - Booking status
  - Contact info (email, phone)
- ✅ Color-coded status badges
- ✅ Payment alert (if unpaid)
- ✅ Action buttons (View All, Print)

---

### Test 4: Print Functionality
1. From the BookingQRView page
2. Click **"Print Details"** button
3. Print preview should show:
   - ✅ Clean layout without navbar
   - ✅ All booking details
   - ✅ No action buttons
   - ✅ Print-optimized styling

---

### Test 5: Mobile Responsiveness
1. Open `/booking-qr-view` on mobile device or use browser dev tools
2. Verify:
   - ✅ Card fits screen width
   - ✅ Text is readable
   - ✅ Buttons stack vertically
   - ✅ All information visible

---

## 🔌 API Endpoints

### 1. Update Booking Payment Status
```
POST /api/booking/update-payment-status
Authorization: Bearer <token>

Body:
{
  "bookingId": "65abc123...",
  "paymentStatus": "paid"
}

Response:
{
  "success": true,
  "message": "Payment status updated successfully",
  "booking": { ... }
}
```

### 2. Send QR Code via Email
```
POST /api/booking/send-qr-code
Authorization: Bearer <token>

Body:
{
  "bookingId": "65abc123..."
}

Response:
{
  "success": true,
  "message": "QR code sent to your email successfully!",
  "qrCodeDataURL": "data:image/png;base64,..."
}
```

---

## 🗺️ Frontend Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/my-bookings` | MyBookings | Protected (Customer) | View all bookings |
| `/booking-qr-view` | BookingQRView | Public | View booking from QR |
| `/qr-scanner` | QRScanner | Public | Manual QR entry helper |
| `/orderManagement` | OrderManagement | Protected (Customer) | Cart/Order page |
| `/paymentManagement` | PaymentManagement | Protected (Customer) | Payment checkout |

---

## 💾 Database Changes

### Booking Model Updates
```javascript
// New fields added to Booking schema:
{
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid"
  },
  paymentMethod: {
    type: String,
    enum: ["card", "cash", "pay_on_return"],
    default: "card"
  }
}
```

**Migration:** These fields are optional and have defaults, so existing bookings will work fine.

---

## 🎨 QR Code Data Structure

The QR code contains JSON data:
```json
{
  "bookingId": "65abc...",
  "outfitName": "Nike Sports Jacket",
  "category": "Sports Wear",
  "location": "Downtown Store",
  "reservationDate": "2025-10-15T00:00:00.000Z",
  "returnDate": "2025-10-22T00:00:00.000Z",
  "price": 150.00,
  "phone": "+1234567890",
  "email": "customer@example.com",
  "status": "confirmed",
  "paymentStatus": "unpaid",
  "paymentMethod": "pay_on_return"
}
```

---

## 🔧 Troubleshooting

### Issue 1: QR Code Email Not Sending

**Symptoms:**
- Click "Pay on Return" but no email received
- Error in console

**Solutions:**
1. Check `.env` email configuration
2. Verify Gmail App Password (not regular password)
3. Check backend console for email errors
4. Test email service:
   ```bash
   cd backend
   node test-email.js
   ```

### Issue 2: Payment Status Not Updating

**Symptoms:**
- Payment completes but booking still shows "unpaid"

**Solutions:**
1. Check browser console for errors
2. Verify booking was added to cart with `type: 'booking'`
3. Check backend logs for API call
4. Verify `bookingId` is present in cart item

### Issue 3: QR View Page Shows Error

**Symptoms:**
- "Invalid QR code data" or "No QR code data provided"

**Solutions:**
1. Check URL has `?data=` parameter
2. Verify JSON is properly encoded
3. Use QR Scanner page for manual entry
4. Try with sample data first

### Issue 4: Cart Shows Empty After Adding Booking

**Symptoms:**
- Click "Pay Now" but cart appears empty in OrderManagement

**Solutions:**
1. Check localStorage: `localStorage.getItem('outletCart')`
2. Verify booking data structure in cart
3. Clear browser cache and try again
4. Check browser console for errors

---

## 📝 Key Files Modified/Created

### Backend
- ✅ `models/Booking.js` - Added payment fields
- ✅ `controllers/bookingController.js` - Added 2 new functions
- ✅ `routes/bookingRoutes.js` - Added 2 new routes
- ✅ `package.json` - Added qrcode dependency

### Frontend
- ✅ `pages/MyBookings.jsx` - Updated handlers
- ✅ `pages/BookingQRView.jsx` - NEW page
- ✅ `pages/BookingQRView.css` - NEW styles
- ✅ `pages/QRScanner.jsx` - NEW helper page
- ✅ `pages/QRScanner.css` - NEW styles
- ✅ `Components/OrderManagement/OrderManagement.jsx` - Enhanced for bookings
- ✅ `Components/PaymentManagement/PaymentManagement.jsx` - Payment status update
- ✅ `App.js` - Added new routes

---

## 🎯 Quick Reference Commands

### Start Everything
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Test with Sample Booking
```bash
# Access these URLs:
http://localhost:3000/my-bookings
http://localhost:3000/qr-scanner
http://localhost:3000/booking-qr-view
```

### Check Email Configuration
```bash
cd backend
cat .env | grep EMAIL
```

---

## ✅ Success Indicators

You'll know everything works when:
- ✅ "Pay Now" adds booking to cart successfully
- ✅ Payment completion marks booking as "paid"
- ✅ "Pay on Return" sends email with QR code
- ✅ QR code opens booking details page
- ✅ All booking information displays correctly
- ✅ Print function works properly
- ✅ Mobile view is responsive

---

## 🆘 Need Help?

Common issues and their fixes are in the [Troubleshooting](#troubleshooting) section above.

For additional support:
1. Check browser console for errors
2. Check backend terminal for logs
3. Verify all environment variables
4. Test with sample data first

---

**Implementation Date:** October 8, 2025  
**Status:** ✅ Complete and Ready for Testing

---

## 🎉 Congratulations!

You now have a complete booking payment and QR code system ready to use!
