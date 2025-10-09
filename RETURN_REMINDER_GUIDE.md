# Return Reminder Email System

This system automatically sends email reminders to customers about upcoming rental returns to avoid additional charges.

## 🚀 Features

- **Automatic Scheduling**: Sends reminders at 9 AM and 6 PM daily
- **Smart Timing**: Reminds customers when return date is tomorrow or today
- **Professional Templates**: Beautiful HTML email templates with urgency indicators
- **Manual Triggers**: Admin can manually send reminders for specific bookings
- **Duplicate Prevention**: Prevents sending multiple reminders for the same booking on the same day
- **Overdue Handling**: Special messaging for overdue returns

## 📧 Email Types

### 1. Final Reminder (1 day before)
- **Subject**: `🚨 FINAL REMINDER - Return Tomorrow - Booking #XXXXXX`
- **Color**: Orange/Yellow theme
- **Message**: "This is your final reminder! Your rental item must be returned tomorrow."

### 2. Urgent Reminder (Return day)
- **Subject**: `🚨 URGENT - Return Today - Booking #XXXXXX`
- **Color**: Red theme
- **Message**: "Your rental item must be returned TODAY to avoid additional charges."

### 3. Overdue Notice (After return date)
- **Subject**: `🚨 OVERDUE - Late Return - Booking #XXXXXX`
- **Color**: Dark red theme
- **Message**: "Your rental item is OVERDUE. Additional charges are now being applied."

## 🛠️ Setup Instructions

### 1. Install Dependencies

The system uses `node-cron` for scheduling. It's already added to `package.json`:

```bash
cd backend
npm install
```

### 2. Email Configuration

Ensure your email configuration is set up in `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Automatic Startup

The reminder scheduler starts automatically when the server starts. You'll see these logs:

```
🚀 Starting return reminder scheduler...
✅ Return reminder scheduler started successfully
📅 Reminders will be sent at 9:00 AM and 6:00 PM daily
🔄 Running initial return reminder check...
```

## 📋 API Endpoints

### 1. Send Manual Reminder
```http
POST /api/booking/send-return-reminder/:bookingId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "ok",
  "message": "Return reminder sent successfully",
  "messageId": "email-message-id"
}
```

### 2. Get Upcoming Returns
```http
GET /api/booking/upcoming-returns
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "ok",
  "message": "Upcoming returns retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": "booking-id",
      "bookingId": "ABC123",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "outfitBrand": "Hugo Boss",
      "outfitModel": "Classic Suit",
      "returnDate": "2025-10-10T00:00:00.000Z",
      "daysUntilReturn": 1
    }
  ]
}
```

### 3. Trigger Manual Check
```http
POST /api/booking/check-reminders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "ok",
  "message": "Return reminder check completed successfully"
}
```

## 🧪 Testing

### 1. Run Test Script
```bash
cd backend
node test-return-reminder.js
```

This will:
- Connect to your database
- Find bookings with upcoming returns
- Send a test email
- Run the reminder check process

### 2. Manual Testing via API

Use Postman or curl to test the endpoints:

```bash
# Get upcoming returns
curl -X GET http://localhost:5001/api/booking/upcoming-returns \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send manual reminder
curl -X POST http://localhost:5001/api/booking/send-return-reminder/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Trigger reminder check
curl -X POST http://localhost:5001/api/booking/check-reminders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📅 Schedule Configuration

The system runs checks at:
- **9:00 AM** daily
- **6:00 PM** daily

To modify the schedule, edit `backend/services/reminderScheduler.js`:

```javascript
// Change these cron expressions
cron.schedule('0 9 * * *', () => { ... }); // 9 AM
cron.schedule('0 18 * * *', () => { ... }); // 6 PM
```

**Cron Format**: `minute hour day month dayOfWeek`

Examples:
- `0 8 * * *` - 8:00 AM daily
- `0 */6 * * *` - Every 6 hours
- `0 9,18 * * *` - 9 AM and 6 PM daily

## 🔧 Customization

### 1. Email Template

Edit the HTML template in `backend/services/emailService.js` in the `sendReturnReminderEmail` function.

### 2. Reminder Logic

Modify the reminder timing logic in `backend/services/reminderScheduler.js`:

```javascript
// Current logic: 1 day before and on return day
if (daysUntilReturn === 1) {
  // Final reminder
} else if (daysUntilReturn === 0) {
  // Urgent reminder
}

// Add more conditions as needed
```

### 3. Additional Charges Message

Customize the late fee messaging in the email template:

```javascript
// In the email template
${daysUntilReturn <= 0 ? `
  <div class="charges-warning">
    <h3>⚠️ ADDITIONAL CHARGES APPLY</h3>
    <p>Late return fees: $10 per day</p>
  </div>
` : ''}
```

## 🐛 Troubleshooting

### 1. Emails Not Sending
- Check email configuration in `.env`
- Verify Gmail App Password is correct
- Check console logs for error messages

### 2. Scheduler Not Running
- Check server startup logs
- Verify `node-cron` is installed
- Check timezone settings

### 3. No Bookings Found
- Verify booking data in database
- Check booking status is 'confirmed'
- Ensure return dates are set correctly

### 4. Duplicate Reminders
- The system prevents duplicates automatically
- Check `sentReminders` Set in the scheduler

## 📊 Monitoring

### Console Logs
The system provides detailed logging:

```
🔍 Checking for bookings that need return reminders...
📋 Found 3 bookings with upcoming return dates
✅ Return reminder sent for booking #ABC123 to customer@email.com
⏭️ Reminder already sent for booking #DEF456
```

### Database Queries
Monitor the booking queries in your database logs to ensure optimal performance.

## 🔒 Security

- All API endpoints require authentication
- Email addresses are validated before sending
- No sensitive data is logged in production

## 🚀 Production Deployment

1. Ensure email configuration is set in production environment
2. Set appropriate timezone in cron jobs
3. Monitor email delivery rates
4. Set up error alerting for failed email sends

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a simple booking first
4. Check network/firewall restrictions

---

**Note**: This system is specifically designed for the rental booking process and integrates seamlessly with the existing booking management system.
