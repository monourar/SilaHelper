import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'surface' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'surface',
  interactive = false,
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-white/80 backdrop-blur-xl border border-white/90 shadow-glass',
    elevated: 'bg-white/90 backdrop-blur-2xl border border-white shadow-glass-hover',
    subtle: 'bg-white/50 backdrop-blur-md border border-white/70 shadow-glass-sm',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer active:scale-[0.985] transition-all duration-150 ease-out'
    : '';

  return (
    <div
      className={`rounded-2xl md:rounded-3xl ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
