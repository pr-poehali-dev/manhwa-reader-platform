import { useEffect, useRef, useState } from 'react';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export default function ProtectedImage({ src, alt, className, onLoad }: ProtectedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.floor(Math.random() * 3) - 1;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      setIsLoading(false);
      if (onLoad) onLoad();
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    img.src = src;
  }, [src, onLoad]);

  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventDragStart = (e: DragEvent) => e.preventDefault();
    const preventSelection = (e: Event) => e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('contextmenu', preventContextMenu);
    canvas.addEventListener('dragstart', preventDragStart);
    canvas.addEventListener('selectstart', preventSelection);

    return () => {
      canvas.removeEventListener('contextmenu', preventContextMenu);
      canvas.removeEventListener('dragstart', preventDragStart);
      canvas.removeEventListener('selectstart', preventSelection);
    };
  }, []);

  return (
    <div className="relative select-none">
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'transparent',
          zIndex: 1,
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-sm text-muted-foreground">Загрузка...</span>
        </div>
      )}
    </div>
  );
}
