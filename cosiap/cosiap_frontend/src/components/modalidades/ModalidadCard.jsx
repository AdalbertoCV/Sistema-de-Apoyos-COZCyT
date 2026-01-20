import { apiUrl } from "@/api";

export function ModalidadCard({ title, description, monto, image, children }) {
  /* Formatear monto con separadores de miles */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="flex flex-col justify-center w-[90%] md:w-[40%] lg:w-[30%] mb-4">
      <div
        className="max-w-sm m-2 border-[var(--gris-1)] bg-[var(--gris-1)] drop-shadow-2xl rounded-[45px] pb-2"
      >
        <div
          className="h-52 overflow-hidden rounded-t-[45px]"
        >
          <img
            className="w-full h-full object-fill"
            src={`${apiUrl}${image}`}
            alt="Modalidad"
          />
          {`${apiUrl}${image}`}
        </div>
        <div className="flex flex-row h-1 lg:h-1.5 rounded-full">
            <div className="flex w-1/3 bg-[var(--principal-c)]"></div>
            <div className="flex w-1/3 bg-[var(--principal-mf)]"></div>
            <div className="flex w-1/3 bg-[var(--principal)]"></div>
        </div>

        <div className="relative bg-[var(--secundario-mc)] px-1 py-2 text-center">
          <h2 className="drop-shadow-xl text-lg lg:text-xl font-black uppercase text-[var(--principal-mf)] break-words overflow-hidden text-ellipsis whitespace-normal">
            {/* (NOMBRE DE LA MODALIDAD) */}
            {title}
          </h2>
        </div>
        <div className="flex flex-col py-2 px-1 justify-center items-center space-y-3">
          <span className="font-bold text-[var(--principal-f)]">
            Descripción
          </span>
          <span className="font-semibold break-words overflow-hidden text-ellipsis whitespace-normal text-center">
            {/* (Descripción de la modalidad) */}
            {description}
          </span>
          <span className="font-bold text-[var(--principal-f)]">
            Monto maximo
          </span>
          <span className="text-lg font-semibold">
            {formatCurrency(monto)} MXN
          </span>
          <div className="flex justify-center items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
