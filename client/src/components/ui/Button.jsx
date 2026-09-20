import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const VARIANT_STYLES = {
  primary: 'bg-cyan text-navy hover:bg-cyan/90 border border-transparent',
  outline: 'bg-transparent text-navy border border-cyan hover:bg-cyan/10',
  ghost: 'bg-transparent text-navy border border-transparent hover:bg-cyan/10',
  outlineDark: 'bg-transparent text-text-primary border border-cyan hover:bg-cyan/10 hover:text-cyan',
};

const SIZE_STYLES = {
  sm: 'h-9 px-4 text-xs gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-[52px] px-8 text-base gap-2.5',
};

export function getButtonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `
    inline-flex items-center justify-center
    rounded-full font-semibold
    transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2
    ${VARIANT_STYLES[variant]}
    ${SIZE_STYLES[size]}
    ${className}
  `;
}


export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    loading = false,
    disabled = false,
    className = '',
    ...rest 
}) {
    const [isPinging, setIsPinging] = useState(false);

    const isDisabled = disabled || loading;

    return (
        <button
        disabled={isDisabled}
        onMouseEnter={() => !isDisabled && setIsPinging(true)}
        className={`
            relative inline-flex items-center justify-center
            rounded-full font-semibold
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2
            overflow-hidden
            ${VARIANT_STYLES[variant]}
            ${SIZE_STYLES[size]}
            ${className}
        `}
        {...rest}
        >
        {isPinging && (
            <motion.span
            key={Date.now()}
            initial={{ scale: 0.4, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setIsPinging(false)}
            className="absolute inset-0 rounded-full bg-cyan/40 pointer-events-none"
            />
        )}

        {loading ? (
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
        ) : (
            Icon && <Icon size={size === 'sm' ? 14 : 18} />
        )}

        <span className="relative z-10">{children}</span>
        </button>
    );

}