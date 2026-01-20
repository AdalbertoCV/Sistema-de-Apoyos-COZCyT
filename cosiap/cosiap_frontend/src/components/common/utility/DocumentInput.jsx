export default function DocumentInput({ title, description, children }) {
  return (
    <>
      <div className="flex flex-col items-center justify-start rounded-[45px] w-[90%] md:w-[40%] lg:w-[30%] h-[560px] mb-4 border-solid border-4 border-[var(--gris-4)] shadow-md p-4">
        <h3 className="text-[var(--principal-f)] text-lg font-extrabold text-center">
          {/* (Título del documento) */}
          {title}
        </h3>
        <div className="flex p-3 justify-center">
          <h2 className="text-[var(--negro)] text-sm font-semibold text-center">
            {/* (Descripción del documento) */}
            {description}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center p-3">
          {/* Contenedores extra */}
          {children}
        </div>
      </div>
    </>
  );
}
