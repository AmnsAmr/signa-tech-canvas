import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api';

interface Subcategory {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

interface MegaMenuProps {
  isScrolled: boolean;
}

const MegaMenu = ({ isScrolled }: MegaMenuProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await apiClient.get('/api/menu');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    }
  };

  const handleMouseEnter = (categoryId: number) => {
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

  const toggleMobileCategory = (categoryId: number) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      {/* Desktop Mega Menu */}
      <div className="hidden md:flex items-center space-x-1 relative">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={handleMouseLeave}
          >
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

            {/* Mega Menu Dropdown */}
            {activeDropdown === category.id && category.subcategories.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[300px] max-w-[600px]"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">{category.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory.id}
                        href="#"
                        className="block p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200"
                      >
                        <span className="font-medium text-foreground hover:text-primary">
                          {subcategory.name}
                        </span>
                      </a>
                    ))}
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
      <div className={`fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 transform transition-transform duration-300 md:hidden ${
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
            {categories.map((category) => (
              <div key={category.id} className="border-b border-border/50 pb-2">
                <button
                  onClick={() => toggleMobileCategory(category.id)}
                  className="w-full flex items-center justify-between p-3 text-left font-medium hover:bg-primary/5 rounded-lg transition-colors duration-200"
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
                        href="#"
                        className="block p-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subcategory.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MegaMenu;