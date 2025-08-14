import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, Save, X, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CacheInvalidation from '@/utils/cacheInvalidation';
import { DynamicImageFrame } from '@/components/shared/DynamicImageFrame';

interface ProductVariable {
  id: string;
  name: string;
  options: Array<{
    id: string;
    value: string;
    price: number;
  }>;
}



interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  variables?: ProductVariable[];
  type: 'product';
}

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [showAddVariable, setShowAddVariable] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [editVariableName, setEditVariableName] = useState('');
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // Force fresh data by bypassing cache with timestamp
      const response = await apiClient.get(`/api/menu/product/${productId}?t=${Date.now()}`);
      setProduct(response.data as Product);
      setNewDescription((response.data as Product).description || '');
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!product) return;

    try {
      await apiClient.put(`/api/menu/admin/categories/${product._id}`, {
        ...product,
        description: newDescription
      });
      
      // Clear cache and force refresh
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
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

  const handleAddVariable = async () => {
    if (!newVariableName.trim() || !product) return;

    try {
      const vars = product.customFields?.variables;
      const variables = Array.isArray(vars) ? vars : (vars && typeof vars === 'object' ? Object.values(vars) : []);
      const newVariable: ProductVariable = {
        id: Date.now().toString(),
        name: newVariableName.trim(),
        options: []
      };

      const updatedProduct = {
        ...product,
        customFields: {
          ...product.customFields,
          variables: [...variables, newVariable]
        }
      };

      await apiClient.put(`/api/menu/admin/categories/${product._id}`, updatedProduct);
      
      // Clear cache and force refresh
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
      setShowAddVariable(false);
      setNewVariableName('');
      
      toast({
        title: 'Success',
        description: 'Variable added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add variable',
        variant: 'destructive'
      });
    }
  };

  const handleAddOption = async (variableId: string, value: string, price: number) => {
    if (!product) return;

    try {
      const vars = product.customFields?.variables;
      const variables = Array.isArray(vars) ? vars : (vars && typeof vars === 'object' ? Object.values(vars) : []);
      const updatedVariables = variables.map((variable: ProductVariable) => {
        if (variable.id === variableId) {
          const currentOptions = Array.isArray(variable.options) ? variable.options : [];
          return {
            ...variable,
            options: [
              ...currentOptions,
              {
                id: Date.now().toString(),
                value,
                price
              }
            ]
          };
        }
        return variable;
      });

      const updatedProduct = {
        ...product,
        customFields: {
          ...product.customFields,
          variables: updatedVariables
        }
      };

      await apiClient.put(`/api/menu/admin/categories/${product._id}`, updatedProduct);
      
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
      
      toast({
        title: 'Success',
        description: 'Option added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add option',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVariable = async (variableId: string) => {
    if (!product || !confirm('Are you sure you want to delete this variable?')) return;

    try {
      const vars = product.customFields?.variables;
      const variables = Array.isArray(vars) ? vars : (vars && typeof vars === 'object' ? Object.values(vars) : []);
      const updatedVariables = variables.filter((variable: ProductVariable) => variable.id !== variableId);

      const updatedProduct = {
        ...product,
        customFields: {
          ...product.customFields,
          variables: updatedVariables
        }
      };

      await apiClient.put(`/api/menu/admin/categories/${product._id}`, updatedProduct);
      
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
      
      toast({
        title: 'Success',
        description: 'Variable deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete variable',
        variant: 'destructive'
      });
    }
  };

  const handleEditVariable = async (variableId: string, newName: string) => {
    if (!product || !newName.trim()) return;

    try {
      const vars = product.customFields?.variables;
      const variables = Array.isArray(vars) ? vars : (vars && typeof vars === 'object' ? Object.values(vars) : []);
      const updatedVariables = variables.map((variable: ProductVariable) => 
        variable.id === variableId ? { ...variable, name: newName.trim() } : variable
      );

      const updatedProduct = {
        ...product,
        customFields: {
          ...product.customFields,
          variables: updatedVariables
        }
      };

      await apiClient.put(`/api/menu/admin/categories/${product._id}`, updatedProduct);
      
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
      setEditingVariable(null);
      
      toast({
        title: 'Success',
        description: 'Variable updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update variable',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteOption = async (variableId: string, optionId: string) => {
    if (!product || !confirm('Are you sure you want to delete this option?')) return;

    try {
      const vars = product.customFields?.variables;
      const variables = Array.isArray(vars) ? vars : (vars && typeof vars === 'object' ? Object.values(vars) : []);
      const updatedVariables = variables.map((variable: ProductVariable) => {
        if (variable.id === variableId) {
          const currentOptions = Array.isArray(variable.options) ? variable.options : [];
          return {
            ...variable,
            options: currentOptions.filter(option => option.id !== optionId)
          };
        }
        return variable;
      });

      const updatedProduct = {
        ...product,
        customFields: {
          ...product.customFields,
          variables: updatedVariables
        }
      };

      await apiClient.put(`/api/menu/admin/categories/${product._id}`, updatedProduct);
      
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
      
      toast({
        title: 'Success',
        description: 'Option deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete option',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !product) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('categoryId', product._id);

      const response = await apiClient.request('/api/menu/admin/upload-image', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Image uploaded successfully'
        });

        CacheInvalidation.clearProductCache(product._id);
        CacheInvalidation.clearMenuCache();
        await fetchProductData();
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!product || !confirm('Are you sure you want to remove this image?')) return;

    try {
      await apiClient.delete(`/api/menu/admin/remove-image/${product._id}`);
      toast({
        title: 'Success',
        description: 'Image removed successfully'
      });
      CacheInvalidation.clearProductCache(product._id);
      CacheInvalidation.clearMenuCache();
      await fetchProductData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive'
      });
    }
  };



  const calculateTotalPrice = () => {
    let total = 0;
    processedVariables.forEach((variable: ProductVariable) => {
      const selectedOptionId = selectedOptions[variable.id];
      if (selectedOptionId) {
        const option = variable.options.find(opt => opt.id === selectedOptionId);
        if (option) {
          total += option.price;
        }
      }
    });
    
    return total * quantity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const vars = product.customFields?.variables;
  const variables = Array.isArray(vars) ? vars : (vars && typeof vars === 'object' ? Object.values(vars) : []);
  // Convert options objects to arrays
  const processedVariables = variables.map((variable: any) => ({
    ...variable,
    options: Array.isArray(variable.options) ? variable.options : (variable.options && typeof variable.options === 'object' ? Object.values(variable.options) : [])
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <DynamicImageFrame
            src={product.imageUrl ? `/uploads/${product.imageUrl}` : undefined}
            alt={product.name}
            onUpload={handleImageUpload}
            onRemove={handleRemoveImage}
            isAdmin={isAdmin}
            uploading={uploadingImage}
            placeholder="No product image available"
          />

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            {/* Description */}
            <div className="mb-6">
              {editingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter product description..."
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
                <div className="flex items-start gap-2">
                  <p className="text-muted-foreground">
                    {product.description || 'No description available.'}
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

            {/* Variables/Options */}
            <div className="space-y-6">
              {processedVariables.map((variable: ProductVariable) => (
                <Card key={variable.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {editingVariable === variable.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editVariableName}
                            onChange={(e) => setEditVariableName(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => handleEditVariable(variable.id, editVariableName)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingVariable(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-lg">{variable.name}</CardTitle>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingVariable(variable.id);
                                  setEditVariableName(variable.name);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteVariable(variable.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select
                        value={selectedOptions[variable.id] || ""}
                        onValueChange={(value) => setSelectedOptions({
                          ...selectedOptions,
                          [variable.id]: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${variable.name.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(Array.isArray(variable.options) ? variable.options : []).map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              <div className="flex justify-between items-center w-full">
                                <span>{option.value}</span>
                                <Badge variant="secondary" className="ml-2">MAD {option.price}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {isAdmin && (Array.isArray(variable.options) ? variable.options : []).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Manage Options:</p>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(variable.options) ? variable.options : []).map((option) => (
                              <div key={option.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                <span className="text-sm">{option.value} (MAD {option.price})</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleDeleteOption(variable.id, option.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="mt-4 pt-4 border-t">
                        <AddOptionForm
                          onAdd={(value, price) => handleAddOption(variable.id, value, price)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddVariable(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              )}
            </div>

            {/* Quantity and Price */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </div>
              
              {processedVariables.length > 0 && (
                <div className="text-2xl font-bold">
                  Total: MAD {calculateTotalPrice().toFixed(2)}
                </div>
              )}

              <Button size="lg" className="w-full">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Variable Dialog */}
      <Dialog open={showAddVariable} onOpenChange={setShowAddVariable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Variable Name</label>
              <Input
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="e.g., Size, Color, Material"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddVariable();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddVariable(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVariable} disabled={!newVariableName.trim()}>
                Add Variable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Helper component for adding options
const AddOptionForm = ({ onAdd }: { onAdd: (value: string, price: number) => void }) => {
  const [value, setValue] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    if (value.trim() && price) {
      onAdd(value.trim(), parseFloat(price));
      setValue('');
      setPrice('');
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Option value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
      />
      <Input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-24"
      />
      <Button size="sm" onClick={handleSubmit} disabled={!value.trim() || !price}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductPage;