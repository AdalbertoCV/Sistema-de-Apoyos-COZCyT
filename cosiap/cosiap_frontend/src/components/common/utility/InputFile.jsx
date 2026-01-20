export default function InputFile({ titleBtn, descBtn, onChange, hasError }) {
  return (
    <label>
      <div className={`mb-5 w-full h-8 rounded-lg border justify-between items-center inline-flex ${
        hasError ? "border-[var(--error-f)]" : "border-[var(--secundario-c)]"}`}>
        <div className="flex w-auto h-8 px-1 flex-col bg-[var(--principal-f)] rounded-l-lg shadow text-[var(--blanco)] text-sm font-bold items-center justify-center cursor-pointer focus:outline-none">
          {titleBtn}
        </div>
        <h4 className="m-3 text-[var(--secundario-f)] text-[10px] font-normal">
          {descBtn}
        </h4>
        <input type="file" hidden onChange={onChange}/>
      </div>
    </label>
  );
}
