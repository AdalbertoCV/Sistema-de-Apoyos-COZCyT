import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileMenuToggle from "@/components/common/layouts/LayoutsNavigation/MobileMenuToggle";
import NotificationToggle from "@/components/common/layouts/LayoutsNavigation/NotificationToggle";
import SidebarLinks from "@/components/common/layouts/LayoutsNavigation/Sidebar/SidebarLinks";
import SidebarBrand from "@/components/common/layouts/LayoutsNavigation/Sidebar/SidebarBrand";
import Notifications from "@/components/common/layouts/LayoutsNavigation/Sidebar/Notifications";
import MobileMenu from "@/components/common/layouts/LayoutsNavigation/Sidebar/MobileMenu";
import { useAutenticacion } from '@/components/common/utility/Autenticador';
import { apiUrl } from "@/api";
import useColor from "@/components/useColor";

export default function Sidebar( {linksItems, viewMenu, setViewMenu} ){
    const {cerrarSesion} = useAutenticacion();
    const navigate = useNavigate();
    const colors = useColor();
    // Estado para controlar la visibilidad de las notificaciones
    const [viewNotifications, setViewNotifications] = useState(false);

    // Referencias para los botones de menú y la sección del menú
    const buttonMenuRef = useRef(null);
    const menuRef = useRef(null);

    // Referencias para los botones de notificaciones y la sección de notificaciones
    const buttonNotificationsMobileRef = useRef(null);
    const buttonNotificationsRef = useRef(null);
    const notificationsRef = useRef(null);

    // Efecto para manejar los clics fuera de los menús y notificaciones
    useEffect(() => {
        function handleClickOutside(event) {
            // Cierra el menú si se hace clic fuera de él y de su botón de toggle
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonMenuRef.current && !buttonMenuRef.current.contains(event.target)) {
                setViewMenu(false);
            }

            // Cierra las notificaciones si se hace clic fuera de ellas y de sus botones de toggle
            if (notificationsRef.current && !notificationsRef.current.contains(event.target) &&
                buttonNotificationsRef.current && !buttonNotificationsRef.current.contains(event.target) &&
                buttonNotificationsMobileRef.current && !buttonNotificationsMobileRef.current.contains(event.target)) {
                setViewNotifications(false);
            }
        }

        // Añade el event listener para detectar clics fuera de los elementos
        document.addEventListener("mousedown", handleClickOutside);

        // Remueve el event listener cuando el componente se desmonte
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>        
        <aside className="z-50 uppercase static left-0 inset-y-0">
            {/* Contenedor gradiente de parte superior */}
            <div className="fixed z-10 h-[3.8rem] lg:h-11 w-full bg-gradient-to-r from-[var(--principal-mf)] via-[var(--principal)] to-[var(--principal-c)] lg:shadow-gray-400 lg:shadow-lg p-1">
            
            </div>
            {/* Contenedor de parte superior */}
            <div className="fixed z-20 right-0 left-0 top-0 h-14 lg:h-10 w-full bg-[#E1E1E1]">
                <div className="relative flex items-center justify-center lg:justify-end">
                    <div className="flex lg:hidden px-2 m-2 items-center cursor-pointer"
                        onClick={() => navigate('/inicio')}>
                        <img src={`${apiUrl}${colors.logo}`} className="w-9 h-9 mr-2"/>
                        <div className="text-[var(--principal-mf)] text-4xl font-extrabold">
                            cosiap
                        </div>
                    </div>
                    {/* Contenedor para los toggles del menú móvil y notificaciones en pantallas pequeñas */}
                    <div className="flex w-full lg:hidden h-full items-center space-x-5 justify-end mx-6">
                        {/* Toggle de notificaciones para móviles */}
                        <NotificationToggle
                            buttonNotificationsRef={buttonNotificationsMobileRef}
                            viewNotifications={viewNotifications}
                            setViewNotifications={setViewNotifications}
                        />
                        {/* Toggle del menú móvil */}
                        <MobileMenuToggle
                            buttonMenuRef={buttonMenuRef}
                            viewMenu={viewMenu}
                            setViewMenu={setViewMenu}
                        />
                    </div>
                    <div className="hidden lg:flex w-full h-full space-x-5 justify-end mr-16 lg:ml-[16%]">
                        <NotificationToggle
                            buttonNotificationsRef={buttonNotificationsRef}
                            viewNotifications={viewNotifications}
                            setViewNotifications={setViewNotifications}
                        />
                    </div>
                </div>
            </div>

            <div className="lg:fixed z-10 rounded-br-[7rem] lg:w-[17.3%] left-0 top-0 h-0 lg:h-full bg-gradient-to-b from-[var(--principal-mf)] via-[var(--principal)] to-[var(--principal-c)] shadow-gray-400 shadow-xl"></div>

            <div className="hidden z-30 lg:flex rounded-br-[7rem] lg:fixed lg:w-[17%] left-0 inset-y-0 bg-[#E1E1E1]">
                <div className="flex-1 space-y-8 flex-wrap w-full h-auto my-4 mx-4">
                    <div className="flex-1 flex-wrap">
                        <SidebarBrand />
                    </div>

                    <div className="flex-1 flex-wrap space-y-2 overflow-y-auto max-h-screen">
                        <SidebarLinks linksItems={linksItems}/>
                    </div>

                    {/* Enlace de cerrar sesión */}
                    <a className="cursor-pointer flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-semibold border-2 border-[var(--principal-f)] text-[var(--principal-mf)] hover:text-white hover:bg-[var(--principal-f)]"
                        onClick={cerrarSesion}
                    >
                        <span className="material-symbols-outlined">
                            logout {/* Icono del ítem */}
                        </span>
                        <span>
                            Cerrar sesión {/* Nombre del ítem */}
                        </span>
                    </a>
                </div>
            </div>
            {/* Renderizado condicional del menú móvil */}
            {viewMenu && <MobileMenu menuRef={menuRef} linksItems={linksItems} />}
                
            {/* Renderizado condicional de las notificaciones */}
            {viewNotifications && <Notifications notificationsRef={notificationsRef} />}
        </aside>
        </>
    );
}