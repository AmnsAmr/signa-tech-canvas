const database = require('./config/database');
const db = database.getDb();

async function addSampleProjects() {
  console.log('Adding sample projects...');
  
  try {
    // Get existing sections
    const sections = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM project_sections ORDER BY display_order", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Found sections:', sections.map(s => s.name));
    
    // Sample projects for each section
    const sampleProjects = [
      // Web Projects
      {
        section_id: sections.find(s => s.name === 'Projets Web')?.id,
        title: 'Site E-commerce Moderne',
        description: 'Plateforme de vente en ligne avec design responsive et interface utilisateur intuitive.',
        display_order: 1
      },
      {
        section_id: sections.find(s => s.name === 'Projets Web')?.id,
        title: 'Application Web Corporate',
        description: 'Site vitrine professionnel avec système de gestion de contenu personnalisé.',
        display_order: 2
      },
      {
        section_id: sections.find(s => s.name === 'Projets Web')?.id,
        title: 'Portail Client Interactif',
        description: 'Interface web pour la gestion des comptes clients avec tableau de bord avancé.',
        display_order: 3
      },
      
      // Mobile Apps
      {
        section_id: sections.find(s => s.name === 'Applications Mobiles')?.id,
        title: 'App Mobile iOS/Android',
        description: 'Application mobile native avec fonctionnalités de géolocalisation et notifications push.',
        display_order: 1
      },
      {
        section_id: sections.find(s => s.name === 'Applications Mobiles')?.id,
        title: 'App de Gestion',
        description: 'Application mobile pour la gestion d\'inventaire et suivi des commandes en temps réel.',
        display_order: 2
      },
      
      // Visual Identity
      {
        section_id: sections.find(s => s.name === 'Identité Visuelle')?.id,
        title: 'Logo & Charte Graphique',
        description: 'Création complète d\'identité visuelle avec logo, couleurs et typographie.',
        display_order: 1
      },
      {
        section_id: sections.find(s => s.name === 'Identité Visuelle')?.id,
        title: 'Supports de Communication',
        description: 'Design de brochures, cartes de visite et supports marketing cohérents.',
        display_order: 2
      },
      {
        section_id: sections.find(s => s.name === 'Identité Visuelle')?.id,
        title: 'Signalétique Professionnelle',
        description: 'Conception de panneaux et signalétique pour espaces commerciaux.',
        display_order: 3
      }
    ];
    
    // Insert sample projects
    for (const project of sampleProjects) {
      if (project.section_id) {
        await new Promise((resolve, reject) => {
          db.run(
            "INSERT INTO projects (section_id, title, description, display_order) VALUES (?, ?, ?, ?)",
            [project.section_id, project.title, project.description, project.display_order],
            function(err) {
              if (err) reject(err);
              else {
                console.log(`Added project: ${project.title}`);
                resolve(this.lastID);
              }
            }
          );
        });
      }
    }
    
    console.log('✅ Sample projects added successfully');
    
  } catch (error) {
    console.error('❌ Error adding sample projects:', error);
  } finally {
    db.close();
  }
}

addSampleProjects();