import { useState, useEffect } from "react";

export default function Alert({ message, type, duration, isVisible, setIsVisible }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false); // Oculta la alerta después de la duración
            }, duration);

            return () => clearTimeout(timer); // Limpia el temporizador cuando el componente se desmonta
        }
    }, [isVisible, duration, setIsVisible]);

    return (
        <div
            className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 rounded-lg shadow-lg text-white z-50
                transition-all duration-300 ease-in-out ring-2 text-center min-w-[80%] lg:min-w-[33%] ${
                    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }
                ${type === "success" ? "bg-[var(--exito)] ring-[var(--exito-f)] text-[var(--secundario-mf)]" 
                    : type === "error" ? "bg-[var(--error)] ring-[var(--error-f)] text-white" 
                    : "bg-[var(--precaucion)] ring-[var(--precaucion-f)] text-[var(--secundario-mf)]"}`}
        >
            <div className="flex justify-between">
                <div className="flex">
                    <span className="material-symbols-outlined font-bold">
                        {type === 'success' ? 'task_alt': type === 'error' ? 'error': 'warning' }
                    </span>
                </div>
                <div className="flex">
                    <span>
                        {message}
                    </span>
                </div>
                <div className="flex">
                    <span

                        onClick={() => setIsVisible(false)}  // Cerrar la alerta al hacer clic
                        className="material-symbols-outlined cursor-pointer font-bold"
                    >
                        close
                    </span>
                </div>
            </div>
        </div>
    );
}
