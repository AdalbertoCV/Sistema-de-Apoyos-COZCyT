import { apiUrl } from "@/api";

export default function Footer( {selectedNav, setShowDesarrolladores} ){
    return (
        <footer className={`overflow-y-hidden relative bg-gradient-to-r from-[var(--principal-c)] via-[var(--principal)] to-[var(--principal-mf)] h-[9rem] mt-8 ${selectedNav === 'vertical' ? 'lg:max-w-[84%] lg:rounded-tl-full lg:ml-[16%]' : 'w-full'}`}>
            {/* Ponemos un contenedor dentro donde pondremos el contenido del footer */}
            <div className={`absolute bottom-0 right-0 bg-[#E1E1E1] h-[8.7rem] mt-5 w-full ${selectedNav === 'vertical' && 'lg:rounded-tl-full lg:w-[99.6%]'}`}>
                <div className="flex flex-row items-center justify-around mx-2">
                    <a href="https://labsol.cozcyt.gob.mx/" target="_blank" rel="noopener noreferrer">
                        <img
                            src={`${apiUrl}/static/images/LogosFooter/Logos Labsol 2023-02.png`}
                            alt="Logo LABSOL"
                            className="w-24 h-24 sm:w-40 sm:h-40 object-contain cursor-pointer"
                        />
                    </a>
                    <div className="flex flex-col space-y-4 justify-center items-center text-center">
                        <span className="font-bold">
                            © LABSOL NETWORK {new Date().getFullYear()}
                        </span>
                        <span 
                            className="font-semibold font-mono hover:text-lg hover:text-orange-500 select-none cursor-pointer"
                            onClick={() => setShowDesarrolladores(true)}
                        >
                            Desarrolladores
                        </span>
                    </div>
                    <div className="flex">
                        <img
                            src={`${apiUrl}/static/images/LogosFooter/GPLv3_Logo.svg.png`}
                            alt="Licencia LABSOL"
                            className="w-24 h-24 sm:w-36 sm:h-36  object-contain"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}