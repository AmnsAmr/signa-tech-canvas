import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, Home, User, Info, FolderOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl, buildUploadUrl } from '@/config/api';

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
  maxImages?: number;
}

const sections: ImageSection[] = [
  { key: 'logo', title: 'Logo', icon: User, description: 'Logo principal du site', maxImages: 1 },
  { key: 'hero', title: 'Page d\'accueil', icon: Home, description: 'Images de la page d\'accueil (3 max)', maxImages: 3 },
  { key: 'about', title: 'Page À propos', icon: Info, description: 'Image de la page à propos', maxImages: 1 },
  { key: 'services', title: 'Services', icon: FolderOpen, description: 'Images des services' },
  { key: 'portfolio', title: 'Portfolio', icon: ImageIcon, description: 'Galerie de projets' }
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
      }
    } catch (error) {
      console.error('Replace failed:', error);
    }
  };

  if (!isAdmin) return <div>Accès refusé</div>;

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const sectionImages = images[section.key] || [];
        const canUpload = !section.maxImages || sectionImages.length < section.maxImages;
        
        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className="h-6 w-6" />
                {section.title}
                <span className="text-sm font-normal text-muted-foreground">
                  ({sectionImages.length}{section.maxImages ? `/${section.maxImages}` : ''})
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                {sectionImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={buildUploadUrl(image.filename)}
                        alt={image.original_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate mb-2">{image.original_name}</div>
                      <div className="text-xs text-gray-500 mb-3">
                        {Math.round(image.size / 1024)}KB
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
                ))}
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