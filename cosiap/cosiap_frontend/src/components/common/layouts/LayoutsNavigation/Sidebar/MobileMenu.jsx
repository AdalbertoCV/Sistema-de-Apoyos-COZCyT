import { useState, useEffect, useRef } from "react";
import SidebarLinks from "@/components/common/layouts/LayoutsNavigation/Sidebar/SidebarLinks";
import SidebarBrand from "@/components/common/layouts/LayoutsNavigation/Sidebar/SidebarBrand";
import { useAutenticacion } from '@/components/common/utility/Autenticador';

export default function MobileMenu({ menuRef, linksItems }) {
    const {cerrarSesion} = useAutenticacion();
    const [viewSubMenuHelp, setViewSubMenuHelp] = useState(false);
    const firstContainerRef = useRef(null);

    // Función para ajustar la altura del primer contenedor
    const adjustHeight = () => {
        if (firstContainerRef.current && menuRef.current) {
            const menuHeight = menuRef.current.clientHeight;
            firstContainerRef.current.style.height = `${menuHeight}px`;
        }
    };

    // Monitorear cambios en el DOM y en la visibilidad del submenú
    useEffect(() => {
        adjustHeight();

        // Agregar un observer para monitorear cambios en el DOM
        const observer = new MutationObserver(adjustHeight);
        if (menuRef.current) {
            observer.observe(menuRef.current, { childList: true, subtree: true });
        }

        // Monitorear cambios en la visibilidad del submenú
        const handleResize = () => adjustHeight();
        window.addEventListener('resize', handleResize);

        return () => {
            if (menuRef.current) {
                observer.disconnect();
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [menuRef, linksItems, viewSubMenuHelp]);

    return (
        <>
            {/* Primer contenedor que se ajusta a la altura del segundo */}
            <div 
                ref={firstContainerRef} 
                className="lg:hidden fixed z-10 flex rounded-br-[7rem] mt-[3.6rem] min-w-[16.3rem] left-0 bg-gradient-to-b from-[var(--principal-mf)] via-[var(--principal)] to-[var(--principal-c)] shadow-gray-400 shadow-xl">
            </div>
            
            {/* Segundo contenedor que se adapta a su contenido */}
            <div 
                ref={menuRef} 
                className="lg:hidden fixed z-20 flex rounded-br-[7rem] mt-[3.5rem] min-w-[16rem] left-0 h-auto top-0 bg-[#E1E1E1]">
                
                <div className="flex-1 space-y-8 flex-wrap w-full h-auto my-4 mx-4">
                    <div className="flex-1 flex-wrap space-y-2 overflow-y-auto max-h-screen">
                        <SidebarLinks 
                            linksItems={linksItems} 
                            viewSubMenuHelp={viewSubMenuHelp} 
                            setViewSubMenuHelp={setViewSubMenuHelp}
                        />
                    </div>

                    {/* Enlace de cerrar sesión */}
                    <a className="cursor-pointer mr-14 flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-semibold border-2 border-[var(--principal-f)] text-[var(--principal-mf)] hover:text-white hover:bg-[var(--principal-f)]"
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
        </>
    );
}
