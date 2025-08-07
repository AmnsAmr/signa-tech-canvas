import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Image as ImageIcon, Plus, FolderPlus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectsApi, ImagesApi } from '@/api';

interface ProjectSection {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface Project {
  id: number;
  section_id: number;
  title: string;
  description?: string;
  image_filename?: string;
  display_order: number;
  is_active: boolean;
}

const ProjectManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [projects, setProjects] = useState<Record<number, Project[]>>({});
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [showNewProject, setShowNewProject] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    image_filename: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadSections(),
      loadImages()
    ]);
  };

  const loadSections = async () => {
    try {
      const response = await ProjectsApi.adminGetSections();
      console.log('Load sections response:', response);
      if (response.success && Array.isArray(response.data)) {
        setSections(response.data);
        response.data.forEach(section => loadProjects(section.id));
      } else {
        console.error('Invalid sections response:', response);
        setSections([]);
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      setSections([]);
    }
  };

  const loadProjects = async (sectionId: number) => {
    try {
      const response = await ProjectsApi.adminGetSectionProjects(sectionId);
      if (response.success) {
        setProjects(prev => ({ ...prev, [sectionId]: response.data }));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadImages = async () => {
    try {
      const response = await ImagesApi.adminGetAll();
      if (response.success) {
        setImages(response.data);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return;
    
    setLoading(true);
    try {
      const response = await ProjectsApi.createSection({
        name: newSectionName,
        display_order: sections.length
      });
      
      if (response.success) {
        setNewSectionName('');
        setShowNewSection(false);
        await loadSections();
        alert('Section created successfully!');
      } else {
        alert('Failed to create section: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to create section: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Delete this section and all its projects?')) return;
    
    setLoading(true);
    try {
      const response = await ProjectsApi.deleteSection(id);
      
      if (response.success) {
        setSections(prev => prev.filter(section => section.id !== id));
        setProjects(prev => {
          const newProjects = { ...prev };
          delete newProjects[id];
          return newProjects;
        });
        alert('Section deleted successfully!');
      } else {
        alert('Failed to delete section: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to delete section: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (sectionId: number) => {
    if (!newProject.title.trim()) return;
    
    try {
      const response = await ProjectsApi.createProject({
        ...newProject,
        section_id: sectionId,
        display_order: (projects[sectionId] || []).length
      });
      
      if (response.success) {
        setNewProject({ title: '', description: '', image_filename: '' });
        setShowNewProject(null);
        await loadProjects(sectionId);
        alert('Project created successfully!');
      } else {
        alert('Failed to create project: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to create project: ' + error.message);
    }
  };

  const handleDeleteProject = async (id: number, sectionId: number) => {
    if (!confirm('Delete this project?')) return;
    
    try {
      const response = await ProjectsApi.deleteProject(id);
      if (response.success) {
        await loadProjects(sectionId);
        alert('Project deleted successfully!');
      } else {
        alert('Failed to delete project: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to delete project: ' + error.message);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'portfolio');

    try {
      const response = await ImagesApi.adminUpload(formData);
      if (response.success) {
        await loadImages();
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to upload image: ' + error.message);
    }
  };

  if (!isAdmin) return <div>Access denied</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage portfolio projects organized by sections.</p>
        </CardContent>
      </Card>



      {/* Sections */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Project Sections</h3>
        <Button onClick={() => setShowNewSection(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Section
        </Button>
      </div>

      {/* New Section Form */}
      {showNewSection && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Section name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSection()}
              />
              <Button onClick={handleCreateSection} disabled={loading || !newSectionName.trim()}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewSection(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections List */}
      {Array.isArray(sections) && sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{section.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowNewProject(section.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Project
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteSection(section.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* New Project Form */}
            {showNewProject === section.id && (
              <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Project title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                  
                  {/* Image Selection/Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Image</label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 p-2 border rounded"
                        value={newProject.image_filename}
                        onChange={(e) => setNewProject({ ...newProject, image_filename: e.target.value })}
                      >
                        <option value="">Select existing image</option>
                        {images.map(img => (
                          <option key={img.filename} value={img.filename}>
                            {img.original_name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`upload-${section.id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`upload-${section.id}`)?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {images.length} images available • Upload new or select existing
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleCreateProject(section.id)}>
                      Create Project
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewProject(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(projects[section.id] || []).map((project) => (
                <Card key={project.id}>
                  <div className="aspect-video bg-gray-100">
                    {project.image_filename ? (
                      <img
                        src={ImagesApi.getImageUrl(project.image_filename)}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h5 className="font-medium mb-1">{project.title}</h5>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {project.description}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProject(project.id, section.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!projects[section.id] || projects[section.id].length === 0) && (
              <p className="text-center py-8 text-muted-foreground">
                No projects in this section.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {(!sections || sections.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No sections created yet. Click "New Section" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectManager;