import nodemailer from 'nodemailer';

// Configure nodemailer from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendPasswordResetEmail(clientEmail: string, clientName: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@portfolio.local',
      to: clientEmail,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${clientName},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  },

  async sendMessageNotificationEmail(recipientEmail: string, recipientName: string, senderName: string, projectTitle: string, messagePreview: string, projectId: string): Promise<void> {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@portfolio.local',
      to: recipientEmail,
      subject: `New message from ${senderName} - ${projectTitle}`,
      html: `
        <h2>New Message</h2>
        <p>Hi ${recipientName},</p>
        <p><strong>${senderName}</strong> sent you a message in project <strong>${projectTitle}</strong>:</p>
        <blockquote style="border-left: 4px solid #3b82f6; padding-left: 10px; margin: 10px 0; color: #666;">
          ${messagePreview}
        </blockquote>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/projects/${projectId}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Conversation</a>
      `,
    });
  },
};
