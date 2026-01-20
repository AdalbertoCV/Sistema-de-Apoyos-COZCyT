export default function NotificationToggle( {buttonNotificationsRef, viewNotifications, setViewNotifications} ){
    return (
        <>
            <a ref={buttonNotificationsRef} className= {`block lg:flex lg:items-center lg:px-4 lg:py-1 cursor-pointer ${viewNotifications ? 'text-[var(--principal-mf)]' : 'text-gray-600'} hover:text-[var(--principal-mf)]`} onClick={() => setViewNotifications(!viewNotifications)}>
                <span className="material-symbols-outlined text-4xl lg:text-3xl">
                  {viewNotifications ? 'notifications_active' : 'notifications'}
                </span>
                <span className="absolute top-3 lg:top-1 flex h-5 w-5">
                    <span className="absolute lg:top-[1px] inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75"></span>
                    <span className="relative lg:top-[4px] w-[13px] h-[13px]  lg:h-[10px] lg:w-[10px] rounded-full bg-red-600 ml-[0.20rem]"></span>
                </span>
            </a>
        </>
    );
}