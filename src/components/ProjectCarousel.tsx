import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/api';


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
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg relative">
              {project.image_filename ? (
                <img
                  src={apiClient.buildUploadUrl(project.image_filename)}
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
