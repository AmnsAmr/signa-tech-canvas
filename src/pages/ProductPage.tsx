import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Save, X, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
      const response = await apiClient.get(`/api/menu/product/${productId}`);
      setProduct(response.data);
      setNewDescription(response.data.description || '');
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
      
      setProduct({ ...product, description: newDescription });
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
      const variables = product.variables || [];
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
      
      setProduct(updatedProduct);
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
      const variables = product.customFields?.variables || [];
      const updatedVariables = variables.map((variable: ProductVariable) => {
        if (variable.id === variableId) {
          return {
            ...variable,
            options: [
              ...variable.options,
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
      setProduct(updatedProduct);
      
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

  const calculateTotalPrice = () => {
    if (!product?.customFields?.variables) return 0;
    
    let total = 0;
    product.customFields.variables.forEach((variable: ProductVariable) => {
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

  const variables = product.customFields?.variables || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
                {isAdmin && (
                  <Button variant="outline" className="ml-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                )}
              </div>
            )}
          </div>

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
              {variables.map((variable: ProductVariable) => (
                <Card key={variable.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{variable.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {variable.options.map((option) => (
                        <Button
                          key={option.id}
                          variant={selectedOptions[variable.id] === option.id ? "default" : "outline"}
                          onClick={() => setSelectedOptions({
                            ...selectedOptions,
                            [variable.id]: option.id
                          })}
                          className="justify-between"
                        >
                          <span>{option.value}</span>
                          <Badge variant="secondary">${option.price}</Badge>
                        </Button>
                      ))}
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
              
              {variables.length > 0 && (
                <div className="text-2xl font-bold">
                  Total: ${calculateTotalPrice().toFixed(2)}
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