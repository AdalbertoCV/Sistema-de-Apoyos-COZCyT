


export default function ModalConfirmation( {nameIcon, title, description, children} ){
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-55">
            <div className="bg-white p-5 rounded-lg flex flex-col max-w-[95%]">
                <div className="flex">
                    <div className="flex flex-col justify-center mr-4">
                        <span className="material-symbols-outlined text-6xl">
                            {nameIcon}
                        </span>
                    </div>
                    <div className="flex flex-col sm:max-w-sm space-y-3">
                        <h1 className="font-semibold text-2xl sm:text-3xl ">
                            {title}
                        </h1>
                        <p className="font-medium text-lg">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex justify-around mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
}