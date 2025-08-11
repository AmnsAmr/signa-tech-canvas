import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import './MegaMenu.css';

interface Subcategory {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  type: 'category' | 'product';
}

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  subcategories: Subcategory[];
}

interface MegaMenuProps {
  isScrolled: boolean;
}

const MegaMenu = ({ isScrolled }: MegaMenuProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<'category' | 'product'>('category');
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/api/menu');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(categoryId);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  const toggleMobileCategory = (categoryId: string) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryId ? null : categoryId);
  };

  const handleAddCategory = (parentId: string | null = null) => {
    setParentCategoryId(parentId);
    setAddType('category');
    setNewItemName('');
    setShowAddDialog(true);
  };

  const handleAddProduct = (parentId: string) => {
    setParentCategoryId(parentId);
    setAddType('product');
    setNewItemName('');
    setShowAddDialog(true);
  };

  const handleSubmitNewItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const data = {
        name: newItemName.trim(),
        parentId: parentCategoryId,
        type: addType,
        displayOrder: 0
      };

      await apiClient.post('/api/menu/admin/categories', data);
      
      toast({
        title: 'Success',
        description: `${addType === 'category' ? 'Category' : 'Product'} added successfully`
      });
      
      setShowAddDialog(false);
      setNewItemName('');
      fetchMenuData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add ${addType}`,
        variant: 'destructive'
      });
    }
  };

  // Don't render anything if still loading
  if (isLoading) {
    return null;
  }

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  


  // Don't render if no categories and user is not admin
  if (safeCategories.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <>
      {/* Desktop Categories Grid */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap gap-2 items-center">
            {isAdmin && (
              <button
                onClick={() => handleAddCategory()}
                className="category-card bg-green-100 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-200 transition-all duration-200 rounded-lg p-1 w-[80px] h-[60px] flex items-center justify-center group"
              >
                <Plus className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="ml-1 text-xs font-medium text-green-600">Add</span>
              </button>
            )}
            {safeCategories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="category-card bg-card hover:bg-primary/5 border border-border hover:border-primary/30 transition-all duration-200 rounded-lg p-1 w-[80px] h-[60px] flex items-center justify-center cursor-pointer group">
                  <span className="text-xs font-medium text-center leading-tight group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(category.id);
                      }}
                    >
                      <Plus className="h-2 w-2" />
                    </Button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {activeDropdown === category.id && category.subcategories.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[250px] max-w-[400px]"
                    onMouseEnter={() => handleMouseEnter(category.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-primary mb-3">{category.name}</h3>
                      <div className="space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <a
                            key={subcategory.id}
                            href={subcategory.type === 'category' ? `/category/${subcategory.id}` : `/product/${subcategory.id}`}
                            className="block p-2 rounded hover:bg-primary/5 transition-colors duration-200"
                          >
                            <span className="text-sm font-medium hover:text-primary">
                              {subcategory.name}
                            </span>
                            {subcategory.type === 'product' && (
                              <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-1 py-0.5 rounded">
                                Product
                              </span>
                            )}
                          </a>
                        ))}
                        {isAdmin && (
                          <div className="border-t pt-2 mt-2 space-y-1">
                            <button
                              onClick={() => handleAddCategory(category.id)}
                              className="w-full text-left p-2 rounded border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                            >
                              <Plus className="h-3 w-3 inline mr-2" />
                              <span className="text-xs">Add Category</span>
                            </button>
                            <button
                              onClick={() => handleAddProduct(category.id)}
                              className="w-full text-left p-2 rounded border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                            >
                              <Plus className="h-3 w-3 inline mr-2" />
                              <span className="text-xs">Add Product</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Categories */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span>Categories</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              isMobileMenuOpen ? 'rotate-180' : ''
            }`} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Accordion */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-2 space-y-2">
            {isAdmin && safeCategories.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No categories yet</p>
                <Button size="sm" onClick={() => handleAddCategory()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddCategory()}
                className="w-full mb-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
            {safeCategories.map((category) => (
              <div key={category.id} className="border border-border rounded-lg">
                <button
                  onClick={() => toggleMobileCategory(category.id)}
                  className="w-full flex items-center justify-between p-3 text-left font-medium hover:bg-primary/5 rounded-lg transition-colors duration-200"
                >
                  {category.name}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    expandedMobileCategory === category.id ? 'rotate-180' : ''
                  }`} />
                </button>

                {expandedMobileCategory === category.id && (
                  <div className="border-t border-border p-3 space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory.id}
                        href={subcategory.type === 'category' ? `/category/${subcategory.id}` : `/product/${subcategory.id}`}
                        className="block p-2 text-sm hover:bg-primary/5 rounded transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="font-medium">{subcategory.name}</span>
                        {subcategory.type === 'product' && (
                          <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-1 py-0.5 rounded">
                            Product
                          </span>
                        )}
                      </a>
                    ))}
                    {isAdmin && (
                      <div className="border-t pt-2 mt-2 space-y-1">
                        <button
                          onClick={() => handleAddCategory(category.id)}
                          className="w-full text-left p-2 text-sm border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded transition-colors duration-200"
                        >
                          <Plus className="h-3 w-3 inline mr-2" />
                          Add Category
                        </button>
                        <button
                          onClick={() => handleAddProduct(category.id)}
                          className="w-full text-left p-2 text-sm border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded transition-colors duration-200"
                        >
                          <Plus className="h-3 w-3 inline mr-2" />
                          Add Product
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New {addType === 'category' ? 'Category' : 'Product'}
              {parentCategoryId && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  to {categories.find(c => c.id === parentCategoryId)?.name || 'category'}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {addType === 'category' ? 'Category' : 'Product'} Name
              </label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${addType} name`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitNewItem();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitNewItem} disabled={!newItemName.trim()}>
                Add {addType === 'category' ? 'Category' : 'Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MegaMenu;