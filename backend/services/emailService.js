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
    console.log('✅ Email service is ready to send messages');
    return true;
  } catch (error) {
    console.log('❌ Email service configuration error:', error.message);
    return false;
  }
};

// Send low stock alert email - AUTOMATIC ONLY
const sendLowStockAlert = async (item, recipientEmail = 'kadavishkakanakasekara@gmail.com') => {
  console.log(`🚨 AUTOMATIC LOW STOCK ALERT: ${item.itemName} (${item.quantity}/${item.minimumStock} ${item.unit})`);
  
  try {
    // Try to send real email
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `🚨 LOW STOCK ALERT - ${item.itemName}`,
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
              <h1>🚨 INVENTORY ALERT</h1>
              <p>Klassy T Shirts - Stock Management System</p>
            </div>
            
            <div class="content">
              <div class="alert-box">
                <h2 style="color: #dc2626; margin-top: 0;">⚠️ LOW STOCK WARNING</h2>
                <p>The following inventory item has reached critically low stock levels and requires immediate attention:</p>
              </div>
              
              <div class="item-details">
                <h3 style="margin-top: 0; color: #1f2937;">📦 Item Details</h3>
                
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
                    ${item.status === 'out_of_stock' ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK'}
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
                <h3 style="margin-top: 0; color: #1e40af;">📋 Recommended Actions</h3>
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
              <p>📧 For support, contact: admin@klassytshirts.com</p>
              <p>© 2025 Klassy T Shirts - All Rights Reserved</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`✅ AUTOMATIC EMAIL SENT: ${item.itemName} to ${recipientEmail}`);
    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error(`❌ Failed to send low stock alert for ${item.itemName}:`, error.message);
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
      subject: `📊 INVENTORY SUMMARY - ${lowStockItems.length + outOfStockItems.length} Items Need Attention`,
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
              <h1>📊 INVENTORY SUMMARY ALERT</h1>
              <p>Klassy T Shirts - Daily Stock Report</p>
            </div>
            
            <div class="content">
              <div class="summary-box">
                <h2 style="color: #dc2626; margin-top: 0;">📋 Stock Alert Summary</h2>
                <p><strong>Out of Stock Items:</strong> ${outOfStockItems.length}</p>
                <p><strong>Low Stock Items:</strong> ${lowStockItems.length}</p>
                <p><strong>Total Items Requiring Attention:</strong> ${lowStockItems.length + outOfStockItems.length}</p>
              </div>
              
              ${outOfStockItems.length > 0 ? `
                <h3 style="color: #dc2626;">🔴 OUT OF STOCK ITEMS (CRITICAL)</h3>
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
                <h3 style="color: #d97706;">🟡 LOW STOCK ITEMS</h3>
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
    console.log(`✅ Bulk low stock alert sent to ${recipientEmail}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send bulk low stock alert:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  testEmailConnection,
  sendLowStockAlert,
  sendBulkLowStockAlerts
};
