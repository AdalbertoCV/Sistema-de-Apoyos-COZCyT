import { useState, useRef, useEffect } from "react";
import NavbarBrand from "@/components/common/layouts/LayoutsNavigation/Navbar/NavbarBrand";
import NavbarLinks from "@/components/common/layouts/LayoutsNavigation/Navbar/NavbarLinks";
import MobileMenuToggle from "@/components/common/layouts/LayoutsNavigation/MobileMenuToggle";
import MobileMenu from "@/components/common/layouts/LayoutsNavigation/Navbar/MobileMenu";
import NotificationToggle from "@/components/common/layouts/LayoutsNavigation/NotificationToggle";
import Notifications from "@/components/common/layouts/LayoutsNavigation/Navbar/Notifications";

export default function Navbar({ linksItems, viewMenu, setViewMenu }) {
    
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
            <nav className="z-50 uppercase static left-0 inset-y-0">
                {/* Contenedor de gradiente para pantallas pequeñas */}
                <div className="fixed z-10 h-[3.8rem] lg:h-[3.1rem] w-full bg-gradient-to-r from-[var(--principal-mf)] via-[var(--principal)] to-[var(--principal-c)] p-1"></div>

                {/* Contenedor principal del navbar */}
                <div className="z-10 fixed top-0 left-0 right-0 flex items-center justify-between bg-[#E1E1E1]">
                    <div className="relative flex items-center sm:items-stretch justify-start">
                        {/* Marca del navbar */}
                        <NavbarBrand />

                        {/* Enlaces del navbar */}
                        <NavbarLinks
                            linksItems={linksItems}
                            notificationsToggle={
                                <NotificationToggle
                                    buttonNotificationsRef={buttonNotificationsRef}
                                    viewNotifications={viewNotifications}
                                    setViewNotifications={setViewNotifications}
                                />
                            }
                        />
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
                </div>

                {/* Renderizado condicional del menú móvil */}
                {viewMenu && <MobileMenu menuRef={menuRef} linksItems={linksItems} />}
                
                {/* Renderizado condicional de las notificaciones */}
                {viewNotifications && <Notifications notificationsRef={notificationsRef} />}
            </nav>
        </>
    );
}
