import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Image as ImageIcon, Plus, FolderPlus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const [projectSections, setProjectSections] = useState<ProjectSection[]>([]);
  const [projects, setProjects] = useState<Record<number, Project[]>>({});
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', display_order: 0 });
  const [showNewProject, setShowNewProject] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({ title: '', description: '', image_filename: '', display_order: 0 });
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProjectSections();
    fetchAvailableImages();
  }, []);

  const fetchAvailableImages = async () => {
    try {
      const response = await ImagesApi.adminGetAll();
      if (response.success) {
        setAvailableImages(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'portfolio');

    try {
      const response = await ImagesApi.adminUpload(formData);
      if (response.success) {
        await fetchAvailableImages();
        alert('Image uploaded successfully!');
      } else {
        alert(`Failed to upload image: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProjectSections = async () => {
    try {
      console.log('Fetching project sections...');
      const response = await ProjectsApi.adminGetSections();
      console.log('Fetch sections response:', response);
      
      if (response.success) {
        console.log('Setting project sections:', response.data);
        setProjectSections(response.data);
        
        // Fetch projects for each section
        for (let section of response.data) {
          fetchProjectsForSection(section.id);
        }
      } else {
        console.error('Failed to fetch sections:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch project sections:', error);
    }
  };

  const fetchProjectsForSection = async (sectionId: number) => {
    try {
      const response = await ProjectsApi.adminGetSectionProjects(sectionId);
      
      if (response.success) {
        setProjects(prev => ({ ...prev, [sectionId]: response.data }));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createSection = async () => {
    if (!newSection.name.trim()) {
      alert('Please enter a section name');
      return;
    }
    
    if (loading) return; // Prevent double submission
    
    console.log('Creating section:', newSection);
    setLoading(true);
    
    try {
      const response = await ProjectsApi.createSection(newSection);
      console.log('Create section response:', response);

      if (response.success) {
        setNewSection({ name: '', display_order: 0 });
        setShowNewSection(false);
        await fetchProjectSections();
        alert('Section created successfully!');
      } else {
        console.error('Create section failed:', response.error);
        alert(`Failed to create section: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      alert(`Failed to create section: ${error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (sectionId: number) => {
    if (!newProject.title.trim()) return;
    
    try {
      const response = await ProjectsApi.createProject({ ...newProject, section_id: sectionId });

      if (response.success) {
        setNewProject({ title: '', description: '', image_filename: '', display_order: 0 });
        setShowNewProject(null);
        fetchProjectsForSection(sectionId);
        alert('Project created successfully!');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const deleteProject = async (id: number, sectionId: number) => {
    if (!confirm('Delete this project?')) return;
    
    try {
      const response = await ProjectsApi.deleteProject(id);

      if (response.success) {
        fetchProjectsForSection(sectionId);
        alert('Project deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Delete this section and all its projects?')) return;
    
    console.log('Deleting section:', id);
    setLoading(true);
    
    try {
      const response = await ProjectsApi.deleteSection(id);
      console.log('Delete section response:', response);

      if (response.success) {
        await fetchProjectSections();
        alert('Section deleted successfully!');
      } else {
        console.error('Delete section failed:', response.error);
        alert(`Failed to delete section: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      alert(`Failed to delete section: ${error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div>Access denied</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Settings className="h-8 w-8 text-purple-600 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-purple-900 mb-2">Project Management</h2>
              <p className="text-purple-700 mb-4">
                Manage your portfolio projects organized by sections. Projects will appear on the Portfolio page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Section Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Project Sections</h3>
        <Button onClick={() => setShowNewSection(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Section
        </Button>
      </div>

      {/* New Section Form */}
      {showNewSection && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <form onSubmit={(e) => { e.preventDefault(); createSection(); }} className="space-y-3">
              <Input
                placeholder="Section name (e.g., 'Signage Projects', 'Retail Displays')"
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                autoFocus
              />
              <Input
                type="number"
                placeholder="Display order (0 = first)"
                value={newSection.display_order}
                onChange={(e) => setNewSection({ ...newSection, display_order: parseInt(e.target.value) || 0 })}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !newSection.name.trim()}>
                  {loading ? 'Creating...' : 'Create Section'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNewSection(false)} disabled={loading}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Project Sections */}
      <div className="space-y-6">
        {projectSections.map((section) => (
          <Card key={section.id} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowNewProject(section.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Project
                  </Button>
                  <Button
                    onClick={() => deleteSection(section.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* New Project Form */}
              {showNewProject === section.id && (
                <Card className="mb-4 bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <Input
                      placeholder="Project title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Project description (optional)"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newProject.image_filename}
                      onChange={(e) => setNewProject({ ...newProject, image_filename: e.target.value })}
                    >
                      <option value="">Select an image (optional)</option>
                      {availableImages.map(img => (
                        <option key={img.filename} value={img.filename}>{img.original_name}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Display order (0 = first)"
                      value={newProject.display_order}
                      onChange={(e) => setNewProject({ ...newProject, display_order: parseInt(e.target.value) || 0 })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => createProject(section.id)}>Create Project</Button>
                      <Button variant="outline" onClick={() => setShowNewProject(null)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Projects List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(projects[section.id] || []).map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      {project.image_filename ? (
                        <img
                          src={ImagesApi.getImageUrl(project.image_filename)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h5 className="font-medium text-sm mb-1">{project.title}</h5>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Order: {project.display_order}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs px-2 py-1 h-auto"
                          onClick={() => deleteProject(project.id, section.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!projects[section.id] || projects[section.id].length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No projects in this section. Click "Add Project" to create one.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projectSections.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground">
              No project sections created yet. Click "New Section" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectManager;