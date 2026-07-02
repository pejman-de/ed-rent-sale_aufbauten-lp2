import { useState, useRef, useEffect } from "react";
import { ChevronsLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Fahrgestell (Rohzustand)",
  afterLabel = "Fertiger Aufbau",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Clean up listeners
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-[4/3] select-none overflow-hidden rounded-2xl border border-brand-grey/10 shadow-2xl group cursor-ew-resize"
    >
      {/* Before Image (Chassis) - Left Side / Base */}
      <img
        src={beforeImage}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute bottom-4 left-4 rounded-lg border border-white/20 bg-brand-navy/65 p-3 text-white backdrop-blur-md text-xs font-semibold uppercase tracking-wider z-10">
        {beforeLabel}
      </div>

      {/* After Image (Finished Truck) - Right Side / Clip Path */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{
          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
        }}
      >
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.getBoundingClientRect().width }}
        />
        <div className="absolute bottom-4 right-4 rounded-lg border border-white/20 bg-brand-navy/65 p-3 text-white backdrop-blur-md text-xs font-bold uppercase tracking-wider z-10">
          {afterLabel}
        </div>
      </div>

      {/* Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-brand-cyan z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-brand-cyan text-brand-navy rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg shadow-brand-cyan/20 transition-transform duration-200 ${
            isDragging ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          <ChevronsLeftRight className="h-6 w-6" />
        </div>
      </div>

      {/* Hint Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-brand-navy/65 text-white text-[10px] px-3 py-1.5 uppercase tracking-widest pointer-events-none rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Slider ziehen
      </div>
    </div>
  );
}
