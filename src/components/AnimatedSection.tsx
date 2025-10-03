import { useEffect, useRef, useState, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  className = ''
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const getAnimationClass = () => {
    const baseClass = 'transition-all ease-out';
    const durationClass = `duration-[${duration}ms]`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return `${baseClass} ${durationClass} opacity-0 translate-y-8`;
        case 'fade-down':
          return `${baseClass} ${durationClass} opacity-0 -translate-y-8`;
        case 'fade-left':
          return `${baseClass} ${durationClass} opacity-0 translate-x-8`;
        case 'fade-right':
          return `${baseClass} ${durationClass} opacity-0 -translate-x-8`;
        case 'scale':
          return `${baseClass} ${durationClass} opacity-0 scale-95`;
        case 'fade':
          return `${baseClass} ${durationClass} opacity-0`;
        default:
          return `${baseClass} ${durationClass} opacity-0`;
      }
    }
    
    return `${baseClass} ${durationClass} opacity-100 translate-x-0 translate-y-0 scale-100`;
  };

  return (
    <div ref={ref} className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
}
