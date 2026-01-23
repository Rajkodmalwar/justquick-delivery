/**
 * Email Service - Unified interface for multiple email providers
 * 
 * Supports:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - Generic SMTP (Gmail, Mailgun, AWS SES, etc.)
 * 
 * Configuration: See .env.local
 */

import nodemailer from "nodemailer"
import { logger } from "@/lib/logger"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

class EmailService {
  private provider: string
  private resend?: any
  private transporter?: nodemailer.Transporter
  private fromEmail: string

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || "resend"
    this.fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.SENDGRID_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      "noreply@justquick.delivery"

    this.initProvider()
  }

  private initProvider() {
    try {
      switch (this.provider) {
        case "resend":
          this.initResend()
          break
        case "sendgrid":
          this.initSendGrid()
          break
        case "smtp":
          this.initSMTP()
          break
        default:
          logger.warn(`Unknown email provider: ${this.provider}, defaulting to resend`)
          this.initResend()
      }
    } catch (error) {
      logger.error("Failed to initialize email provider:", error)
    }
  }

  private initResend() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY not set in environment variables"
      )
    }

    // Dynamically import resend only when needed
    try {
      const ResendModule = require("resend")
      this.resend = new ResendModule.Resend(apiKey)
      logger.log("📧 Email: Initialized Resend provider")
    } catch (error) {
      logger.error("Failed to import resend:", error)
      throw error
    }
  }

  private initSendGrid() {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      throw new Error(
        "SENDGRID_API_KEY not set in environment variables"
      )
    }

    // SendGrid initialization
    try {
      const sgMail = require("@sendgrid/mail")
      sgMail.setApiKey(apiKey)
      this.resend = sgMail
      logger.log("📧 Email: Initialized SendGrid provider")
    } catch (error) {
      logger.error("Failed to import sendgrid:", error)
      throw error
    }
  }

  private initSMTP() {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || "587")
    const user = process.env.SMTP_USER
    const password = process.env.SMTP_PASSWORD
    const secure = process.env.SMTP_SECURE === "true"

    if (!host || !user || !password) {
      throw new Error(
        "SMTP configuration incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD"
      )
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password
      }
    })

    logger.log(`📧 Email: Initialized SMTP provider (${host}:${port})`)
  }

  async send(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const { to, subject, html, text, from } = options
      const fromEmail = from || this.fromEmail

      logger.log(`📧 Email: Sending to ${to} via ${this.provider}`)

      switch (this.provider) {
        case "resend":
          return await this.sendViaResend(to, subject, html, text, fromEmail)

        case "sendgrid":
          return await this.sendViaSendGrid(to, subject, html, text, fromEmail)

        case "smtp":
          return await this.sendViaSMTP(to, subject, html, text, fromEmail)

        default:
          throw new Error(`Unknown provider: ${this.provider}`)
      }
    } catch (error) {
      logger.error("❌ Email: Failed to send", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  private async sendViaResend(
    to: string,
    subject: string,
    html: string,
    text: string | undefined,
    from: string
  ) {
    if (!this.resend) throw new Error("Resend not initialized")

    const response = await this.resend.emails.send({
      from,
      to,
      subject,
      html,
      text
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    logger.log(`✅ Email: Sent via Resend, message ID: ${response.data.id}`)
    return {
      success: true,
      messageId: response.data.id
    }
  }

  private async sendViaSendGrid(
    to: string,
    subject: string,
    html: string,
    text: string | undefined,
    from: string
  ) {
    if (!this.resend) throw new Error("SendGrid not initialized")

    const response = await this.resend.send({
      to,
      from,
      subject,
      html,
      text
    })

    // SendGrid returns array with response object
    const result = Array.isArray(response) ? response[0] : response
    if (result.statusCode && result.statusCode >= 400) {
      throw new Error(`SendGrid error: ${result.statusCode}`)
    }

    logger.log(`✅ Email: Sent via SendGrid`)
    return {
      success: true,
      messageId: result.headers?.["x-message-id"] || "unknown"
    }
  }

  private async sendViaSMTP(
    to: string,
    subject: string,
    html: string,
    text: string | undefined,
    from: string
  ) {
    if (!this.transporter) throw new Error("SMTP not initialized")

    const info = await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, "")
    })

    logger.log(`✅ Email: Sent via SMTP, message ID: ${info.messageId}`)
    return {
      success: true,
      messageId: info.messageId
    }
  }

  /**
   * Send OTP email for authentication
   */
  async sendOTP(email: string, otp: string, type: "login" | "signup" = "login") {
    const subject = type === "signup" ? "Verify your JustQuick account" : "Your JustQuick login code"

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .content { background: #f9fafb; border-radius: 8px; padding: 30px; text-align: center; }
    .otp-code { 
      font-size: 32px; 
      font-weight: bold; 
      color: #10b981; 
      letter-spacing: 4px;
      margin: 20px 0;
      font-family: 'Courier New', monospace;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      font-size: 12px; 
      color: #6b7280; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">JustQuick 🚀</div>
      <p style="color: #6b7280;">Delivery App</p>
    </div>
    
    <div class="content">
      <h2>Your Login Code</h2>
      <p>Enter this code to ${type === "signup" ? "verify your account" : "log in to JustQuick"}:</p>
      <div class="otp-code">${otp}</div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes</p>
    </div>
    
    <div class="footer">
      <p>Don't share this code with anyone. JustQuick team will never ask for your code.</p>
      <p>&copy; 2026 JustQuick Delivery. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.send({
      to: email,
      subject,
      html,
      text: `Your JustQuick login code: ${otp}`
    })
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, verificationUrl: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .content { background: #f9fafb; border-radius: 8px; padding: 30px; text-align: center; }
    .button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      margin: 20px 0;
      font-weight: 500;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      font-size: 12px; 
      color: #6b7280; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">JustQuick 🚀</div>
      <p style="color: #6b7280;">Delivery App</p>
    </div>
    
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Click the button below to verify your email address and complete your signup:</p>
      <a href="${verificationUrl}" class="button">Verify Email</a>
      <p style="color: #6b7280; font-size: 14px;">Link expires in 24 hours</p>
      <p style="color: #6b7280; font-size: 12px;">Or paste this link: <br>${verificationUrl}</p>
    </div>
    
    <div class="footer">
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>&copy; 2026 JustQuick Delivery. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.send({
      to: email,
      subject: "Verify your JustQuick email",
      html,
      text: `Click here to verify your email: ${verificationUrl}`
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .content { background: #f9fafb; border-radius: 8px; padding: 30px; text-align: center; }
    .button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      margin: 20px 0;
      font-weight: 500;
    }
    .warning { color: #dc2626; font-size: 12px; margin-top: 20px; }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      font-size: 12px; 
      color: #6b7280; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">JustQuick 🚀</div>
      <p style="color: #6b7280;">Delivery App</p>
    </div>
    
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px;">Link expires in 1 hour</p>
      <p class="warning">⚠️ If you didn't request this, your account may be at risk. Please change your password immediately.</p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 JustQuick Delivery. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.send({
      to: email,
      subject: "Reset your JustQuick password",
      html,
      text: `Click here to reset your password: ${resetUrl}`
    })
  }
}

// Singleton instance
let emailService: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService()
  }
  return emailService
}

export default EmailService
