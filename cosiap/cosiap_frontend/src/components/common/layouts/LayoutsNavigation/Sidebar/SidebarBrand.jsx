import { useNavigate } from "react-router-dom";
import { apiUrl } from "@/api";
import useColor from "@/components/useColor";

export default function SidebarBrand(){
    const navigate = useNavigate();
    const colors = useColor();

    return (
        <div onClick={() => navigate('/inicio')} className="cursor-pointer">
            <div className="flex justify-center">
                <img src={`${apiUrl}${colors.logo}`} className="w-20 h-20"/>
            </div>
            <div className="flex justify-center">
                <div className="text-[var(--principal-mf)] text-[2.5rem] font-bold">
                    cosiap
                </div>
            </div>
        </div>
    );
}