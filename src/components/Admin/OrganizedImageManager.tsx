import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, Home, User, Info, FolderOpen, Building2, Star, Palette, AlertTriangle, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImagesApi } from '@/api';
import { API_CONFIG } from '@/api/config';
import { apiCache } from '@/api/cache';
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



const getSections = (t: (key: string) => string): ImageSection[] => [
  { 
    key: 'logo', 
    title: t('organized_images.site_logo'), 
    icon: Building2, 
    description: t('organized_images.logo_desc'), 
    usage: 'Header navigation + Browser tab icon (favicon)',
    maxImages: 1,
    priority: 'high'
  },
  { 
    key: 'hero', 
    title: t('organized_images.homepage'), 
    icon: Home, 
    description: t('organized_images.homepage_desc'), 
    usage: 'Homepage hero section + portfolio preview cards',
    maxImages: 3,
    priority: 'high'
  },
  { 
    key: 'about', 
    title: t('organized_images.about_page'), 
    icon: Info, 
    description: t('organized_images.about_desc'), 
    usage: 'About page story section (single image)',
    maxImages: 1,
    priority: 'medium'
  },
  { 
    key: 'portfolio', 
    title: 'Portfolio Gallery', 
    icon: Star, 
    description: 'General portfolio images for display purposes', 
    usage: 'Portfolio page image gallery',
    priority: 'low'
  }
];

const OrganizedImageManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [images, setImages] = useState<Record<string, SiteImage[]>>({});
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});


  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const response = await ImagesApi.adminGetAll();
      
      if (response.success) {
        console.log('Fetched images:', response.data);
        const grouped = response.data.reduce((acc: Record<string, SiteImage[]>, img: SiteImage) => {
          if (!acc[img.category]) acc[img.category] = [];
          acc[img.category].push(img);
          return acc;
        }, {});
        
        // Sort images by ID for consistent order
        Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => a.id - b.id);
        });
        
        setImages(grouped);
      } else {
        console.error('Failed to fetch images:', response.error);
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
      const response = await ImagesApi.adminUpload(formData);

      if (response.success) {
        setUploadFiles(prev => ({ ...prev, [category]: null }));
        fetchAllImages();
        // Clear all image caches to force refresh on frontend pages
        if (API_CONFIG.CACHE_ENABLED) {
          apiCache.invalidatePattern('^images:');
          apiCache.invalidatePattern('^admin:images:');
        }
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        alert(response.data.message || 'Image ajoutée avec succès!');
      } else {
        alert(response.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette image ?')) return;
    
    try {
      const response = await ImagesApi.adminDelete(id);

      if (response.success) {
        fetchAllImages();
        // Clear all image caches to force refresh on frontend pages
        if (API_CONFIG.CACHE_ENABLED) {
          apiCache.invalidatePattern('^images:');
          apiCache.invalidatePattern('^admin:images:');
        }
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        alert('Image supprimée avec succès!');
      } else {
        alert(response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleReplace = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await ImagesApi.adminReplace(id, formData);

      if (response.success) {
        fetchAllImages();
        // Clear all image caches to force refresh on frontend pages
        if (API_CONFIG.CACHE_ENABLED) {
          apiCache.invalidatePattern('^images:');
          apiCache.invalidatePattern('^admin:images:');
        }
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        alert(response.data.message || 'Image remplacée avec succès!');
      } else {
        alert(response.error || 'Erreur lors du remplacement');
      }
    } catch (error) {
      console.error('Replace failed:', error);
      alert('Erreur lors du remplacement');
    }
  };



  if (!isAdmin) return <div>{t('organized_images.access_denied')}</div>;

  return (
    <div className="space-y-8">
      {/* Instructions Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ImageIcon className="h-8 w-8 text-blue-600 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">{t('organized_images.title')}</h2>
              <p className="text-blue-700 mb-4">
                {t('organized_images.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span><strong>{t('organized_images.critical')}:</strong> {t('organized_images.critical_desc')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span><strong>{t('organized_images.important')}:</strong> {t('organized_images.important_desc')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span><strong>{t('organized_images.standard')}:</strong> {t('organized_images.standard_desc')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {getSections(t).map((section) => {
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
                  {section.priority === 'high' ? t('organized_images.critical') : section.priority === 'medium' ? t('organized_images.important') : t('organized_images.standard')}
                </span>
              </CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <strong>{t('organized_images.usage')}:</strong> {section.usage}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canUpload && section.maxImages && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    Limit reached ({section.maxImages} images max). Delete an image to add a new one.
                  </span>
                </div>
              )}
              
              {section.key === 'logo' && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg mb-4">
                  <Info className="h-4 w-4 text-purple-600" />
                  <div className="text-sm text-purple-700">
                    <p><strong>{t('organized_images.favicon_info')}:</strong> {t('organized_images.favicon_desc')}</p>
                    <p className="mt-1">{t('organized_images.favicon_formats')}</p>
                  </div>
                </div>
              )}
              
              {section.key === 'hero' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <Info className="h-4 w-4 text-blue-600" />
                  <div className="text-sm text-blue-700">
                    <p><strong>{t('organized_images.important')}:</strong> {t('organized_images.hero_info')}</p>
                    <ol className="list-decimal ml-5 mt-1">
                      <li>{t('organized_images.hero_main')}</li>
                      <li>{t('organized_images.hero_project1')}</li>
                      <li>{t('organized_images.hero_project2')}</li>
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
                    className="hover:bg-primary/90 active:scale-95 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('organized_images.add')}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sectionImages.map((image, index) => {
                  const isFirstImage = index === 0;
                  const orderHint = section.key === 'hero' && index < 3 ? 
                    [t('organized_images.main_hero'), t('organized_images.project_preview1'), t('organized_images.project_preview2')][index] :
                    section.key === 'about' ?
                    t('organized_images.team_image') :
                    `Image ${index + 1}`;
                  
                  return (
                    <Card key={image.id} className={`overflow-hidden relative group hover:shadow-lg transition-all duration-200 ${
                      isFirstImage ? 'ring-2 ring-primary ring-opacity-50' : ''
                    }`}>
                      {isFirstImage && (
                        <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          {t('organized_images.main_image')}
                        </div>
                      )}
                      <div className="relative bg-gray-100" style={{ height: '180px' }}>
                        <img
                          src={ImagesApi.getImageUrl(image.filename)}
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
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-secondary/80 active:scale-95"
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
                                {t('image_manager.replace')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(image.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('admin.delete')}
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

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading images...</p>
                </div>
              ) : sectionImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <section.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('organized_images.no_images_section')}</p>
                </div>
              ) : null}


            </CardContent>
          </Card>
        );
      })}


    </div>
  );
};

export default OrganizedImageManager;

