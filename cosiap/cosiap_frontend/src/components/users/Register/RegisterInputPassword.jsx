import {FormInputPassword} from '@/components/common/base/FormInputPassword.jsx';
import PropTypes from 'prop-types';

export const RegisterInputPassword = ({ name,  placeholder, className, register, errors }) => {  

    return (
        <>
            <FormInputPassword
                id={name}
                name={name}
                placeholder={placeholder}
                className={`customInputsButtons block w-full rounded-tr-2xl bg-[#F6F2F2] border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-[var(--principal-f)] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--principal-mf)] sm:text-sm sm:leading-6 ${className}`}
                register={register}
                errors={errors}
            />
        </>
    );
};

RegisterInputPassword.propTypes = {    
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    register: PropTypes.func.isRequired,
    errors: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.string
    ])
};