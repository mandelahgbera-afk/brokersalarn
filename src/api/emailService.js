/**
 * Email Service API
 * Integrates with Supabase to send transactional emails
 * Supports SendGrid, Resend, AWS SES, or custom webhook-based delivery
 */

import { supabase } from './supabaseClient';
import emailTemplates from '@/lib/emailTemplates';

/**
 * Send transactional email via Supabase + Email Provider
 * Logs to email_notifications table for audit trail
 */
export async function sendEmail({
  recipientEmail,
  templateType,
  subject,
  htmlBody,
  relatedTxId = null,
  variables = {}
}) {
  try {
    // Log email to database
    const { data, error: dbError } = await supabase
      .from('email_notifications')
      .insert([
        {
          recipient_email: recipientEmail,
          template_type: templateType,
          subject,
          body_html: htmlBody,
          related_tx_id: relatedTxId,
          status: 'pending'
        }
      ])
      .select('id')
      .single();

    if (dbError) {
      console.error('[Email Service] Database error:', dbError);
      throw dbError;
    }

    const emailId = data.id;

    // Send via your configured provider
    // Option 1: SendGrid
    // Option 2: Resend.io
    // Option 3: AWS SES
    // Option 4: Custom webhook
    
    const sendResult = await sendViaProvider({
      recipientEmail,
      subject,
      htmlBody,
      emailId
    });

    // Update status in database
    if (sendResult.success) {
      await supabase
        .from('email_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', emailId);
    } else {
      await supabase
        .from('email_notifications')
        .update({ 
          status: 'failed', 
          error_message: sendResult.error 
        })
        .eq('id', emailId);
    }

    return { success: sendResult.success, emailId };
  } catch (error) {
    console.error('[Email Service] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send via configured email provider
 * Replace this with your actual provider integration
 */
async function sendViaProvider({ recipientEmail, subject, htmlBody, emailId }) {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER || 'resend';

  switch (provider) {
    case 'sendgrid':
      return await sendViaSendGrid(recipientEmail, subject, htmlBody);
    case 'resend':
      return await sendViaResend(recipientEmail, subject, htmlBody);
    case 'ses':
      return await sendViaSES(recipientEmail, subject, htmlBody);
    case 'webhook':
      return await sendViaWebhook(recipientEmail, subject, htmlBody, emailId);
    default:
      return { success: false, error: `Unknown provider: ${provider}` };
  }
}

/**
 * SendGrid Integration
 * Requires: VITE_SENDGRID_API_KEY environment variable
 */
async function sendViaSendGrid(recipientEmail, subject, htmlBody) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipientEmail }],
            subject
          }
        ],
        from: {
          email: import.meta.env.VITE_EMAIL_FROM || 'noreply@brokerr.io',
          name: 'Brokerr'
        },
        content: [
          {
            type: 'text/html',
            value: htmlBody
          }
        ],
        track_opens: true,
        track_clicks: true
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Resend.io Integration
 * Requires: VITE_RESEND_API_KEY environment variable
 */
async function sendViaResend(recipientEmail, subject, htmlBody) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: import.meta.env.VITE_EMAIL_FROM || 'Brokerr <noreply@brokerr.io>',
        to: recipientEmail,
        subject,
        html: htmlBody
      })
    });

    const data = await response.json();
    if (response.ok && data.id) {
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Failed to send' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * AWS SES Integration
 * Requires: AWS credentials and VITE_AWS_SES_REGION
 */
async function sendViaSES(recipientEmail, subject, htmlBody) {
  try {
    // This would require AWS SDK which is server-side only
    // For browser-based client, use Lambda/API Gateway endpoint instead
    console.warn('[Email Service] AWS SES must be called from server-side');
    return { success: false, error: 'SES requires server-side implementation' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Custom Webhook Integration
 * Call your own backend endpoint
 */
async function sendViaWebhook(recipientEmail, subject, htmlBody, emailId) {
  try {
    const response = await fetch(import.meta.env.VITE_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_EMAIL_WEBHOOK_SECRET}`
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: htmlBody,
        emailId
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper functions for specific email types
 */

export async function sendDepositRequestEmail(userName, userEmail, amount, currency) {
  const html = emailTemplates.depositRequestSubmitted(userName, amount, currency);
  return sendEmail({
    recipientEmail: userEmail,
    templateType: 'deposit_request_submitted',
    subject: 'Deposit Request Submitted - Brokerr',
    htmlBody: html
  });
}

export async function sendDepositApprovedEmail(userName, userEmail, amount, currency, depositAddress) {
  const html = emailTemplates.depositApproved(userName, amount, currency, depositAddress);
  return sendEmail({
    recipientEmail: userEmail,
    templateType: 'deposit_approved',
    subject: 'Deposit Approved - Brokerr',
    htmlBody: html
  });
}

export async function sendWithdrawalRequestEmail(userName, userEmail, amount, currency, walletAddress) {
  const html = emailTemplates.withdrawalRequestSubmitted(userName, amount, currency, walletAddress);
  return sendEmail({
    recipientEmail: userEmail,
    templateType: 'withdrawal_request_submitted',
    subject: 'Withdrawal Request Submitted - Brokerr',
    htmlBody: html
  });
}

export async function sendWithdrawalApprovedEmail(userName, userEmail, amount, currency, walletAddress, txHash) {
  const html = emailTemplates.withdrawalApproved(userName, amount, currency, walletAddress, txHash);
  return sendEmail({
    recipientEmail: userEmail,
    templateType: 'withdrawal_approved',
    subject: 'Withdrawal Approved - Brokerr',
    htmlBody: html
  });
}

export async function sendTradeExecutedEmail(userName, userEmail, tradeType, crypto, amount, price, total) {
  const html = emailTemplates.tradeExecuted(userName, tradeType, crypto, amount, price, total);
  return sendEmail({
    recipientEmail: userEmail,
    templateType: 'trade_executed',
    subject: `Trade Executed - ${tradeType.toUpperCase()} ${crypto}`,
    htmlBody: html
  });
}

export async function sendCopyTraderProfitEmail(userName, userEmail, traderName, profit, profitPct) {
  const html = emailTemplates.copyTraderProfit(userName, traderName, profit, profitPct);
  return sendEmail({
    recipientEmail: userEmail,
    templateType: 'copy_trader_profit',
    subject: `Copy Trading Profit - ${traderName}`,
    htmlBody: html
  });
}

export default {
  sendEmail,
  sendDepositRequestEmail,
  sendDepositApprovedEmail,
  sendWithdrawalRequestEmail,
  sendWithdrawalApprovedEmail,
  sendTradeExecutedEmail,
  sendCopyTraderProfitEmail
};
