import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings2, RotateCcw, Check, LayoutGrid } from 'lucide-react';
import { useDashboardStore, widgetLabels } from '@/stores/dashboardStore';
import { Badge } from '@/components/ui/badge';

export function DashboardControls() {
  const { 
    isEditMode, 
    toggleEditMode, 
    hiddenWidgets, 
    toggleWidgetVisibility, 
    resetLayout 
  } = useDashboardStore();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        onClick={toggleEditMode}
        className="gap-2"
      >
        {isEditMode ? <Check className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        {isEditMode ? 'Guardar' : 'Editar Diseño'}
      </Button>

      {isEditMode && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Widgets
                {hiddenWidgets.length > 0 && (
                  <Badge variant="secondary" className="px-1 h-5 min-w-5 flex items-center justify-center">
                    {hiddenWidgets.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mostrar/Ocultar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(widgetLabels).map(([id, label]) => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={!hiddenWidgets.includes(id)}
                  onCheckedChange={() => toggleWidgetVisibility(id)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetLayout}
            className="text-muted-foreground hover:text-destructive"
            title="Restablecer diseño predeterminado"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
