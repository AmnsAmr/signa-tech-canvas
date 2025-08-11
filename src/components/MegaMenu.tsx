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
      setError('Failed to load menu');
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

  // Don't render anything if still loading or if there are no categories
  if (isLoading) {
    return null;
  }

  if (error || !Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Mega Menu */}
      <div className="hidden md:flex items-center space-x-1 relative group">
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleAddCategory()}
            title="Add Top-Level Category"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        {Array.isArray(categories) && categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-1">
              <button
                className={`px-4 py-2 font-medium rounded-lg flex items-center transition-colors duration-200 ${
                  activeDropdown === category.id ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary'
                }`}
              >
                {category.name}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                  activeDropdown === category.id ? 'rotate-180' : ''
                }`} />
              </button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddProduct(category.id);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Mega Menu Dropdown */}
            {activeDropdown === category.id && category.subcategories.length > 0 && (
              <div
                ref={dropdownRef}
                className="mega-menu-dropdown absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[300px] max-w-[600px]"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {category.imageUrl && (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory.id}
                        href={subcategory.type === 'category' ? `/category/${subcategory.id}` : `/product/${subcategory.id}`}
                        className="mega-menu-item block p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          {subcategory.imageUrl && subcategory.type === 'product' && (
                            <img 
                              src={subcategory.imageUrl} 
                              alt={subcategory.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div>
                            <span className="font-medium text-foreground hover:text-primary">
                              {subcategory.name}
                            </span>
                            {subcategory.description && (
                              <p className="text-xs text-muted-foreground mt-1">{subcategory.description}</p>
                            )}
                            {subcategory.type === 'product' && (
                              <span className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded mt-1">
                                Product
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleAddCategory(category.id)}
                          className="mega-menu-item block p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Add Category</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleAddProduct(category.id)}
                          className="mega-menu-item block p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Add Product</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden p-3 hover:bg-primary/10 transition-all duration-300"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <div className="relative">
          <Menu className={`h-6 w-6 absolute transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`} />
          <X className={`h-6 w-6 absolute transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
          }`} />
        </div>
      </Button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-menu-sidebar fixed top-0 right-0 h-full w-80 bg-background/95 border-l border-border z-50 transform transition-transform duration-300 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2">
            {Array.isArray(categories) && categories.map((category) => (
              <div key={category.id} className="border-b border-border/50 pb-2">
                <button
                  onClick={() => toggleMobileCategory(category.id)}
                  className="mobile-category-item w-full flex items-center justify-between p-3 text-left font-medium hover:bg-primary/5 rounded-lg transition-colors duration-200"
                >
                  {category.name}
                  {category.subcategories.length > 0 && (
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                      expandedMobileCategory === category.id ? 'rotate-180' : ''
                    }`} />
                  )}
                </button>

                {/* Mobile Subcategories */}
                {expandedMobileCategory === category.id && category.subcategories.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory.id}
                        href={subcategory.type === 'category' ? `/category/${subcategory.id}` : `/product/${subcategory.id}`}
                        className="mobile-subcategory-item block p-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          {subcategory.imageUrl && subcategory.type === 'product' && (
                            <img 
                              src={subcategory.imageUrl} 
                              alt={subcategory.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          )}
                          <div>
                            <span>{subcategory.name}</span>
                            {subcategory.type === 'product' && (
                              <span className="inline-block text-xs bg-secondary text-secondary-foreground px-1 py-0.5 rounded ml-2">
                                Product
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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