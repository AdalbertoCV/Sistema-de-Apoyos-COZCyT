import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarLinks( {linksItems} ) {
    const navigate = useNavigate();
    const [viewSubMenuHelp, setViewSubMenuHelp] = useState(false);

    return (
        // Si existe linksItems, mapea cada uno para generar enlaces
        linksItems ? (
            linksItems.map((item) => (
                <>
                    {/* Enlace principal de cada ítem del menú */}
                    <a key={item.nameItem}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm font-semibold cursor-pointer 
                            ${item.isSelected || (viewSubMenuHelp && item.nameItem === 'Ayuda') 
                                ? 'border-l-4 border-[var(--principal-f)] text-[var(--principal-mf)]' 
                                : 'hover:border-l-4 hover:border-[var(--principal-f)] hover:text-[var(--principal-mf)]'}`}
                        onClick={() => {
                            // Si el ítem es "Ayuda", alterna la visibilidad del submenú
                            if (item.nameItem === 'Ayuda') {
                                setViewSubMenuHelp(!viewSubMenuHelp);
                            }else{
                                navigate(item.navigate);
                            }
                        }}
                    >
                        <span className="material-symbols-outlined">
                            {item.nameIcon} {/* Icono del ítem */}
                        </span>
                        <span>
                            {item.nameItem} {/* Nombre del ítem */}
                        </span>
                        {
                            // Si el ítem es "Ayuda" y tiene un submenú, muestra el ícono de dropdown y se intercala dependiendo si esta abierto o no
                            item.nameItem === 'Ayuda' && item.subMenu && item.subMenu.length > 0 && (
                                <div className="flex w-full flex-row-reverse">
                                    <span className="material-symbols-outlined">
                                        {viewSubMenuHelp ? 'arrow_drop_up' : 'arrow_drop_down'} {/* Ícono para desplegar el submenú */}
                                    </span>
                                </div>
                            )
                        }
                    </a>
                    {
                        // Si el ítem es "Ayuda" y tiene un submenú, renderiza el submenú
                        item.nameItem === 'Ayuda' && item.subMenu && item.subMenu.length > 0 && (
                            <SubMenuAyuda viewSubMenuHelp={viewSubMenuHelp} items={item.subMenu} />
                        )
                    }
                </>
            ))
        ) : '' // Si no hay linksItems, no se muestra nada
    );
}

// Componente para renderizar el submenú de "Ayuda"
function SubMenuAyuda({ viewSubMenuHelp, items }) {
    const navigate = useNavigate();
    return (
        // Si el submenú está visible, mapea sus ítems para generar enlaces
        viewSubMenuHelp && (
            items.map((item) => (
                <a key={item.nameItem} className={`ml-8 flex space-x-3 px-3 py-1 text-base font-semibold 
                    ${item.isSelected ? 'cursor-pointer text-[var(--principal-mf)] border-l-4 border-[var(--principal-f)]' 
                                      : 'cursor-pointer hover:text-[var(--principal-mf)] hover:border-l-4 hover:border-[var(--principal-f)]'}`}
                    onClick={() => navigate(item.navigate)}
                    >
                    <span>
                        {item.nameItem} {/* Nombre del ítem del submenú */}
                    </span>
                </a>
            ))
        )
    );
}