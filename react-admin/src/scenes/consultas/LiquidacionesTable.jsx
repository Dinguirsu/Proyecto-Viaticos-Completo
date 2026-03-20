const LiquidacionesTable = ({ liquidaciones }) => {
    return (
      <div className="table-container">
        <h4 className="table-title">Resultados de Liquidaciones</h4>
        <table className="styled-table">
          <thead>
            <tr>
              <th># Autorización</th>
              <th>Código Etapa</th>
              <th>Lugar a Visitar</th>
              <th>Objetivo de Misión</th>
              <th>Observaciones</th>
              <th>Fecha Salida</th>
              <th>Fecha Regreso</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((liquidacion, index) => (
              <tr key={index}>
                <td>{liquidacion.NumeroAutorizacion}</td>
                <td>{liquidacion.CodigoEtapa}</td>
                <td>{liquidacion.LugarAVisitar}</td>
                <td>{liquidacion.ObjetivoMision}</td>
                <td>{liquidacion.Observaciones}</td>
                <td>{new Date(liquidacion.FechaSalida).toLocaleDateString()}</td>
                <td>{new Date(liquidacion.FechaRegreso).toLocaleDateString()}</td>
                <td>
                  {liquidacion.Monto !== undefined && liquidacion.Monto !== null
                    ? `L${liquidacion.Monto.toFixed(2)}`
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default LiquidacionesTable;
  