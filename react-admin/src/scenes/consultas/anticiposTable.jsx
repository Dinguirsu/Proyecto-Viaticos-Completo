const AnticiposTable = ({ anticipos }) => {
    return (
      <div className="table-container">
        <h4 className="table-title">Resultados de Anticipos</h4>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Número Autorización</th>
              <th>Fecha Ingreso</th>
              <th>Empleado</th>
              <th>Área</th>
              <th>Etapa</th>
            </tr>
          </thead>
          <tbody>
            {anticipos.map((anticipo, index) => (
              <tr key={index}>
                <td>{anticipo.NumeroAutorizacion}</td>
                <td>{new Date(anticipo.FechaIngreso).toISOString().split("T")[0]}</td>
                <td>{anticipo.Empleado}</td>
                <td>{anticipo.Area}</td>
                <td>{anticipo.Etapa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default AnticiposTable;
  