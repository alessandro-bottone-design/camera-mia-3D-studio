import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-md border px-2 py-0.5 text-xs font-normal transition-colors',
  {
    variants: {
      variant: {
        default: 'border-zinc-700 bg-zinc-900 text-zinc-200',
        active: 'border-zinc-200 bg-zinc-100 text-zinc-950 font-medium',
        muted: 'border-zinc-800 bg-zinc-950 text-zinc-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
