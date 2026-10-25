import nodemailer from 'nodemailer';
import { config } from '../config';

interface SendPasswordResetParams {
  to: string;
  name: string;
  resetUrl: string;
  token: string;
}

// Create reusable transporter
function getTransporter() {
  if (!config.email.isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure, // true for 465, false for other ports (587)
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  token,
}: SendPasswordResetParams): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('\n⚠️  [EMAIL SERVICE] SMTP belum dikonfigurasi di backend/.env.');
    console.warn(`📩 Target email: ${to}`);
    console.warn(`🔗 Reset link (dev fallback): ${resetUrl}`);
    console.warn(`🔑 Token: ${token}\n`);
    return false;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - CLOSETTE</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f6f2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1c1c1a;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f7f6f2;
      padding: 40px 0;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e7e5dc;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
    .header {
      background-color: #1b2e2b;
      padding: 32px 40px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 4px;
      text-decoration: none;
      text-transform: uppercase;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .content {
      padding: 40px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1c1c1a;
      margin-top: 0;
      margin-bottom: 16px;
      font-family: 'Playfair Display', Georgia, serif;
    }
    p {
      color: #55534e;
      font-size: 15px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #c07848;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }
    .token-box {
      background-color: #f7f6f2;
      border: 1px dashed #d6d3c7;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 24px 0;
      word-break: break-all;
    }
    .token-code {
      font-family: Courier, monospace;
      font-size: 14px;
      font-weight: 700;
      color: #1c1c1a;
    }
    .footer {
      background-color: #fcfbf9;
      border-top: 1px solid #e7e5dc;
      padding: 24px 40px;
      text-align: center;
      font-size: 13px;
      color: #8c887b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <div class="logo">OOTD-Nan</div>
        <div style="font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.7); text-transform: uppercase; margin-top: 4px;">STUDIO CURATED</div>
      </div>
      <div class="content">
        <h1>Permintaan Reset Password</h1>
        <p>Halo <strong>${name || 'Pengguna OOTD-Nan'}</strong>,</p>
        <p>Kami menerima permintaan untuk mereset password akun OOTD-Nan Anda yang terhubung dengan email <strong>${to}</strong>.</p>
        <p>Silakan klik tombol di bawah ini untuk membuat password baru:</p>
        
        <div class="button-container">
          <a href="${resetUrl}" target="_blank" class="button">Reset Password Saya</a>
        </div>

        <p style="font-size: 13px; color: #8c887b;">
          Tombol tidak berfungsi? Salin link berikut ke browser Anda:<br>
          <a href="${resetUrl}" style="color: #c07848;">${resetUrl}</a>
        </p>

        <div class="token-box">
          <p style="font-size: 12px; margin-bottom: 6px; color: #8c887b; text-transform: uppercase; letter-spacing: 1px;">Atau masukkan token reset ini langsung:</p>
          <div class="token-code">${token}</div>
        </div>

        <p style="font-size: 13px; color: #8c887b; margin-top: 24px;">
          ⏱️ Link ini hanya berlaku selama <strong>1 jam</strong>.<br>
          Jika Anda tidak merasa meminta reset password, Anda dapat mengabaikan email ini dengan aman.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} OOTD-Nan Studio Curated. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject: 'Reset Password Akun OOTD-Nan Anda',
      text: `Halo ${name},\n\nPermintaan reset password akun OOTD-Nan Anda telah diterima.\nBuka link berikut untuk mereset password:\n${resetUrl}\n\nToken: ${token}\n\nLink ini berlaku selama 1 jam. Jika Anda tidak memintanya, abaikan email ini.`,
      html: htmlContent,
    });

    console.log(`✅ [EMAIL SERVICE] Email reset password berhasil dikirim ke ${to} (MessageId: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ [EMAIL SERVICE] Gagal mengirim email reset password ke ${to}:`, err);
    // Keep fallback in dev mode console
    console.warn(`🔗 Reset link fallback: ${resetUrl}`);
    return false;
  }
}
