import '@/App.css';

const Tabla = ({ columnas, datos }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columnas.map((columna, index) => (
              <th key={index}>{columna.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, index) => (
            <tr key={index}>
              {columnas.map((columna, colIndex) => (
                <td key={colIndex}>
                  {columna.render(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tabla;