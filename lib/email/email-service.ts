/**
 * Email Service - Simple & Reliable
 * 
 * Uses Resend API directly via HTTP (no SDK complications)
 * Falls back to nodemailer for SMTP if needed
 * 
 * Configuration: .env.local
 */

import { logger } from "@/lib/logger"
import nodemailer from "nodemailer"

interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

class EmailService {
  private provider: string
  private fromEmail: string
  private smtpTransporter?: nodemailer.Transporter

  constructor() {
    this.provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase()
    this.fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || "onboarding@resend.dev"

    try {
      if (this.provider === "smtp") {
        this.initSMTP()
      }
      logger.log(`✅ Email: ${this.provider} provider ready`)
    } catch (error) {
      logger.error(`❌ Email: Setup error`, error instanceof Error ? error.message : String(error))
    }
  }

  private initSMTP() {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const user = process.env.SMTP_USER
    const password = process.env.SMTP_PASSWORD

    if (!host || !user || !password) {
      throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASSWORD required")
    }

    this.smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass: password },
      connectionTimeout: 5000,
      socketTimeout: 5000
    })
  }

  async send(options: {
    to: string
    subject: string
    html: string
    text?: string
    from?: string
  }): Promise<EmailResult> {
    const from = options.from || this.fromEmail

    try {
      if (this.provider === "resend") {
        return await this.sendViaResend(from, options)
      } else if (this.provider === "smtp") {
        return await this.sendViaSMTP(from, options)
      } else {
        throw new Error(`Unknown provider: ${this.provider}`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error(`❌ Email: Send failed`, msg)
      return { success: false, error: msg }
    }
  }

  private async sendViaResend(from: string, options: any): Promise<EmailResult> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return { success: false, error: "RESEND_API_KEY not configured" }
    }

    try {
      // Use fetch to call Resend API directly (avoids SDK import issues)
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, "")
        })
      })

      const data = (await response.json()) as any

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`
        }
      }

      logger.log(`✅ Email: Sent via Resend to ${options.to}`)
      return {
        success: true,
        messageId: data.id
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error(`❌ Email: Resend error`, msg)
      return { success: false, error: msg }
    }
  }

  private async sendViaSMTP(from: string, options: any): Promise<EmailResult> {
    if (!this.smtpTransporter) {
      return { success: false, error: "SMTP not configured" }
    }

    try {
      const info = await this.smtpTransporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, "")
      })

      logger.log(`✅ Email: Sent via SMTP to ${options.to}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error(`❌ Email: SMTP error`, msg)
      return { success: false, error: msg }
    }
  }

  async sendOTP(email: string, otp: string, type: "login" | "signup" = "login"): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">JustQuick</h1>
          <p style="color: #ecfdf5; margin: 8px 0 0 0;">Your ${type === "signup" ? "Registration" : "Login"} Code</p>
        </div>
        
        <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 24px 0;">
            ${type === "signup" ? "Welcome! Use this code to complete registration:" : "Use this code to log in:"}
          </p>
          
          <div style="background: #f3f4f6; border: 2px solid #10b981; border-radius: 8px; padding: 30px; text-align: center; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 12px 0;">Enter this code</p>
            <div style="font-size: 48px; font-weight: bold; color: #059669; letter-spacing: 4px; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">Valid for 10 minutes</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0;">
            Never share this code with anyone.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
          JustQuick © ${new Date().getFullYear()}
        </div>
      </div>
    `

    return this.send({
      to: email,
      subject: `Your JustQuick ${type === "signup" ? "Registration" : "Login"} Code`,
      html,
      text: `Your JustQuick ${type === "signup" ? "registration" : "login"} code: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code.`
    })
  }

  async sendVerificationEmail(email: string, verificationUrl: string): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: "Verify Your JustQuick Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 40px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">JustQuick</h1>
          </div>
          <div style="padding: 40px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0;">Verify Your Email</h2>
            <p style="color: #6b7280;">Click the button below to verify your email:</p>
            <a href="${verificationUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0;">
              Verify Email
            </a>
          </div>
        </div>
      `
    })
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: "Reset Your JustQuick Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 40px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">JustQuick</h1>
          </div>
          <div style="padding: 40px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0;">Reset Your Password</h2>
            <p style="color: #6b7280;">Click below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0;">
              Reset Password
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0;">This link expires in 24 hours.</p>
          </div>
        </div>
      `
    })
  }
}

let instance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!instance) {
    instance = new EmailService()
  }
  return instance
}

export { EmailService }
