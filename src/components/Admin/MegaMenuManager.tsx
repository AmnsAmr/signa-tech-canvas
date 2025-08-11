import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trash2, Edit, Plus, Upload, Move } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { apiClient } from '../../api';

interface MenuCategory {
  _id: string;
  name: string;
  parentId?: string;
  displayOrder: number;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  type: 'category' | 'product';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const MegaMenuManager: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    displayOrder: 0,
    description: '',
    type: 'category' as 'category' | 'product',
    customFields: {}
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/menu/admin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend = {
      name: formData.name,
      parentId: formData.parentId,
      displayOrder: formData.displayOrder,
      description: formData.description,
      type: formData.type,
      customFields: formData.customFields,
      imageUrl: editingCategory?.imageUrl || ''
    };

    try {
      if (editingCategory) {
        await apiClient.put(`/api/menu/admin/categories/${editingCategory._id}`, dataToSend);
      } else {
        await apiClient.post('/api/menu/admin/categories', dataToSend);
      }
      
      toast({
        title: 'Success',
        description: `Category ${editingCategory ? 'updated' : 'created'} successfully`
      });
      resetForm();
      await fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId || '',
      displayOrder: category.displayOrder,
      description: category.description || '',
      type: category.type,
      customFields: category.customFields || {}
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await apiClient.delete(`/api/menu/admin/categories/${id}`);
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parentId: '',
      displayOrder: 0,
      description: '',
      type: 'category',
      customFields: {}
    });
    setEditingCategory(null);
    setShowForm(false);
    setImageFile(null);
  };

  const getParentCategories = () => {
    return Array.isArray(categories) ? categories.filter(cat => !cat.parentId) : [];
  };

  const getSubcategories = (parentId: string) => {
    return Array.isArray(categories) ? categories.filter(cat => cat.parentId === parentId) : [];
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mega Menu Manager</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Parent Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  >
                    <option value="">Top Level</option>
                    {getParentCategories().map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'category' | 'product' })}
                  >
                    <option value="category">Category</option>
                    <option value="product">Product</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {getParentCategories().map(category => (
          <Card key={category._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {category.imageUrl && (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <Badge variant={category.type === 'category' ? 'default' : 'secondary'}>
                    {category.type}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(category._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {getSubcategories(category._id).length > 0 && (
                <div className="ml-6 mt-4 space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Subcategories:</h4>
                  {getSubcategories(category._id).map(sub => (
                    <div key={sub._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {sub.imageUrl && (
                          <img 
                            src={sub.imageUrl} 
                            alt={sub.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <span className="text-sm">{sub.name}</span>
                        <Badge variant={sub.type === 'category' ? 'default' : 'secondary'} className="text-xs">
                          {sub.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(sub)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sub._id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MegaMenuManager;