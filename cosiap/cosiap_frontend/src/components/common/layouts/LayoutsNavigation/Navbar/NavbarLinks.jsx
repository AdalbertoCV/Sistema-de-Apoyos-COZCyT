import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAutenticacion } from '@/components/common/utility/Autenticador';

export default function NavbarLinks({ linksItems, notificationsToggle }) {
    const {cerrarSesion} = useAutenticacion();
    const navigate = useNavigate();
    // Estado para controlar la visibilidad del submenú de ayuda
    const [viewMenuHelp, setViewMenuHelp] = useState(false);

    // Referencias para el botón de ayuda y el menú de ayuda
    const menuHelpRef = useRef(null);
    const buttonHelpRef = useRef(null);

    // Efecto para manejar clics fuera del menú de ayuda y cerrar el menú si ocurre un clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            // Si se hace clic fuera del botón de ayuda y del menú de ayuda, se cierra el menú
            if (menuHelpRef.current && !menuHelpRef.current.contains(event.target) &&
                buttonHelpRef.current && !buttonHelpRef.current.contains(event.target)) {
                setViewMenuHelp(false);
            }
        }

        // Añadir el event listener para manejar clics fuera del menú
        document.addEventListener("mousedown", handleClickOutside);
        
        // Remover el event listener cuando el componente se desmonte
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            
            {/* Contenedor principal de los enlaces en pantallas grandes */}
            <div className="z-10 fixed sm:ml-6 lg:block lg:w-full lg:bg-[#E1E1E1]">
                <div className="hidden lg:flex flex-row-reverse space-x-4 mr-8">
                    <div className="flex z-0">
                        {
                            // Renderizado de los elementos del menú principal
                            linksItems ? (
                                linksItems.map((item, key) => (
                                    <div key={item.nameItem} className="flex items-center">
                                        <a
                                            ref={item.nameItem === 'Ayuda' ? buttonHelpRef : null}
                                            className={item.isSelected || (item.nameItem === 'Ayuda' && viewMenuHelp) 
                                                ? "cursor-pointer px-4 py-2 text-base font-semibold border-b-2 border-[var(--principal-mf)] text-[var(--principal-mf)] flex items-center space-x-2 group"
                                                : "cursor-pointer px-4 py-2 text-base font-semibold text-gray-600 hover:border-b-2 hover:border-[var(--principal-mf)] hover:text-[var(--principal-mf)] flex items-center space-x-2 group"}
                                            onClick={() => {
                                                // Al hacer clic en 'Ayuda', alternar la visibilidad del submenú
                                                if (item.nameItem === 'Ayuda') {
                                                    setViewMenuHelp(!viewMenuHelp);
                                                }else{
                                                    navigate(item.navigate)
                                                }
                                            }}
                                        >
                                            {/* Ícono y nombre del elemento */}
                                            <span className="material-symbols-outlined">
                                                {item.nameIcon}
                                            </span>
                                            <span>{item.nameItem}</span>
                                        </a>
                                    </div>
                                ))
                            ) : ''
                        }

                        {/* Componente de notificaciones pasado como prop */}
                        <div className="flex">
                            {notificationsToggle}
                        </div>

                        {/* Enlace para cerrar sesión */}
                        <div className="flex items-center">
                            <a 
                                className="cursor-pointer px-2 py-1 text-base font-semibold rounded-md text-[var(--principal-mf)] border-2 border-[var(--principal-f)] hover:bg-[var(--principal-f)] hover:text-white flex items-center space-x-2"
                                onClick={cerrarSesion}
                            >
                                <span className="material-symbols-outlined">
                                    logout
                                </span>
                                <span>Cerrar sesión</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Renderizado condicional del submenú de 'Ayuda' */}
                {viewMenuHelp && (
                    <div ref={menuHelpRef} className="p-3 absolute right-[22rem] z-10 w-36 origin-top-right rounded-md bg-[#E1E1E1] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {
                            // Verifica si 'Ayuda' tiene un submenú y lo renderiza
                            linksItems.find(item => item.nameItem === 'Ayuda').subMenu ? (
                                linksItems.find(item => item.nameItem === 'Ayuda').subMenu.map((subItem, key) => (
                                    <div key={key} className={`mb-2 ${subItem.isSelected ? "border-l-4 border-[var(--principal-f)] " : "hover:border-l-4 hover:border-[var(--principal-f)] "}`}>
                                        <a
                                            className={subItem.isSelected ? "cursor-pointer block px-4 py-2 text-sm font-semibold text-[var(--principal-mf)]" : "cursor-pointer block px-4 py-2 text-sm hover:font-semibold text-gray-700 hover:text-[var(--principal-mf)]"}
                                            onClick={() => navigate(subItem.navigate)}
                                        >
                                            {subItem.nameItem}
                                        </a>
                                    </div>
                                ))
                            ) : 'No hay elementos'
                        }
                    </div>
                )}
            </div>
        </>
    );
}
