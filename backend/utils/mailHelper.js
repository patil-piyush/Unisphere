const transporter = require('../config/mail.js');

const sendRegistrationEmail = (user, event) => {
    transporter.sendMail({
        from: `"UniSphere Events" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🎉 Registration Confirmed: ${event.title}`,
        html: `
        <div style="background-color:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:25px;text-align:center;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;">UniSphere Events</h1>
                    <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">
                        Registration Successful 🎉
                    </p>
                </div>

                <!-- Body -->
                <div style="padding:30px;color:#333333;">
                    <h2 style="margin-top:0;font-size:20px;color:#111827;">
                        Hi ${user.name},
                    </h2>

                    <p style="font-size:15px;line-height:1.6;">
                        We're excited to confirm your registration for the event:
                    </p>

                    <div style="background:#f9fafb;border-radius:10px;padding:18px;margin:20px 0;">
                        <h3 style="margin:0 0 12px;color:#4f46e5;">
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
                    </div>

                    <p style="font-size:15px;line-height:1.6;">
                        We look forward to your participation and hope you have an amazing experience.
                    </p>

                    <p style="margin-top:25px;font-size:14px;color:#555;">
                        If you have any questions, feel free to reach out to us.
                    </p>

                    <p style="margin-top:30px;font-size:14px;">
                        Warm regards,<br/>
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


const sendWaitingEmail = (user, event) => {
    transporter.sendMail({
        from: `"UniSphere Events" <${process.env.MAIL_USER}>`,
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


const sendPromotionEmail = (user, event) => {
  transporter.sendMail({
    from: `"UniSphere Events" <${process.env.MAIL_USER}>`,
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
    await transporter.sendMail({
      from: `"UniSphere" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text
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
  sendMail
};