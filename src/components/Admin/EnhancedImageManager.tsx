import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImagesApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

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

interface ImageRule {
  category: string;
  maxImages: number | null;
  description: string;
  currentCount: number;
  canAdd: boolean;
}

const EnhancedImageManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<Record<string, SiteImage[]>>({});
  const [rules, setRules] = useState<ImageRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [imagesResponse, rulesResponse] = await Promise.all([
        ImagesApi.adminGetAll(),
        ImagesApi.getRules()
      ]);

      if (imagesResponse.success) {
        const grouped = imagesResponse.data.reduce((acc: Record<string, SiteImage[]>, img: SiteImage) => {
          if (!acc[img.category]) acc[img.category] = [];
          acc[img.category].push(img);
          return acc;
        }, {});
        
        // Sort images by creation date
        Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
        
        setImages(grouped);
      }

      if (rulesResponse.success) {
        setRules(rulesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load images and rules",
        variant: "destructive"
      });
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
      setLoading(true);
      const response = await ImagesApi.adminUpload(formData);

      if (response.success) {
        setUploadFiles(prev => ({ ...prev, [category]: null }));
        await fetchData();
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        toast({
          title: "Success",
          description: response.data.message || "Image uploaded successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      setLoading(true);
      const response = await ImagesApi.adminDelete(id);

      if (response.success) {
        await fetchData();
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        toast({
          title: "Success",
          description: "Image deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const response = await ImagesApi.adminReplace(id, formData);

      if (response.success) {
        await fetchData();
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        toast({
          title: "Success",
          description: response.data.message || "Image replaced successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to replace image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Replace failed:', error);
      toast({
        title: "Error",
        description: "Failed to replace image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRuleIcon = (rule: ImageRule) => {
    if (rule.category === 'logo' || rule.category === 'about') {
      return rule.currentCount > 0 ? CheckCircle : AlertTriangle;
    }
    if (rule.category === 'hero') {
      return rule.currentCount >= 3 ? CheckCircle : rule.currentCount > 0 ? Info : AlertTriangle;
    }
    return Info;
  };

  const getRuleColor = (rule: ImageRule) => {
    if (rule.category === 'logo' || rule.category === 'about') {
      return rule.currentCount > 0 ? 'text-green-600' : 'text-red-600';
    }
    if (rule.category === 'hero') {
      return rule.currentCount >= 3 ? 'text-green-600' : rule.currentCount > 0 ? 'text-blue-600' : 'text-red-600';
    }
    return 'text-gray-600';
  };

  if (!isAdmin) {
    return <div className="text-center py-8">Access denied</div>;
  }

  if (loading && rules.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ImageIcon className="h-8 w-8 text-blue-600 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Enhanced Image Management</h2>
              <p className="text-blue-700 mb-4">
                Manage your website images with intelligent rules and automatic organization.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {rules.map((rule) => {
                  const Icon = getRuleIcon(rule);
                  return (
                    <div key={rule.category} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${getRuleColor(rule)}`} />
                      <span className="capitalize font-medium">{rule.category}:</span>
                      <span>{rule.currentCount}{rule.maxImages ? `/${rule.maxImages}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Categories */}
      {rules.map((rule) => {
        const categoryImages = images[rule.category] || [];
        
        return (
          <Card key={rule.category} className={`border-l-4 ${
            rule.category === 'logo' ? 'border-l-red-500' : 
            rule.category === 'hero' ? 'border-l-yellow-500' : 
            rule.category === 'about' ? 'border-l-blue-500' : 'border-l-green-500'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="capitalize">{rule.category} Images</span>
                <Badge variant={rule.canAdd ? "default" : "secondary"}>
                  {rule.currentCount}{rule.maxImages ? `/${rule.maxImages}` : ''}
                </Badge>
                {!rule.canAdd && rule.maxImages && (
                  <Badge variant="destructive">Limit Reached</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{rule.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Upload Section */}
              {rule.canAdd && (
                <div className="flex gap-4 items-end p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFiles(prev => ({ 
                        ...prev, 
                        [rule.category]: e.target.files?.[0] || null 
                      }))}
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={() => handleUpload(rule.category)}
                    disabled={!uploadFiles[rule.category] || loading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {rule.maxImages === 1 ? 'Replace' : 'Add'}
                  </Button>
                </div>
              )}

              {/* Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryImages.map((image, index) => (
                  <Card key={image.id} className="overflow-hidden relative group hover:shadow-lg transition-all duration-200">
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
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={loading}
                            >
                              <ImageIcon className="h-4 w-4" />
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
                              Replace
                            </DropdownMenuItem>
                            {rule.category !== 'logo' && rule.category !== 'about' && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(image.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate mb-1">{image.original_name}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(image.size / 1024)}KB • {new Date(image.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {categoryImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {rule.category} images uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedImageManager;