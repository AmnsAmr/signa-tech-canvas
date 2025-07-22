const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE } = require('../config/constants');
const database = require('../config/database');

const db = database.getDb();

class EmailService {
  constructor() {
    // Check if email credentials are available
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn('Email credentials not found. Email notifications will not work.');
    } else {
      console.log('Initializing email service with:', EMAIL_USER);
    }
    
    // Create a more reliable transporter configuration
    this.transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      host: EMAIL_SERVICE === 'gmail' ? 'smtp.gmail.com' : undefined,
      port: EMAIL_SERVICE === 'gmail' ? 587 : undefined,
      secure: EMAIL_SERVICE === 'gmail' ? false : undefined,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development'
    });
    
    console.log('Email transport configuration:', {
      service: EMAIL_SERVICE,
      host: EMAIL_SERVICE === 'gmail' ? 'smtp.gmail.com' : undefined,
      port: EMAIL_SERVICE === 'gmail' ? 587 : undefined,
      secure: EMAIL_SERVICE === 'gmail' ? false : undefined,
      hasAuth: !!EMAIL_USER && !!EMAIL_PASS
    });
    
    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service error:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
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

  async toggleAdminNotifications(adminId, enabled) {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET email_notifications = ? WHERE id = ? AND role = 'admin'", 
        [enabled ? 1 : 0, adminId], 
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  async getAdminNotificationStatus(adminId) {
    return new Promise((resolve, reject) => {
      db.get("SELECT email_notifications FROM users WHERE id = ? AND role = 'admin'", 
        [adminId], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? (row.email_notifications === 1) : true);
        }
      );
    });
  }

  async sendContactNotification({ name, company, email, phone, project, message, services, isGuest, hasFile, fileName, vectorAnalysis }) {
    console.log('Attempting to send contact notification email');
    
    if (!EMAIL_USER || !EMAIL_PASS || !this.transporter) {
      console.warn('Email service not configured, skipping notification');
      return;
    }
    
    console.log('Email credentials available, proceeding with notification');
    
    // Parse services if it's a string
    let parsedServices = [];
    try {
      if (typeof services === 'string') {
        parsedServices = JSON.parse(services);
      } else if (Array.isArray(services)) {
        parsedServices = services;
      }
    } catch (e) {
      console.error('Error parsing services in email:', e);
      parsedServices = [];
    }
    
    const servicesHtml = parsedServices && parsedServices.length > 0 
      ? `
        <h3>Services demandés (${parsedServices.length} service${parsedServices.length > 1 ? 's' : ''}):</h3>
        ${parsedServices.map((service, index) => {
          // Ensure service is an object
          if (!service || typeof service !== 'object') {
            return `<div>Service ${index + 1}: Information non disponible</div>`;
          }
          
          return `
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
            <h4 style="color: #333; margin-bottom: 8px;">Service ${index + 1}: ${service.serviceType || 'Non spécifié'}</h4>
            ${service.material ? `<p><strong>Matériau:</strong> ${service.material}</p>` : ''}
            ${service.size ? `<p><strong>Taille:</strong> ${service.size}</p>` : ''}
            ${service.quantity ? `<p><strong>Quantité:</strong> ${service.quantity}</p>` : ''}
            ${service.thickness ? `<p><strong>Épaisseur:</strong> ${service.thickness}</p>` : ''}
            ${service.colors ? `<p><strong>Couleurs:</strong> ${service.colors}</p>` : ''}
            ${service.finishing ? `<p><strong>Finition:</strong> ${service.finishing}</p>` : ''}
            ${service.cuttingApplication ? `<p><strong>Application:</strong> ${service.cuttingApplication}</p>` : ''}
          </div>
          `;
        }).join('')}
      `
      : '';

    try {
      // Get admin emails with notification preferences enabled
      console.log('Looking up admin emails for notification');
      
      // First check if there are any admins at all
      const allAdmins = await new Promise((resolve, reject) => {
        db.all("SELECT email, email_notifications FROM users WHERE role = 'admin'", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log('All admins found:', allAdmins.length, allAdmins.map(a => ({ email: a.email, notifications: a.email_notifications })));
      
      const adminEmails = await new Promise((resolve, reject) => {
        db.all("SELECT email FROM users WHERE role = 'admin' AND (email_notifications = 1 OR email_notifications IS NULL)", (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.email));
        });
      });
      
      if (adminEmails.length === 0) {
        console.warn('No admin emails with notifications enabled found');
        return;
      }
      
      console.log('Sending notification to admins:', adminEmails);

      const mailOptions = {
        from: EMAIL_USER,
        to: adminEmails.join(', '),
        subject: `Nouvelle demande de contact de ${name}${parsedServices && parsedServices.length > 0 ? ` (${parsedServices.length} service${parsedServices.length > 1 ? 's' : ''})` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Nouvelle demande de contact ${isGuest ? '(Invité)' : '(Utilisateur connecté)'}</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Nom:</strong> ${name}</p>
              <p><strong>Entreprise:</strong> ${company || 'N/A'}</p>
              <p><strong>Email:</strong> ${email || 'N/A'}</p>
              <p><strong>Téléphone:</strong> ${phone || 'N/A'}</p>
              ${project ? `<p><strong>Type de projet:</strong> ${project}</p>` : ''}
            </div>
            <div style="margin: 15px 0;">
              <h3 style="color: #333;">Message:</h3>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; border-radius: 0 5px 5px 0;">
                ${message}
              </div>
            </div>
            ${hasFile ? `
            <div style="margin: 15px 0; padding: 10px; background-color: #e8f5e9; border-radius: 5px; border: 1px solid #c8e6c9;">
              <h3 style="color: #2e7d32; margin-top: 0;">Fichier joint</h3>
              <p><strong>Nom du fichier:</strong> ${fileName || 'Fichier vectoriel'}</p>
              <p style="color: #388e3c;">Le fichier est disponible dans le panneau d'administration.</p>
              ${vectorAnalysis ? `
              <div style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
                <h4 style="color: #2e7d32; margin-top: 0;">Analyse vectorielle</h4>
                <p><strong>Surface du matériau:</strong> ${vectorAnalysis.paperArea}</p>
                <p><strong>Surface de la forme:</strong> ${vectorAnalysis.letterArea}</p>
                <p><strong>Longueur totale des chemins:</strong> ${vectorAnalysis.pathLength}</p>
                ${vectorAnalysis.shapes && vectorAnalysis.shapes.length > 0 ? `
                <p><strong>Nombre de formes:</strong> ${vectorAnalysis.shapes.length}</p>
                ` : ''}
              </div>
              ` : ''}
            </div>
            ` : ''}
            ${servicesHtml}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">Cette notification a été envoyée automatiquement depuis le site SignaTech.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();