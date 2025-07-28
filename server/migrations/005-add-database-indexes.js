function runMigration(db) {
  return new Promise((resolve, reject) => {
    const indexes = [
      // Users table indexes
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified)',
      
      // Contact submissions indexes
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id)',
      
      // Password resets indexes
      'CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)',
      'CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at)',
      
      // Email verifications indexes
      'CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email)',
      'CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at)',
      
      // Projects indexes
      'CREATE INDEX IF NOT EXISTS idx_projects_section_id ON projects(section_id)',
      'CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order)',
      
      // Project sections indexes
      'CREATE INDEX IF NOT EXISTS idx_project_sections_is_active ON project_sections(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_project_sections_display_order ON project_sections(display_order)'
    ];

    let completed = 0;
    const total = indexes.length;

    indexes.forEach((indexQuery, i) => {
      db.run(indexQuery, (err) => {
        if (err) {
          console.error(`Error creating index ${i + 1}:`, err);
          reject(err);
        } else {
          completed++;
          console.log(`✓ Created index ${i + 1}/${total}`);
          if (completed === total) {
            console.log('✓ All database indexes created successfully');
            resolve();
          }
        }
      });
    });
  });
}

module.exports = { runMigration };