export default function InputMonto({ value, onChange, hasError }) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          className={`px-4 ps-11 block w-full h-8 shadow-sm rounded-lg text-sm font-medium focus:z-10 focus:border-[var(--principal-f)] disabled:opacity-50 disabled:pointer-events-none dark:bg-transparent dark:border-[var(--secundario-c)] text-[var(--secundario-f)] dark:placeholder-[var(--secundario-f)] dark:focus:ring-[var(--principal-mf)] ${
          hasError ? "border-[var(--error-f)]" : "border-[var(--secundario-c)]"
          }`}
          placeholder="0.00"
          maxLength="8"
        />
        <div className="absolute inset-y-0 flex items-center pointer-events-none ps-2">
          <img
            className="size-5"
            src="http://localhost:5173/src/assets/IconsImg/Money.svg"
          />
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--secundario-f)] text-sm">
          MXN
        </div>
      </div>
    );
}