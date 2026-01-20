import PropTypes from 'prop-types';
import { ErrorDisplay } from '@/components/common/ui/ErrorDisplay';

export function FormSelect({ id, name, options, className, register, errors, onChange, isDisabled, value}) {
    return (
        <>
            <select
                id={id}
                name={name}
                className={className}
                {...register(name)}
                onChange={onChange}
                disabled={isDisabled}
                value={value}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ErrorDisplay errors={errors} />
        </>
    );
}

FormSelect.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    className: PropTypes.string,
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    register: PropTypes.func.isRequired,
    errors: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
};