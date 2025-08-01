import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImagesApi } from '@/api';

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

const ImageManager: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [images, setImages] = useState<SiteImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, [selectedCategory]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = selectedCategory 
        ? await ImagesApi.adminGetByCategory(selectedCategory)
        : await ImagesApi.adminGetAll();
      
      console.log('Response:', response);
      
      if (response.success) {
        console.log('Images data:', response.data);
        setImages(response.data);
      } else {
        console.error('API Error:', response.error);
        alert(`${t('common.error')}: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      alert(t('image_manager.server_connection_error'));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ImagesApi.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !newCategory) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', uploadFile);
    formData.append('category', newCategory);

    try {
      const response = await ImagesApi.adminUpload(formData);

      if (response.success) {
        console.log('Upload success:', response.data);
        alert(t('image_manager.image_added'));
        setUploadFile(null);
        setNewCategory('');
        fetchImages();
        fetchCategories();
        // Notify other components to refresh their images
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        console.error('Upload error:', response.error);
        alert(`${t('image_manager.upload_error')}: ${response.error}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('image_manager.connection_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('image_manager.delete_confirm'))) return;
    
    try {
      const response = await ImagesApi.adminDelete(id);

      if (response.success) {
        alert(t('image_manager.image_deleted'));
        fetchImages();
        // Notify other components to refresh their images
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        console.error('Delete error:', response.error);
        alert(`${t('image_manager.delete_error')}: ${response.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(t('image_manager.connection_delete_error'));
    }
  };

  const handleReplace = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await ImagesApi.adminReplace(id, formData);

      if (response.success) {
        alert(t('image_manager.image_replaced'));
        fetchImages();
        // Notify other components to refresh their images
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        console.error('Replace error:', response.error);
        alert(`${t('image_manager.replace_error')}: ${response.error}`);
      }
    } catch (error) {
      console.error('Replace failed:', error);
      alert(t('image_manager.connection_replace_error'));
    }
  };

  const getImageUrl = (image: SiteImage) => {
    return ImagesApi.getImageUrl(image.filename);
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500 mb-4">{t('image_manager.access_denied')}</p>
          <p className="text-sm text-gray-600 mb-4">{t('image_manager.user')}: {user?.email} ({t('admin.role')}: {user?.role})</p>
          <Button onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/admin';
          }}>
            {t('image_manager.reconnect')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>{t('image_manager.user')}: {user?.name} ({user?.email})</span>
            <span className="ml-4">{t('admin.role')}: {user?.role}</span>
            <span className="ml-4">{t('image_manager.admin')}: {isAdmin ? t('image_manager.yes') : t('image_manager.no')}</span>
            <span className="ml-4">{t('image_manager.token')}: {localStorage.getItem('token') ? t('image_manager.present') : t('image_manager.missing')}</span>
            <Button size="sm" onClick={() => window.location.reload()} className="ml-4">
              {t('image_manager.refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {t('image_manager.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">{t('image_manager.category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">{t('image_manager.all_categories')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Button onClick={fetchImages} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('image_manager.refresh')}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">{t('image_manager.add_new_image')}</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">{t('image_manager.file')}</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">{t('image_manager.category')}</label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={t('image_manager.category_placeholder')}
                />
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={!uploadFile || !newCategory || loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? t('image_manager.uploading') : t('image_manager.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={getImageUrl(image)}
                alt={image.original_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="text-sm font-medium truncate">{image.original_name}</div>
                <div className="text-xs text-gray-500">
                  <div>{t('image_manager.category')}: {image.category}</div>
                  <div>{t('image_manager.size')}: {Math.round(image.size / 1024)}KB</div>
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
                    {t('image_manager.replace')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('image_manager.no_images')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageManager;