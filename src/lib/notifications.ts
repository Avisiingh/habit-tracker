import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendSMS(to: string, message: string) {
  try {
    await twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendWelcomeNotifications(user: { email?: string | null; phoneNumber?: string | null; name?: string | null }) {
  const welcomeMessage = `Welcome to 100 Days Tracker, ${user.name || 'there'}! 🎉 Ready to build some great habits?`;
  
  if (user.email) {
    await sendEmail(
      user.email,
      'Welcome to 100 Days Tracker! 🎉',
      welcomeMessage,
      `<h1>Welcome to 100 Days Tracker!</h1>
       <p>${welcomeMessage}</p>
       <p>We're excited to help you build and maintain great habits.</p>`
    );
  }

  if (user.phoneNumber) {
    await sendSMS(user.phoneNumber, welcomeMessage);
  }
}

export async function sendStreakNotification(user: { email?: string | null; phoneNumber?: string | null; name?: string | null; streak: number }) {
  const streakMessage = `🔥 Amazing! You've maintained a ${user.streak} day streak. Keep it up, ${user.name || 'there'}!`;
  
  if (user.email) {
    await sendEmail(
      user.email,
      `${user.streak} Day Streak! 🔥`,
      streakMessage,
      `<h1>${user.streak} Day Streak!</h1>
       <p>${streakMessage}</p>
       <p>You're making great progress on your journey.</p>`
    );
  }

  if (user.phoneNumber) {
    await sendSMS(user.phoneNumber, streakMessage);
  }
}

export async function sendDailyReminder(user: { email?: string | null; phoneNumber?: string | null; name?: string | null }) {
  const reminderMessage = `Hey ${user.name || 'there'}! 👋 Don't forget to check in today to maintain your streak!`;
  
  if (user.email) {
    await sendEmail(
      user.email,
      'Daily Check-in Reminder ⏰',
      reminderMessage,
      `<h1>Daily Check-in Reminder</h1>
       <p>${reminderMessage}</p>
       <p>Click here to check in now: ${process.env.NEXTAUTH_URL}/dashboard</p>`
    );
  }

  if (user.phoneNumber) {
    await sendSMS(user.phoneNumber, reminderMessage);
  }
} 