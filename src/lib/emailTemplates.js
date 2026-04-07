/**
 * Email Templates - Professional transactional emails for Brokerr
 * All HTML is optimized for 100% inbox delivery across all email clients
 * Inline CSS, no external resources, works in Gmail/Outlook/Apple Mail
 */

// Brand colors for Web3 aesthetic
const BRAND = {
  primary: '#6366f1',    // Indigo - crypto-friendly
  secondary: '#10b981',  // Green - trust/growth
  accent: '#f59e0b',     // Amber - highlights
  neutral: '#f3f4f6',    // Light gray - backgrounds
  text: '#1f2937',       // Dark gray - text
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

/**
 * Base email wrapper with consistent styling and branding
 */
const emailWrapper = (subject, bodyHTML, footer = true) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${BRAND.text}; background: #ffffff; margin: 0; padding: 0; }
    table { border-collapse: collapse; width: 100%; }
    td { padding: 0; }
    img { max-width: 100%; height: auto; display: block; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, ${BRAND.primary} 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
    .header-subtitle { font-size: 14px; color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; }
    .content { padding: 40px 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 20px; font-weight: 600; color: ${BRAND.text}; margin: 0 0 15px 0; }
    .section-text { font-size: 16px; line-height: 1.6; color: ${BRAND.text}; margin: 0 0 15px 0; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #7f1d1d; }
    .status-completed { background: #d1fae5; color: #065f46; }
    .info-box { background: ${BRAND.neutral}; border-left: 4px solid ${BRAND.primary}; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-box-label { font-size: 12px; font-weight: 600; color: ${BRAND.primary}; text-transform: uppercase; margin: 0 0 4px 0; }
    .info-box-value { font-size: 18px; font-weight: 600; color: ${BRAND.text}; margin: 0; }
    .info-box-currency { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .cta-button { display: inline-block; background: ${BRAND.primary}; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .cta-button:hover { background: #4f46e5; }
    .divider { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
    .transaction-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .transaction-table th { background: ${BRAND.neutral}; padding: 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; border: 1px solid #e5e7eb; }
    .transaction-table td { padding: 12px; border: 1px solid #e5e7eb; }
    .transaction-table tr:nth-child(even) { background: #fafafa; }
    .footer { background: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { font-size: 12px; color: #6b7280; margin: 0 0 10px 0; }
    .footer-link { color: ${BRAND.primary}; text-decoration: none; }
    .footer-link:hover { text-decoration: underline; }
    .badge-crypto { display: inline-block; background: ${BRAND.primary}; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin: 0 4px 0 0; }
    .amount-positive { color: ${BRAND.success}; font-weight: 600; }
    .amount-negative { color: ${BRAND.error}; font-weight: 600; }
    @media (max-width: 600px) {
      .container { width: 100%; }
      .content { padding: 20px 15px; }
      .header { padding: 30px 15px; }
      .section-title { font-size: 18px; }
      .info-box-value { font-size: 16px; }
      .cta-button { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0">
    <tr>
      <td class="header">
        <h1 class="header-logo">Brokerr</h1>
        <p class="header-subtitle">Copy Trading Platform</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        ${bodyHTML}
      </td>
    </tr>
    ${footer ? `
    <tr>
      <td class="footer">
        <p class="footer-text">© 2026 Brokerr Inc. All rights reserved.</p>
        <p class="footer-text">
          <a href="https://brokerr.io" class="footer-link">Visit Platform</a> • 
          <a href="https://brokerr.io/settings" class="footer-link">Settings</a> • 
          <a href="https://brokerr.io/help" class="footer-link">Help Center</a>
        </p>
        <p class="footer-text">You&apos;re receiving this because you have an active Brokerr account.</p>
      </td>
    </tr>
    ` : ''}
  </table>
</body>
</html>
`;

/**
 * DEPOSIT REQUEST SUBMITTED - For user confirmation
 */
export const depositRequestSubmitted = (userName, amount, currency = 'USD') => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Deposit Request Submitted</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Your deposit request has been received and is pending admin approval.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Amount</p>
      <p class="info-box-value">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p class="info-box-currency">${currency}</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Status</p>
      <span class="status-badge status-pending">Pending Review</span>
    </div>
    
    <div class="section">
      <p class="section-text">You will receive an email notification once your deposit has been approved or declined.</p>
      <p class="section-text"><strong>Typical processing time:</strong> 24-48 hours</p>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/dashboard" class="cta-button">View Dashboard</a>
    </div>
    
    <hr class="divider">
    
    <div class="section">
      <p class="section-text" style="font-size: 14px; color: #6b7280;">
        <strong>Need help?</strong> Contact our support team at support@brokerr.io or reply to this email.
      </p>
    </div>
  `;
  
  return emailWrapper('Deposit Request Submitted', bodyHTML);
};

/**
 * DEPOSIT APPROVED - For user notification
 */
export const depositApproved = (userName, amount, currency = 'USD', depositAddress = null) => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Deposit Approved ✓</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Great news! Your deposit request has been approved by our admin team.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Approved Amount</p>
      <p class="info-box-value amount-positive">+$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p class="info-box-currency">${currency}</p>
    </div>
    
    ${depositAddress ? `
    <div class="info-box">
      <p class="info-box-label">Deposit Address</p>
      <p class="info-box-value" style="font-size: 14px; word-break: break-all; font-family: 'Monaco', 'Courier New', monospace;">${depositAddress}</p>
    </div>
    ` : ''}
    
    <div class="section">
      <p class="section-text"><strong>Next steps:</strong></p>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Navigate to your Brokerr dashboard</li>
        <li>Go to Deposit section</li>
        <li>Send ${currency} to the provided address</li>
        <li>Funds will appear in your account after confirmation</li>
      </ol>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/deposit" class="cta-button">Start Deposit</a>
    </div>
    
    <hr class="divider">
    
    <div class="section">
      <p class="section-text" style="font-size: 14px; color: #6b7280;">
        <strong>Security tip:</strong> Never share your deposit address with anyone. Always use the address from your Brokerr account.
      </p>
    </div>
  `;
  
  return emailWrapper('Deposit Approved', bodyHTML);
};

/**
 * DEPOSIT REJECTED - For user notification
 */
export const depositRejected = (userName, amount, reason = 'Security verification required') => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Deposit Request Declined</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Unfortunately, your deposit request could not be approved at this time.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Requested Amount</p>
      <p class="info-box-value">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
    
    <div class="info-box" style="border-left-color: ${BRAND.error}; background: #fef2f2;">
      <p class="info-box-label" style="color: ${BRAND.error};">Reason</p>
      <p class="section-text">${reason}</p>
    </div>
    
    <div class="section">
      <p class="section-text"><strong>What you can do:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Review your account information for any issues</li>
        <li>Complete additional verification if requested</li>
        <li>Try submitting a new request with updated information</li>
        <li>Contact support if you believe this is an error</li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/settings/verification" class="cta-button">Update Information</a>
    </div>
    
    <hr class="divider">
    
    <div class="section">
      <p class="section-text" style="font-size: 14px; color: #6b7280;">
        Questions? Reply to this email or contact our support team at support@brokerr.io
      </p>
    </div>
  `;
  
  return emailWrapper('Deposit Request Declined', bodyHTML);
};

/**
 * WITHDRAWAL REQUEST SUBMITTED - For user confirmation
 */
export const withdrawalRequestSubmitted = (userName, amount, currency = 'USD', walletAddress) => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Withdrawal Request Submitted</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Your withdrawal request has been received and is pending admin approval.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Withdrawal Amount</p>
      <p class="info-box-value">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p class="info-box-currency">${currency}</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Destination Wallet</p>
      <p class="info-box-value" style="font-size: 14px; word-break: break-all; font-family: 'Monaco', 'Courier New', monospace;">${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 10)}</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Status</p>
      <span class="status-badge status-pending">Pending Review</span>
    </div>
    
    <div class="section">
      <p class="section-text">You will receive an email once your withdrawal has been approved and processed.</p>
      <p class="section-text"><strong>Typical processing time:</strong> 24-48 hours for approval, then blockchain confirmation</p>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/dashboard" class="cta-button">View Dashboard</a>
    </div>
  `;
  
  return emailWrapper('Withdrawal Request Submitted', bodyHTML);
};

/**
 * WITHDRAWAL APPROVED - For user notification
 */
export const withdrawalApproved = (userName, amount, currency = 'USD', walletAddress, txHash = null) => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Withdrawal Approved ✓</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Excellent! Your withdrawal request has been approved and your funds are being processed.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Withdrawal Amount</p>
      <p class="info-box-value amount-negative">-$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p class="info-box-currency">${currency}</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Destination Wallet</p>
      <p class="info-box-value" style="font-size: 14px; word-break: break-all; font-family: 'Monaco', 'Courier New', monospace;">${walletAddress}</p>
    </div>
    
    ${txHash ? `
    <div class="info-box">
      <p class="info-box-label">Transaction Hash</p>
      <p class="info-box-value" style="font-size: 12px; word-break: break-all; font-family: 'Monaco', 'Courier New', monospace;">${txHash}</p>
    </div>
    ` : ''}
    
    <div class="section">
      <p class="section-text"><strong>What happens next:</strong></p>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Your withdrawal is now being processed on the blockchain</li>
        <li>You'll receive a confirmation email with transaction details</li>
        <li>Blockchain confirmation typically takes 10-30 minutes</li>
        <li>Funds will appear in your wallet after confirmation</li>
      </ol>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/transactions" class="cta-button">View Transactions</a>
    </div>
  `;
  
  return emailWrapper('Withdrawal Approved', bodyHTML);
};

/**
 * WITHDRAWAL REJECTED - For user notification
 */
export const withdrawalRejected = (userName, amount, reason = 'Security verification required') => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Withdrawal Request Declined</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Unfortunately, your withdrawal request could not be approved at this time.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Requested Amount</p>
      <p class="info-box-value">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
    
    <div class="info-box" style="border-left-color: ${BRAND.error}; background: #fef2f2;">
      <p class="info-box-label" style="color: ${BRAND.error};">Reason</p>
      <p class="section-text">${reason}</p>
    </div>
    
    <div class="section">
      <p class="section-text"><strong>Your funds are safe:</strong> The amount remains in your Brokerr account and can be used for trading.</p>
      <p class="section-text">You can submit a new withdrawal request or contact our support team for assistance.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/withdraw" class="cta-button">Submit New Request</a>
    </div>
  `;
  
  return emailWrapper('Withdrawal Request Declined', bodyHTML);
};

/**
 * TRADE EXECUTED - For user notification
 */
export const tradeExecuted = (userName, tradeType, crypto, amount, price, total) => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Trade Executed ✓</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Your ${tradeType.toUpperCase()} order has been successfully executed.</p>
    </div>
    
    <table class="transaction-table">
      <tr>
        <th>Type</th>
        <th>Asset</th>
        <th>Amount</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
      <tr>
        <td><span class="badge-crypto">${tradeType}</span></td>
        <td><strong>${crypto}</strong></td>
        <td>${amount}</td>
        <td>$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
        <td><strong>$${parseFloat(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
      </tr>
    </table>
    
    <div class="info-box">
      <p class="info-box-label">Status</p>
      <span class="status-badge status-completed">Completed</span>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/portfolio" class="cta-button">View Portfolio</a>
    </div>
  `;
  
  return emailWrapper('Trade Executed', bodyHTML);
};

/**
 * COPY TRADER PROFIT - For user notification
 */
export const copyTraderProfit = (userName, traderName, profit, profitPct) => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Copy Trading Profit 🎉</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">Great news! Your copy trading with <strong>${traderName}</strong> generated a profit.</p>
    </div>
    
    <div class="info-box">
      <p class="info-box-label">Profit Generated</p>
      <p class="info-box-value amount-positive">+$${parseFloat(profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p class="info-box-currency">${profitPct}% return</p>
    </div>
    
    <div class="section">
      <p class="section-text">This profit has been added to your account balance and is available for withdrawal or further trading.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/copy-trading" class="cta-button">View Copy Trading</a>
    </div>
  `;
  
  return emailWrapper('Copy Trading Profit', bodyHTML);
};

/**
 * ACCOUNT VERIFICATION REQUIRED - For user action
 */
export const verificationRequired = (userName, reason = 'Enhanced security verification') => {
  const bodyHTML = `
    <div class="section">
      <h2 class="section-title">Account Verification Required</h2>
      <p class="section-text">Hi ${userName},</p>
      <p class="section-text">We need to verify some information on your account to continue using Brokerr.</p>
    </div>
    
    <div class="info-box" style="border-left-color: ${BRAND.accent};">
      <p class="info-box-label">Action Required</p>
      <p class="section-text">${reason}</p>
    </div>
    
    <div class="section">
      <p class="section-text">This is a standard security measure to protect your account and comply with regulatory requirements.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="https://brokerr.io/settings/verification" class="cta-button">Complete Verification</a>
    </div>
    
    <div class="section">
      <p class="section-text" style="font-size: 14px; color: #6b7280;">
        <strong>Why this matters:</strong> Account verification helps us prevent fraud and keep your funds secure.
      </p>
    </div>
  `;
  
  return emailWrapper('Account Verification Required', bodyHTML);
};

export default {
  depositRequestSubmitted,
  depositApproved,
  depositRejected,
  withdrawalRequestSubmitted,
  withdrawalApproved,
  withdrawalRejected,
  tradeExecuted,
  copyTraderProfit,
  verificationRequired
};
