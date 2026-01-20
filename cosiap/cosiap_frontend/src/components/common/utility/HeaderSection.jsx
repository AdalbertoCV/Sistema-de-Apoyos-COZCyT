export default function HeaderSection({ title }) {
  return (
    <div className="flex flex-row m-3 mt-0 items-center justify-center">
      <div className="flex-grow h-2 rounded-l-md rounded-r-md bg-[var(--error)]"></div>
      <div className="flex-shrink text-[var(--principal-mf)] px-4">
        <h3 className="uppercase font-bold text-lg lg:text-2xl text-center">
          {title}
        </h3>
      </div>
      <div className="flex-grow h-2 rounded-l-md rounded-r-md bg-[var(--error)]"></div>
    </div>
  );
}
