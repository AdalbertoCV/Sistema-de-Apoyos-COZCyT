import PropTypes from 'prop-types';
import { FormSelect } from "@/components/common/base/FormSelect";

export default function Label_SelectForm({ label, id, name, options, className, register, errors, onChange, isDisabled, value }) {
    return (
        <div className="flex flex-col space-y-2 select-none w-full">
            <label className="font-semibold text-sm">{label}</label>
            <FormSelect 
                id={id}
                name={name}
                options={options}
                className={`disabled:bg-gray-300 focus:ring-1 focus:ring-inset focus:ring-[var(--principal-f)] border-none rounded-lg text-sm min-w-56 ${className}`}
                register={register}
                value={value}
                onChange={onChange}
                isDisabled={isDisabled}
                errors={errors}
            />
        </div>
    );
}

Label_SelectForm.propTypes = {
    label: PropTypes.string.isRequired,
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
