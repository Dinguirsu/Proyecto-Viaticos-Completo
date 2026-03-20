const LiquidacionesTable = ({ liquidaciones }) => {
    const mostrarLugarAVisitar = liquidaciones.some(
      (liq) => liq.LugarAVisitar && liq.LugarAVisitar.trim() !== ""
    );
    const mostrarDescripcion = liquidaciones.some(
      (liq) => liq.Descripcion && liq.Descripcion.trim() !== ""
    );
  
    return (
      <div className="table-container">
        <h4 className="table-title">Resultados de Liquidaciones</h4>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Número Autorización</th>
              <th>Fecha Ingreso</th>
              <th>Empleado</th>
              <th>Area</th>
              <th>Estado</th>
              {mostrarLugarAVisitar && <th>Lugar a Visitar</th>}
              {mostrarDescripcion && <th>Descripción</th>}                           
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((liquidacion, index) => (
              <tr key={index}>
                <td>{liquidacion.NumeroLiquidacion}</td>
                <td>{new Date(liquidacion.FechaIngreso).toLocaleDateString()}</td>
                <td>{liquidacion.Empleado}</td>
                <td>{liquidacion.Area}</td>
                <td>{liquidacion.Etapa}</td>
                {mostrarLugarAVisitar && (
                  <td>{liquidacion.LugarAVisitar || "—"}</td>
                )}
                {mostrarDescripcion && (
                  <td>{liquidacion.Descripcion || "—"}</td>
                )}                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default LiquidacionesTable;
  