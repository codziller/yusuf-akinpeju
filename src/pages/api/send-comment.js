export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, comment, articleTitle } = req.body;

  // Validate input
  if (!name || !email || !comment || !articleTitle) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Option 1: Using a service like SendGrid, Mailgun, or Resend
    // This is a placeholder - you'll need to configure your email service

    const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'akinpejuyusuf@gmail.com';

    // For now, we'll use a simple fetch to a third-party email API
    // You can replace this with your preferred email service

    // Example using Resend (recommended - simple and free tier available)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email will not be sent.');
      // For development, we'll just log the comment
      console.log('Comment received:', {
        name,
        email,
        comment,
        articleTitle
      });
      return res.status(200).json({
        message: 'Comment received (development mode - email service not configured)'
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'comments@yourdomain.com', // Update with your verified domain
        to: RECIPIENT_EMAIL,
        subject: `New comment on: ${articleTitle}`,
        html: `
          <h2>New Comment on Your Blog</h2>
          <p><strong>Article:</strong> ${articleTitle}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <h3>Comment:</h3>
          <p>${comment.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            You can reply directly to ${email}
          </p>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email service error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ message: 'Comment sent successfully' });

  } catch (error) {
    console.error('Error sending comment:', error);
    return res.status(500).json({ error: 'An error occurred while sending your comment' });
  }
}
