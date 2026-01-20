import PropTypes from 'prop-types';
import { FormInput } from "@/components/common/base/FormInput";

export default function Label_InputForm( {label, id, name, type, placeholder, className, register, errors, onChange, isDisabled} ) {
    return (
        <div className="flex flex-col space-y-2 select-none w-full">
            <label className="font-semibold text-sm ">{label}</label>
            <FormInput 
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                className={`disabled:bg-gray-300 focus:ring-1 focus:ring-inset focus:ring-[var(--principal-f)] border-none rounded-lg text-sm min-w-56 ${className}`}
                register={register}
                onChange={onChange}
                isDisabled={isDisabled}
                errors={errors}
            />
        </div>
    );
}

Label_InputForm.PropTypes = {
    label: PropTypes.string.isRequired,
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
}

