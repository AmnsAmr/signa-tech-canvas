import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, Home, User, Info, FolderOpen, Building2, Star, Palette, AlertTriangle } from 'lucide-react';
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
    title: 'Page d\'Accueil - Hero', 
    icon: Home, 
    description: 'Images principales de la page d\'accueil et aperçus portfolio', 
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
    key: 'services', 
    title: 'Services & Projets', 
    icon: Palette, 
    description: 'Images des services (façade, PLV, etc.) utilisées sur la page d\'accueil', 
    usage: 'Homepage portfolio preview section',
    priority: 'medium'
  },
  { 
    key: 'portfolio', 
    title: 'Galerie Portfolio', 
    icon: Star, 
    description: 'Collection complète des projets pour la galerie portfolio', 
    usage: 'Portfolio page main gallery',
    priority: 'low'
  }
];

const OrganizedImageManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const [images, setImages] = useState<Record<string, SiteImage[]>>({});
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    fetchAllImages();
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionImages.map((image, index) => {
                  const isFirstImage = index === 0;
                  const orderHint = section.key === 'hero' && index < 3 ? 
                    ['Image principale', 'Aperçu projet 1', 'Aperçu projet 2'][index] :
                    section.key === 'services' && index < 2 ?
                    ['Projet façade', 'Projet PLV'][index] :
                    section.key === 'about' ?
                    'Image équipe' :
                    `Image ${index + 1}`;
                  
                  return (
                    <Card key={image.id} className={`overflow-hidden relative ${
                      isFirstImage ? 'ring-2 ring-primary ring-opacity-50' : ''
                    }`}>
                      {isFirstImage && (
                        <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Principale
                        </div>
                      )}
                      <div className="aspect-video bg-gray-100 relative">
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
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium truncate mb-1">{image.original_name}</div>
                        <div className="text-xs text-blue-600 mb-2 font-medium">{orderHint}</div>
                        <div className="text-xs text-gray-500 mb-3">
                          {Math.round(image.size / 1024)}KB • {new Date(image.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
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
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Remplacer
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrganizedImageManager;