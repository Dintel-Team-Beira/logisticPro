import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    error,
    helper,
    options = [],
    placeholder = 'Selecione uma opção',
    className = '',
    children,
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
                <select
                    ref={ref}
                    className={`
                        w-full px-3.5 py-2.5 pr-10 border rounded-lg text-slate-900 text-sm appearance-none
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-0
                        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                        transition-colors duration-200
                        ${className}
                    `}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}

                    {/* Se tiver children, usa children. Senão, usa options */}
                    {children ? children : options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none text-slate-400 right-3 top-1/2" />
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

Select.displayName = 'Select';

export default Select;
