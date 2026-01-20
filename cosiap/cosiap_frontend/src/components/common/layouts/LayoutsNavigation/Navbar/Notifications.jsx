import { useRef, useEffect } from "react";

export default function Notifications( {notificationsRef} ){

    return (
        <>
            <div ref={notificationsRef} className="fixed z-50 right-4 lg:right-36 w-[90%] sm:w-2/3 lg:w-1/3 mt-[3.8rem] lg:mt-11">
                <div className="space-y-1 px-2 pb-3 pt-2 h-32 bg-[#E1E1E1] mt-2 rounded-3xl shadow-gray-500 shadow-2xl">
                    
                </div>
            </div>
        </>
    );
}