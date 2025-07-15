-- Contact settings table for admin-configurable contact information
CREATE TABLE IF NOT EXISTS contact_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default contact settings
INSERT OR REPLACE INTO contact_settings (setting_key, setting_value) VALUES
('company_name', 'Signa Tech'),
('company_tagline', 'Solutions PLV & Signalétique'),
('email', 'contact@signatech.ma'),
('phone', '+212 5 39 40 31 33'),
('whatsapp', '+212623537445'),
('address_fr', 'Zone Industrielle Gzenaya, lot 376, Tanger, Morocco'),
('address_en', 'Industrial Zone Gzenaya, lot 376, Tangier, Morocco'),
('hours_fr', 'Lun-Ven: 8h-18h | Sam: 8h-13h'),
('hours_en', 'Mon-Fri: 8am-6pm | Sat: 8am-1pm'),
('hours_detailed_fr', 'Lun - Ven: 8h00 - 18h00|Samedi: 8h00 - 13h00|Dimanche: Fermé'),
('hours_detailed_en', 'Mon - Fri: 8:00 AM - 6:00 PM|Saturday: 8:00 AM - 1:00 PM|Sunday: Closed');