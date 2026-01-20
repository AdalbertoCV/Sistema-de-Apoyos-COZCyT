export default function SectionContainer( { title, children } ){
    return (
        <div className="flex-wrap rounded-[2.5rem] bg-[#E3E3E3]">
            <div className="flex items-center justify-center rounded-t-[2.5rem] bg-[#D6D6D6]">
                <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-mf)] my-2">
                    <h1>{title}</h1>
                </div>
            </div>
            <div className="flex flex-row h-1 lg:h-1.5 rounded-full">
                <div className="flex w-1/3 bg-[var(--principal-c)]"></div>
                <div className="flex w-1/3 bg-[var(--principal-mf)]"></div>
                <div className="flex w-1/3 bg-[var(--principal)]"></div>
            </div>
            <div className="flex min-h-10">
                {children}
            </div>
            <div>
            </div>
        </div>
    );
}