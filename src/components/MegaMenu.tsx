import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, Plus, Edit, Settings, Trash2, MoreVertical, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import CacheInvalidation from '@/utils/cacheInvalidation';
import './MegaMenu.css';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  type: 'product';
}

interface Subdirectory {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  type: 'category';
  products: Product[];
}

interface TopDirectory {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  type: 'category';
  subdirectories: Subdirectory[];
}

interface MegaMenuProps {
  isScrolled: boolean;
}

const MegaMenu = ({ isScrolled }: MegaMenuProps) => {
  const [topDirectories, setTopDirectories] = useState<TopDirectory[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<'category' | 'product'>('category');
  const [parentId, setParentId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedItemForImage, setSelectedItemForImage] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Force fresh data by bypassing cache with timestamp
      const response = await apiClient.get(`/api/menu?t=${Date.now()}`);
      setTopDirectories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
      setTopDirectories([]);
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

  const handleAddTopDirectory = () => {
    setParentId(null);
    setAddType('category');
    setNewItemName('');
    setEditingItem(null);
    setShowAddDialog(true);
  };

  const handleAddSubdirectory = (topDirId: string) => {
    setParentId(topDirId);
    setAddType('category');
    setNewItemName('');
    setEditingItem(null);
    setShowAddDialog(true);
  };

  const handleAddProduct = (subdirId: string) => {
    setParentId(subdirId);
    setAddType('product');
    setNewItemName('');
    setEditingItem(null);
    setShowAddDialog(true);
  };

  const handleSubmitNewItem = async () => {
    if (!newItemName.trim()) return;

    try {
      if (editingItem) {
        await apiClient.put(`/api/menu/admin/categories/${editingItem.id}`, {
          name: newItemName.trim(),
          parentId: editingItem.parentId,
          type: editingItem.type,
          displayOrder: 0
        });
        toast({
          title: 'Success',
          description: `${editingItem.type === 'category' ? 'Directory' : 'Product'} updated successfully`
        });
      } else {
        const data = {
          name: newItemName.trim(),
          parentId: parentId,
          type: addType,
          displayOrder: 0
        };
        await apiClient.post('/api/menu/admin/categories', data);
        toast({
          title: 'Success',
          description: `${addType === 'category' ? (parentId ? 'Subdirectory' : 'Top Directory') : 'Product'} added successfully`
        });
      }
      
      setShowAddDialog(false);
      setNewItemName('');
      setEditingItem(null);
      // Clear all caches and force immediate refresh
      CacheInvalidation.clearMenuCache();
      await fetchMenuData();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingItem ? 'Failed to update item' : `Failed to add ${addType}`,
        variant: 'destructive'
      });
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setAddType(item.type);
    setParentId(item.parentId || null);
    setShowAddDialog(true);
  };

  const handleDeleteItem = async (itemId: string, itemType: string) => {
    const confirmMsg = itemType === 'category' 
      ? 'Are you sure you want to delete this directory? This will also delete all subdirectories and products.' 
      : 'Are you sure you want to delete this product?';
    
    if (!confirm(confirmMsg)) return;

    try {
      await apiClient.delete(`/api/menu/admin/categories/${itemId}`);
      toast({
        title: 'Success',
        description: `${itemType === 'category' ? 'Directory' : 'Product'} deleted successfully`
      });
      // Clear all caches and force immediate refresh after deletion
      CacheInvalidation.clearMenuCache();
      if (itemType === 'product') {
        CacheInvalidation.clearProductCache(itemId);
      } else {
        CacheInvalidation.clearCategoryCache(itemId);
      }
      await fetchMenuData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${itemType}`,
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = (item: any) => {
    setSelectedItemForImage(item);
    setShowImageDialog(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedItemForImage) return;

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
      formData.append('categoryId', selectedItemForImage.id);

      const response = await apiClient.post('/api/menu/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });

      setShowImageDialog(false);
      CacheInvalidation.clearMenuCache();
      await fetchMenuData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (item: any) => {
    if (!confirm('Are you sure you want to remove this image?')) return;

    try {
      await apiClient.delete(`/api/menu/admin/remove-image/${item.id}`);
      toast({
        title: 'Success',
        description: 'Image removed successfully'
      });
      CacheInvalidation.clearMenuCache();
      await fetchMenuData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive'
      });
    }
  };

  // Don't render anything if still loading
  if (isLoading) {
    return null;
  }

  // Ensure topDirectories is always an array
  const safeTopDirectories = Array.isArray(topDirectories) ? topDirectories : [];
  
  // Don't render if no directories and user is not admin
  if (safeTopDirectories.length === 0 && !isAdmin) {
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
                onClick={handleAddTopDirectory}
                className="category-card bg-green-100 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-200 transition-all duration-200 rounded-lg p-1 w-[80px] h-[60px] flex items-center justify-center group"
              >
                <Plus className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="ml-1 text-xs font-medium text-green-600">Add</span>
              </button>
            )}
            {safeTopDirectories.map((topDir) => (
              <div
                key={topDir.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(topDir.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="category-card bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-500 hover:shadow-md transition-all duration-200 rounded-lg p-1 w-[80px] h-[60px] flex items-center justify-center cursor-pointer group">
                  <span className="text-xs font-medium text-center leading-tight text-gray-900 group-hover:text-black transition-colors">
                    {topDir.name}
                  </span>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 hover:bg-gray-50 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-50">
                        <DropdownMenuItem onClick={() => handleEditItem(topDir)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Directory
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddSubdirectory(topDir.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subdirectory
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteItem(topDir.id, 'category')}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Directory
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Subdirectories Dropdown Menu */}
                {activeDropdown === topDir.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-40 min-w-[300px] max-w-[500px]"
                    onMouseEnter={() => handleMouseEnter(topDir.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{topDir.name}</h3>
                      {topDir.subdirectories.length > 0 ? (
                        <div className="space-y-3">
                          {topDir.subdirectories.map((subdir) => (
                            <div key={subdir.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-800">{subdir.name}</h4>
                                {isAdmin && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem onClick={() => handleEditItem(subdir)}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleAddProduct(subdir.id)}>
                                        <Plus className="h-3 w-3 mr-2" />
                                        Add Product
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteItem(subdir.id, 'category')}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              {subdir.products.length > 0 ? (
                                <div className="space-y-1">
                                  {subdir.products.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                      <a
                                        href={`/product/${product.id}`}
                                        className="text-sm text-gray-700 hover:text-gray-900 flex-1"
                                      >
                                        {product.name}
                                      </a>
                                      {isAdmin && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-2">
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-32">
                                            <DropdownMenuItem onClick={() => handleEditItem(product)}>
                                              <Edit className="h-3 w-3 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                              onClick={() => handleDeleteItem(product.id, 'product')}
                                              className="text-red-600"
                                            >
                                              <Trash2 className="h-3 w-3 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">No products yet</p>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => handleAddProduct(subdir.id)}
                                  className="w-full text-left p-2 mt-2 text-xs border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded transition-colors"
                                >
                                  <Plus className="h-3 w-3 inline mr-2 text-gray-600" />
                                  Add Product
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No subdirectories yet</p>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleAddSubdirectory(topDir.id)}
                          className="w-full text-left p-2 mt-3 text-sm border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded transition-colors"
                        >
                          <Plus className="h-3 w-3 inline mr-2 text-gray-600" />
                          Add Subdirectory
                        </button>
                      )}
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
            {isAdmin && safeTopDirectories.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No directories yet</p>
                <Button size="sm" onClick={handleAddTopDirectory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Directory
                </Button>
              </div>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTopDirectory}
                className="w-full mb-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Top Directory
              </Button>
            )}
            {safeTopDirectories.map((topDir) => (
              <div key={topDir.id} className="border border-border rounded-lg">
                <button
                  onClick={() => toggleMobileCategory(topDir.id)}
                  className="w-full flex items-center justify-between p-3 text-left font-medium hover:bg-primary/5 rounded-lg transition-colors duration-200"
                >
                  {topDir.name}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    expandedMobileCategory === topDir.id ? 'rotate-180' : ''
                  }`} />
                </button>

                {expandedMobileCategory === topDir.id && (
                  <div className="border-t border-border p-3 space-y-2">
                    {topDir.subdirectories.map((subdir) => (
                      <div key={subdir.id} className="border border-gray-200 rounded p-2">
                        <div className="font-medium text-sm mb-1">{subdir.name}</div>
                        {subdir.products.map((product) => (
                          <a
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="block p-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-primary/5 rounded transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            • {product.name}
                          </a>
                        ))}
                        {isAdmin && (
                          <button
                            onClick={() => handleAddProduct(subdir.id)}
                            className="w-full text-left p-1 mt-1 text-xs border border-dashed border-gray-300 hover:bg-primary/5 rounded transition-colors"
                          >
                            <Plus className="h-3 w-3 inline mr-1" />
                            Add Product
                          </button>
                        )}
                      </div>
                    ))}
                    {isAdmin && (
                      <button
                        onClick={() => handleAddSubdirectory(topDir.id)}
                        className="w-full text-left p-2 text-sm border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded transition-colors duration-200"
                      >
                        <Plus className="h-3 w-3 inline mr-2" />
                        Add Subdirectory
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${editingItem.type === 'category' ? 'Directory' : 'Product'}` : 
               `Add New ${addType === 'category' ? (parentId ? 'Subdirectory' : 'Top Directory') : 'Product'}`}
              {parentId && !editingItem && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  to {topDirectories.find(d => d.id === parentId)?.name || 
                      topDirectories.flatMap(d => d.subdirectories).find(s => s.id === parentId)?.name || 'directory'}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {addType === 'category' ? (parentId ? 'Subdirectory' : 'Directory') : 'Product'} Name
              </label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${addType === 'category' ? (parentId ? 'subdirectory' : 'directory') : 'product'} name`}
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
                {editingItem ? 'Update' : 
                 `Add ${addType === 'category' ? (parentId ? 'Subdirectory' : 'Directory') : 'Product'}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Manage Image for {selectedItemForImage?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItemForImage?.imageUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Image:</p>
                <div className="relative">
                  <img 
                    src={`/uploads/${selectedItemForImage.imageUrl}`} 
                    alt={selectedItemForImage.name}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveImage(selectedItemForImage)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {selectedItemForImage?.imageUrl ? 'Replace Image:' : 'Upload Image:'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-2 border rounded-lg"
                disabled={uploadingImage}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MegaMenu;