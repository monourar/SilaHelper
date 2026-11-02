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
    surface: 'bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-xl border border-white/90 shadow-glass shadow-inner-glow',
    elevated: 'bg-gradient-to-b from-white/95 via-white/85 to-white/75 backdrop-blur-2xl border border-white shadow-glass-hover shadow-inner-glow',
    subtle: 'bg-gradient-to-b from-white/50 to-white/35 backdrop-blur-md border border-white/70 shadow-glass-sm',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer active:scale-[0.985] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:from-white/90 hover:to-white/75 hover:shadow-glass-hover'
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
