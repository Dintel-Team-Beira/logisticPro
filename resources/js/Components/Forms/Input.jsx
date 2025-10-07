import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    helper,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                    {label}
                    {props.required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute -translate-y-1/2 left-3 top-1/2">
                        <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full px-3.5 py-2.5 border rounded-lg text-slate-900 text-sm
                        ${Icon ? 'pl-10' : ''}
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
                        }
                        placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-offset-0
                        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                        transition-colors duration-200
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {helper && !error && (
                <p className="mt-1.5 text-xs text-slate-500">{helper}</p>
            )}
            {error && (
                <p className="mt-1.5 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
