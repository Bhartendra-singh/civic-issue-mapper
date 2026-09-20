import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    icon: Icon,
    error,
    type = 'text',
    id,
    className = '',
    ...rest
  },
  ref
) {
  const isTextarea = type === 'textarea';
  const Element = isTextarea ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        )}

        <Element
          ref={ref}
          id={id}
          type={isTextarea ? undefined : type}
          rows={isTextarea ? 4 : undefined}
          className={`
            w-full rounded-xl border bg-white
            text-sm text-ink placeholder:text-text-muted
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-light
            ${Icon ? 'pl-11' : 'pl-4'} pr-4
            ${isTextarea ? 'py-3 resize-none' : 'h-11'}
            ${error ? 'border-status-open focus:border-status-open focus:ring-status-open/30' : 'border-gray-200'}
            ${className}
          `}
          {...rest}
        />
      </div>

      {error && (
        <span className="text-xs text-status-open">{error}</span>
      )}
    </div>
  );
});

export default Input;