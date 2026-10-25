import { clsx } from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
}

const sizeMap = {
  sm: 'text-heading-md',
  md: 'text-heading-xl',
  lg: 'text-display-md',
};

export default function Logo({ size = 'md', variant = 'dark', className }: LogoProps) {
  return (
    <div
      className={clsx(
        'font-heading font-bold tracking-wider select-none inline-flex items-center',
        sizeMap[size],
        variant === 'dark' ? 'text-ink' : 'text-ivory',
        className
      )}
    >
      <span className="inline-block tracking-[0.14em] uppercase font-bold">OOTD</span>
      <span className="inline-block text-cognac font-heading font-medium tracking-wide">
        -Nan
      </span>
    </div>
  );
}
