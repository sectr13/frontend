import { Icon } from "@workspace/ui/composed/icon";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" icon={icon} />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="mt-1 text-muted-foreground text-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
