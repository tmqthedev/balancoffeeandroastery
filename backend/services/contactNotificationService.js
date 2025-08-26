// backend/services/contactNotificationService.js
const emailService = require('./emailService');
const process = require('process');

/**
 * Send contact form notification to department managers
 * @param {Object} contact - Contact document (Mongoose)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function notifyManagers(contact) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  if (!adminEmails.length) {
    console.warn('No ADMIN_EMAILS configured in .env');
    return { success: false, error: 'No admin emails configured' };
  }

  const subject = `[Liên hệ mới] ${contact.subject} - ${contact.name}`;
  const html = `
    <h2>Thông báo liên hệ mới từ website</h2>
    <p><strong>Họ tên:</strong> ${contact.name}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Số điện thoại:</strong> ${contact.phone || '(không có)'}</p>
    <p><strong>Chủ đề:</strong> ${contact.subject}</p>
    <p><strong>Nội dung:</strong></p>
    <div style="background:#f8f8f8;padding:10px;border-radius:5px;">${contact.message}</div>
    <hr />
    <p><strong>Thời gian gửi:</strong> ${contact.createdAt?.toLocaleString?.() || new Date().toLocaleString()}</p>
    <p><strong>IP:</strong> ${contact.ipAddress || ''}</p>
    <p><strong>User Agent:</strong> ${contact.userAgent || ''}</p>
    <p><strong>Referrer:</strong> ${contact.referrer || ''}</p>
  `;

  return emailService.sendEmail(adminEmails, subject, html);
}

module.exports = { notifyManagers };
