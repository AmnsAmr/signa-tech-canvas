const database = require('../config/database');
const db = database.getDb();
const path = require('path');
const fs = require('fs');

// Get all project sections with their projects
const getSections = async (req, res) => {
  try {
    const sections = await new Promise((resolve, reject) => {
      db.all(`
        SELECT ps.*, 
          COUNT(p.id) as project_count
        FROM project_sections ps
        LEFT JOIN projects p ON ps.id = p.section_id AND p.is_active = 1
        WHERE ps.is_active = 1
        GROUP BY ps.id
        ORDER BY ps.display_order ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get projects for each section
    for (let section of sections) {
      const projects = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM projects 
          WHERE section_id = ? AND is_active = 1 
          ORDER BY display_order ASC
        `, [section.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      section.projects = projects;
    }

    res.json(sections);
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
};

// Admin: Get all sections (including inactive)
const getAllSections = async (req, res) => {
  try {
    const sections = await new Promise((resolve, reject) => {
      db.all(`
        SELECT ps.*, 
          COUNT(p.id) as project_count
        FROM project_sections ps
        LEFT JOIN projects p ON ps.id = p.section_id
        GROUP BY ps.id
        ORDER BY ps.display_order ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(sections);
  } catch (error) {
    console.error('Get all sections error:', error);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
};

// Admin: Create section
const createSection = async (req, res) => {
  try {
    const { name, display_order } = req.body;
    console.log('Creating section:', { name, display_order });
    
    const sectionId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO project_sections (name, display_order) VALUES (?, ?)",
        [name, display_order || 0],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    console.log('Section created with ID:', sectionId);

    res.json({ id: sectionId, message: 'Section created successfully' });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ message: 'Failed to create section' });
  }
};

// Admin: Update section
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_order, is_active } = req.body;
    
    const changes = await new Promise((resolve, reject) => {
      db.run(
        "UPDATE project_sections SET name = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, display_order, is_active, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json({ message: 'Section updated successfully' });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ message: 'Failed to update section' });
  }
};

// Admin: Delete section
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting section with ID:', id);
    
    // First delete all projects in this section
    const projectChanges = await new Promise((resolve, reject) => {
      db.run("DELETE FROM projects WHERE section_id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log('Projects deleted:', projectChanges);
    
    // Then delete the section
    const changes = await new Promise((resolve, reject) => {
      db.run("DELETE FROM project_sections WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    console.log('Section delete changes:', changes);

    if (changes === 0) {
      console.log('Section not found with ID:', id);
      return res.status(404).json({ message: 'Section not found' });
    }

    console.log('Section deleted successfully');
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ message: 'Failed to delete section' });
  }
};

// Admin: Get projects by section
const getProjectsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const projects = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM projects WHERE section_id = ? ORDER BY display_order ASC",
        [sectionId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects by section error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// Admin: Create project
const createProject = async (req, res) => {
  try {
    const { section_id, title, description, image_filename, display_order } = req.body;
    
    const projectId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO projects (section_id, title, description, image_filename, display_order) VALUES (?, ?, ?, ?, ?)",
        [section_id, title, description, image_filename, display_order || 0],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({ id: projectId, message: 'Project created successfully' });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

// Admin: Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_filename, display_order, is_active } = req.body;
    
    const changes = await new Promise((resolve, reject) => {
      db.run(
        "UPDATE projects SET title = ?, description = ?, image_filename = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, description, image_filename, display_order, is_active, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

// Admin: Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const changes = await new Promise((resolve, reject) => {
      db.run("DELETE FROM projects WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

// Admin: Update project image
const updateProjectImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get current project to check if it has an existing image
    const currentProject = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM projects WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!currentProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete old image file if it exists
    if (currentProject.image_filename) {
      const oldFilePath = path.join(__dirname, '../uploads', currentProject.image_filename);
      fs.unlink(oldFilePath, (fsErr) => {
        if (fsErr) console.error('Failed to delete old project image:', fsErr);
      });
    }

    const filename = req.file.filename;
    
    const changes = await new Promise((resolve, reject) => {
      db.run(
        "UPDATE projects SET image_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [filename, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project image updated successfully', filename });
  } catch (error) {
    console.error('Update project image error:', error);
    res.status(500).json({ message: 'Failed to update project image' });
  }
};

// Admin: Remove project image
const removeProjectImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentProject = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM projects WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!currentProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete image file if it exists
    if (currentProject.image_filename) {
      const filePath = path.join(__dirname, '../uploads', currentProject.image_filename);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) console.error('Failed to delete project image file:', fsErr);
      });
    }
    
    const changes = await new Promise((resolve, reject) => {
      db.run(
        "UPDATE projects SET image_filename = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project image removed successfully' });
  } catch (error) {
    console.error('Remove project image error:', error);
    res.status(500).json({ message: 'Failed to remove project image' });
  }
};

module.exports = {
  getSections,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  getProjectsBySection,
  createProject,
  updateProject,
  deleteProject,
  updateProjectImage,
  removeProjectImage
};