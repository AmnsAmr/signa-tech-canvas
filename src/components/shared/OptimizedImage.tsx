import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  critical?: boolean;
  width?: number;
  height?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  critical = false,
  width,
  height
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(critical);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (critical || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [critical]);

  const handleLoad = () => setLoaded(true);

  return (
    <img
      ref={imgRef}
      src={inView ? src : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjwvc3ZnPg=='}
      alt={alt}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      onLoad={handleLoad}
      loading={critical ? 'eager' : 'lazy'}
      decoding="async"
      width={width}
      height={height}
      style={{ contentVisibility: 'auto' }}
    />
  );
};

export default React.memo(OptimizedImage);