/* ============================================================
   LUMORA SOLAR — Contact Form Mailer
   Node.js + Express + Nodemailer
   Run: node server.js  (or: npm run dev  with nodemon)
   ============================================================ */

require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static site from the same directory
app.use(express.static(path.join(__dirname)));

// ── SMTP Transporter ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ── Email HTML Template ───────────────────────────────────────
function buildEmailHTML({ name, phone, email, type, bill, message, submittedAt }) {
    const typeLabels = {
        residential:   'Residential',
        commercial:    'Commercial',
        industrial:    'Industrial',
        institutional: 'Institutional',
    };
    const typeLabel = typeLabels[type] || type || '—';

    const row = (label, value) =>
        value
            ? `<tr>
                 <td style="padding:10px 14px;font-size:13px;color:#8a96a8;
                             white-space:nowrap;width:160px;vertical-align:top;">
                   ${label}
                 </td>
                 <td style="padding:10px 14px;font-size:14px;color:#e8ecf0;
                             font-weight:600;border-left:1px solid #1e2a3a;">
                   ${value}
                 </td>
               </tr>`
            : '';

    const section = (title, rows) =>
        `<div style="margin-bottom:28px;">
           <p style="margin:0 0 10px;font-size:11px;font-weight:700;
                      letter-spacing:2px;text-transform:uppercase;color:#f7a600;">
             ${title}
           </p>
           <table width="100%" cellpadding="0" cellspacing="0"
                  style="border-collapse:collapse;background:#0f1623;
                          border-radius:8px;overflow:hidden;
                          border:1px solid #1e2a3a;">
             <tbody>${rows}</tbody>
           </table>
         </div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Lead — Lumora Solar</title>
</head>
<body style="margin:0;padding:0;background:#0a0e17;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#0a0e17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f7a600,#ff6b00);
                        border-radius:12px 12px 0 0;padding:32px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:800;
                          color:#0a0e17;letter-spacing:-0.5px;">
                ☀ Lumora Solar
              </p>
              <p style="margin:0;font-size:12px;font-weight:600;
                          letter-spacing:3px;color:rgba(10,14,23,0.7);
                          text-transform:uppercase;">
                New Website Enquiry
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#131b2e;border-radius:0 0 12px 12px;
                        padding:36px;border:1px solid #1e2a3a;border-top:none;">

              <p style="margin:0 0 28px;font-size:15px;color:#a0aec0;line-height:1.6;">
                A new consultation request has been submitted via the Lumora Solar website.
                The lead details are below.
              </p>

              ${section('Contact Details',
                  row('Full Name',   name)  +
                  row('Phone',       phone) +
                  row('Email',       email)
              )}

              ${section('Installation Details',
                  row('Type',         typeLabel)              +
                  row('Monthly Bill', bill ? '₹ ' + bill : '')
              )}

              ${message ? section('Message',
                  `<tr>
                     <td style="padding:14px;font-size:14px;color:#e8ecf0;
                                 line-height:1.7;white-space:pre-wrap;">
                       ${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}
                     </td>
                   </tr>`
              ) : ''}

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1e2a3a;margin:28px 0;">

              <!-- Meta -->
              <p style="margin:0;font-size:11px;color:#4a5568;text-align:center;">
                Submitted on ${submittedAt} · Lumora Solar Private Limited
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Plain-text fallback ───────────────────────────────────────
function buildEmailText({ name, phone, email, type, bill, message, submittedAt }) {
    const typeLabels = {
        residential: 'Residential', commercial: 'Commercial',
        industrial: 'Industrial', institutional: 'Institutional',
    };
    return [
        '╔══════════════════════════════════════╗',
        '  LUMORA SOLAR — NEW WEBSITE ENQUIRY   ',
        '╚══════════════════════════════════════╝',
        '',
        '── CONTACT DETAILS ──────────────────────',
        `  Full Name   : ${name}`,
        `  Phone       : ${phone}`,
        `  Email       : ${email}`,
        '',
        '── INSTALLATION DETAILS ─────────────────',
        `  Type        : ${typeLabels[type] || type || '—'}`,
        `  Monthly Bill: ${bill ? '₹ ' + bill : '—'}`,
        '',
        ...(message ? [
            '── MESSAGE ──────────────────────────────',
            `  ${message}`,
            '',
        ] : []),
        '─────────────────────────────────────────',
        `  Submitted : ${submittedAt}`,
        '  Lumora Solar Private Limited',
    ].join('\n');
}

// ── POST /api/contact ─────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { name, phone, email, type, bill, message } = req.body;

    // Basic validation
    if (!name || !phone || !email || !type) {
        return res.status(400).json({
            success: false,
            error: 'Please fill in all required fields.',
        });
    }

    const submittedAt = new Date().toLocaleString('en-IN', {
        timeZone:    'Asia/Kolkata',
        dateStyle:   'long',
        timeStyle:   'short',
    });

    const payload = { name, phone, email, type, bill, message, submittedAt };

    try {
        await transporter.sendMail({
            from:    `"${process.env.SENDER_NAME || 'Lumora Solar Website'}" <${process.env.SMTP_USER}>`,
            to:      process.env.RECIPIENT_EMAIL || 'deepaksingh@lumorasolar.org',
            replyTo: email,
            subject: `☀ New Solar Enquiry — ${name} (${type || 'Website'})`,
            text:    buildEmailText(payload),
            html:    buildEmailHTML(payload),
        });

        console.log(`[${submittedAt}] Lead from ${name} <${email}> sent successfully.`);
        return res.json({ success: true });

    } catch (err) {
        console.error('Mailer error:', err);
        return res.status(500).json({
            success: false,
            error: 'Could not send email. Please try again or call us directly.',
        });
    }
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  ☀  Lumora Solar server running at http://localhost:${PORT}`);
    console.log(`     SMTP: ${process.env.SMTP_HOST || '(not configured — copy .env.example to .env)'}\n`);
});
