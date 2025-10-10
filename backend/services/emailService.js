const nodemailer = require('nodemailer');

// Email configuration - Try multiple approaches for compatibility
const getEmailConfig = () => {
  // First try: Gmail with App Password (most secure)
  if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length === 16 && !process.env.EMAIL_PASS.includes(' ')) {
    return {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };
  }
  
  // Second try: Gmail SMTP with regular password (less secure, may not work)
  return {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };
};

// Create transporter
const transporter = nodemailer.createTransport(getEmailConfig());

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return true;
  } catch (error) {
    console.log('Email service configuration error:', error.message);
    return false;
  }
};

// Send low stock alert email - AUTOMATIC ONLY
const sendLowStockAlert = async (item, recipientEmail = 'kadavishkakanakasekara@gmail.com') => {
  console.log(`AUTOMATIC LOW STOCK ALERT: ${item.itemName} (${item.quantity}/${item.minimumStock} ${item.unit})`);
  
  try {
    // Try to send real email
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `LOW STOCK ALERT - ${item.itemName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .item-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #6b7280; }
            .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status-low { background: #fef3c7; color: #92400e; }
            .status-out { background: #fee2e2; color: #dc2626; }
            .action-needed { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .urgent { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>INVENTORY ALERT</h1>
              <p>Klassy T Shirts - Stock Management System</p>
            </div>
            
            <div class="content">
              <div class="alert-box">
                <h2 style="color: #dc2626; margin-top: 0;">LOW STOCK WARNING</h2>
                <p>The following inventory item has reached critically low stock levels and requires immediate attention:</p>
              </div>
              
              <div class="item-details">
                <h3 style="margin-top: 0; color: #1f2937;">Item Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Item Name:</span>
                  <span class="detail-value"><strong>${item.itemName}</strong></span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Current Stock:</span>
                  <span class="detail-value urgent">${item.quantity} ${item.unit}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Minimum Stock Level:</span>
                  <span class="detail-value">${item.minimumStock} ${item.unit}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="status-badge ${item.status === 'out_of_stock' ? 'status-out' : 'status-low'}">
                    ${item.status === 'out_of_stock' ? 'OUT OF STOCK' : 'LOW STOCK'}
                  </span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${item.category}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${item.location}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Supplier:</span>
                  <span class="detail-value">${item.supplierName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Unit Price:</span>
                  <span class="detail-value">$${item.unitPrice.toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Last Updated:</span>
                  <span class="detail-value">${new Date(item.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
              
              <div class="action-needed">
                <h3 style="margin-top: 0; color: #1e40af;">Recommended Actions</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Immediate:</strong> Check current production requirements</li>
                  <li><strong>Contact Supplier:</strong> Place urgent reorder with ${item.supplierName}</li>
                  <li><strong>Review:</strong> Consider increasing minimum stock level</li>
                  <li><strong>Monitor:</strong> Track usage patterns for better forecasting</li>
                  ${item.status === 'out_of_stock' ? '<li class="urgent"><strong>CRITICAL:</strong> Production may be affected - prioritize reorder</li>' : ''}
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6b7280;">This is an automated alert from the Klassy T Shirts Inventory Management System</p>
                <p style="color: #6b7280; font-size: 12px;">Alert generated on: ${new Date().toLocaleString()}</p>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Klassy T Shirts</strong> - Inventory Management System</p>
              <p>For support, contact: admin@klassytshirts.com</p>
              <p>© 2025 Klassy T Shirts - All Rights Reserved</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`AUTOMATIC EMAIL SENT: ${item.itemName} to ${recipientEmail}`);
    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error(`Failed to send low stock alert for ${item.itemName}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send bulk low stock alerts
const sendBulkLowStockAlerts = async (items, recipientEmail = 'kadavishkakanakasekara@gmail.com') => {
  try {
    const lowStockItems = items.filter(item => item.status === 'low_stock');
    const outOfStockItems = items.filter(item => item.status === 'out_of_stock');
    
    if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
      return { success: true, message: 'No low stock items to report' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@klassytshirts.com',
      to: recipientEmail,
      subject: `INVENTORY SUMMARY - ${lowStockItems.length + outOfStockItems.length} Items Need Attention`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .summary-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .item-table th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            .item-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            .status-out { color: #dc2626; font-weight: bold; }
            .status-low { color: #d97706; font-weight: bold; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>INVENTORY SUMMARY ALERT</h1>
              <p>Klassy T Shirts - Daily Stock Report</p>
            </div>
            
            <div class="content">
              <div class="summary-box">
                <h2 style="color: #dc2626; margin-top: 0;">Stock Alert Summary</h2>
                <p><strong>Out of Stock Items:</strong> ${outOfStockItems.length}</p>
                <p><strong>Low Stock Items:</strong> ${lowStockItems.length}</p>
                <p><strong>Total Items Requiring Attention:</strong> ${lowStockItems.length + outOfStockItems.length}</p>
              </div>
              
              ${outOfStockItems.length > 0 ? `
                <h3 style="color: #dc2626;">OUT OF STOCK ITEMS (CRITICAL)</h3>
                <table class="item-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Supplier</th>
                      <th>Min Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${outOfStockItems.map(item => `
                      <tr>
                        <td><strong>${item.itemName}</strong></td>
                        <td>${item.category}</td>
                        <td>${item.supplierName}</td>
                        <td>${item.minimumStock} ${item.unit}</td>
                        <td class="status-out">OUT OF STOCK</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
              
              ${lowStockItems.length > 0 ? `
                <h3 style="color: #d97706;">LOW STOCK ITEMS</h3>
                <table class="item-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Current Stock</th>
                      <th>Min Stock</th>
                      <th>Category</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lowStockItems.map(item => `
                      <tr>
                        <td><strong>${item.itemName}</strong></td>
                        <td class="status-low">${item.quantity} ${item.unit}</td>
                        <td>${item.minimumStock} ${item.unit}</td>
                        <td>${item.category}</td>
                        <td>${item.supplierName}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
            </div>
            
            <div class="footer">
              <p><strong>Klassy T Shirts</strong> - Inventory Management System</p>
              <p>Report generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Bulk low stock alert sent to ${recipientEmail}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Failed to send bulk low stock alert:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send Pay on Return confirmation email
const sendPayOnReturnEmail = async (booking, recipientEmail) => {
  console.log(`Sending Pay on Return confirmation to: ${recipientEmail}`);
  
  try {
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Payment on Return Confirmed - Booking #${booking._id.toString().slice(-6)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #ffffff;
              color: #000000;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff; 
              border: 2px solid #000000; 
              padding: 0;
            }
            .header { 
              background: #000000; 
              color: #ffffff; 
              padding: 30px; 
              text-align: center; 
              border-bottom: 2px solid #000000;
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold;
            }
            .content { 
              padding: 30px; 
              background: #ffffff;
            }
            .booking-box { 
              background: #f5f5f5; 
              border: 2px solid #000000; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .outfit-image { 
              width: 100%; 
              max-width: 400px; 
              height: auto; 
              border: 2px solid #000000; 
              margin: 20px auto;
              display: block;
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 12px 0; 
              padding: 10px 0; 
              border-bottom: 1px solid #cccccc; 
            }
            .detail-label { 
              font-weight: bold; 
              color: #000000; 
            }
            .detail-value { 
              color: #333333; 
              text-align: right;
            }
            .important-box { 
              background: #000000; 
              color: #ffffff; 
              border: 2px solid #000000; 
              padding: 20px; 
              margin: 20px 0; 
              text-align: center;
            }
            .footer { 
              background: #f5f5f5; 
              padding: 20px; 
              text-align: center; 
              color: #666666; 
              font-size: 14px; 
              border-top: 2px solid #000000;
            }
            .price-highlight { 
              font-size: 24px; 
              font-weight: bold; 
              color: #000000; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PAYMENT ON RETURN CONFIRMED</h1>
              <p style="margin: 10px 0 0 0;">Outfit Rental Booking Confirmation</p>
            </div>
            
            <div class="content">
              <div class="booking-box">
                <h2 style="margin-top: 0; color: #000000; text-align: center;">Booking Details</h2>
                <p style="text-align: center; font-size: 18px; margin: 10px 0;">
                  <strong>Booking ID:</strong> #${booking._id.toString().slice(-6)}
                </p>
              </div>
              
              ${booking.outfit?.image ? `
                <img src="${booking.outfit.image}" alt="Outfit" class="outfit-image" />
              ` : ''}
              
              <div style="margin: 30px 0;">
                <h3 style="color: #000000; border-bottom: 2px solid #000000; padding-bottom: 10px;">
                  Outfit Information
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Brand:</span>
                  <span class="detail-value">${booking.outfit?.brand || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Model:</span>
                  <span class="detail-value">${booking.outfit?.model || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${booking.outfit?.category || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${booking.outfit?.location || 'N/A'}</span>
                </div>
              </div>
              
              <div style="margin: 30px 0;">
                <h3 style="color: #000000; border-bottom: 2px solid #000000; padding-bottom: 10px;">
                  Rental Period
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Reservation Date:</span>
                  <span class="detail-value">${new Date(booking.reservationDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Return Date:</span>
                  <span class="detail-value">${new Date(booking.returnDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${Math.ceil((new Date(booking.returnDate) - new Date(booking.reservationDate)) / (1000 * 60 * 60 * 24))} day(s)</span>
                </div>
              </div>
              
              <div style="margin: 30px 0;">
                <h3 style="color: #000000; border-bottom: 2px solid #000000; padding-bottom: 10px;">
                  👤 Customer Information
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${booking.user?.username || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${booking.email}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${booking.phone}</span>
                </div>
              </div>
              
              <div class="important-box">
                <h3 style="margin: 0 0 15px 0; color: #ffffff;">TOTAL AMOUNT TO PAY ON RETURN</h3>
                <p class="price-highlight" style="color: #ffffff; margin: 0;">
                  ${process.env.REACT_APP_CURRENCY || 'Rs.'} ${booking.price.toFixed(2)}
                </p>
              </div>
              
              <div style="background: #f5f5f5; border: 2px solid #000000; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #000000;">Important Instructions</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>Present this email</strong> to the outlet staff when returning the outfit</li>
                  <li><strong>Payment Method:</strong> Cash or Card accepted at outlet</li>
                  <li><strong>Return Time:</strong> Please return before closing time on the return date</li>
                  <li><strong>Condition:</strong> Ensure the outfit is in good condition</li>
                  <li><strong>Late Returns:</strong> Additional charges may apply for late returns</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f5f5f5; border: 1px solid #cccccc;">
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  <strong>Booking Status:</strong> ${booking.status.toUpperCase()}
                </p>
                <p style="margin: 10px 0 0 0; color: #666666; font-size: 12px;">
                  Booked on: ${new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>Outfit Rental Management System</strong></p>
              <p style="margin: 10px 0;">For any queries, please contact us at the outlet</p>
              <p style="margin: 10px 0; font-size: 12px;">© ${new Date().getFullYear()} - All Rights Reserved</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`Pay on Return email sent to ${recipientEmail}`);
    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error(`Failed to send Pay on Return email:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send return reminder email
const sendReturnReminderEmail = async (booking, recipientEmail) => {
  console.log(`Sending return reminder to: ${recipientEmail}`);
  
  try {
    const returnDate = new Date(booking.returnDate);
    const today = new Date();
    const daysUntilReturn = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
    
    let reminderType = '';
    let urgencyClass = '';
    let reminderMessage = '';
    
    if (daysUntilReturn === 2) {
      reminderType = 'REMINDER - Return in 2 Days';
      urgencyClass = 'early-reminder';
      reminderMessage = 'Friendly reminder: Your rental item needs to be returned in 2 days.';
    } else if (daysUntilReturn === 1) {
      reminderType = 'FINAL REMINDER - Return Tomorrow';
      urgencyClass = 'urgent-reminder';
      reminderMessage = 'This is your final reminder! Your rental item must be returned tomorrow.';
    } else if (daysUntilReturn === 0) {
      reminderType = 'URGENT - Return Today';
      urgencyClass = 'critical-reminder';
      reminderMessage = 'Your rental item must be returned TODAY to avoid additional charges.';
    } else if (daysUntilReturn < 0) {
      reminderType = 'OVERDUE - Late Return';
      urgencyClass = 'overdue-reminder';
      reminderMessage = 'Your rental item is OVERDUE. Additional charges are now being applied.';
    }

    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `${reminderType} - Booking #${booking._id.toString().slice(-6)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #ffffff;
              color: #000000;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff; 
              border: 2px solid #000000; 
              padding: 0;
            }
            .header { 
              background: #dc2626; 
              color: #ffffff; 
              padding: 30px; 
              text-align: center; 
              border-bottom: 2px solid #000000;
            }
            .early-reminder .header { background: #10b981; }
            .urgent-reminder .header { background: #f59e0b; }
            .critical-reminder .header { background: #dc2626; }
            .overdue-reminder .header { background: #7f1d1d; }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold;
            }
            .content { 
              padding: 30px; 
              background: #ffffff;
            }
            .reminder-box { 
              background: #fef2f2; 
              border: 2px solid #dc2626; 
              padding: 20px; 
              margin: 20px 0; 
              text-align: center;
            }
            .urgent-reminder .reminder-box { 
              background: #fef3c7; 
              border-color: #f59e0b; 
            }
            .critical-reminder .reminder-box { 
              background: #fef2f2; 
              border-color: #dc2626; 
            }
            .overdue-reminder .reminder-box { 
              background: #fef2f2; 
              border-color: #7f1d1d; 
            }
            .booking-details { 
              background: #f5f5f5; 
              border: 2px solid #000000; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 12px 0; 
              padding: 10px 0; 
              border-bottom: 1px solid #cccccc; 
            }
            .detail-label { 
              font-weight: bold; 
              color: #000000; 
            }
            .detail-value { 
              color: #333333; 
              text-align: right;
            }
            .return-date-highlight { 
              font-size: 24px; 
              font-weight: bold; 
              color: #dc2626; 
              text-align: center;
              margin: 20px 0;
            }
            .charges-warning { 
              background: #7f1d1d; 
              color: #ffffff; 
              border: 2px solid #7f1d1d; 
              padding: 20px; 
              margin: 20px 0; 
              text-align: center;
            }
            .footer { 
              background: #f5f5f5; 
              padding: 20px; 
              text-align: center; 
              color: #666666; 
              font-size: 14px; 
              border-top: 2px solid #000000;
            }
            .action-buttons {
              text-align: center;
              margin: 30px 0;
            }
            .contact-info {
              background: #e5e7eb;
              border: 1px solid #9ca3af;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container ${urgencyClass}">
            <div class="header">
              <h1>RETURN REMINDER</h1>
              <p style="margin: 10px 0 0 0;">${reminderType}</p>
            </div>
            
            <div class="content">
              <div class="reminder-box">
                <h2 style="margin-top: 0; color: #dc2626;">${reminderMessage}</h2>
                <p style="font-size: 18px; margin: 15px 0;">
                  <strong>Booking ID:</strong> #${booking._id.toString().slice(-6)}
                </p>
              </div>
              
              <div class="return-date-highlight">
                Return Date: ${returnDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #000000; text-align: center;">Rental Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Outfit Brand:</span>
                  <span class="detail-value">${booking.outfit?.brand || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Outfit Model:</span>
                  <span class="detail-value">${booking.outfit?.model || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${booking.outfit?.category || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Rental Price:</span>
                  <span class="detail-value">${process.env.REACT_APP_CURRENCY || 'Rs.'} ${booking.price.toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Customer Name:</span>
                  <span class="detail-value">${booking.user?.username || 'N/A'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${booking.phone}</span>
                </div>
              </div>
              
              ${daysUntilReturn <= 0 ? `
                <div class="charges-warning">
                  <h3 style="margin: 0 0 15px 0; color: #ffffff;">ADDITIONAL CHARGES APPLY</h3>
                  <p style="margin: 0; font-size: 16px;">
                    Late return fees are now being applied to your booking. 
                    Please return the item immediately to minimize additional charges.
                  </p>
                </div>
              ` : `
                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #92400e;">Avoid Additional Charges</h3>
                  <p style="margin: 0; color: #92400e;">
                    Return your rental item on time to avoid late fees. 
                    Additional charges will apply for returns after the due date.
                  </p>
                </div>
              `}
              
              <div style="background: #f5f5f5; border: 2px solid #000000; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #000000;">Return Instructions</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>Location:</strong> Return to the same outlet where you collected the item</li>
                  <li><strong>Condition:</strong> Ensure the outfit is clean and in good condition</li>
                  <li><strong>Time:</strong> Return before closing time on the due date</li>
                  <li><strong>Documents:</strong> Bring this email and your ID for verification</li>
                  <li><strong>Payment:</strong> Complete any pending payments at the outlet</li>
                </ul>
              </div>
              
              <div class="contact-info">
                <h4 style="margin-top: 0; color: #374151;">Need Help?</h4>
                <p style="margin: 5px 0; color: #6b7280;">
                  If you have any questions or need to extend your rental, 
                  please contact us immediately at the outlet.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f5f5f5; border: 1px solid #cccccc;">
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  <strong>Booking Status:</strong> ${booking.status.toUpperCase()}
                </p>
                <p style="margin: 10px 0 0 0; color: #666666; font-size: 12px;">
                  Reminder sent on: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>Outfit Rental Management System</strong></p>
              <p style="margin: 10px 0;">Thank you for choosing our rental service</p>
              <p style="margin: 10px 0; font-size: 12px;">© ${new Date().getFullYear()} - All Rights Reserved</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`Return reminder email sent to ${recipientEmail}`);
    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error(`Failed to send return reminder email:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  testEmailConnection,
  sendLowStockAlert,
  sendBulkLowStockAlerts,
  sendPayOnReturnEmail,
  sendReturnReminderEmail
};
