import {FormInput} from '@/components/common/base/FormInput.jsx';
import PropTypes from 'prop-types';
import { useState } from 'react';

export const FormInputPassword = ({ name,  placeholder, className, register, errors }) => {  
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const switchShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <>
            <FormInput
                id={name}
                name={name}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className={className}
                register={register}
                errors={errors}
                onChange={handleInputChange}
            />
            {inputValue && (
                <img
                    src={showPassword ? "http://localhost:5173/src/assets/IconsImg/Eye.svg" : "http://localhost:5173/src/assets/IconsImg/EyeOff.svg"}
                    className={`cursor-pointer absolute right-3 top-1/2 transform ${errors ? "-translate-y-6" : "-translate-y-1/2"} w-5 h-5`}
                    onClick={switchShowPassword}
                />
            )}
            
        </>
    );
};

FormInputPassword.propTypes = {    
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