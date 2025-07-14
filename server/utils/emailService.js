const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/constants');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  async sendResetEmail(email, code) {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Code de réinitialisation de mot de passe - SignaTech',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Votre code de vérification est: <strong>${code}</strong></p>
        <p>Ce code expire dans 15 minutes.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendContactNotification({ name, company, email, phone, message, services, isGuest }) {
    const servicesHtml = services && services.length > 0 
      ? `
        <h3>Services demandés:</h3>
        ${services.map((service, index) => `
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <h4>Service ${index + 1}: ${service.serviceType || 'Non spécifié'}</h4>
            ${service.material ? `<p><strong>Matériau:</strong> ${service.material}</p>` : ''}
            ${service.size ? `<p><strong>Taille:</strong> ${service.size}</p>` : ''}
            ${service.quantity ? `<p><strong>Quantité:</strong> ${service.quantity}</p>` : ''}
            ${service.thickness ? `<p><strong>Épaisseur:</strong> ${service.thickness}</p>` : ''}
            ${service.colors ? `<p><strong>Couleurs:</strong> ${service.colors}</p>` : ''}
            ${service.finishing ? `<p><strong>Finition:</strong> ${service.finishing}</p>` : ''}
          </div>
        `).join('')}
      `
      : '';

    const mailOptions = {
      from: EMAIL_USER,
      to: 'amraniaamine@gmail.com',
      subject: `Nouvelle demande de contact de ${name}`,
      html: `
        <h2>Nouvelle demande de contact ${isGuest ? '(Invité)' : '(Utilisateur connecté)'}</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Entreprise:</strong> ${company || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Téléphone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        ${servicesHtml}
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();