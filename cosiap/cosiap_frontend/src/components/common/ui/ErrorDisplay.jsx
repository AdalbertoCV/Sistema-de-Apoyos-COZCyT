import PropTypes from 'prop-types';


export const ErrorDisplay = ({ errors }) => {    
    if (!errors) return null;

    return (
        <div className="error-display break-words text-[var(--error-f)] text-sm mt-1 text-center">
            {renderErrors(errors)}
        </div>
    );
};

const renderErrors = (errors) => {
    if (typeof errors === 'string') {
        return <p>{errors}</p>;
    } else if (Array.isArray(errors)) {
        return errors.map((error, index) => <p key={index}>{error}</p>);
    } else if (typeof errors === 'object' && !Array.isArray(errors)) {
        return Object.values(errors).map((errorList, index) => (            
            <div key={index}>
                {errorList.map((error, idx) => <p key={idx}>{error}</p>)}
            </div>
        ));
    }
};

ErrorDisplay.propTypes = {
    errors: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.string
    ])
};

export default ErrorDisplay;