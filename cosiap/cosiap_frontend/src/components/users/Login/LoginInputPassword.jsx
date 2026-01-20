import {FormInputPassword} from '@/components/common/base/FormInputPassword.jsx';
import PropTypes from 'prop-types';

export const LoginInputPassword = ({ name,  placeholder, className, register, errors }) => {  

    return (
        <>
            <FormInputPassword
                id={name}
                name={name}
                placeholder={placeholder}
                className={`customInputsButtons block w-full rounded-tr-2xl bg-[var(--pagina-fondo)] border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-[var(--principal-f)] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--principal-mf)] sm:text-sm sm:leading-6 ${className}`}
                register={register}
                errors={errors}
            />
            <img src="http://localhost:5173/src/assets/IconsImg/password.svg" className={`absolute left-3 top-1/2 transform ${errors ? "-translate-y-[93%]" : "-translate-y-1/2"} w-5 h-5`} />
        </>
    );
};

LoginInputPassword.propTypes = {    
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