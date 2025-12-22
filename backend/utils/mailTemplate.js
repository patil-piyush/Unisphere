// utils/mailTemplates.js

const eventRejectedTemplate = (event, reason = null) => {
  return {
    subject: `❌ Event Submission Update: ${event.title}`,
    html: `
    <div style="background-color:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:22px;text-align:center;color:#ffffff;">
          <h1 style="margin:0;font-size:22px;">Event Submission Update</h1>
        </div>

        <!-- Body -->
        <div style="padding:30px;color:#333333;">
          <p style="font-size:15px;line-height:1.6;">
            Thank you for submitting your event proposal on <strong>UniSphere</strong>.
          </p>

          <p style="font-size:15px;line-height:1.6;">
            After careful review, we regret to inform you that the following event
            could not be approved at this time:
          </p>

          <!-- Event Card -->
          <div style="background:#fef2f2;border-radius:10px;padding:18px;margin:20px 0;">
            <h3 style="margin:0 0 10px;color:#dc2626;">
              ${event.title}
            </h3>
            <p style="margin:6px 0;font-size:14px;">
              📅 <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}
            </p>
            <p style="margin:6px 0;font-size:14px;">
              ⏰ <strong>Time:</strong> ${event.start_time} – ${event.end_time}
            </p>
            <p style="margin:6px 0;font-size:14px;">
              📍 <strong>Venue:</strong> ${event.venue}
            </p>
            <p style="margin:6px 0;font-size:14px;">
              🏷️ <strong>Organized by:</strong> ${event.club_id?.name || "—"}
            </p>
          </div>

          ${
            reason
              ? `<p style="font-size:14px;line-height:1.6;">
                   <strong>Reason for rejection:</strong> ${reason}
                 </p>`
              : ``
          }

          <p style="font-size:15px;line-height:1.6;">
            You are encouraged to review the event details and submit a revised proposal.
            Our team is always happy to support quality and well-planned events.
          </p>

          <p style="margin-top:25px;font-size:14px;">
            Regards,<br/>
            <strong>UniSphere Admin Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
          © ${new Date().getFullYear()} UniSphere · All rights reserved
        </div>

      </div>
    </div>
    `,
  };
};

module.exports = {
  eventRejectedTemplate,
};
