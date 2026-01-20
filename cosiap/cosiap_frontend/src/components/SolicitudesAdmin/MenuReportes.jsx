
export default function MenuReportes( {reportes, reporteAplicado, enableSectionReportes, setEnableSectionReportes, setReporteAplicado, menuRef, setViewMenu} ){
    const handleActionCreateReport = () => {
        setViewMenu(false); //Ocultamo este menu
        setEnableSectionReportes(true); //Mostramos la sección de reportes
        setReporteAplicado(null)
    };

    return (
        <>
            <div ref={menuRef} className="absolute right-4 lg:right-60 w-[60%] sm:w-3/12 lg:w-1/6 mt-[7.8rem] sm:mt-[9rem] lg:mt-[8.5rem] z-10">
                <div className="space-y-2 px-2 pb-3 pt-2 bg-white mt-2 rounded-2xl shadow-gray-500 shadow-2xl  ring-1 ring-[var(--principal-f)]">
                    <div className="flex text-center text-sm p-2 border-b-2 border-gray-400 text-gray-500">
                        <div className="flex flex-col space-y-2 overflow-y-auto max-h-32">
                            {reportes.length === 0 ? (
                                <span className="font-semibold">
                                    No hay reportes registrados. Crea uno nuevo.
                                </span>

                            ) : (
                                reportes.map((reporte, key) => (
                                    <div 
                                        key={key} 
                                        className="flex space-x-2 items-center justify-start hover:bg-gray-300 hover:text-black cursor-pointer p-1"
                                        onClick={() => {setReporteAplicado(reporte), setViewMenu(false)}}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            settings
                                        </span>
                                        <span className="font-semibold text-start break-words overflow-hidden text-ellipsis whitespace-normal">
                                            {reporte.nombre}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div 
                        className="flex items-center h-auto px-2 py-1 font-medium space-x-2 hover:bg-[var(--principal-mc)] hover:font-bold cursor-pointer text-[var(--principal-mf)]"
                        onClick={handleActionCreateReport}
                    >
                        <span className="material-symbols-outlined text-sm">
                            add
                        </span>
                        <span className="p-0 text-sm">
                            Nuevo Reporte
                        </span>
                        
                    </div>
                </div>
            </div>
        </>
    );
}