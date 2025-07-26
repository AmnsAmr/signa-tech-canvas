import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, Home, User, Info, FolderOpen, Building2, Star, Palette, AlertTriangle, Settings, Plus, Edit, FolderPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl, buildUploadUrl } from '@/config/api';
import { IMAGE_USAGE_MAP, isCategoryFull, getPriorityColor } from '@/utils/imageOrganizer';

interface SiteImage {
  id: number;
  category: string;
  filename: string;
  original_name: string;
  path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

interface ImageSection {
  key: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  usage: string;
  maxImages?: number;
  priority: 'high' | 'medium' | 'low';
}

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

const sections: ImageSection[] = [
  { 
    key: 'logo', 
    title: 'Logo du Site', 
    icon: Building2, 
    description: 'Logo principal affiché dans l\'en-tête', 
    usage: 'Header navigation',
    maxImages: 1,
    priority: 'high'
  },
  { 
    key: 'hero', 
    title: 'Page d\'Accueil', 
    icon: Home, 
    description: 'Images principales de la page d\'accueil (hero + 2 aperçus portfolio)', 
    usage: 'Homepage hero section + portfolio preview cards',
    maxImages: 3,
    priority: 'high'
  },
  { 
    key: 'about', 
    title: 'Page À Propos', 
    icon: Info, 
    description: 'Image de l\'équipe utilisée dans la section histoire', 
    usage: 'About page story section (single image)',
    maxImages: 1,
    priority: 'medium'
  },
  { 
    key: 'portfolio', 
    title: 'Portfolio Carousel', 
    icon: Star, 
    description: 'Images pour le système de carousel organisé par sections', 
    usage: 'Portfolio page carousel sections',
    priority: 'low'
  }
];

const OrganizedImageManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const [images, setImages] = useState<Record<string, SiteImage[]>>({});
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});
  const [projectSections, setProjectSections] = useState<ProjectSection[]>([]);
  const [projects, setProjects] = useState<Record<number, Project[]>>({});
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', display_order: 0 });
  const [showNewProject, setShowNewProject] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({ title: '', description: '', image_filename: '', display_order: 0 });

  useEffect(() => {
    fetchAllImages();
    fetchProjectSections();
  }, []);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/images'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const grouped = data.reduce((acc: Record<string, SiteImage[]>, img: SiteImage) => {
          if (!acc[img.category]) acc[img.category] = [];
          acc[img.category].push(img);
          return acc;
        }, {});
        
        // Sort images by ID for consistent order
        Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => a.id - b.id);
        });
        
        setImages(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (category: string) => {
    const file = uploadFiles[category];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/images/upload'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setUploadFiles(prev => ({ ...prev, [category]: null }));
        fetchAllImages();
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        alert('Image ajoutée avec succès! Actualisez la page du site pour voir les changements.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette image ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/images/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAllImages();
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleReplace = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/images/${id}/replace`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchAllImages();
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        alert('Image remplacée avec succès! Actualisez la page du site pour voir les changements.');
      }
    } catch (error) {
      console.error('Replace failed:', error);
    }
  };

  const fetchProjectSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/projects/admin/sections'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const sections = await response.json();
        setProjectSections(sections);
        
        // Fetch projects for each section
        for (let section of sections) {
          fetchProjectsForSection(section.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project sections:', error);
    }
  };

  const fetchProjectsForSection = async (sectionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/sections/${sectionId}/projects`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const sectionProjects = await response.json();
        setProjects(prev => ({ ...prev, [sectionId]: sectionProjects }));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createSection = async () => {
    if (!newSection.name.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/projects/admin/sections'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSection)
      });

      if (response.ok) {
        setNewSection({ name: '', display_order: 0 });
        setShowNewSection(false);
        fetchProjectSections();
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const createProject = async (sectionId: number) => {
    if (!newProject.title.trim()) return;
    
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
        setNewProject({ title: '', description: '', image_filename: '', display_order: 0 });
        setShowNewProject(null);
        fetchProjectsForSection(sectionId);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const deleteProject = async (id: number, sectionId: number) => {
    if (!confirm('Supprimer ce projet ?')) return;
    
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
    }
  };

  if (!isAdmin) return <div>Accès refusé</div>;

  return (
    <div className="space-y-8">
      {/* Instructions Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ImageIcon className="h-8 w-8 text-blue-600 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Gestion Organisée des Images</h2>
              <p className="text-blue-700 mb-4">
                Chaque section correspond à un usage spécifique sur le site. L'ordre des images est important pour l'affichage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span><strong>Critique:</strong> Affichage immédiat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span><strong>Important:</strong> Pages principales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span><strong>Standard:</strong> Galeries</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {sections.map((section) => {
        const sectionImages = images[section.key] || [];
        const canUpload = !section.maxImages || sectionImages.length < section.maxImages;
        
        return (
          <Card key={section.key} className={`border-l-4 ${
            section.priority === 'high' ? 'border-l-red-500' : 
            section.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className="h-6 w-6" />
                {section.title}
                <span className="text-sm font-normal text-muted-foreground">
                  ({sectionImages.length}{section.maxImages ? `/${section.maxImages}` : ''})
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  section.priority === 'high' ? 'bg-red-100 text-red-700' : 
                  section.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {section.priority === 'high' ? 'Critique' : section.priority === 'medium' ? 'Important' : 'Standard'}
                </span>
              </CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <strong>Utilisation:</strong> {section.usage}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canUpload && section.maxImages && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    Limite atteinte ({section.maxImages} images max). Supprimez une image pour en ajouter une nouvelle.
                  </span>
                </div>
              )}
              
              {section.key === 'hero' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <Info className="h-4 w-4 text-blue-600" />
                  <div className="text-sm text-blue-700">
                    <p><strong>Important:</strong> Cette section est limitée à 3 images spécifiques pour la page d'accueil:</p>
                    <ol className="list-decimal ml-5 mt-1">
                      <li>Image principale (Hero) - Affichée en haut de la page d'accueil</li>
                      <li>Aperçu projet 1 (Façade) - Affichée dans la section portfolio (1ère carte)</li>
                      <li>Aperçu projet 2 (Artisanat) - Affichée dans la section portfolio (3ème carte)</li>
                    </ol>
                  </div>
                </div>
              )}
              
              {canUpload && (
                <div className="flex gap-4 items-end p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFiles(prev => ({ 
                        ...prev, 
                        [section.key]: e.target.files?.[0] || null 
                      }))}
                    />
                  </div>
                  <Button 
                    onClick={() => handleUpload(section.key)}
                    disabled={!uploadFiles[section.key]}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sectionImages.map((image, index) => {
                  const isFirstImage = index === 0;
                  const orderHint = section.key === 'hero' && index < 3 ? 
                    ['Image principale (Hero)', 'Aperçu projet 1 (Façade)', 'Aperçu projet 2 (Artisanat)'][index] :
                    section.key === 'about' ?
                    'Image équipe' :
                    `Image ${index + 1}`;
                  
                  return (
                    <Card key={image.id} className={`overflow-hidden relative group hover:shadow-lg transition-all duration-200 ${
                      isFirstImage ? 'ring-2 ring-primary ring-opacity-50' : ''
                    }`}>
                      {isFirstImage && (
                        <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Principale
                        </div>
                      )}
                      <div className="relative bg-gray-100" style={{ height: '180px' }}>
                        <img
                          src={buildUploadUrl(image.filename)}
                          alt={image.original_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleReplace(image.id, file);
                                  };
                                  input.click();
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Remplacer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(image.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium truncate mb-1">{image.original_name}</div>
                        <div className="text-xs text-blue-600 mb-2 font-medium">{orderHint}</div>
                        <div className="text-xs text-gray-500">
                          {Math.round(image.size / 1024)}KB • {new Date(image.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {sectionImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <section.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune image dans cette section</p>
                </div>
              )}

              {/* Carousel Management for Portfolio Section */}
              {section.key === 'portfolio' && (
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Organisation du Carousel</h4>
                    <Button onClick={() => setShowNewSection(true)} size="sm">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Nouvelle Section
                    </Button>
                  </div>

                  {/* New Section Form */}
                  {showNewSection && (
                    <Card className="mb-4">
                      <CardContent className="p-4 space-y-3">
                        <Input
                          placeholder="Nom de la section (ex: Projets Web)"
                          value={newSection.name}
                          onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                        />
                        <Input
                          type="number"
                          placeholder="Ordre d'affichage"
                          value={newSection.display_order}
                          onChange={(e) => setNewSection({ ...newSection, display_order: parseInt(e.target.value) || 0 })}
                        />
                        <div className="flex gap-2">
                          <Button onClick={createSection} size="sm">
                            Créer
                          </Button>
                          <Button variant="outline" onClick={() => setShowNewSection(false)} size="sm">
                            Annuler
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Project Sections */}
                  <div className="space-y-4">
                    {projectSections.map((projectSection) => (
                      <Card key={projectSection.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{projectSection.name}</CardTitle>
                            <Button
                              onClick={() => setShowNewProject(projectSection.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Projet
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* New Project Form */}
                          {showNewProject === projectSection.id && (
                            <Card className="mb-4 bg-muted/30">
                              <CardContent className="p-4 space-y-3">
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
                                <select
                                  className="w-full p-2 border rounded"
                                  value={newProject.image_filename}
                                  onChange={(e) => setNewProject({ ...newProject, image_filename: e.target.value })}
                                >
                                  <option value="">Sélectionner une image</option>
                                  {sectionImages.map(img => (
                                    <option key={img.filename} value={img.filename}>{img.original_name}</option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <Button onClick={() => createProject(projectSection.id)} size="sm">
                                    Créer
                                  </Button>
                                  <Button variant="outline" onClick={() => setShowNewProject(null)} size="sm">
                                    Annuler
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Projects List */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(projects[projectSection.id] || []).map((project) => (
                              <Card key={project.id} className="overflow-hidden">
                                <div className="aspect-video bg-gray-100 relative">
                                  {project.image_filename ? (
                                    <img
                                      src={buildUploadUrl(project.image_filename)}
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
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs px-2 py-1 h-auto"
                                    onClick={() => deleteProject(project.id, projectSection.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {(!projects[projectSection.id] || projects[projectSection.id].length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Aucun projet dans cette section
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {projectSections.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune section créée. Créez votre première section pour organiser vos projets.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Instructions for Portfolio Carousel */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Star className="h-8 w-8 text-green-600 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Système de Carousel Portfolio</h3>
              <p className="text-green-700 mb-4">
                Le portfolio utilise maintenant un système de carousel organisé par sections. 
                Ajoutez vos images dans la section "Portfolio Carousel" ci-dessus, puis organisez-les en projets.
              </p>
              <div className="space-y-2 text-sm text-green-600">
                <p><strong>1.</strong> Uploadez vos images dans la section Portfolio Carousel</p>
                <p><strong>2.</strong> Créez des sections (ex: "Projets Web", "Applications Mobiles")</p>
                <p><strong>3.</strong> Ajoutez des projets à chaque section avec titre, description et image</p>
                <p><strong>4.</strong> Les visiteurs verront un carousel moderne avec vos projets organisés</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizedImageManager;