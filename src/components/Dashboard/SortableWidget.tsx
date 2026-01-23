import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  className?: string; // Allow passing grid column spans
}

export function SortableWidget({ id, children, isEditMode, className }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? 'relative' as const : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group h-full", 
        className,
        isDragging && "opacity-50 scale-95",
        isEditMode && "border-2 border-dashed border-primary/20 rounded-xl hover:border-primary/50 transition-colors"
      )}
    >
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-50 p-1 bg-background/80 backdrop-blur rounded cursor-grab active:cursor-grabbing hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {children}
    </div>
  );
}
