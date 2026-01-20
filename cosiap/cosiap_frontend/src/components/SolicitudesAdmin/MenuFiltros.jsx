import { useEffect, useState } from "react";
import { Range } from 'react-range';

export default function MenuFiltros({ filtros, setFiltros, columnasOcultas, menuRef, solicitudes }) {
    const [mostrarSubmenu, setMostrarSubmenu] = useState(null); // Se guarda el nombre de la columna activa.
    const [submenuData, setSubmenuData] = useState([]); // Datos específicos del submenu.

    const handleArrowClick = (filtro) => {
        if (mostrarSubmenu === filtro.campo) {
            setMostrarSubmenu(null); // Si ya está abierto, lo cerramos.
        } else {
            setMostrarSubmenu(filtro.campo); // Abrimos el submenu correspondiente.
            setSubmenuData(filtro); // Guardamos la información del filtro activo.
        }
    };

    //Funcion que elimina todos los filtros
    const handleDeleteAllFilters = () => {
        //Cierro el submenu si se encuentra abierto
        setMostrarSubmenu(null);
        // Mapea todos los filtros y resetea sus valores según el tipo de filtro
        const resetedFilters = filtros.map((filtro) => {
            if (hasFilter(filtro)) {
                if (filtro.html_type === "numberInput" || filtro.html_type === "dateInput") {
                    // Resetea filtros numéricos y de fecha
                    return { ...filtro, lookups: { gte: null, lte: null } };
                } else if (filtro.html_type === "textInput") {
                    if (filtro.lookups.icontains){
                        //Reseteo filtros de cadenas de texto
                        return { ...filtro, lookups: { icontains: null } };
                    }
                    if (filtro.lookups.iexact) {
                        //Reseteo filtros de choices
                        return { ...filtro, lookups: { iexact: null } };
                    }
                    // Resetea filtros de texto
                    return { ...filtro, lookups: { icontains: null, iexact: null } };
                }
            }
            return filtro; // Si no tiene filtro, lo retorna sin modificar
        });
    
        // Actualiza el estado de todos los filtros con los valores reseteados
        setFiltros(resetedFilters);
    };

    //Funcion para comprobar si una columna tiene filtros
    const hasFilter = (filtro) => {
        if ((filtro.html_type === "numberInput") || (filtro.html_type === "dateInput")) {
            if ((filtro.lookups.gte === null) && (filtro.lookups.lte === null)){
                return false;
            }else{
                return true;
            }
        } else if (filtro.html_type === "textInput") {
            if ((filtro.lookups.icontains === null) || (filtro.lookups.iexact === null)){
                return false;
            }else{
                return true;
            }
        }
    }

    const updateFilterValue = (campo, newLookups) => {
        const updatedFiltros = filtros.map((filter) => {
            if (filter.campo === campo) {
                return { ...filter, lookups: newLookups }; // Actualiza únicamente los lookups.
            }
            return filter;
        });
        setFiltros(updatedFiltros);
    };

    return (
        <>
            <div ref={menuRef} className="absolute right-4 sm:right-24 lg:right-32 w-44 lg:w-56 mt-[7.8rem] sm:mt-[9rem] lg:mt-[8.5rem] z-10 h-auto">
                <div className="space-y-5 px-2 pb-3 pt-2 h-auto bg-white mt-2 rounded-2xl shadow-gray-500 shadow-2xl">
                    <div className="text-sm text-start px-2">
                        <a className="cursor-pointer text-[var(--principal-mf)]" onClick={() => handleDeleteAllFilters()}>
                            Eliminar filtros
                        </a>
                    </div>
                    <div className="flex-row max-h-44 space-y-4 px-3 uppercase font-semibold relative overflow-y-auto">
                        {filtros.map((filtro, key) => (
                            (!columnasOcultas.includes(filtro.campo) && !['solicitante__ap_materno','solicitante__ap_paterno'].includes(filtro.campo)) && (
                                <div 
                                    key={key} 
                                    className={`relative flex cursor-pointer select-none justify-between text-sm ${mostrarSubmenu === filtro.campo && "bg-slate-200"}`}
                                    onClick={() => handleArrowClick(filtro)} // Pasamos el filtro completo.
                                >
                                    <div className="flex items-center">
                                        <span 
                                            className="material-symbols-outlined text-sm text-[var(--principal-mf)]"
                                        >
                                            {mostrarSubmenu === filtro.campo ? "arrow_forward_ios" : "arrow_back_ios"}
                                        </span>
                                    </div>
                                    <div className="grow text-end mx-2 items-center">
                                        <span>
                                            {filtro.campo === 'modalidad__nombre' ? "Modalidad" : filtro.campo === 'solicitante__nombre' ? "Solicitante" : filtro.campo === 'timestamp' ? "Fecha" : filtro.label}
                                        </span> 
                                    </div>
                                    {
                                        hasFilter(filtro) ? (
                                            <div className="flex items-center">
                                                <span className="material-symbols-outlined text-red-400 text-sm">
                                                    target
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center w-3 h-3">
                                                
                                            </div>
                                        )
                                    }
                                    
                                </div>
                            )
                        ))}
                    </div>
                    {/* Submenú que aparece cuando se da click en la flecha */}
                    {mostrarSubmenu !== null && (
                        <SubMenuFiltros filtro={submenuData} updateFilterValue={updateFilterValue} solicitudes={solicitudes}/>
                    )}
                </div>
            </div>
        </>
    );
}

function SubMenuFiltros({ filtro, updateFilterValue, solicitudes, }) {

    const handleDeleteFilter = (filtro) => {

        //Borramos sus campos dependiendo del filtro
        if (filtro.html_type === "numberInput") {
            updateFilterValue(filtro.campo, { gte: null, lte: null });
        } else if ((filtro.html_type === "textInput") && (filtro.lookups.icontains !== undefined)) {
            updateFilterValue(filtro.campo, { icontains: null });
        } else if ((filtro.html_type === "textInput") && (filtro.lookups.iexact !== undefined)) {
            updateFilterValue(filtro.campo, { iexact: null });
        } else if (filtro.html_type === "dateInput") {
            updateFilterValue(filtro.campo, { gte: null, lte: null });
        }
    };

    return (
        <div className="absolute right-[11.4rem] lg:right-[14.5rem] top-2 w-auto h-auto shadow-gray-500 z-50">
            <div className="space-y-5 px-2 py-2 max-w-44 w-44 lg:max-w-52 lg:w-52 max-h-56 h-auto bg-white mt-2 rounded-2xl shadow-2xl">
                <div className="flex-row w-auto space-y-3">
                    <div className="flex justify-center items-center text-sm font-semibold uppercase text-[var(--principal-mf)]">
                    {filtro.campo === 'modalidad__nombre' ? "Modalidad" : filtro.campo === 'solicitante__nombre' ? "Solicitante" : filtro.campo === 'timestamp' ? "Fecha" : filtro.label}
                    </div>
                    <div className="flex-row">
                        {filtro.html_type === "numberInput" && (
                            <MultiRangeSliderSelection filtro={filtro} updateFilterValue={updateFilterValue} solicitudes={solicitudes} handleDeleteFilter={handleDeleteFilter} />
                        )}
                        {filtro.html_type === "textInput" && filtro.lookups.icontains !== undefined && (
                            <ContainsFilterSelection filtro={filtro} updateFilterValue={updateFilterValue} handleDeleteFilter={handleDeleteFilter} />
                        )}
                        {filtro.html_type === "textInput" && filtro.lookups.iexact !== undefined && (
                            <ChoicesSelection filtro={filtro} updateFilterValue={updateFilterValue} handleDeleteFilter={handleDeleteFilter} />
                        )}
                        {filtro.html_type === "dateInput" && (
                            <DateSelection filtro={filtro} updateFilterValue={updateFilterValue} handleDeleteFilter={handleDeleteFilter} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const MultiRangeSliderSelection = ({ filtro, updateFilterValue, solicitudes, handleDeleteFilter }) => {
    // Obtenemos el valor máximo del campo específico en las solicitudes
    const maxValue = Math.max(...solicitudes.map((solicitud) => solicitud[filtro.campo]));
    // Obtenemos el valor mínimo del campo específico en las solicitudes
    const minValue = Math.min(...solicitudes.map((solicitud) => solicitud[filtro.campo]));

    // Estado para almacenar los valores del rango
    const [values, setValues] = useState([(minValue !== maxValue ? minValue : 0), maxValue]);

    // Efecto para actualizar el estado cuando el filtro cambie
    useEffect(() => {
        setValues([filtro.lookups.gte || (minValue !== maxValue ? minValue : 0 ), filtro.lookups.lte || maxValue]);
    }, [filtro, minValue, maxValue]);

    // Función para manejar el cambio de valores en el rango
    const handleRangeChange = (newValues) => {
        setValues(newValues); // Actualizamos el estado local del slider
        // Actualizamos los valores en el filtro
        //Si los dos valores son el valor minimo y maximo
        if ((minValue === maxValue ? (newValues[0] === 0) : (newValues[0] === minValue)) && newValues[1] === maxValue) {
            //Estableceremos valores nulos, ya que se tomara que no se hiso ningun filtro
            updateFilterValue(filtro.campo, { gte: null, lte: null });
        } else {
            // Actualizamos los valores en el filtro
            updateFilterValue(filtro.campo, { gte: newValues[0], lte: newValues[1]});
        }
    };

    // Función para eliminar los filtros y restablecer los valores del rango
    const handleDeleteFilterAndValues = (filtro) => {
        handleDeleteFilter(filtro); // Elimina el filtro y sus valores
        // Restablece los valores del rango a sus valores mínimos y máximos
        setValues([(minValue !== maxValue ? minValue : 0), maxValue]);
    };

    return (
        <>
            <div className="flex flex-col">
                <div className="flex justify-center mb-1">
                    <span className="text-sm font-semibold">Selecciona rango</span>
                </div>
                <div className="flex justify-between text-sm font-semibold mb-3">
                    {/* Mostramos los valores seleccionados */}
                    <span>{values[0]}</span>
                    <span>{values[1]}</span>
                </div>
            </div>
            <div className="flex-col w-full">
                <Range
                    step={1} // Define el tamaño de paso del slider
                    min={minValue === maxValue ? 0 : minValue} // Valor mínimo
                    max={maxValue} // Valor máximo
                    values={values} // El valor actual del slider
                    onChange={handleRangeChange} // Función que se llama cuando cambian los valores
                    renderTrack={({ props, children }) => (
                        <div
                            className="flex h-2 w-[90%] bg-gray-200 mx-2 rounded-lg"
                            {...props}
                            style={{
                                ...props.style,
                            }}
                        >
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div
                            className="flex h-4 w-4 rounded-full bg-[var(--principal-c)]"
                            {...props}
                            style={{
                                ...props.style,
                            }}
                        />
                    )}
                />
            </div>
            <div className="flex justify-center">
                <a
                    className="text-sm text-[var(--principal-mf)] font-semibold cursor-pointer"
                    onClick={() => handleDeleteFilterAndValues(filtro)}
                >
                    Eliminar Filtro
                </a>
            </div>
        </>
    );
};


const ChoicesSelection = ({ filtro, updateFilterValue, handleDeleteFilter }) => {
    // Estado para almacenar los valores seleccionados.
    const [selectedValues, setSelectedValues] = useState(filtro.lookups.iexact || []);
    
    // Efecto para actualizar el estado cuando el filtro cambie
    useEffect(() => {
        setSelectedValues(filtro.lookups.iexact || []);
    }, [filtro]);
    // Función para manejar cambios en los checkboxes.
    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;

        // Si el checkbox está marcado, agregamos el valor al arreglo.
        if (checked) {
            setSelectedValues((prevValues) => [...prevValues, value]);
        } else {
            // Si está desmarcado, eliminamos el valor del arreglo.
            setSelectedValues((prevValues) =>
                prevValues.filter((v) => v !== value)
            );
        }
    };

    // Cuando los valores seleccionados cambien, actualizamos los lookups en el filtro.
    useEffect(() => {
        updateFilterValue(filtro.campo, { iexact: (selectedValues.length > 0 ? selectedValues : null) }); // Si no hay ninguna opción seleccionada, devolvemos un null
    }, [selectedValues]);

    const handleDeleteFilterAndValues = (filtro) => {
        handleDeleteFilter(filtro); // Elimina el filtro y sus valores
        //Eliminamos los valores actuales
        setSelectedValues([]);
    }

    return (
        <>
            <div className="overflow-y-auto max-h-36 p-2 space-y-2">
                {filtro.choices.map((choice) => (
                    <div key={choice.value} className="flex items-center text-sm">
                        <input
                            type="checkbox"
                            id={`checkbox-${choice.value}`}
                            value={choice.value}
                            onChange={handleCheckboxChange}
                            checked={selectedValues.includes(choice.value)} 
                            className="h-2 w-2 rounded border-gray-400 text-[var(--principal-f)] focus:ring-[var(--principal-f)]"
                        />
                        <label htmlFor={`checkbox-${choice.value}`} className="ml-2 font-semibold">
                            {choice.label}
                        </label>
                    </div>
                ))}
            </div>
            <div className="flex justify-center">
                <a 
                    className="text-sm text-[var(--principal-mf)] font-semibold cursor-pointer"
                    onClick={() => handleDeleteFilterAndValues(filtro)}
                >
                    Eliminar Filtro
                </a>
            </div>
        </>
    );
};

const ContainsFilterSelection = ({ filtro, updateFilterValue, handleDeleteFilter }) => {
    const [inputValue, setInputValue] = useState(filtro.lookups.icontains || ''); // Estado local para el valor del input.

    // Efecto para actualizar el estado cuando el filtro cambie
    useEffect(() => {
        setInputValue(filtro.lookups.icontains || '');
    }, [filtro]);

    const handleInputChange = (event) => {
        const { value } = event.target;
        setInputValue(value); // Actualizamos el valor del input.
        // Actualizamos el filtro con el valor ingresado.
        //Si la cadena esta vacia
        updateFilterValue(filtro.campo, { ...filtro.lookups, icontains: value.trim() === "" || value === " " ? null : value} ); // Si no hay ninguna opción seleccionada, devolvemos un null
    };

    const handleDeleteFilterAndValues = (filtro) => {
        //Eliminamos el filtro realizado del arreglo principal
        handleDeleteFilter(filtro);
        //Reestablecemos los valores
        setInputValue("");
    }

    return (
        <> 
            <div className="flex-col space-y-1">
                <div className="flex text-center text-sm mx-2 font-semibold">
                    Ingresa el texto a filtrar de este campo
                </div>
                <div className="flex">

                </div>
                
                <input
                    type="text"
                    name="icontains"
                    value={inputValue} // El valor controlado es el del estado local.
                    onChange={handleInputChange} // Manejador de cambios.
                    placeholder="Ingresa"
                    className="border-[var(--principal-mf)] rounded-xl w-full focus:ring-2 focus:ring-[var(--principal-mf)]"
                />
            </div>
            <div className="flex justify-center">
                <a 
                    className="text-sm text-[var(--principal-mf)] font-semibold cursor-pointer"
                    onClick={() => handleDeleteFilterAndValues(filtro)}
                >
                    Eliminar Filtro
                </a>
            </div>
        </>
    );
};

const DateSelection = ({ filtro, updateFilterValue, handleDeleteFilter }) => {
    const [startDate, setStartDate] = useState(filtro.lookups.gte); // Fecha de inicio
    const [endDate, setEndDate] = useState(filtro.lookups.lte);     // Fecha de fin

    // Actualizamos los filtros cada vez que cambien las fechas de inicio o fin.
    useEffect(() => {
        if (startDate !== "" && endDate !== "") {
            updateFilterValue(filtro.campo, { gte: startDate, lte: endDate});
        }
    }, [startDate, endDate]);

    // Maneja el cambio de la fecha de inicio
    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        // Solo actualiza si la fecha de inicio es menor o igual que la fecha de fin
        if (!endDate || selectedDate <= endDate) {
            setStartDate(selectedDate);
        }
        if(selectedDate === ""){ //Si limpia el campo, se borra el estado
            setEndDate("");
        }
    };

    const handleDeleteFilterAndValues = (filtro) => {
        handleDeleteFilter(filtro); // Elimina el filtro y sus valores
        //Eliminamos los valores actuales
        setStartDate("");
        setEndDate("");
    }

    // Maneja el cambio de la fecha de fin
    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        // Solo actualiza si la fecha de fin es mayor o igual que la fecha de inicio
        if (!startDate || selectedDate >= startDate) {
            setEndDate(selectedDate);
        }
        if(selectedDate === ""){ //Si limpia el campo, se borra el estado
            setEndDate("");
        }
    };

    return (
        <>
            <div className="flex flex-col space-y-2 justify-center">
                <div className="flex">
                    <input
                        type="date"
                        id="datepicker-range-start"
                        name="gte"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[var(--principal-f)] focus:border-[var(--principal-f)] w-full ps-5 lg:ps-10 px-2"
                    />
                </div>
                <div className="flex justify-center">
                    <span className="font-semibold">a</span>
                </div>
                <div className="flex">
                    <input
                        type="date"
                        id="datepicker-range-end"
                        name="lte"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[var(--principal-f)] focus:border-[var(--principal-f)] ps-5 lg:ps-10 w-full px-2"
                    />
                </div>
            </div>
            <div className="flex justify-center">
                <a 
                    className="text-sm text-[var(--principal-mf)] font-semibold cursor-pointer"
                    onClick={() => handleDeleteFilterAndValues(filtro)}
                >
                    Eliminar Filtro
                </a>
            </div>
        </>
    );
};
