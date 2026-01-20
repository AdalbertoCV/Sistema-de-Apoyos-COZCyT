import SectionContainer from "@/components/common/ui/SectionContainers/SectionContainer";
import Label_InputFile from "../Perfil/Label_InputFile";

export default function Convenio( {setViewPageLoader, setShowAlertSuccesful} ){
    return (
        <>
            <SectionContainer title="Convenio" >
                <div className="flex-row">
                    <div className="flex justify-center items-center w-full my-2 mx-2">
                        <span className="font-semibold text-center text-sm">
                            Descarga el documento prellenado, fírmalo y súbelo en su respectivo campo
                        </span>
                    </div>
                    <div className="flex justify-center items-center w-full my-4 mx-2">
                        <a href="" className="p-2 bg-[var(--informacion-f)] text-white uppercase rounded-lg text-xs font-semibold">
                            DESCARGAR DOCUMENTO
                        </a>
                    </div>
                    <div className="flex justify-center items-center w-full my-4 mx-2">
                        <form className="w-full">
                            <div className="grow p-2">
                                <div className="flex flex-col space-y-2 select-none w-full">
                                    <label className="font-semibold text-sm ">Convenio firmado</label>
                                    <input 
                                        type="file"
                                        className={`disabled:bg-gray-300 bg-white rounded-md text-sm border-0
                                            file:bg-[var(--principal-f)] file:mr-3 file:border-1 file:text-sm file:border-[var(--principal-mf)] 
                                            file:text-white file:rounded-l-[7px] file:py-[2px] file:px-3`}
                                    />
                                    <div className="text-sm text-gray-500">Sube tu archivo</div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </SectionContainer>
        </>
    );
}