import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        block w-full rounded-lg border-gray-300
                        shadow-sm
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-all duration-200
                        ${Icon ? 'pl-10' : 'pl-3'}
                        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
