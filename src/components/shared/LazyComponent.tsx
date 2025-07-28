import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded"></div>,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isInView ? children : fallback}
    </div>
  );
};

export default LazyComponent;