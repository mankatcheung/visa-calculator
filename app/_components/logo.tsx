import { cn } from '@/lib/utils';

interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn('size-8', className)}
      role="img"
      aria-hidden="true"
    >
      <rect width={512} height={512} rx={96} className="fill-primary" />
      <rect x={160} y={140} width={32} height={72} rx={16} className="fill-primary-foreground" />
      <rect x={320} y={140} width={32} height={72} rx={16} className="fill-primary-foreground" />
      <rect
        x={120}
        y={180}
        width={272}
        height={232}
        rx={28}
        className="fill-primary-foreground"
      />
      <rect x={120} y={236} width={272} height={12} className="fill-primary" />
      <path
        d="M188 330 L232 374 L338 268"
        className="stroke-primary"
        strokeWidth={30}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export function Logo({ className, iconClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoIcon className={cn('size-6 shrink-0', iconClassName)} />
      <span className="font-semibold text-sm">Visa Tracker</span>
    </div>
  );
}
