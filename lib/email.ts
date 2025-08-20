import nodemailer from 'nodemailer';

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email with purchased pack download links
 */
export async function sendPurchaseConfirmationEmail(
  customerEmail: string,
  orderDetails: {
    orderId: string;
    total: number;
  },
  purchasedPacks: Array<{
    sampleTitle: string;
    producer: string;
    downloadUrl: string;
    expiresAt: Date;
    maxDownloads: number;
    sampleCount?: number;
    samples?: Array<{
      sampleTitle: string;
      downloadUrl: string;
    }>;
  }>
) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Create HTML content for the email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; color: white;">Ethereal Techno</h1>
        <p style="margin-top: 10px;">Thanks for your purchase!</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px;">
        <h2>Your Purchase</h2>
        <p>Order #${orderDetails.orderId} | Total: ${formatCurrency(orderDetails.total/100)}</p>
        
        <div style="margin-top: 20px;">
          ${purchasedPacks.map(pack => `
            <div style="margin-bottom: 15px; padding: 15px; background-color: white; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">${pack.sampleTitle}</h3>
              <p>By ${pack.producer}</p>
              <p>Download limit: ${pack.maxDownloads} downloads</p>
              <p>Expires on: ${formatDate(pack.expiresAt)}</p>
              ${pack.sampleCount ? `<p>Includes ${pack.sampleCount} samples</p>` : ''}
              <a href="${pack.downloadUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Download Pack</a>
              
              ${pack.samples && pack.samples.length > 1 ? `
                <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                  <p style="font-size: 14px; color: #666;">Individual samples in this pack:</p>
                  <ul style="padding-left: 20px; margin-top: 8px;">
                    ${pack.samples.slice(0, 5).map(sample => `
                      <li style="margin-bottom: 5px;">
                        <span style="font-size: 14px;">${sample.sampleTitle}</span>
                      </li>
                    `).join('')}
                    ${pack.samples.length > 5 ? `<li style="margin-top: 5px; font-size: 14px; color: #666;">+ ${pack.samples.length - 5} more samples</li>` : ''}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>If you have any questions about your order, please contact our support team.</p>
        <p>&copy; ${new Date().getFullYear()} Ethereal Techno. All rights reserved.</p>
      </div>
    </div>
  `;

  // Send email
  return transporter.sendMail({
    from: `"Ethereal Techno" <${process.env.EMAIL_FROM || 'noreply@etherealtechno.com'}>`,
    to: customerEmail,
    subject: 'Your Ethereal Techno Downloads Are Ready',
    html: htmlContent,
  });
}
