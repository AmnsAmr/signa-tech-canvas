import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, FolderPlus, Image as ImageIcon } from 'lucide-react';
import { buildApiUrl, buildUploadUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import LazyImage from '@/components/LazyImage';

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

const ProjectManager: React.FC = () => {
  const { user } = useAuth();
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadController, setImageUploadController] = useState<AbortController | null>(null);
  const [showNewSection, setShowNewSection] = useState(false);
  const [showNewProject, setShowNewProject] = useState<number | null>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  useEffect(() => {
    fetchSections();
    fetchAvailableImages();
    
    return () => {
      if (imageUploadController) {
        imageUploadController.abort();
      }
    };
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/projects/sections'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsForSection = async (sectionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/sections/${sectionId}/projects`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const projects = await response.json();
        setSections(prev => prev.map(section => 
          section.id === sectionId ? { ...section, projects } : section
        ));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/images?category=portfolio'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const images = await response.json();
        setAvailableImages(images.map((img: any) => img.filename));
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const createSection = async () => {
    if (!newSection.name.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/projects/admin/sections'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...newSection, display_order: sections.length })
      });

      if (response.ok) {
        setNewSection({ name: '' });
        setShowNewSection(false);
        fetchSections();
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: number, data: Partial<ProjectSection>) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/sections/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setEditingSection(null);
        fetchSections();
      }
    } catch (error) {
      console.error('Failed to update section:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section et tous ses projets ?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/sections/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSections();
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (sectionId: number) => {
    if (!newProject.title.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/projects/admin/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...newProject, section_id: sectionId })
      });

      if (response.ok) {
        setNewProject({ section_id: 0, title: '', description: '', image_filename: '', display_order: 0 });
        setShowNewProject(null);
        fetchProjectsForSection(sectionId);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: number, data: Partial<Project>) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/projects/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setEditingProject(null);
        fetchSections();
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number, sectionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/projects/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchProjectsForSection(sectionId);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (projectId: number, file: File) => {
    if (imageUploadController) {
      imageUploadController.abort();
    }
    
    const controller = new AbortController();
    setImageUploadController(controller);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/projects/${projectId}/image`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal
      });

      if (response.ok) {
        alert('Image updated successfully!');
        fetchSections();
      } else {
        const errorData = await response.json();
        alert(`Failed to update image: ${errorData.message}`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
      }
    } finally {
      setImageUploadController(null);
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
    if (uploadingImage) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'portfolio');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/images'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setNewProject(prev => ({ ...prev, image_filename: result.filename }));
        await fetchAvailableImages();
        alert('Image uploaded successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to upload image: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
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
        <h2 className="text-2xl font-bold">Gestion des Projets</h2>
        <Button onClick={() => setShowNewSection(true)} disabled={loading}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Nouvelle Section
        </Button>
      </div>

      {/* New Section Form */}
      {showNewSection && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nom de la section"
              value={newSection.name}
              onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={createSection} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Créer
              </Button>
              <Button variant="outline" onClick={() => setShowNewSection(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuler
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
                  />
                  <Input
                    type="number"
                    className="w-24"
                    value={section.display_order}
                    onChange={(e) => setSections(prev => prev.map(s => 
                      s.id === section.id ? { ...s, display_order: parseInt(e.target.value) || 0 } : s
                    ))}
                  />
                  <Button
                    size="sm"
                    onClick={() => updateSection(section.id, {
                      name: section.name,
                      display_order: section.display_order,
                      is_active: section.is_active
                    })}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CardTitle>{section.name}</CardTitle>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant="outline">{section.project_count} projets</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewProject(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Projet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(section.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSection(section.id)}
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
              <h4 className="font-medium">Nouveau Projet</h4>
              <Input
                placeholder="Titre du projet"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optionnelle)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border rounded"
                    value={newProject.image_filename}
                    onChange={(e) => setNewProject({ ...newProject, image_filename: e.target.value })}
                  >
                    <option value="">Sélectionner une image existante</option>
                    {availableImages.map(filename => (
                      <option key={filename} value={filename}>{filename}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerNewProjectImageUpload}
                    disabled={uploadingImage}
                    className="whitespace-nowrap"
                  >
                    {uploadingImage ? 'Upload...' : 'Upload New'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choisissez une image existante ou uploadez-en une nouvelle depuis votre PC
                </p>
              </div>
              <Input
                type="number"
                placeholder="Ordre d'affichage"
                value={newProject.display_order}
                onChange={(e) => setNewProject({ ...newProject, display_order: parseInt(e.target.value) || 0 })}
              />
              <div className="flex gap-2">
                <Button onClick={() => createProject(section.id)} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Créer
                </Button>
                <Button variant="outline" onClick={() => setShowNewProject(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
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
                      <LazyImage
                        filename={project.image_filename}
                        alt={project.title}
                        className="w-full h-full"
                        useThumbnail={true}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => triggerImageUpload(project.id)}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <ImageIcon className="h-4 w-4 mr-1" />
                          {project.image_filename ? 'Replace' : 'Add'}
                        </Button>
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
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
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
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ProjectManager;