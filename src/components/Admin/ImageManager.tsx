import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
      
      const url = selectedCategory 
        ? `http://localhost:5000/api/admin/images?category=${selectedCategory}`
        : 'http://localhost:5000/api/admin/images';
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Images data:', data);
        setImages(data);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/images/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/images/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload success:', result);
        alert('Image ajoutée avec succès!');
        setUploadFile(null);
        setNewCategory('');
        fetchImages();
        fetchCategories();
        // Notify other components to refresh their images
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        alert(`Erreur d'upload: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur de connexion lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/images/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Image supprimée avec succès!');
        fetchImages();
        // Notify other components to refresh their images
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        alert(`Erreur de suppression: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Erreur de connexion lors de la suppression');
    }
  };

  const handleReplace = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/images/${id}/replace`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert('Image remplacée avec succès!');
        fetchImages();
        // Notify other components to refresh their images
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Replace error:', errorData);
        alert(`Erreur de remplacement: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Replace failed:', error);
      alert('Erreur de connexion lors du remplacement');
    }
  };

  const getImageUrl = (image: SiteImage) => {
    return `http://localhost:5000/uploads/${image.filename}`;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500 mb-4">Accès refusé. Vous devez être administrateur.</p>
          <p className="text-sm text-gray-600 mb-4">Utilisateur: {user?.email} (Rôle: {user?.role})</p>
          <Button onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/admin';
          }}>
            Se reconnecter
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
            <span>Utilisateur: {user?.name} ({user?.email})</span>
            <span className="ml-4">Rôle: {user?.role}</span>
            <span className="ml-4">Admin: {isAdmin ? 'Oui' : 'Non'}</span>
            <span className="ml-4">Token: {localStorage.getItem('token') ? 'Présent' : 'Manquant'}</span>
            <Button size="sm" onClick={() => window.location.reload()} className="ml-4">
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestion des Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Button onClick={fetchImages} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Ajouter une nouvelle image</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Fichier</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="logo, hero, portfolio, etc."
                />
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={!uploadFile || !newCategory || loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Upload...' : 'Ajouter'}
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
                  <div>Catégorie: {image.category}</div>
                  <div>Taille: {Math.round(image.size / 1024)}KB</div>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune image trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageManager;