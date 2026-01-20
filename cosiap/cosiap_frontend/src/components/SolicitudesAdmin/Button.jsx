export default function Button( {nameIcon, text, onClick, buttonRef} ){
    return (
        <div 
            ref={buttonRef}
            className="cursor-pointer select-none flex justify-center items-center space-x-2 text-white bg-[var(--principal-f)] rounded-xl p-2"
            onClick={onClick}
        >
            <span className="material-symbols-outlined">
                {nameIcon}
            </span>
            <span className="text-sm hidden lg:block">
                {text}
            </span>
        </div>
    );
}