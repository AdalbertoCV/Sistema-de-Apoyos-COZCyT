import { useState, useEffect, useRef } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Navbar from "@/components/common/layouts/LayoutsNavigation/Navbar/Navbar";
import Sidebar from "@/components/common/layouts/LayoutsNavigation/Sidebar/Sidebar";
import SettingsToggle from "@/components/common/layouts/LayoutsNavigation/SettingsToggle";
import Settings from "@/components/common/layouts/LayoutsNavigation/Settings";
import { useAutenticacion } from "@/components/common/utility/Autenticador";
import Footer from "./Footer";
import { apiUrl } from "@/api";

const linksItemsAdmin = [
  { nameIcon: 'library_books', nameItem: 'Modalidades', navigate: '/modalidades', isSelected: false },
  { nameIcon: 'group', nameItem: 'Usuarios', navigate: '/usuarios', isSelected: false },
  { nameIcon: 'list_alt', nameItem: 'Solicitudes', navigate: '/solicitudes', isSelected: false },
  { nameIcon: 'description', nameItem: 'Formatos', navigate: '/formatos', isSelected: false },
];

const linksItemsSolicitante = [
  { nameIcon: 'library_books', nameItem: 'Modalidades', navigate: '/modalidades', isSelected: false },
  { nameIcon: 'history', nameItem: 'Historial', navigate: '/historial', isSelected: false },
  { 
    nameIcon: 'help', nameItem: 'Ayuda', isSelected: false,
    subMenu: [{ nameItem: 'Manual', isSelected: false, navigate: '/ayuda/manual' }] 
  },
  { nameIcon: 'account_circle', nameItem: 'Perfil', navigate: '/perfil', isSelected: false },
];

export default function LayoutBaseNavigation() {
  const [viewMenu, setViewMenu] = useState(false);
  const [selectedNav, setSelectedNav] = useState('vertical');
  const [viewSettings, setViewSettings] = useState(false);
  const { isAdmin } = useAutenticacion();
  const [links, setLinks] = useState(isAdmin ? linksItemsAdmin : linksItemsSolicitante);
  const settingsRef = useRef();
  const settingsToggleRef = useRef();
  const location = useLocation();
  const [sectionURL, setSectionURL] = useState("");
  const [showDesarrolladores, setShowDesarrolladores] = useState(false);
  const desarrolladoresRef = useRef();

  useEffect(() => {
    setLinks(isAdmin ? linksItemsAdmin : linksItemsSolicitante);
  }, [isAdmin]);

  useEffect(() => {
    setSectionURL(location.pathname.split('/').filter(Boolean).pop());
    setViewMenu(false);
  }, [location]);

  useEffect(() => {
    const savedNavStyle = localStorage.getItem('selectedNav');
    if (savedNavStyle) setSelectedNav(savedNavStyle);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedNav', selectedNav);
  }, [selectedNav]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        settingsRef.current && !settingsRef.current.contains(event.target) &&
        settingsToggleRef.current && !settingsToggleRef.current.contains(event.target)
      ) {
        setViewSettings(false);
      }

      if (
        desarrolladoresRef.current && !desarrolladoresRef.current.contains(event.target)
      ) {
        setShowDesarrolladores(false);
      }

    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#C6C4C4] overflow-x-hidden">
        {showDesarrolladores && (
          <Desarrolladores desarrolladoresRef={desarrolladoresRef}/>
        )}
        {selectedNav === 'horizontal' && (
          <Navbar linksItems={links} viewMenu={viewMenu} setViewMenu={setViewMenu} />
        )}
        {selectedNav === 'vertical' && (
          <Sidebar linksItems={links} viewMenu={viewMenu} setViewMenu={setViewMenu} />
        )}

        <div className={`flex-grow w-full h-full ${selectedNav === 'vertical' ? 'lg:ml-[17.3%]' : ''}`}>
          <div 
            className="fixed flex cursor-pointer h-10 w-10 right-0 bg-[var(--principal-c)] border-y-4 border-l-4 border-[var(--principal-mf)] rounded-s-3xl mt-16 lg:mt-14 z-10"
            onClick={() => setViewSettings(!viewSettings)}
          >
            <SettingsToggle settingsToggleRef={settingsToggleRef} />
          </div>

          {viewSettings && (
            <Settings settingsRef={settingsRef} selectedNav={selectedNav} setSelectedNav={setSelectedNav} />
          )}

          <div className={`h-full mt-[3.8rem] lg:mt-11 ${selectedNav === 'vertical' ? 'lg:max-w-[82.7%]' : 'w-full'}`}>
            <div className="flex justify-center">
              <div className="flex-wrap w-[90%] lg:w-[98%] mt-[5%] lg:mt-[2%] justify-center">
                <Outlet />  
              </div>
            </div>
          </div>
        </div>
        {/* Footer del sistema */}
        <Footer selectedNav={selectedNav} setShowDesarrolladores={setShowDesarrolladores}/>
      </div>
    </>
  );
}

const Desarrolladores = ( {desarrolladoresRef} ) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-55">
      <div ref={desarrolladoresRef} className="bg-white p-5 rounded-2xl flex flex-col max-w-[95%]">
          <div className="flex flex-wrap justify-center items-center text-center space-y-2">
            <div className="flex flex-col w-36 h-auto m-3 p-2 ring-2 ring-blue-500 rounded-2xl">
              <div className="flex items-center justify-center">
                <img
                  src={`${apiUrl}/static/images/Desarrolladores/Avatar-hombre.jpeg`}
                  alt="Logo Desarrollador"
                  className="w-20 h-20 rounded-3xl"
                />
              </div>
              <span className="font-bold font-serif my-2">
                Elliot Axel Noriega
              </span>
              <div className="flex flex-row items-center justify-around">
                <a href="https://github.com/ElliotAxNor" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    alt="GitHub"
                    className="w-8 h-8"
                  />
                </a>
                <a href="mailto:elliotnoriega@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <span
                    className="material-symbols-outlined"
                  >
                    mail
                  </span>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/in/elliot-axel-noriega-41005528a/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                    alt="LinkedIn"
                    className="w-6 h-6"
                  />
                </a>
              </div>
            </div>
            <div className="flex flex-col w-36 h-auto mx-3 p-2 ring-2 ring-blue-500 rounded-2xl">
              <div className="flex items-center justify-center">
                <img
                  src={`${apiUrl}/static/images/Desarrolladores/Avatar-mujer.png`}
                  alt="Logo Desarrollador"
                  className="w-20 h-20 rounded-3xl"
                />
              </div>
              <span className="font-bold font-serif my-2">
                Narda Viktoria Goméz Aguilera
              </span>
              <div className="flex flex-row items-center justify-around">
                <a href="https://github.com/Viky-Gomez/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <img
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    alt="GitHub"
                    className="w-8 h-8"
                  />
                </a>
                <a href="mailto:viky.gomez.12@gmail.com" target="_blank" rel="noopener noreferrer">
                  <span
                    className="material-symbols-outlined"
                  >
                    mail
                  </span>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/in/viky-g%C3%B3mez-91990428a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                    alt="LinkedIn"
                    className="w-6 h-6"
                  />
                </a>
              </div>
            </div>
            <div className="flex flex-col w-36 h-auto mx-3 p-2 ring-2 ring-blue-500 rounded-2xl">
              <div className="flex items-center justify-center">
                <img
                  src={`${apiUrl}/static/images/Desarrolladores/Avatar-hombre.jpeg`}
                  alt="Logo Desarrollador"
                  className="w-20 h-20 rounded-3xl"
                />
              </div>
              <span className="font-bold font-serif my-2">
                Adalberto Cerrillo Vázquez
              </span>
              <div className="flex flex-row items-center justify-around">
                <a href="https://github.com/AdalbertoCV" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    alt="GitHub"
                    className="w-8 h-8"
                  />
                </a>
                <a href="mailto:adalc3488@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <span
                    className="material-symbols-outlined"
                  >
                    mail
                  </span>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/in/adalberto-cerrillo-v%C3%A1zquez-a3870628a" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                    alt="LinkedIn"
                    className="w-6 h-6"
                  />
                </a>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
