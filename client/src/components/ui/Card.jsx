import { motion } from 'framer-motion';

const PADDING_STYLES = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  padding = 'md',
  pulse = false,
  onClick,
  className = '',
  ...rest
}) {
  const isClickable = Boolean(onClick);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e)
          : undefined
      }
      className={`
        group relative bg-white rounded-2xl
        border border-gray-200
        hover:border-cyan/50 hover:shadow-lg hover:shadow-cyan-dim
        transition-colors duration-200
        ${isClickable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2' : ''}
        ${PADDING_STYLES[padding]}
        ${className}
      `}
      {...rest}
    >
      {pulse && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60 group-hover:opacity-100" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
        </span>
      )}

      {children}
    </motion.div>
  );
}