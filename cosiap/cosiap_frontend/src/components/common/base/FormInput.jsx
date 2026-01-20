import PropTypes from 'prop-types';
import {ErrorDisplay} from '@/components/common/ui/ErrorDisplay'

export function FormInput({ id, name, type, placeholder, className, register, errors, onChange, isDisabled }) {    
    return (
        <>
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                className={className}
                {...register(name)}
                onChange={onChange}
                disabled={isDisabled}
                
            />
            <ErrorDisplay  errors={errors}/>            
        </>
    );
}

FormInput.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    register: PropTypes.func.isRequired,
    errors: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.string
    ])
};