# 📧 Email Setup Guide for Low Stock Alerts

## 🎯 Current Status
✅ **Email System**: Fully implemented and working  
✅ **Mock Emails**: Currently showing in backend logs  
✅ **Recipient**: kadavishkakanakasekara@gmail.com  
⚠️ **Real Emails**: Need Gmail App Password configuration  

## 🔧 Setup Steps to Receive Real Emails

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under **Signing in to Google**, click **2-Step Verification**
4. Follow the setup process to enable 2FA

### Step 2: Generate Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Click **App passwords**
5. Select **Mail** as the app
6. Select **Other (Custom name)** as device
7. Enter: "Klassy T Shirts Inventory"
8. Click **Generate**
9. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
1. Open `/backend/.env` file
2. Replace the email configuration:

```env
# Email Configuration for Low Stock Alerts
EMAIL_USER=kadavishkakanakasekara@gmail.com
EMAIL_PASS=your-16-character-app-password-here
```

**Example:**
```env
EMAIL_USER=kadavishkakanakasekara@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### Step 4: Restart Backend Server
```bash
cd backend
npm start
```

## 🧪 Test Email System

### Option 1: Use Item to Trigger Alert
1. Go to Inventory Management in frontend
2. Find an item with stock > 10
3. Click **Use** button
4. Use enough quantity to drop below minimum stock (10)
5. Email will be sent automatically

### Option 2: Manual Alert Check
1. Go to Inventory Management
2. Click **📧 Check Stock Alerts** button
3. System will scan all items and send alerts

### Option 3: API Test
```bash
curl -X POST http://localhost:5001/inventory/alerts/check
```

## 📧 What Emails Look Like

You'll receive professional HTML emails with:
- 🏢 **Klassy T Shirts Header**
- 📊 **Item Details** (name, current stock, minimum stock)
- ⚠️ **Alert Level** (Low Stock / Out of Stock)
- 📋 **Recommended Actions**
- 📞 **Contact Information**

## 🔄 Automatic Email Triggers

Emails are sent automatically when:
1. **Using Items**: When `consumeItem()` drops stock below minimum
2. **Updating Quantities**: When manual adjustments cause low stock
3. **Status Changes**: When item status changes to "low_stock" or "out_of_stock"

## 🎯 Current Low Stock Items

Based on the last check, these items need attention:
- **Silk Fabric**: 4/10 pieces (Low Stock)
- **Needles**: 9/10 pieces (Low Stock)  
- **qq**: 1/10 pieces (Low Stock)
- **aroshana**: 9/10 pieces (Low Stock)
- **cotton-50**: 1/10 pieces (Low Stock)
- **boxes**: 1/10 pieces (Low Stock)
- **linen**: 1/10 pieces (Low Stock)

## 🚨 Troubleshooting

### If Emails Still Don't Work:

1. **Check App Password**: Make sure it's exactly 16 characters
2. **Check Gmail Settings**: Ensure 2FA is enabled
3. **Check .env File**: No spaces around the = sign
4. **Restart Server**: Always restart after changing .env
5. **Check Logs**: Look for error messages in backend console

### Alternative Email Services:
If Gmail doesn't work, you can use:
- **Outlook**: Change service to 'hotmail'
- **Yahoo**: Change service to 'yahoo'
- **Custom SMTP**: Configure manual SMTP settings

## 📱 Next Steps

1. **Set up Gmail App Password** (most important)
2. **Update .env file** with real credentials
3. **Restart backend server**
4. **Test with low stock item**
5. **Check your email inbox**

Once configured, you'll receive automatic email alerts whenever any inventory item reaches low stock levels!

---

**Need Help?** Check the backend console logs for detailed error messages.
