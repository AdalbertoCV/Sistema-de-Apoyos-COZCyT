export default function MenuColumnas( {columnas, columnasOcultas, setColumnasOcultas, menuRef} ){
    // Función para manejar la selección/deselección de columnas
    const handleToggleColumn = (key) => {
        if (columnasOcultas.includes(key)) {
            // Si la columna está oculta, quitarla de la lista
            setColumnasOcultas(columnasOcultas.filter(col => col !== key));
        } else {
            // Si la columna no está oculta, agregarla a la lista
            setColumnasOcultas([...columnasOcultas, key]);
        }
    };

    // Función para ocultar todas las columnas
    const handleHideAll = () => {
        // Agrega todas las claves de columnas a columnasOcultas
        setColumnasOcultas(Object.keys(columnas));
    };

    // Función para mostrar todas las columnas
    const handleShowAll = () => {
        // Limpia la lista de columnas ocultas
        setColumnasOcultas([]);
    };
    
    return (
        <>
            <div ref={menuRef} className="absolute right-4 lg:right-6 w-[60%] sm:w-3/12 lg:w-1/6 mt-[7.8rem] sm:mt-[9rem] lg:mt-[8.5rem] z-10">
                <div className="space-y-5 px-2 pb-3 pt-2 h-80 bg-white mt-2 rounded-2xl shadow-gray-500 shadow-2xl">
                    <div className="flex justify-between text-sm px-2">
                        <div className="flex">
                            <a 
                                className="cursor-pointer text-[var(--principal-mf)]"
                                onClick={handleHideAll}
                            >
                                Ocultar todas
                            </a>
                        </div>
                        <div className="flex">
                            <a 
                                className="cursor-pointer text-[var(--principal-mf)]"
                                onClick={handleShowAll}
                            >
                                Mostrar todas
                            </a>
                        </div>
                    </div>
                    <div className="flex-row overflow-y-auto h-64 space-y-3 px-3 uppercase font-semibold">
                        {Object.entries(columnas).map(([key, value], index) => (
                            (!['solicitante__ap_materno','solicitante__ap_paterno'].includes(key) && (
                                <div key={key} className="flex justify-start text-sm">
                                    <label className="inline-flex items-center me-5 cursor-pointer">
                                    <input type="checkbox"
                                        checked={!columnasOcultas.includes(key)} // Mostrar el checkbox marcado si la columna no está oculta
                                        onChange={() => handleToggleColumn(key)} // Maneja el cambio al seleccionar/deseleccionar
                                        className="sr-only peer"
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--principal-mf)]"></div>
                                    </label>
                                    <span className="">
                                        {key === 'modalidad__nombre' ? "Modalidad" : key === 'solicitante__nombre' ? "Solicitante" : key === 'timestamp' ? "Fecha" : value}
                                    </span>
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}