import { useNavigate } from "react-router-dom";
import useColor from "@/components/useColor";
import { apiUrl } from "@/api";


export default function NavbarBrand() {
  const navigate = useNavigate();
  const colors = useColor();

    return (
        <>
            {/* Contenedor del texto "COSIAP" */}
            <div className="m-2 lg:m-auto lg:z-20 flex lg:fixed lg:h-16 lg:w-60 items-center lg:rounded-br-full lg:bg-[#E1E1E1]">
                <div className=" cursor-pointer flex px-2 lg:ml-2 lg:mr-10 items-center"
                  onClick={() => navigate('/inicio')}>
                  <img src={`${apiUrl}${colors.logo}`} className="w-9 h-9 mr-2"/>
                  <div className="text-[var(--principal-mf)] text-4xl font-extrabold">
                    cosiap
                  </div>
                </div>
              </div>
              {/* Contenedor curvo de cosiap*/}
              <div className="lg:z-0 lg:fixed lg:h-16 lg:w-60 lg:bg-[#E1E1E1] lg:rounded-br-full"></div>

              {/* Contenedor gradiente del contenedor curvo */}
              <div className="lg:z-0 lg:fixed lg:h-[4.4rem] lg:w-[15.4rem] lg:rounded-br-full lg:bg-gradient-to-r lg:from-[var(--principal-c)] lg:via-[var(--principal)] lg:to-[var(--principal-mf)]"></div>
        </>
    );
}