export default function MobileMenuToggle({ viewMenu, setViewMenu, buttonMenuRef }) {
    return (
        <>
            <a ref={buttonMenuRef} className= {`cursor-pointer ${viewMenu ? 'text-[var(--principal-mf)]' : 'text-gray-600'} hover:text-[var(--principal-mf)]`} onClick={() => setViewMenu(!viewMenu)}>
                <span className="material-symbols-outlined text-4xl">
                  {viewMenu ? 'segment' : 'menu'}
                </span>
            </a>
        </>
    );
}