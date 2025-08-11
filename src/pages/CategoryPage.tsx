import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Plus, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  type: 'product';
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  products: Product[];
}

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/menu/category/${categoryId}`);
      setCategory(response.data);
      setNewDescription(response.data.description || '');
    } catch (error) {
      console.error('Failed to fetch category:', error);
      toast({
        title: 'Error',
        description: 'Failed to load category',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!category) return;

    try {
      await apiClient.put(`/api/menu/admin/categories/${category._id}`, {
        ...category,
        description: newDescription
      });
      
      setCategory({ ...category, description: newDescription });
      setEditingDescription(false);
      
      toast({
        title: 'Success',
        description: 'Description updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update description',
        variant: 'destructive'
      });
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !category) return;

    try {
      const data = {
        name: newProductName.trim(),
        parentId: category._id,
        type: 'product',
        displayOrder: 0
      };

      await apiClient.post('/api/menu/admin/categories', data);
      
      toast({
        title: 'Success',
        description: 'Product added successfully'
      });
      
      setShowAddProduct(false);
      setNewProductName('');
      fetchCategoryData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading category...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">{category.name}</h1>
            {isAdmin && (
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            {editingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter category description..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveDescription}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingDescription(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  {category.description || 'No description available.'}
                </p>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingDescription(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.products?.map((product) => (
            <Card key={product._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to={`/product/${product._id}`}>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-muted-foreground text-sm">
                      {product.description}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!category.products || category.products.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products in this category yet.</p>
            {isAdmin && (
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product to {category.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Enter product name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddProduct();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} disabled={!newProductName.trim()}>
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CategoryPage;