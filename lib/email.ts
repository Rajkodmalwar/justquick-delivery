/**
 * Email Service Utility
 * Handles sending emails via SMTP (Resend, SendGrid, or Nodemailer)
 * 
 * FEATURES:
 * - OTP verification emails
 * - Password reset emails
 * - Order confirmation emails
 * - Admin notifications
 * - Rate limiting friendly
 * 
 * SETUP OPTIONS:
 * 1. Resend (Recommended for Next.js): resend.com
 * 2. SendGrid: sendgrid.com
 * 3. Mailgun: mailgun.com
 * 4. AWS SES: aws.amazon.com
 */

import { logger } from './logger'

// Email templates
export const EmailTemplates = {
  OTP_VERIFICATION: 'otp_verification',
  PASSWORD_RESET: 'password_reset',
  ORDER_CONFIRMATION: 'order_confirmation',
  DELIVERY_UPDATE: 'delivery_update',
  ADMIN_ALERT: 'admin_alert'
} as const

export type EmailTemplate = typeof EmailTemplates[keyof typeof EmailTemplates]

interface EmailOptions {
  to: string
  template: EmailTemplate
  subject: string
  data: Record<string, any>
}

/**
 * OPTION 1: Using Resend (Recommended)
 * Installation: npm install resend
 * Get API key: https://resend.com/dashboard
 */
export async function sendEmailViaResend(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    let htmlContent = ''
    let plainTextContent = ''

    // Generate email content based on template
    switch (options.template) {
      case EmailTemplates.OTP_VERIFICATION:
        htmlContent = generateOTPEmail(options.data)
        plainTextContent = `Your OTP is: ${options.data.otp}. Valid for 10 minutes.`
        break

      case EmailTemplates.PASSWORD_RESET:
        htmlContent = generatePasswordResetEmail(options.data)
        plainTextContent = `Click here to reset your password: ${options.data.resetLink}`
        break

      case EmailTemplates.ORDER_CONFIRMATION:
        htmlContent = generateOrderConfirmationEmail(options.data)
        plainTextContent = `Order #${options.data.orderId} confirmed`
        break

      case EmailTemplates.DELIVERY_UPDATE:
        htmlContent = generateDeliveryUpdateEmail(options.data)
        plainTextContent = `Your delivery update: ${options.data.status}`
        break

      case EmailTemplates.ADMIN_ALERT:
        htmlContent = generateAdminAlertEmail(options.data)
        plainTextContent = `Admin alert: ${options.data.message}`
        break

      default:
        throw new Error(`Unknown email template: ${options.template}`)
    }

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@justquick.delivery',
      to: options.to,
      subject: options.subject,
      html: htmlContent,
      text: plainTextContent,
    })

    if (response.error) {
      logger.error('❌ Resend email failed:', response.error)
      return { success: false, error: response.error.message }
    }

    logger.log('✅ Email sent via Resend:', response.id)
    return { success: true, messageId: response.id }
  } catch (error) {
    logger.error('❌ Error sending email via Resend:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * OPTION 2: Using SendGrid
 * Installation: npm install @sendgrid/mail
 * Get API key: https://sendgrid.com/
 */
export async function sendEmailViaSendGrid(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sgMail = await import('@sendgrid/mail')
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY || '')

    let htmlContent = ''
    let plainTextContent = ''

    switch (options.template) {
      case EmailTemplates.OTP_VERIFICATION:
        htmlContent = generateOTPEmail(options.data)
        plainTextContent = `Your OTP is: ${options.data.otp}. Valid for 10 minutes.`
        break

      case EmailTemplates.PASSWORD_RESET:
        htmlContent = generatePasswordResetEmail(options.data)
        plainTextContent = `Click here to reset your password: ${options.data.resetLink}`
        break

      case EmailTemplates.ORDER_CONFIRMATION:
        htmlContent = generateOrderConfirmationEmail(options.data)
        plainTextContent = `Order #${options.data.orderId} confirmed`
        break

      case EmailTemplates.DELIVERY_UPDATE:
        htmlContent = generateDeliveryUpdateEmail(options.data)
        plainTextContent = `Your delivery update: ${options.data.status}`
        break

      case EmailTemplates.ADMIN_ALERT:
        htmlContent = generateAdminAlertEmail(options.data)
        plainTextContent = `Admin alert: ${options.data.message}`
        break

      default:
        throw new Error(`Unknown email template: ${options.template}`)
    }

    const response = await sgMail.default.send({
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@justquick.delivery',
      to: options.to,
      subject: options.subject,
      html: htmlContent,
      text: plainTextContent,
    })

    logger.log('✅ Email sent via SendGrid:', response[0].headers['x-message-id'])
    return { success: true, messageId: response[0].headers['x-message-id'] }
  } catch (error) {
    logger.error('❌ Error sending email via SendGrid:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * OPTION 3: Using Nodemailer (Generic SMTP)
 * Installation: npm install nodemailer
 * Works with any SMTP provider (Gmail, Mailgun, custom SMTP server)
 */
export async function sendEmailViaNodemailer(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const nodemailer = await import('nodemailer')

    // Create transporter based on environment
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    let htmlContent = ''
    let plainTextContent = ''

    switch (options.template) {
      case EmailTemplates.OTP_VERIFICATION:
        htmlContent = generateOTPEmail(options.data)
        plainTextContent = `Your OTP is: ${options.data.otp}. Valid for 10 minutes.`
        break

      case EmailTemplates.PASSWORD_RESET:
        htmlContent = generatePasswordResetEmail(options.data)
        plainTextContent = `Click here to reset your password: ${options.data.resetLink}`
        break

      case EmailTemplates.ORDER_CONFIRMATION:
        htmlContent = generateOrderConfirmationEmail(options.data)
        plainTextContent = `Order #${options.data.orderId} confirmed`
        break

      case EmailTemplates.DELIVERY_UPDATE:
        htmlContent = generateDeliveryUpdateEmail(options.data)
        plainTextContent = `Your delivery update: ${options.data.status}`
        break

      case EmailTemplates.ADMIN_ALERT:
        htmlContent = generateAdminAlertEmail(options.data)
        plainTextContent = `Admin alert: ${options.data.message}`
        break

      default:
        throw new Error(`Unknown email template: ${options.template}`)
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: htmlContent,
      text: plainTextContent,
    })

    logger.log('✅ Email sent via Nodemailer:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    logger.error('❌ Error sending email via Nodemailer:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Main email sending function
 * Automatically selects the configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const emailProvider = process.env.EMAIL_PROVIDER || 'resend'

  logger.log(`📧 Sending email via ${emailProvider}:`, options.to)

  switch (emailProvider.toLowerCase()) {
    case 'resend':
      return sendEmailViaResend(options)

    case 'sendgrid':
      return sendEmailViaSendGrid(options)

    case 'nodemailer':
    case 'smtp':
      return sendEmailViaNodemailer(options)

    default:
      logger.error('❌ Unknown EMAIL_PROVIDER:', emailProvider)
      return { success: false, error: `Unknown EMAIL_PROVIDER: ${emailProvider}` }
  }
}

// ============ EMAIL TEMPLATES ============

function generateOTPEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .otp-code { 
            background-color: #f0fdf4; 
            border: 2px solid #10b981; 
            padding: 20px; 
            text-align: center; 
            font-size: 32px; 
            font-weight: bold; 
            color: #059669; 
            margin: 20px 0; 
            letter-spacing: 5px;
            border-radius: 8px;
          }
          .footer { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍕 JustQuick Delivery</div>
          </div>
          <h2>Your Login Code</h2>
          <p>Use this code to verify your email and complete your login:</p>
          <div class="otp-code">${data.otp}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JustQuick Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generatePasswordResetEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .button { 
            display: inline-block; 
            background-color: #10b981; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          .footer { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍕 JustQuick Delivery</div>
          </div>
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" class="button">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JustQuick Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateOrderConfirmationEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .order-item { padding: 10px; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #10b981; margin-top: 20px; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍕 JustQuick Delivery</div>
          </div>
          <h2>Order Confirmed!</h2>
          <p>Order #${data.orderId}</p>
          <p>Thank you for your order. Your food will be delivered soon!</p>
          <div class="order-items">
            ${data.items?.map((item: any) => `
              <div class="order-item">
                ${item.name} x${item.quantity} - ₹${item.price * item.quantity}
              </div>
            `).join('')}
          </div>
          <div class="total">Total: ₹${data.total}</div>
          <p>Estimated delivery time: ${data.estimatedTime || '30-45 minutes'}</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JustQuick Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateDeliveryUpdateEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .status { background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍕 JustQuick Delivery</div>
          </div>
          <h2>Delivery Update</h2>
          <div class="status">
            <p><strong>Order #${data.orderId}</strong></p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p>${data.message}</p>
          </div>
          ${data.driverPhone ? `<p>Driver contact: ${data.driverPhone}</p>` : ''}
          ${data.estimatedTime ? `<p>Estimated arrival: ${data.estimatedTime}</p>` : ''}
          <div class="footer">
            <p>© ${new Date().getFullYear()} JustQuick Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateAdminAlertEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .alert { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍕 JustQuick Admin Alert</div>
          </div>
          <div class="alert">
            <h3>⚠️ Alert</h3>
            <p>${data.message}</p>
            ${data.details ? `<p><strong>Details:</strong> ${data.details}</p>` : ''}
          </div>
          <p>Time: ${new Date().toISOString()}</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JustQuick Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
