import { apiUrl } from "@/api";

export default function ModalidadInfoContainer( {imagen, nombre, descripcion, monto_maximo, children} ) {
    return (
        <>
            
            <div className="flex-wrap rounded-[2.5rem] bg-[#E3E3E3] min-h-96 pb-2 justify-center">
                {/* Contenedor de la imagen de modalidad */}
                <div className="relative w-full h-56 lg:h-80 rounded-t-[2.5rem] overflow-hidden">
                    <img 
                        src={`${apiUrl + imagen}`} 
                        alt="Modalidad" 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gray-600 bg-opacity-75 rounded-t-[2.5rem]"></div>
                    <div className="absolute flex flex-col items-center justify-center top-[10%] space-y-4 lg:space-y-8 w-full text-center text-white">
                        
                        <span className="text-base lg:text-xl font-semibold uppercase"
                            style={{
                                textShadow: `
                                1px 1px 0 black, 
                                -1px 1px 0 black, 
                                1px -1px 0 black, 
                                -1px -1px 0 black,
                                2px 2px 0 black, 
                                -2px 2px 0 black, 
                                2px -2px 0 black, 
                                -2px -2px 0 black
                                `
                            }} 
                        >
                            Modalidad:
                        </span>
                        
                        <span className="text-lg lg:text-2xl uppercase font-bold font-sans break-words whitespace-normal overflow-hidden text-ellipsis px-4 max-w-full"
                            style={{
                                textShadow: `
                                1px 1px 0 #B91C1C, 
                                -1px 1px 0 #B91C1C, 
                                1px -1px 0 #B91C1C, 
                                -1px -1px 0 #B91C1C,
                                2px 2px 0 #B91C1C, 
                                -2px 2px 0 #B91C1C, 
                                2px -2px 0 #B91C1C, 
                                -2px -2px 0 #B91C1C
                                `
                            }}    
                        >
                            "{nombre}"
                        </span>
                        
                        <span className="text-base lg:text-lg font-semibold break-words whitespace-normal overflow-hidden text-ellipsis px-4 max-w-full"
                            style={{
                                textShadow: `
                                0.5px 0.5px 0 black, 
                                -0.5px 0.5px 0 black, 
                                0.5px -0.5px 0 black, 
                                -0.5px -0.5px 0 black,
                                1px 1px 0 black, 
                                -1px 1px 0 black, 
                                1px -1px 0 black, 
                                -1px -1px 0 black
                                `
                            }}                                 
                        >
                            {descripcion}
                        </span>
                        
                        <span className="uppercase text-lg lg:text-xl font-semibold break-words whitespace-normal overflow-hidden px-4 max-w-full"
                            style={{
                                textShadow: `
                                1px 1px 0 black, 
                                -1px 1px 0 black, 
                                1px -1px 0 black, 
                                -1px -1px 0 black,
                                2px 2px 0 black, 
                                -2px 2px 0 black, 
                                2px -2px 0 black, 
                                -2px -2px 0 black
                                `
                            }} 
                        >
                            $ {
                                monto_maximo?.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2, // Número mínimo de decimales
                                    maximumFractionDigits: 2, // Número máximo de decimales
                                })
                                
                            } MXN
                        </span>
                    </div>
                </div>
                {children}
            </div>
        </>
    );
}