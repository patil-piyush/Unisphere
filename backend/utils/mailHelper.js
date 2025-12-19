const transporter = require('../config/mail.js');

const sendRegistrationEmail = (user, event) => {
    transporter.sendMail({
        from: `"UniSphere Events" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Registration Confirmed: ${event.title}`,  
        html: `
            <h2>Hi ${user.name},</h2>
            <p>You have successfully registered for the event: <strong>${event.title}</strong></p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.start_time} - ${event.end_time}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p>We look forward to your participation!</p>
            <br/>
            <p>Best Regards,<br/>UniSphere Team</p>
        `,
    })
}

const sendWaitingEmail = (user, event) => {
    transporter.sendMail({
        from: `"UniSphere Events" <${process.env.MAIL_USER}>`,
        to: user.email,
        subject: `Waiting List for ${event.title}`,
        html: `
        <h2>Hey ${user.name},</h2>
        <p>The event <b>${event.title}</b> is currently full.</p>
        <p>You have been placed on the <b>waiting list</b>.</p>
        <p>If seats open up, you will be registered automatically.</p>
        <p>Organized by <b>${event.club_id.name}</b></p>
        <hr/><small>Powered by UniSphere</small>
        `,
  });
};

const sendPromotionEmail = (user, event) => {
  transporter.sendMail({
    from: `"UniSphere Events" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: `You are now registered for ${event.title}! 🎉`,
    html: `
      <h2>Good news, ${user.name}!</h2>
      <p>You have been moved from the waiting list to <b>confirmed registration</b> for <b>${event.title}</b>.</p>
      <p><b>Venue:</b> ${event.venue}<br/>
      <b>Date:</b> ${new Date(event.start_time).toLocaleString()}</p>
      <p>Organized by <b>${event.club_id.name}</b></p>
      <hr/><small>Powered by UniSphere</small>
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