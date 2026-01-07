const mailjet = require("../config/mail.js");

const sendMailjetEmail = async ({ to, subject, html }) => {
  return mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAIL_FROM_EMAIL,
          Name: "UniSphere Events",
        },
        To: [
          {
            Email: to,
          },
        ],
        Subject: subject,
        HTMLPart: html,
      },
    ],
  });
};

const sendRegistrationEmail = async (user, event) => {
  const formattedDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  await sendMailjetEmail({
    to: user.email,
    subject: `You're in — ${event.title}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes lineExpand {
            from { width: 0; }
            to { width: 48px; }
        }
        
        @keyframes subtlePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
    
    <div style="max-width:520px;margin:0 auto;padding:48px 24px;">
        
        <!-- Minimal Header -->
        <div style="margin-bottom:48px;animation:slideIn 0.5s ease-out;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
                <div style="width:10px;height:10px;background:#22c55e;border-radius:50%;"></div>
                <span style="color:#a1a1aa;font-size:13px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">Confirmed</span>
            </div>
            
            <h1 style="color:#fafafa;font-size:32px;font-weight:600;margin:0 0 12px;line-height:1.2;letter-spacing:-0.5px;">
                You're registered.
            </h1>
            
            <p style="color:#71717a;font-size:15px;margin:0;line-height:1.6;">
                ${user.name}, your spot is secured.
            </p>
        </div>

        <!-- Event Card -->
        <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;margin-bottom:32px;animation:slideIn 0.5s ease-out 0.1s both;">
            
            <p style="color:#71717a;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 16px;">
                Event
            </p>
            
            <h2 style="color:#fafafa;font-size:20px;font-weight:600;margin:0 0 24px;line-height:1.4;">
                ${event.title}
            </h2>
            
            <!-- Divider -->
            <div style="height:1px;background:#27272a;margin:0 0 24px;"></div>
            
            <!-- Details -->
            <div style="display:grid;gap:20px;">
                
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#52525b;font-size:14px;">Date</span>
                    <span style="color:#e4e4e7;font-size:14px;font-weight:500;">${formattedDate}</span>
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#52525b;font-size:14px;">Time</span>
                    <span style="color:#e4e4e7;font-size:14px;font-weight:500;">${event.start_time} → ${event.end_time}</span>
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#52525b;font-size:14px;">Location</span>
                    <span style="color:#e4e4e7;font-size:14px;font-weight:500;">${event.venue}</span>
                </div>
                
            </div>
        </div>

        <!-- Action Button -->
        <div style="animation:slideIn 0.5s ease-out 0.2s both;">
            <a href="#" style="display:block;background:#fafafa;color:#09090b;text-decoration:none;padding:16px 24px;border-radius:12px;font-size:14px;font-weight:600;text-align:center;transition:all 0.2s;">
                Add to Calendar
            </a>
        </div>

        <!-- Secondary Action -->
        <div style="text-align:center;margin-top:16px;animation:slideIn 0.5s ease-out 0.25s both;">
            <a href="#" style="color:#71717a;font-size:13px;text-decoration:none;border-bottom:1px solid #3f3f46;padding-bottom:2px;">
                View event details
            </a>
        </div>

        <!-- Footer -->
        <div style="margin-top:64px;padding-top:32px;border-top:1px solid #18181b;animation:slideIn 0.5s ease-out 0.3s both;">
            
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
                <div style="width:24px;height:24px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:6px;"></div>
                <span style="color:#fafafa;font-size:14px;font-weight:600;">UniSphere</span>
            </div>
            
            <p style="color:#52525b;font-size:12px;line-height:1.7;margin:0 0 20px;">
                Questions? Reply to this email or reach out at
                <a href="mailto:support@unisphere.com" style="color:#71717a;text-decoration:none;border-bottom:1px solid #3f3f46;">support@unisphere.com</a>
            </p>
            
            <div style="display:flex;gap:16px;">
                <a href="#" style="color:#52525b;font-size:12px;text-decoration:none;">Twitter</a>
                <a href="#" style="color:#52525b;font-size:12px;text-decoration:none;">Instagram</a>
                <a href="#" style="color:#52525b;font-size:12px;text-decoration:none;">LinkedIn</a>
            </div>
            
            <p style="color:#3f3f46;font-size:11px;margin:24px 0 0;">
                © ${new Date().getFullYear()} UniSphere
            </p>
            
        </div>

    </div>
    
</body>
</html>
    `,
  });
};

const sendWaitingEmail = async (user, event) => {
  await sendMailjetEmail({
    to: user.email,
    subject: `⏳ Waiting List Confirmation: ${event.title}`,
    html: `
        <div style="background-color:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#f59e0b,#fbbf24);padding:25px;text-align:center;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;">UniSphere Events</h1>
                    <p style="margin:6px 0 0;font-size:14px;opacity:0.95;">
                        Waiting List Update ⏳
                    </p>
                </div>

                <!-- Body -->
                <div style="padding:30px;color:#333333;">
                    <h2 style="margin-top:0;font-size:20px;color:#111827;">
                        Hi ${user.name},
                    </h2>

                    <p style="font-size:15px;line-height:1.6;">
                        Thank you for your interest in the event below:
                    </p>

                    <div style="background:#fff7ed;border-radius:10px;padding:18px;margin:20px 0;">
                        <h3 style="margin:0 0 12px;color:#f59e0b;">
                            ${event.title}
                        </h3>
                        <p style="margin:6px 0;font-size:14px;">
                            👥 <strong>Status:</strong> Currently Full
                        </p>
                        <p style="margin:6px 0;font-size:14px;">
                            🏷️ <strong>Organized by:</strong> ${event.club_id.name}
                        </p>
                    </div>

                    <p style="font-size:15px;line-height:1.6;">
                        You have been successfully placed on the <strong>waiting list</strong>.
                        If a seat becomes available, you will be <strong>automatically registered</strong>
                        and notified by email.
                    </p>

                    <p style="margin-top:25px;font-size:14px;color:#555;">
                        We appreciate your patience and hope to see you at the event!
                    </p>

                    <p style="margin-top:30px;font-size:14px;">
                        Best regards,<br/>
                        <strong>UniSphere Team</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280;">
                    © ${new Date().getFullYear()} UniSphere · All rights reserved
                </div>

            </div>
        </div>
        `,
  });
};

const sendPromotionEmail = async (user, event) => {
  await sendMailjetEmail({
    to: user.email,
    subject: `🎉 You're In! Registration Confirmed for ${event.title}`,
    html: `
    <div style="background-color:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:25px;text-align:center;color:#ffffff;">
          <h1 style="margin:0;font-size:24px;">🎉 You're Officially In!</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.95;">
            Registration Confirmed
          </p>
        </div>

        <!-- Body -->
        <div style="padding:30px;color:#333333;">
          <h2 style="margin-top:0;font-size:20px;color:#111827;">
            Hi ${user.name},
          </h2>

          <p style="font-size:15px;line-height:1.6;">
            Great news! You've been moved from the <strong>waiting list</strong> to
            <strong>confirmed registration</strong> for the event below:
          </p>

          <div style="background:#ecfdf5;border-radius:10px;padding:18px;margin:20px 0;">
            <h3 style="margin:0 0 12px;color:#16a34a;">
              ${event.title}
            </h3>
            <p style="margin:6px 0;font-size:14px;">
              📅 <strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()}
            </p>
            <p style="margin:6px 0;font-size:14px;">
              ⏰ <strong>Time:</strong> ${event.start_time} – ${event.end_time}
            </p>
            <p style="margin:6px 0;font-size:14px;">
              📍 <strong>Venue:</strong> ${event.venue}
            </p>
            <p style="margin:6px 0;font-size:14px;">
              🏷️ <strong>Organized by:</strong> ${event.club_id.name}
            </p>
          </div>

          <p style="font-size:15px;line-height:1.6;">
            We’re excited to have you with us. Get ready for an engaging and memorable experience!
          </p>

          <p style="margin-top:30px;font-size:14px;">
            See you there,<br/>
            <strong>UniSphere Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280;">
          © ${new Date().getFullYear()} UniSphere · All rights reserved
        </div>

      </div>
    </div>
    `,
  });
};

const sendMail = async (to, subject, text) => {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM_EMAIL,
            Name: "UniSphere",
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
        },
      ],
    });

    console.log(`📧 Mail sent to ${to}`);
  } catch (error) {
    console.error("❌ Mail sending failed:", error.message);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendWaitingEmail,
  sendPromotionEmail,
  sendMail,
};
