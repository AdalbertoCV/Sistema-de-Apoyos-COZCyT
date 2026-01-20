export default function MainContainer({ title, children }) {
  return (
    <>
      <div className="flex flex-col pb-9 justify-center w-auto h-auto m-7 bg-[var(--gris-1)] rounded-[3rem]">
        <div className="flex items-center justify-center bg-[var(--gris-2)] p-2 rounded-tr-[3rem] rounded-tl-[3rem]">
          <h1 className="text-2xl lg:text-3xl font-extrabold py-4 text-center uppercase text-[var(--principal-mf)]">
            {title}
          </h1>
        </div>
        <div className="flex">
          <div className="h-1 flex-1 bg-gradient-to-r from-[var(--principal)] to-[var(--principal)]"></div>
        </div>
        {children}
      </div>
    </>
  );
}
