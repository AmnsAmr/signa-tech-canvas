import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, FolderPlus, Image as ImageIcon, Upload } from 'lucide-react';
import { ProjectsApi, ImagesApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  section_id: number;
  title: string;
  description?: string;
  image_filename?: string;
  display_order: number;
  is_active: boolean;
}

interface ProjectSection {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  project_count: number;
  projects?: Project[];
}

const EnhancedProjectManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [newSection, setNewSection] = useState({ name: '' });
  const [newProject, setNewProject] = useState({
    section_id: 0,
    title: '',
    description: '',
    image_filename: '',
    display_order: 0
  });
  const [showNewSection, setShowNewSection] = useState(false);
  const [showNewProject, setShowNewProject] = useState<number | null>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  useEffect(() => {
    fetchSections();
    fetchAvailableImages();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await ProjectsApi.getSections();
      
      if (response.success) {
        setSections(response.data);
        
        // Fetch projects for each section
        for (let section of response.data) {
          fetchProjectsForSection(section.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      toast({
        title: "Error",
        description: "Failed to load project sections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsForSection = async (sectionId: number) => {
    try {
      const response = await ProjectsApi.getSectionProjects(sectionId);
      
      if (response.success) {
        setSections(prev => prev.map(section => 
          section.id === sectionId ? { ...section, projects: response.data } : section
        ));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const response = await ImagesApi.adminGetByCategory('portfolio');
      
      if (response.success) {
        setAvailableImages(response.data.map((img: any) => img.filename));
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const createSection = async () => {
    if (!newSection.name.trim()) return;
    
    setLoading(true);
    try {
      const response = await ProjectsApi.createSection({ 
        ...newSection, 
        display_order: sections.length 
      });

      if (response.success) {
        setNewSection({ name: '' });
        setShowNewSection(false);
        fetchSections();
        toast({
          title: "Success",
          description: "Section created successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create section",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: number, data: Partial<ProjectSection>) => {
    setLoading(true);
    try {
      const response = await ProjectsApi.updateSection?.(id, data);

      if (response?.success) {
        setEditingSection(null);
        fetchSections();
        toast({
          title: "Success",
          description: "Section updated successfully"
        });
      }
    } catch (error) {
      console.error('Failed to update section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this section? All projects in this section will also be deleted.')) return;
    
    setLoading(true);
    try {
      const response = await ProjectsApi.deleteSection(id);

      if (response.success) {
        fetchSections();
        toast({
          title: "Success",
          description: "Section deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete section",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (sectionId: number) => {
    if (!newProject.title.trim()) return;
    
    setLoading(true);
    try {
      const response = await ProjectsApi.createProject({ 
        ...newProject, 
        section_id: sectionId 
      });

      if (response.success) {
        setNewProject({ section_id: 0, title: '', description: '', image_filename: '', display_order: 0 });
        setShowNewProject(null);
        fetchProjectsForSection(sectionId);
        toast({
          title: "Success",
          description: "Project created successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create project",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: number, data: Partial<Project>) => {
    setLoading(true);
    try {
      const response = await ProjectsApi.updateProject(id, data);

      if (response.success) {
        setEditingProject(null);
        fetchSections();
        toast({
          title: "Success",
          description: "Project updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update project",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number, sectionId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setLoading(true);
    try {
      const response = await ProjectsApi.deleteProject(id);

      if (response.success) {
        fetchProjectsForSection(sectionId);
        toast({
          title: "Success",
          description: "Project deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete project",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const response = await ProjectsApi.updateProjectImage(projectId, formData);

      if (response.success) {
        fetchSections();
        toast({
          title: "Success",
          description: "Project image updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeProjectImage = async (projectId: number, sectionId: number) => {
    if (!confirm('Are you sure you want to remove this image?')) return;

    try {
      setLoading(true);
      const response = await ProjectsApi.removeProjectImage(projectId);

      if (response.success) {
        fetchProjectsForSection(sectionId);
        toast({
          title: "Success",
          description: "Project image removed successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to remove image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerImageUpload = (projectId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(projectId, file);
    };
    input.click();
  };

  const handleNewProjectImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'portfolio');

    try {
      setLoading(true);
      const response = await ImagesApi.adminUpload(formData);

      if (response.success) {
        setNewProject({ ...newProject, image_filename: response.data.filename });
        fetchAvailableImages();
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerNewProjectImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleNewProjectImageUpload(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Project Manager</h2>
        <Button onClick={() => setShowNewSection(true)} disabled={loading}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Section
        </Button>
      </div>

      {/* New Section Form */}
      {showNewSection && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Section name (e.g., Web Projects, Mobile Apps)"
              value={newSection.name}
              onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button onClick={createSection} disabled={loading || !newSection.name.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowNewSection(false)} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections List */}
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              {editingSection === section.id ? (
                <div className="flex-1 flex gap-2 items-center">
                  <Input
                    value={section.name}
                    onChange={(e) => setSections(prev => prev.map(s => 
                      s.id === section.id ? { ...s, name: e.target.value } : s
                    ))}
                    disabled={loading}
                  />
                  <Input
                    type="number"
                    className="w-24"
                    value={section.display_order}
                    onChange={(e) => setSections(prev => prev.map(s => 
                      s.id === section.id ? { ...s, display_order: parseInt(e.target.value) || 0 } : s
                    ))}
                    disabled={loading}
                  />
                  <Button
                    size="sm"
                    onClick={() => updateSection(section.id, {
                      name: section.name,
                      display_order: section.display_order,
                      is_active: section.is_active
                    })}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingSection(null)} disabled={loading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CardTitle>{section.name}</CardTitle>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{section.project_count} Projects</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewProject(section.id)}
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(section.id)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSection(section.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardHeader>

          {/* New Project Form */}
          {showNewProject === section.id && (
            <CardContent className="border-t space-y-4">
              <h4 className="font-medium">Add New Project</h4>
              <Input
                placeholder="Project title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                disabled={loading}
              />
              <Textarea
                placeholder="Project description (optional)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                disabled={loading}
              />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border rounded"
                    value={newProject.image_filename}
                    onChange={(e) => setNewProject({ ...newProject, image_filename: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">Select existing image</option>
                    {availableImages.map(filename => (
                      <option key={filename} value={filename}>{filename}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerNewProjectImageUpload}
                    disabled={loading}
                    className="whitespace-nowrap"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose an existing portfolio image or upload a new one
                </p>
              </div>
              <Input
                type="number"
                placeholder="Display order"
                value={newProject.display_order}
                onChange={(e) => setNewProject({ ...newProject, display_order: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button onClick={() => createProject(section.id)} disabled={loading || !newProject.title.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setShowNewProject(null)} disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}

          {/* Projects List */}
          {section.projects && section.projects.length > 0 && (
            <CardContent className="border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative group">
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
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => triggerImageUpload(project.id)}
                          className="bg-white/90 hover:bg-white text-black"
                          disabled={loading}
                        >
                          <ImageIcon className="h-4 w-4 mr-1" />
                          {project.image_filename ? 'Replace' : 'Add'}
                        </Button>
                        {project.image_filename && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeProjectImage(project.id, section.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h5 className="font-medium text-sm mb-1">{project.title}</h5>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 h-auto"
                          onClick={() => setEditingProject(project.id)}
                          disabled={loading}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs px-2 py-1 h-auto"
                          onClick={() => deleteProject(project.id, section.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}

          {(!section.projects || section.projects.length === 0) && (
            <CardContent className="border-t">
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects in this section yet</p>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {sections.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No project sections created yet</p>
            <Button onClick={() => setShowNewSection(true)} className="mt-4">
              Create Your First Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProjectManager;