import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload, RefreshCw } from 'lucide-react';
import { buildUploadUrl, buildApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: number;
  title: string;
  description?: string;
  image_filename?: string;
}

interface ProjectCarouselProps {
  projects: Project[];
  title: string;
  onProjectUpdate?: () => void;
}

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects, title, onProjectUpdate }) => {
  const { isAdmin } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, [projects]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Card width + gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleImageUpload = async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/projects/admin/projects/${projectId}/image`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert('Image updated successfully!');
        onProjectUpdate?.();
      } else {
        const errorData = await response.json();
        alert(`Failed to update image: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  const triggerImageUpload = (projectId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(projectId, file);
    };
    input.click();
  };

  if (!projects.length) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-bold text-foreground">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="project-carousel-container">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 project-carousel-scroll"
        >
          {projects.map((project) => (
            <Card
              key={project.id}
              className="project-carousel-item w-80 group hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-soft hover:shadow-pink"
            >
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg relative group">
              {project.image_filename ? (
                <img
                  src={buildUploadUrl(project.image_filename)}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-lg font-medium">{project.title}</span>
                </div>
              )}
              {isAdmin && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => triggerImageUpload(project.id)}
                    className="bg-white/90 hover:bg-white text-black"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {project.image_filename ? 'Replace' : 'Add'}
                  </Button>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold text-foreground mb-2">{project.title}</h4>
              {project.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCarousel;