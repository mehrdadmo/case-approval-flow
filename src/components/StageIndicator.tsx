import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageIndicatorProps {
  stages: Array<{ id: string; label: string; icon: LucideIcon }>;
  currentStage: string;
  onStageClick: (stage: any) => void;
}

export const StageIndicator = ({ stages, currentStage, onStageClick }: StageIndicatorProps) => {
  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = stage.id === currentStage;
          const isCompleted = index < currentIndex;
          const isDisabled = index > currentIndex + 1;

          return (
            <div key={stage.id} className="flex-1 relative">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => !isDisabled && onStageClick(stage.id)}
                  disabled={isDisabled}
                  className={cn(
                    "relative z-10 h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300",
                    "border-2 shadow-md",
                    isActive &&
                      "bg-gradient-to-br from-primary to-accent border-primary scale-110 shadow-lg shadow-primary/30",
                    isCompleted &&
                      "bg-success border-success shadow-success/20",
                    !isActive && !isCompleted && !isDisabled &&
                      "bg-card border-border hover:border-primary/50 hover:scale-105",
                    isDisabled && "bg-muted border-border opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isActive && "text-primary-foreground",
                      isCompleted && "text-success-foreground",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  />
                </button>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive && "text-primary font-semibold",
                      isCompleted && "text-success",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </p>
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="absolute top-7 left-1/2 w-full h-0.5 bg-border -z-0">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      index < currentIndex ? "w-full bg-gradient-to-r from-success to-primary" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
