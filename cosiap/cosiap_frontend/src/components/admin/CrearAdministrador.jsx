import { useState } from "react";
import api from '../../api';
import MainContainer from "../common/utility/MainContainer";
import '@/App.css';
import { useNavigate } from "react-router-dom";

const CrearAdmin = ({setViewPageLoader}) =>{
    const [nombre, setNombre] = useState('');
    const [curp, setCurp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [alertMessage, setAlertMessage] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const showAlert = (message, isSuccess) => {
        setAlertMessage(message);
        setIsSuccess(isSuccess);
        
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setViewPageLoader(true)
    
        if (password !== passwordConfirm) {
          showAlert("Las contraseñas no coinciden.", false);
          return;
        }
    
        try {
            const data = {
                nombre: nombre,
                curp: curp,
                email: email,
                password: password,
                confirmar_password: passwordConfirm,
            };
            const response = await api.usuarios.administradores.post(data)
            showAlert('Cuenta de administrador creada correctamente.', true)
            navigate('/administradores'); 
        } catch (error) {
            const errorData = error.response.data;
            for (const key in errorData) {
                if (errorData.hasOwnProperty(key)) {
                    showAlert(errorData[key], false);
                }
            }
        }
        setViewPageLoader(false);
      };

    return (
        <MainContainer title={"Nuevo Administrador"}>
            {alertMessage && (
                <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                    {alertMessage}
                </div>
            )}
          <form onSubmit={handleSubmit} className="container">
          <div className="form-group">
            <div className="form-row">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="CURP"
                value={curp}
                onChange={(e) => setCurp(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
    
            <div className="form-row">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
    
            <div className="button-container">
            <button className="add-button" onClick={() => navigate('/administradores')}>
                Cancelar
            </button>
            <button type="submit" className="submit-button">
              Crear
            </button>
            </div>
          </div>
          </form>
        </MainContainer>
    );
};

export default CrearAdmin;