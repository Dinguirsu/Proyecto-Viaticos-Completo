import { getConnection } from '../database/connection.js';
import sql from "mssql";
import multer from 'multer';
import { loginMembership } from "../services/membershipLogin.js";
import jwt from "jsonwebtoken"; // para emitir el token JWT

const upload = multer({ storage: multer.memoryStorage() });

//Obtener nombre de Empleado 
export const getNameEmployee = async (req, res) => {
    const pool = await getConnection()
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;
    const result = await pool
    .request()
    .input("Usuario", sql.VarChar(15), sistemaUsuario)
    .query('SELECT CodigoEmpleado, Empleado, UsuarioSITAE FROM View_Empleados WHERE (UsuarioSITAE = @Usuario)')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Empleado no encontrado."})
    }
    return res.json(result.recordset[0]);
}

//Obtener Area de trabajo del Empleado 
export const getWorkAreaEmployee = async (req, res) => {
    const pool = await getConnection()
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;
    const result = await pool
    .request()
    .input("Usuario", sql.VarChar, sistemaUsuario)
    .query('SELECT View_Areas.Area, View_Areas.CodigoArea FROM View_Empleados INNER JOIN View_Cargo ON View_Empleados.CodigoCargo = View_Cargo.CodigoCargo INNER JOIN View_Areas ON View_Cargo.CodigoArea = View_Areas.CodigoArea WHERE (View_Empleados.UsuarioSITAE = @Usuario)')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Area no encontrado."})
    }
    return res.json(result.recordset[0]);
}

//Obtener Area de trabajo del Empleado 
export const getTypeEmployee = async (req, res) => {
    const pool = await getConnection()
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;
    const result = await pool
    .request()
    .input("CodigoEmpleado", sql.Int, codigoEmpleado)
    .query('SELECT view_TipoCargo.CodigoTipoCargo, view_TipoCargo.TipoCargo FROM View_Cargo INNER JOIN View_Empleados ON View_Cargo.CodigoCargo = View_Empleados.CodigoCargo INNER JOIN view_TipoCargo ON View_Cargo.TipoCargo = view_TipoCargo.CodigoTipoCargo WHERE (View_Empleados.CodigoEmpleado = @CodigoEmpleado)')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Tipo de Empleado no encontrado."})
    }
    return res.json(result.recordset[0]);
}

//Continente
export const getContinent = async (req, res) => {

    const pool = await getConnection()

    const result = await pool.request().query('SELECT CodigoContinente, NombreContinente FROM View_Continente')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Country not found"})
    }
    return res.json(result.recordset);
}

//Pais
export const getCountry = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("CodigoContinente", sql.VarChar(2), req.params.CodigoContinente)
    .query('SELECT View_Paises.CodigoPais, View_Paises.NombrePais FROM View_Continente INNER JOIN View_Paises ON View_Continente.CodigoContinente = View_Paises.CodigoContinente WHERE (View_Continente.CodigoContinente = @CodigoContinente) ORDER BY View_Paises.NombrePais')
    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Country not found"})
    }
    return res.json(result.recordset);
}

//Departamento
export const getDepto = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .query("SELECT View_Departamentos.IDDept, View_Departamentos.Nombre FROM View_Departamentos CROSS JOIN View_Paises WHERE (View_Paises.CodigoPais = 'HN')")
    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Depto not found"})
    }
    return res.json(result.recordset);
}

//Municipio
export const getMunicipio = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("Departamento", sql.SmallInt, req.params.Departamento)
    .query('SELECT View_Municipios.IDMunicipio, View_Municipios.Nombre FROM View_Municipios INNER JOIN View_Departamentos ON View_Municipios.IDDept = View_Departamentos.IDDept WHERE (View_Departamentos.IDDept = @Departamento)')
    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Municipio not found"})
    }
    return res.json(result.recordset);
}

//Transporte
export const getTransport = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .query("SELECT IDTransporte, DescripcionTransporte FROM TB_Viajes_Transporte")

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Transport not found"})
    }
    return res.json(result.recordset);
}

//Numero de placa
export const getNumPlaca = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .query("SELECT NoPlaca FROM TB_Vehiculo")

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Nº Placa not found"})
    }
    return res.json(result.recordset);
}

export const postAnticiposEncabezado = async (req, res) => {
    try{  
        const { NumeroAutorizacion, CodigoEmpleado, DireccionResidencia, FechaIngreso, CodigoEtapa, Observaciones, SistemaUsuario, SistemaFecha } = req.body;

        const pool = await getConnection()
        const result = await pool
        .request()
        .input("NumeroAutorizacion", sql.Int, NumeroAutorizacion)
        .input("CodigoEmpleado", sql.Int, CodigoEmpleado)
        .input("DireccionResidencia", sql.VarChar(200), DireccionResidencia)
        .input("FechaIngreso", sql.Date, FechaIngreso)
        .input("CodigoEtapa", sql.VarChar(30), CodigoEtapa)
        .input("Observaciones", sql.VarChar(200), Observaciones)
        .input("SistemaUsuario", sql.VarChar(20), SistemaUsuario)
        .input("SistemaFecha", sql.DateTime, SistemaFecha)
        .query("INSERT INTO TB_Anticipo_Gastos_Viaje_Encabezado(NumeroAutorizacion, CodigoEmpleado, DireccionResidencia, FechaIngreso, CodigoEtapa, Observaciones, SistemaUsuario, SistemaFecha) values (@NumeroAutorizacion, @CodigoEmpleado, @DireccionResidencia, @FechaIngreso, @CodigoEtapa, @Observaciones, @SistemaUsuario, @SistemaFecha)")

        return res.json({
            NumeroAutorizacion,
            CodigoEmpleado,
            DireccionResidencia,
            FechaIngreso,
            CodigoEtapa,
            Observaciones,
            SistemaUsuario,
            SistemaFecha
        }); 
    }
    catch(error){
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }

    
}

export const postAnticiposDetalleMision = async (req, res) => {
    try{  
        const { NumeroAutorizacionAnticipo, LugarAVisitar, ObjetivoMision, Observaciones, FechaSalida, FechaRegreso, IDTransporte, NumeroPlaca, TipoCambio, Moneda, Monto, SistemaUsuario, SistemaFecha } = req.body;

        const pool = await getConnection()
        const result = await pool
        .request()
        .input("NumeroAutorizacionAnticipo", sql.Int, NumeroAutorizacionAnticipo)
        .input("LugarAVisitar", sql.VarChar(2000), LugarAVisitar, LugarAVisitar || "")
        .input("ObjetivoMision", sql.VarChar(2000), ObjetivoMision)
        .input("Observaciones", sql.VarChar(2000), Observaciones)
        .input("FechaSalida", sql.Date, FechaSalida)
        .input("FechaRegreso", sql.Date, FechaRegreso)
        .input("IDTransporte", sql.Int, IDTransporte)
        .input("NumeroPlaca", sql.VarChar(10), NumeroPlaca)
        .input("TipoCambio", sql.Numeric(18, 2), TipoCambio)
        .input("Moneda", sql.Int, Moneda)
        .input("Monto", sql.Numeric(18, 2), Monto)      
        .input("SistemaUsuario", sql.VarChar(20), SistemaUsuario)
        .input("SistemaFecha", sql.DateTime, SistemaFecha)
        .query("INSERT INTO TB_Anticipo_Gastos_Viaje_Detalle_Mision(NumeroAutorizacionAnticipo, LugarAVisitar, ObjetivoMision, Observaciones, FechaSalida, FechaRegreso, IDTransporte, NumeroPlaca, TipoCambio, Moneda, Monto, SistemaUsuario, SistemaFecha) values (@NumeroAutorizacionAnticipo, @LugarAVisitar, @ObjetivoMision, @Observaciones, @FechaSalida, @FechaRegreso, @IDTransporte, @NumeroPlaca, @TipoCambio, @Moneda, @Monto, @SistemaUsuario, @SistemaFecha)")

        return res.json({
            NumeroAutorizacionAnticipo,
            LugarAVisitar,
            ObjetivoMision,
            Observaciones,
            FechaSalida,
            FechaRegreso,
            IDTransporte,
            NumeroPlaca,
            TipoCambio,
            Moneda,
            Monto,
            SistemaUsuario,
            SistemaFecha
        }); 
    }
    catch(error){
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
    
}

export const getTotalAnticipos = async (req, res) => {
    const pool = await getConnection()

    const result = await pool
    .request()
    .query('select MAX(NumeroAutorizacion) as "total" from TB_Anticipo_Gastos_Viaje_Encabezado')


    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Anticipos no encontrados."})
    }
    return res.json(result.recordset);
}

export const getCodigoEtapa = async (req, res) => {
    const pool = await getConnection()

    const result = await pool
    .request()
    .input("Anticipo", sql.VarChar(30), req.params.Anticipo)
    .query('SELECT TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEtapa, TB_Viajes_Etapas.Etapa FROM TB_Anticipo_Gastos_Viaje_Encabezado INNER JOIN TB_Viajes_Etapas on TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEtapa = TB_Viajes_Etapas.CodigoEtapa WHERE (NumeroAutorizacion = @Anticipo)')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getCambioDolar = async (req, res) => {
    const today = new Date().toISOString().slice(0, 10); 
    const query =  `select top 1 CotizacionDolarVenta 
                    from view_CotizacionDolar 
                    order by FechaCotizacion desc`;
    const pool = await getConnection()

    const result = await pool.request().query(query)

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Tipo cambio no encontrados."})
    }
    return res.json(result.recordset);
}

export const getCodigoZonaViaticoHN = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("NombreMunicipio", sql.VarChar(150), req.params.NombreMunicipio)
    .query('SELECT View_Municipios.CodigoZonaViaticos FROM View_Municipios Where View_Municipios.Nombre = @NombreMunicipio')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getCodigoZonaViatico = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("NombrePais", sql.VarChar(150), req.params.NombrePais)
    .query('SELECT View_Paises.CodigoZona FROM View_Paises Where View_Paises.NombrePais = @NombrePais')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getMontoViaticoLempiras = async (req, res) => {
    try{
        
        const { CodigoZona, CodigoCargoEmpleado, CodigoPeriodo } = req.query;
        const pool = await getConnection();
        const result = await pool
        .request()
        .input("CodigoZona", sql.Int, CodigoZona)
        .input("CodigoCargoEmpleado", sql.Int, CodigoCargoEmpleado)
        .input("CodigoPeriodo", sql.Int, CodigoPeriodo)
        .query('SELECT Monto FROM View_Viaticos_Zona_Local WHERE CodigoPeriodo = @CodigoPeriodo AND CodigoZona = @CodigoZona AND CodigoCargoEmpleado = @CodigoCargoEmpleado');

        if(result.rowsAffected[0] === 0) {
            return res.status(404).json({message: "Etapa no encontrados."})
        }
        return res.json(result.recordset);
    }
    catch(error){
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getMontoViaticoDolares = async (req, res) => {
    const pool = await getConnection()
    const { CodigoZona, CodigoCargoEmpleado, CodigoPeriodo } = req.query;

    const result = await pool
    .request()
    .input("CodigoZona", sql.Int, CodigoZona)
    .input("CodigoCargoEmpleado", sql.Int, CodigoCargoEmpleado)
    .input("CodigoPeriodo", sql.Int, CodigoPeriodo)
    .query('SELECT Monto FROM View_Viaticos_Zona_Internacional WHERE CodigoPeriodo = @CodigoPeriodo AND CodigoZona = @CodigoZona AND CodigoCargoEmpleado = @CodigoCargoEmpleado')

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getAnticiposByIDEmpleadoConsultas = async (req, res) => {
  try {
    const pool = await getConnection();

    const codigoEmpleado = Number(
      req.usuario?.codigoEmpleado ??
      req.params?.codigoEmpleado ??
      req.query?.codigoEmpleado ??
      req.body?.codigoEmpleado
    );

    console.log(codigoEmpleado);

    if (!Number.isInteger(codigoEmpleado) || codigoEmpleado <= 0) {
      return res.status(400).json({ message: "Código de empleado inválido o ausente." });
    }

    const result = await pool
      .request()
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .query(`
        SELECT 
          AGE.NumeroAutorizacion,
          VE.Empleado,
          VA.Area,
          CONVERT(varchar(10), AGE.FechaIngreso, 120) AS FechaIngreso,
          ET.Etapa,
          ADM.LugarAVisitar,
          SUM(ADM.Monto) AS MontoAnticipo
        FROM TB_Anticipo_Gastos_Viaje_Detalle_Mision ADM
        INNER JOIN TB_Anticipo_Gastos_Viaje_Encabezado AGE
          ON ADM.NumeroAutorizacionAnticipo = AGE.NumeroAutorizacion
        INNER JOIN View_Empleados VE
          ON AGE.CodigoEmpleado = VE.CodigoEmpleado
        INNER JOIN View_Cargo VC
          ON VE.CodigoCargo = VC.CodigoCargo
        INNER JOIN View_Area VA
          ON VC.CodigoArea = VA.CodigoArea
        INNER JOIN TB_Viajes_Etapas ET
          ON ET.CodigoEtapa = AGE.CodigoEtapa
        WHERE 
          AGE.CodigoEmpleado = @CodigoEmpleado
          AND AGE.CodigoEtapa = 'ETP_ANT_APROBADO'
        GROUP BY
          AGE.NumeroAutorizacion,
          VE.Empleado,
          VA.Area,
          AGE.FechaIngreso,
          ET.Etapa,
          ADM.LugarAVisitar;
      `);

    res.set("Cache-Control", "no-store");
    return res.status(200).json(result.recordset ?? []);
  } catch (err) {
    console.error("❌ getAnticiposByIDEmpleado error:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getAnticiposByIDEmpleado = async (req, res) => {
  try {
    const pool = await getConnection();

    const codigoEmpleado = Number(
      req.usuario?.codigoEmpleado ??
      req.params?.codigoEmpleado ??
      req.query?.codigoEmpleado ??
      req.body?.codigoEmpleado
    );

    console.log(codigoEmpleado);

    if (!Number.isInteger(codigoEmpleado) || codigoEmpleado <= 0) {
      return res.status(400).json({ message: "Código de empleado inválido o ausente." });
    }

    const result = await pool
      .request()
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .query(`
        SELECT 
          AGE.NumeroAutorizacion,
          VE.Empleado,
          VA.Area,
          CONVERT(varchar(10), AGE.FechaIngreso, 120) AS FechaIngreso,
          ET.Etapa,
          ADM.LugarAVisitar,
          SUM(ADM.Monto) AS MontoAnticipo
        FROM TB_Anticipo_Gastos_Viaje_Detalle_Mision ADM
        INNER JOIN TB_Anticipo_Gastos_Viaje_Encabezado AGE
          ON ADM.NumeroAutorizacionAnticipo = AGE.NumeroAutorizacion
        INNER JOIN View_Empleados VE
          ON AGE.CodigoEmpleado = VE.CodigoEmpleado
        INNER JOIN View_Cargo VC
          ON VE.CodigoCargo = VC.CodigoCargo
        INNER JOIN View_Area VA
          ON VC.CodigoArea = VA.CodigoArea
        INNER JOIN TB_Viajes_Etapas ET
          ON ET.CodigoEtapa = AGE.CodigoEtapa
        WHERE 
          AGE.CodigoEmpleado = @CodigoEmpleado
          AND AGE.CodigoEtapa = 'ETP_ANT_APROBADO'
          AND NOT EXISTS (
              SELECT 1
              FROM TB_Liquidacion_Gastos_Viaje_Encabezado LGE
              WHERE LGE.NumeroAutorizacionAnticipo = AGE.NumeroAutorizacion
          )
        GROUP BY
          AGE.NumeroAutorizacion,
          VE.Empleado,
          VA.Area,
          AGE.FechaIngreso,
          ET.Etapa,
          ADM.LugarAVisitar;
      `);

    res.set("Cache-Control", "no-store");
    return res.status(200).json(result.recordset ?? []);
  } catch (err) {
    console.error("❌ getAnticiposByIDEmpleado error:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getLiquidacionesByAnticipo = async (req, res) => {
    const pool = await getConnection();
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;

    const result = await pool
    .request()
    .input("CodigoEmpleado", sql.Int, codigoEmpleado)
    .query(`SELECT TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion, view_Empleados.Empleado, View_Area.Area, TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso 
            FROM TB_Liquidacion_Gastos_Viaje_Encabezado 
            INNER JOIN view_Empleados ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
            INNER JOIN View_Cargo ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
            INNER JOIN View_Area ON View_Cargo.CodigoArea = View_Area.CodigoArea 
            WHERE (TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroAutorizacionAnticipo = @NumeroAutorizacion)`
    )


    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Liquidaciones no encontrados."})
    }
    return res.json(result.recordset);
}

export const getNumeroLiquidacion = async (req, res) => {
    const pool = await getConnection();

    try {
        const result = await pool.request().query("SELECT MAX(NumeroLiquidacion) as maxNumero FROM TB_Liquidacion_Gastos_Viaje_Encabezado");

        if (result.recordset.length === 0 || result.recordset[0].maxNumero === null) {
            return res.status(404).json({ message: "Anticipos no encontrados." });
        }
        
        const nextNumeroLiquidacion = result.recordset[0].maxNumero + 1;
        return res.json({ nextNumeroLiquidacion });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener el número de liquidación." });
    }
};

export const postLiquidacion = async (req, res) => {
  let pool;
  let transaction;
  const codigoEmpleado = req.usuario?.codigoEmpleado;
  const sistemaUsuario = req.usuario?.username;
  try {
    pool = await getConnection();

    if (!req.file) {
      return res.status(400).send("Archivo no recibido. Envíe un archivo válido.");
    }

    const fileContent = req.file.buffer;
    const contentType = req.file.mimetype;
    const filename = req.file.originalname;

    const numeroLiquidacion = Number(req.body.numeroLiquidacion);

    const liquidacionDataRaw = req.body.liquidacionData;
    if (!liquidacionDataRaw) {
      return res.status(400).send("Faltan los datos de la liquidación (liquidacionData).");
    }

    let data;
    try {
      data = JSON.parse(liquidacionDataRaw);
    } catch {
      return res.status(400).send("liquidacionData no es un JSON válido.");
    }

    if (!numeroLiquidacion) return res.status(400).send("NumeroLiquidacion inválido.");
    if (!data.NumeroAutorizacionAnticipo) return res.status(400).send("Falta NumeroAutorizacionAnticipo.");

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const queryEncabezado = `
      INSERT INTO TB_Liquidacion_Gastos_Viaje_Encabezado
        (NumeroLiquidacion, NumeroAutorizacionAnticipo, CodigoEmpleado, FechaIngreso, CodigoEtapa, SistemaUsuario, SistemaFecha)
      VALUES
        (@NumeroLiquidacion, @NumeroAutorizacionAnticipo, @CodigoEmpleado, @FechaIngreso, @CodigoEtapa, @SistemaUsuario, GETDATE());
    `;

    const queryDetalle = `
      INSERT INTO TB_Liquidacion_Gastos_Viaje_Detalle_Gastos
        (NumeroLiquidacion, Monto, TipoCambio, Moneda, SistemaUsuario, SistemaFecha)
      VALUES
        (@NumeroLiquidacion, @Monto, @TipoCambio, @Moneda, @SistemaUsuario, GETDATE());
    `;

    const queryArchivo = `
      INSERT INTO TB_Liquidacion_Gastos_Archivos
        (NumeroLiquidacion, Nombre, ContenidoTipo, Data, Fecha_Ingreso)
      VALUES
        (@NumeroLiquidacion, @Nombre, @ContenidoTipo, @Data, GETDATE());
    `;

    const reqTx1 = new sql.Request(transaction);
    await reqTx1
      .input("NumeroLiquidacion", sql.Int, numeroLiquidacion)
      .input("NumeroAutorizacionAnticipo", sql.Int, Number(data.NumeroAutorizacionAnticipo))
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .input("FechaIngreso", sql.Date, data.FechaIngreso) // ideal "YYYY-MM-DD"
      .input("CodigoEtapa", sql.VarChar(50), data.CodigoEtapa)
      .input("SistemaUsuario", sql.VarChar(50), sistemaUsuario)
      .input("SistemaFecha", sql.Date, data.SistemaFecha) // ideal "YYYY-MM-DD"
      .query(queryEncabezado);

    const reqTx2 = new sql.Request(transaction);
    await reqTx2
      .input("NumeroLiquidacion", sql.Int, numeroLiquidacion)
      .input("Monto", sql.Decimal(18, 2), Number(data.Monto))
      .input("TipoCambio", sql.Decimal(18, 4), Number(data.TipoCambio))
      .input("Moneda", sql.VarChar(5), String(data.Moneda))
      .input("SistemaUsuario", sql.VarChar(50), sistemaUsuario)
      .input("SistemaFecha", sql.Date, data.SistemaFecha)
      .query(queryDetalle);

    const reqTx3 = new sql.Request(transaction);
    await reqTx3
      .input("NumeroLiquidacion", sql.Int, numeroLiquidacion)
      .input("Nombre", sql.VarChar(255), filename)
      .input("ContenidoTipo", sql.VarChar(100), contentType)
      .input("Data", sql.VarBinary(sql.MAX), fileContent)
      .query(queryArchivo);

    await transaction.commit();
    return res.status(200).json({ message: "Liquidación y archivo guardados exitosamente." });

  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch {}
    }
    console.error("Error al guardar liquidación:", error);
    return res.status(500).send("Error al guardar la liquidación");
  }
};


export const getEtapas = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .query("SELECT CodigoEtapa, Etapa FROM TB_Viajes_Etapas WHERE (CodigoEtapa LIKE '%ANT%') ORDER BY Etapa")

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getEtapasLiquidacion = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .query("SELECT CodigoEtapa, Etapa FROM TB_Viajes_Etapas WHERE (CodigoEtapa LIKE '%LIQ%') ORDER BY Etapa")

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getAnticiposXEtapa = async (req, res) => {
    const pool = await getConnection()
    const { CodigoEtapa, SistemaUsuario } = req.params;
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;

    const result = await pool
        .request()
        .input("CodigoEtapa", sql.VarChar(30), CodigoEtapa)
        .input("SistemaUsuario", sql.VarChar(20), sistemaUsuario)
        .query(`SELECT TB_Anticipo_Gastos_Viaje_Encabezado.NumeroAutorizacion, TB_Anticipo_Gastos_Viaje_Encabezado.FechaIngreso, view_Empleados.Empleado, View_Areas.Area, TB_Viajes_Etapas.Etapa, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionJefe, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionDirector, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionAsistenteDIFA, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionAdministrador 
        FROM TB_Anticipo_Gastos_Viaje_Encabezado 
        INNER JOIN view_Empleados ON TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
        INNER JOIN View_Cargo ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
        INNER JOIN View_Areas ON View_Cargo.CodigoArea = View_Areas.CodigoArea 
        INNER JOIN TB_Viajes_Etapas ON TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEtapa = TB_Viajes_Etapas.CodigoEtapa 
        WHERE (TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEtapa = @CodigoEtapa) 
        AND (TB_Anticipo_Gastos_Viaje_Encabezado.SistemaUsuario = @SistemaUsuario) 
        ORDER BY TB_Anticipo_Gastos_Viaje_Encabezado.FechaIngreso DESC`);

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getAnticiposXFechas = async (req, res) => {
    const pool = await getConnection()
    const { FechaInicio, FechaFinal } = req.params;
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;
    const result = await pool
        .request()
        .input("FechaInicio", sql.Date, FechaInicio)
        .input("FechaFinal", sql.Date, FechaFinal)
        .input("Usuario", sql.VarChar(20), sistemaUsuario)
        .query(`SELECT TB_Anticipo_Gastos_Viaje_Encabezado.NumeroAutorizacion, TB_Anticipo_Gastos_Viaje_Encabezado.FechaIngreso, view_Empleados.Empleado, View_Areas.Area, TB_Viajes_Etapas.Etapa, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionJefe, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionDirector, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionAsistenteDIFA, TB_Anticipo_Gastos_Viaje_Encabezado.FechaAutorizacionAdministrador 
        FROM TB_Anticipo_Gastos_Viaje_Encabezado 
        INNER JOIN view_Empleados ON TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
        INNER JOIN View_Cargo ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
        INNER JOIN View_Areas ON View_Cargo.CodigoArea = View_Areas.CodigoArea 
        INNER JOIN TB_Viajes_Etapas ON TB_Anticipo_Gastos_Viaje_Encabezado.CodigoEtapa = TB_Viajes_Etapas.CodigoEtapa 
        WHERE (TB_Anticipo_Gastos_Viaje_Encabezado.FechaIngreso BETWEEN @FechaInicio AND @FechaFinal) AND (TB_Anticipo_Gastos_Viaje_Encabezado.SistemaUsuario = @Usuario) 
        ORDER BY TB_Anticipo_Gastos_Viaje_Encabezado.NumeroAutorizacion`);

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getAnticiposParaLiquidar = async (req, res) => {
    const pool = await getConnection();
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;
    
    const result = await pool
        .request()
        .input("CodigoEmpleado", sql.Int, codigoEmpleado)
        .query(`
            SELECT 
                TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion, 
                TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroAutorizacionAnticipo, 
                TB_Liquidacion_Gastos_Viaje_Encabezado.Observaciones,
                CONVERT(varchar(10), TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso, 120) AS FechaIngreso,
                view_Empleados.Empleado, 
                View_Area.Area, 
                viajes.Etapa,
                TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.Monto
            FROM TB_Liquidacion_Gastos_Viaje_Encabezado 
                INNER JOIN view_Empleados 
            ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
                INNER JOIN View_Cargo 
            ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
                INNER JOIN View_Area 
            ON View_Cargo.CodigoArea = View_Area.CodigoArea 
                INNER JOIN TB_Viajes_Etapas AS viajes 
            ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = viajes.CodigoEtapa
                INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos 
            ON TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.NumeroLiquidacion = TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion
            WHERE TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = @CodigoEmpleado
            ORDER BY TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso DESC
        `);

    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: "Anticipos no encontrados." });
    }
    
    return res.json(result.recordset);
};

/*export const getLiquidacionesByIDEmpleado = async (req, res) => {
    const pool = await getConnection();
    const codigoEmpleado = req.usuario?.codigoEmpleado; // desde token
    const sistemaUsuario = req.usuario?.username; // para logs

    const result = await pool
        .request()
        .input("CodigoEmpleado", sql.Int, codigoEmpleado)
        .query(`
            SELECT 
            TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion, 
            TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroAutorizacionAnticipo, 
            CONVERT(varchar(10), TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso, 120) AS FechaIngreso,
            view_Empleados.Empleado, 
            View_Area.Area, 
            viajes.Etapa,
			TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.Monto
            FROM TB_Liquidacion_Gastos_Viaje_Encabezado 
            INNER JOIN view_Empleados ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
            INNER JOIN View_Cargo ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
            INNER JOIN View_Area ON View_Cargo.CodigoArea = View_Area.CodigoArea 
            INNER JOIN TB_Viajes_Etapas as viajes on TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = viajes.CodigoEtapa
			INNER JOIN [TB_Liquidacion_Gastos_Viaje_Detalle_Gastos] on [TB_Liquidacion_Gastos_Viaje_Detalle_Gastos].NumeroLiquidacion = TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion
            WHERE (TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = @CodigoEmpleado) 
            ORDER BY TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso DESC
        `);

    if (result.rowsAffected[0] === 0) {
        return res.status(200).json({ message: "Liquidaciones no encontrados." });
    }

    return res.json(result.recordset);
};*/
export const getLiquidacionesByIDEmpleado = async (req, res) => {
  try {
    const pool = await getConnection();

    const codigoEmpleado = Number(req.usuario?.codigoEmpleado);

    if (!Number.isInteger(codigoEmpleado) || codigoEmpleado <= 0) {
      return res.status(400).json({ message: "Código de empleado inválido." });
    }

    const result = await pool
      .request()
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .query(`
        SELECT 
          TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion, 
          TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroAutorizacionAnticipo, 
          CONVERT(varchar(10), TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso, 120) AS FechaIngreso,
          view_Empleados.Empleado, 
          View_Area.Area, 
          viajes.Etapa,
          TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.Monto
        FROM TB_Liquidacion_Gastos_Viaje_Encabezado 
        INNER JOIN view_Empleados 
          ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
        INNER JOIN View_Cargo 
          ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
        INNER JOIN View_Area 
          ON View_Cargo.CodigoArea = View_Area.CodigoArea 
        INNER JOIN TB_Viajes_Etapas AS viajes 
          ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = viajes.CodigoEtapa
        INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos 
          ON TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.NumeroLiquidacion = TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion
        WHERE TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = @CodigoEmpleado 
        ORDER BY TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso DESC
      `);

    // 👇 Para SELECT usa recordset
    const liquidaciones = result.recordset || [];

    // Si no hay registros, responde 200 con lista vacía
    if (liquidaciones.length === 0) {
      return res.json([]); // o { success: true, liquidaciones: [] }
    }

    return res.json(liquidaciones);
  } catch (error) {
    console.error("❌ Error en getLiquidacionesByIDEmpleado:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//BORRAR FUNCION en teoria hace lo mismo que getLiquidacionXEtapa
export const getLiquidacionesPendientes = async (req, res) => {
  try {
    const pool = await getConnection();

    const codigoEmpleadoRaw =
      req.usuario?.codigoEmpleado ??
      req.params?.codigoEmpleado ??
      req.query?.codigoEmpleado ??
      req.body?.codigoEmpleado;

    const codigoEmpleado = Number(codigoEmpleadoRaw);

    if (!Number.isInteger(codigoEmpleado) || codigoEmpleado <= 0) {
      return res
        .status(400)
        .json({ message: "Código de empleado inválido o ausente." });
    }

    const sistemaUsuario = req.usuario?.username || "desconocido";

    // 2) Obtener TipoCargo y CodigoArea del empleado
    const empleadoResult = await pool
      .request()
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .query(`
        SELECT TOP 1
            TipoCargo,
            CodigoArea
        FROM view_EmpleadosCH
        WHERE CodigoEmpleado = @CodigoEmpleado
      `);

    if (!empleadoResult.recordset || empleadoResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "Empleado no encontrado en view_EmpleadosCH." });
    }

    const { TipoCargo, CodigoArea } = empleadoResult.recordset[0];
    // 3) Validar rol (TipoCargo 2 o 3)
    if (TipoCargo !== 2 && TipoCargo !== 3) {
      // Aquí puedes cambiar a 404 si no quieres revelar que existe
      return res.status(403).json({
        message:
          "No tienes permisos para consultar el historial de anticipos del área.",
      });
    }

    if (!Number.isInteger(CodigoArea)) {
      return res.status(500).json({
        message:
          "El empleado no tiene un Código de Área válido asociado. Contacte a soporte.",
      });
    }

    const result = await pool
      .request()
      .input("CodigoArea", sql.Int, CodigoArea)
      .query(`
        SELECT 
          TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion, 
          TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroAutorizacionAnticipo, 
          CONVERT(varchar(10), TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso, 120) AS FechaIngreso,
          view_Empleados.Empleado, 
          View_Area.Area, 
          viajes.Etapa,
          TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.Monto
        FROM TB_Liquidacion_Gastos_Viaje_Encabezado 
          INNER JOIN view_Empleados 
        ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
          INNER JOIN View_Cargo 
        ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
          INNER JOIN View_Area 
        ON View_Cargo.CodigoArea = View_Area.CodigoArea 
          INNER JOIN TB_Viajes_Etapas AS viajes 
        ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = viajes.CodigoEtapa
            INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos 
        ON TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.NumeroLiquidacion = TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion
        WHERE TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = 'ETP_PEN_LIQ_JEFE' and View_Area.CodigoArea = @CodigoArea
        ORDER BY TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso DESC
      `);

    // 👇 Para SELECT usa recordset
    const liquidaciones = result.recordset || [];

    // Si no hay registros, responde 200 con lista vacía
    if (liquidaciones.length === 0) {
      return res.json([]); // o { success: true, liquidaciones: [] }
    }

    return res.json(liquidaciones);
  } catch (error) {
    console.error("❌ Error en getLiquidacionesByIDEmpleado:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getLiquidacionesXFechas = async (req, res) => {
    const pool = await getConnection();
    const { FechaInicio, FechaFinal, SistemaUsuario } = req.params;
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;

    const result = await pool
        .request()
        .input("FechaInicio", sql.Date, FechaInicio)
        .input("FechaFinal", sql.Date, FechaFinal)
        .input("SistemaUsuario", sql.VarChar(20), sistemaUsuario)
        .query(`
            SELECT 
            enc.NumeroLiquidacion, 
            enc.NumeroAutorizacionAnticipo, 
            enc.FechaIngreso, 
            emp.Empleado, 
            area.Area, 
            viajes.Etapa, 
            enc.FechaAutorizacionJefe, 
            enc.FechaAutorizacionDirector, 
            enc.FechaAutorizacionAsistente 
            FROM TB_Liquidacion_Gastos_Viaje_Encabezado AS enc
            INNER JOIN view_Empleados AS emp ON enc.CodigoEmpleado = emp.CodigoEmpleado 
            INNER JOIN View_Cargo AS cargo ON emp.CodigoCargo = cargo.CodigoCargo 
            INNER JOIN View_Area AS area ON cargo.CodigoArea = area.CodigoArea 
            INNER JOIN TB_Viajes_Etapas as viajes on enc.CodigoEtapa = viajes.CodigoEtapa
            WHERE (enc.FechaIngreso BETWEEN @FechaInicio AND @FechaFinal) 
            AND (enc.SistemaUsuario = @SistemaUsuario) 
            ORDER BY enc.FechaIngreso DESC;
        `);

    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: "Anticipos no encontrados." });
    }
    
    return res.json(result.recordset);
};

export const getLiquidacionXEtapa = async (req, res) => {
    const pool = await getConnection()
    const { CodigoEtapa, SistemaUsuario } = req.params;
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;

    const result = await pool
        .request()
        .input("CodigoEtapa", sql.VarChar(30), CodigoEtapa)
        .query(`SELECT 
                  enc.NumeroLiquidacion, 
                  enc.NumeroAutorizacionAnticipo, 
                  enc.FechaIngreso, 
                  emp.Empleado, 
                  area.Area, 
                  viajes.Etapa, 
                  enc.FechaAutorizacionJefe, 
                  enc.FechaAutorizacionDirector, 
                  enc.FechaAutorizacionAsistente, 
                  det.Descripcion,
                  det.Monto
                FROM TB_Liquidacion_Gastos_Viaje_Encabezado AS enc
                INNER JOIN view_Empleados AS emp ON enc.CodigoEmpleado = emp.CodigoEmpleado 
                INNER JOIN View_Cargo AS cargo ON emp.CodigoCargo = cargo.CodigoCargo 
                INNER JOIN View_Area AS area ON cargo.CodigoArea = area.CodigoArea 
                INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos as det on enc.NumeroLiquidacion = det.NumeroLiquidacion
                INNER JOIN TB_Viajes_Etapas as viajes on enc.CodigoEtapa = viajes.CodigoEtapa
                WHERE enc.CodigoEtapa = @CodigoEtapa 
                ORDER BY enc.FechaIngreso DESC;
              `);

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const getLiquidacionEmpleadoXEtapa = async (req, res) => {
    const pool = await getConnection()
    const { CodigoEtapa, SistemaUsuario } = req.params;
    const codigoEmpleado = req.usuario?.codigoEmpleado;
    const sistemaUsuario = req.usuario?.username;

    const result = await pool
        .request()
        .input("CodigoEtapa", sql.VarChar(30), CodigoEtapa)
        .input("CodigoEmpleado", sql.Int, codigoEmpleado)
        .query(`SELECT 
                  enc.NumeroLiquidacion, 
                  enc.NumeroAutorizacionAnticipo, 
                  enc.FechaIngreso, 
                  emp.Empleado, 
                  area.Area, 
                  viajes.Etapa, 
                  enc.FechaAutorizacionJefe, 
                  enc.FechaAutorizacionDirector, 
                  enc.FechaAutorizacionAsistente, 
                  det.Descripcion,
                  det.Monto
                FROM TB_Liquidacion_Gastos_Viaje_Encabezado AS enc
                INNER JOIN view_Empleados AS emp ON enc.CodigoEmpleado = emp.CodigoEmpleado 
                INNER JOIN View_Cargo AS cargo ON emp.CodigoCargo = cargo.CodigoCargo 
                INNER JOIN View_Area AS area ON cargo.CodigoArea = area.CodigoArea 
                INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos as det on enc.NumeroLiquidacion = det.NumeroLiquidacion
                INNER JOIN TB_Viajes_Etapas as viajes on enc.CodigoEtapa = viajes.CodigoEtapa
                WHERE enc.CodigoEtapa = @CodigoEtapa and enc.CodigoEmpleado = @CodigoEmpleado
                ORDER BY enc.FechaIngreso DESC;
              `);

    if(result.rowsAffected[0] === 0) {
        return res.status(404).json({message: "Etapa no encontrados."})
    }
    return res.json(result.recordset);
}

export const loginMembershipController = async (req, res) => {
  const { username, password } = req.body;

  // Validación mínima
  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: "Usuario y contraseña son requeridos." });
  }

  try {
    // 1) Validar credenciales contra Membership (ASP.NET)
    const usuario = await loginMembership(username, password); // { username: '...' }

    // 2) Buscar empleado en tu vista (sin Prisma)
    const pool = await getPool();
    const result = await pool
      .request()
      .input("UsuarioSITAE", sql.VarChar, usuario.username)
      .query(`
        SELECT TOP (1)
          CodigoEmpleado,
          CodigoCargo,
          TipoCargo
        FROM dbo.View_EmpleadosCH
        WHERE UsuarioSITAE = @UsuarioSITAE
      `);

    if (result.recordset.length === 0) {
      // No hay empleado vinculado a ese UsuarioSITAE
      return res.status(404).json({ success: false, message: "Empleado no encontrado." });
    }

    const empleado = result.recordset[0];

    // 3) Emitir JWT
    const token = jwt.sign(
      {
        username: usuario.username,
        tipoLogin: "membership",
        codigoEmpleado: empleado.CodigoEmpleado,
        // En tu código original había empleado.Cargo?.TipoCargo, pero aquí el campo viene directo
        tipoEmpleado: empleado.TipoCargo ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 4) Respuesta
    return res.json({
      success: true,
      user: {
        username: usuario.username,
        id: empleado.CodigoEmpleado,
        tipoEmpleado: empleado.TipoCargo ?? null,
      },
      token,
    });
  } catch (error) {
    console.error("Error en loginMembership:", error?.message || error);
    // Devuelve mensaje genérico para no filtrar si falló usuario o contraseña
    return res.status(401).json({ success: false, message: "Credenciales inválidas." });
  }
};

export const getHistorialAnticipos = async (req, res) => {
  try {
    const pool = await getConnection();

    // 1) Obtener y normalizar el código de empleado
    const codigoEmpleadoRaw =
      req.usuario?.codigoEmpleado ??
      req.params?.codigoEmpleado ??
      req.query?.codigoEmpleado ??
      req.body?.codigoEmpleado;

    const codigoEmpleado = Number(codigoEmpleadoRaw);

    if (!Number.isInteger(codigoEmpleado) || codigoEmpleado <= 0) {
      return res
        .status(400)
        .json({ message: "Código de empleado inválido o ausente." });
    }

    const sistemaUsuario = req.usuario?.username || "desconocido";

    // 2) Obtener TipoCargo y CodigoArea del empleado
    const empleadoResult = await pool
      .request()
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .query(`
        SELECT TOP 1
            TipoCargo,
            CodigoArea
        FROM view_EmpleadosCH
        WHERE CodigoEmpleado = @CodigoEmpleado
      `);

    if (!empleadoResult.recordset || empleadoResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "Empleado no encontrado en view_EmpleadosCH." });
    }

    const { TipoCargo, CodigoArea } = empleadoResult.recordset[0];
    // 3) Validar rol (TipoCargo 2 o 3)
    if (TipoCargo !== 2 && TipoCargo !== 3) {
      // Aquí puedes cambiar a 404 si no quieres revelar que existe
      return res.status(403).json({
        message:
          "No tienes permisos para consultar el historial de anticipos del área.",
      });
    }

    if (!Number.isInteger(CodigoArea)) {
      return res.status(500).json({
        message:
          "El empleado no tiene un Código de Área válido asociado. Contacte a soporte.",
      });
    }

    // 4) Consultar anticipos del área
    const anticiposResult = await pool
      .request()
      .input("CodigoArea", sql.Int, CodigoArea)
      .query(`
        SELECT 
            e.NumeroAutorizacion,
            ve.Empleado,
            va.Area,
            CONVERT(varchar(10), e.FechaIngreso, 120) AS FechaIngreso,
            et.Etapa,
            d.LugarAVisitar,
            SUM(d.Monto) AS MontoAnticipo
        FROM TB_Anticipo_Gastos_Viaje_Detalle_Mision d
        INNER JOIN TB_Anticipo_Gastos_Viaje_Encabezado e
            ON d.NumeroAutorizacionAnticipo = e.NumeroAutorizacion
        INNER JOIN View_Empleados ve
            ON e.CodigoEmpleado = ve.CodigoEmpleado
        INNER JOIN View_Cargo vc
            ON ve.CodigoCargo = vc.CodigoCargo
        INNER JOIN View_Area va
            ON vc.CodigoArea = va.CodigoArea
        INNER JOIN TB_Viajes_Etapas et
            ON et.CodigoEtapa = e.CodigoEtapa
        WHERE va.CodigoArea = @CodigoArea
        GROUP BY 
            e.NumeroAutorizacion,
            ve.Empleado,
            va.Area,
            e.FechaIngreso,
            et.Etapa,
            d.LugarAVisitar;
      `);

    const anticipos = anticiposResult.recordset || [];

    if (anticipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron anticipos para el área." });
    }

    // 5) No cachear la respuesta
    res.set("Cache-Control", "no-store");
    return res.json(anticipos);
  } catch (err) {
    console.error(
      "❌ getHistorialAnticipos error:",
      err?.message || err
    );
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

export const getHistorialAnticiposByEtapa = async (req, res) => {
  try {
    const pool = await getConnection();
    const { CodigoEtapa } = req.params;

    // 1) Obtener y normalizar el código de empleado
    const codigoEmpleadoRaw =
      req.usuario?.codigoEmpleado ??
      req.params?.codigoEmpleado ??
      req.query?.codigoEmpleado ??
      req.body?.codigoEmpleado;

    const codigoEmpleado = Number(codigoEmpleadoRaw);

    if (!Number.isInteger(codigoEmpleado) || codigoEmpleado <= 0) {
      return res
        .status(400)
        .json({ message: "Código de empleado inválido o ausente." });
    }

    const sistemaUsuario = req.usuario?.username || "desconocido";

    // 2) Obtener TipoCargo y CodigoArea del empleado
    const empleadoResult = await pool
      .request()
      .input("CodigoEmpleado", sql.Int, codigoEmpleado)
      .query(`
        SELECT TOP 1
            TipoCargo,
            CodigoArea
        FROM view_EmpleadosCH
        WHERE CodigoEmpleado = @CodigoEmpleado
      `);

    if (!empleadoResult.recordset || empleadoResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "Empleado no encontrado en view_EmpleadosCH." });
    }

    const { CodigoArea } = empleadoResult.recordset[0];

    if (!Number.isInteger(CodigoArea)) {
      return res.status(500).json({
        message:
          "El empleado no tiene un Código de Área válido asociado. Contacte a soporte.",
      });
    }

    // 4) Consultar anticipos del área
    const anticiposResult = await pool
      .request()
      .input("CodigoArea", sql.Int, CodigoArea)
      .input("CodigoEtapa", sql.VarChar, CodigoEtapa)
      .query(`
        ;WITH Detalle AS (
          SELECT
              NumeroAutorizacionAnticipo,
              SUM(Monto) AS MontoAnticipo,
              MAX(LugarAVisitar) AS LugarAVisitar  -- opcional (solo si necesitas 1)
          FROM TB_Anticipo_Gastos_Viaje_Detalle_Mision
          GROUP BY NumeroAutorizacionAnticipo
        )
        SELECT
            e.NumeroAutorizacion,
            ve.Empleado,
            va.Area,
            CONVERT(varchar(10), e.FechaIngreso, 120) AS FechaIngreso,
            et.Etapa,
            d.LugarAVisitar,
            d.MontoAnticipo
        FROM TB_Anticipo_Gastos_Viaje_Encabezado e
        INNER JOIN Detalle d
            ON d.NumeroAutorizacionAnticipo = e.NumeroAutorizacion
        INNER JOIN View_Empleados ve
            ON e.CodigoEmpleado = ve.CodigoEmpleado
        INNER JOIN View_Cargo vc
            ON ve.CodigoCargo = vc.CodigoCargo
        INNER JOIN View_Area va
            ON vc.CodigoArea = va.CodigoArea
        INNER JOIN TB_Viajes_Etapas et
            ON et.CodigoEtapa = e.CodigoEtapa
        -- ✅ si realmente necesitas view_EmpleadosCH, únelo bien y sin duplicar
        -- OUTER APPLY (SELECT TOP 1 * FROM view_EmpleadosCH ch WHERE ch.CodigoEmpleado = e.CodigoEmpleado ORDER BY ch.AlgunaFecha DESC) ch
        WHERE
            e.CodigoEtapa = @CodigoEtapa
            AND va.CodigoArea = @CodigoArea;
        `);

    const anticipos = anticiposResult.recordset || [];

    if (anticipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron anticipos para el área." });
    }

    // 5) No cachear la respuesta
    res.set("Cache-Control", "no-store");
    return res.json(anticipos);
  } catch (err) {
    console.error(
      "❌ getHistorialAnticipos error:",
      err?.message || err
    );
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

export const getHistorialAnticiposDIFA = async (req, res) => {
  try {
    const pool = await getConnection();
    const { CodigoEtapa } = req.params;

    // 4) Consultar anticipos del área
    const anticiposResult = await pool
      .request()
      .input("CodigoEtapa", sql.VarChar, CodigoEtapa)
      .query(`
        ;WITH Detalle AS (
          SELECT
            NumeroAutorizacionAnticipo,
            LugarAVisitar,
            SUM(Monto) AS MontoAnticipo
          FROM TB_Anticipo_Gastos_Viaje_Detalle_Mision
          GROUP BY NumeroAutorizacionAnticipo, LugarAVisitar
        )
        SELECT
          e.NumeroAutorizacion,
          ve.Empleado,
          va.Area,
          CONVERT(varchar(10), e.FechaIngreso, 120) AS FechaIngreso,
          et.Etapa,
          d.LugarAVisitar,
          d.MontoAnticipo
        FROM TB_Anticipo_Gastos_Viaje_Encabezado e
        JOIN Detalle d
          ON d.NumeroAutorizacionAnticipo = e.NumeroAutorizacion
        JOIN View_Empleados ve
          ON e.CodigoEmpleado = ve.CodigoEmpleado
        JOIN View_Cargo vc
          ON ve.CodigoCargo = vc.CodigoCargo
        JOIN View_Area va
          ON vc.CodigoArea = va.CodigoArea
        JOIN TB_Viajes_Etapas et
          ON et.CodigoEtapa = e.CodigoEtapa
        WHERE e.CodigoEtapa = @CodigoEtapa;
      `);

    const anticipos = anticiposResult.recordset || [];

    if (anticipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron anticipos para el área." });
    }

    // 5) No cachear la respuesta
    res.set("Cache-Control", "no-store");
    return res.json(anticipos);
  } catch (err) {
    console.error(
      "❌ getHistorialAnticipos error:",
      err?.message || err
    );
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

export const getHistorialLiquidacionesDIFA = async (req, res) => {
  try {
    const pool = await getConnection();
    const CodigoEtapa = req.params;

    const anticiposResult = await pool
      .request()
      .query(`
        SELECT 
            enc.NumeroLiquidacion, 
            enc.NumeroAutorizacionAnticipo, 
            enc.FechaIngreso, 
            emp.Empleado, 
            area.Area, 
            viajes.Etapa, 
            enc.FechaAutorizacionJefe, 
            enc.FechaAutorizacionDirector, 
            enc.FechaAutorizacionAsistente, 
            det.Descripcion,
            det.Monto
        FROM TB_Liquidacion_Gastos_Viaje_Encabezado AS enc
        INNER JOIN view_Empleados AS emp ON enc.CodigoEmpleado = emp.CodigoEmpleado 
        INNER JOIN View_Cargo AS cargo ON emp.CodigoCargo = cargo.CodigoCargo 
        INNER JOIN View_Area AS area ON cargo.CodigoArea = area.CodigoArea 
        INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos as det on enc.NumeroLiquidacion = det.NumeroLiquidacion
        INNER JOIN TB_Viajes_Etapas as viajes on enc.CodigoEtapa = viajes.CodigoEtapa
        WHERE enc.CodigoEtapa = 'ETP_PEN_LIQ_ASISTENTE' 
        ORDER BY enc.FechaIngreso DESC;
      `);

    const anticipos = anticiposResult.recordset || [];

    if (anticipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron anticipos para el área." });
    }

    // 5) No cachear la respuesta
    res.set("Cache-Control", "no-store");
    return res.json(anticipos);
  } catch (err) {
    console.error(
      "❌ getHistorialAnticipos error:",
      err?.message || err
    );
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

export const getArchivosLiquidacion = async (req, res) => {
  try {
    const pool = await getConnection();

    const numeroLiquidacion = Number(req.params.numeroLiquidacion);
    if (!Number.isInteger(numeroLiquidacion) || numeroLiquidacion <= 0) {
      return res.status(400).json({ message: "Número de liquidación inválido." });
    }

    const result = await pool
      .request()
      .input("NumeroLiquidacion", sql.Int, numeroLiquidacion)
      .query(`
        SELECT
          CodigoArchivo,
          NumeroLiquidacion,
          Nombre,
          ContenidoTipo,
          Fecha_Ingreso
        FROM TB_Liquidacion_Gastos_Archivos
        WHERE NumeroLiquidacion = @NumeroLiquidacion
        ORDER BY Fecha_Ingreso DESC
      `);

    res.set("Cache-Control", "no-store");
    return res.json(result.recordset || []);
  } catch (err) {
    console.error("❌ getArchivosLiquidacion error:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getArchivoLiquidacionByCodigo = async (req, res) => {
  try {
    const pool = await getConnection();

    const codigoArchivo = Number(req.params.codigoArchivo);
    if (!Number.isInteger(codigoArchivo) || codigoArchivo <= 0) {
      return res.status(400).json({ message: "Código de archivo inválido." });
    }

    const result = await pool
      .request()
      .input("CodigoArchivo", sql.Int, codigoArchivo)
      .query(`
        SELECT TOP 1
          CodigoArchivo,
          Nombre,
          ContenidoTipo,
          Data
        FROM TB_Liquidacion_Gastos_Archivos
        WHERE CodigoArchivo = @CodigoArchivo
      `);

    const file = result.recordset?.[0];
    if (!file) {
      return res.status(404).json({ message: "Archivo no encontrado." });
    }

    const contentType = file.ContenidoTipo || "application/octet-stream";
    const filename = (file.Nombre || `archivo_${codigoArchivo}`).replace(/"/g, "");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");

    // ✅ Data debe ser Buffer/varbinary
    return res.send(file.Data);
  } catch (err) {
    console.error("❌ getArchivoLiquidacionByCodigo error:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const downloadArchivoLiquidacion = async (req, res) => {
  try {
    const pool = await getConnection();
    const codigoArchivo = Number(req.params.codigoArchivo);

    if (!Number.isInteger(codigoArchivo) || codigoArchivo <= 0) {
      return res.status(400).json({ message: "Código de archivo inválido." });
    }

    const result = await pool.request()
      .input("CodigoArchivo", sql.Int, codigoArchivo)
      .query(`
        SELECT TOP 1
          CodigoArchivo,
          Nombre,
          ContenidoTipo,
          Data
        FROM TB_Liquidacion_Gastos_Archivos
        WHERE CodigoArchivo = @CodigoArchivo
      `);

    const file = result.recordset?.[0];
    if (!file) return res.status(404).json({ message: "Archivo no encontrado." });

    const mime = file.ContenidoTipo || "application/octet-stream";
    const filename = file.Nombre || `archivo_${codigoArchivo}`;

    res.setHeader("Content-Type", mime);
    // inline permite previsualizar (PDF/imagenes). Si quieres forzar descarga, usa attachment
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");

    // Data viene como Buffer (varbinary)
    return res.send(file.Data);
  } catch (err) {
    console.error("❌ downloadArchivoLiquidacion:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getHistorialAnticiposDIFAByYear = async (req, res) => {
  try {
    const pool = await getConnection();
    const yearRaw = req.params.Year;

    const currentYear = new Date().getFullYear();
    // Si no viene nada, usamos el año actual
    const year = yearRaw ? Number(yearRaw) : currentYear;

    // Validar que sea número entero
    if (!Number.isInteger(year)) {
      return res
        .status(400)
        .json({ message: "Parámetro 'year' inválido. Debe ser un número entero." });
    }

    const anticiposResult = await pool
      .request()
      .input("year", sql.Int, year)
      .query(`
        ;WITH Detalle AS (
          SELECT
            NumeroAutorizacionAnticipo,
            LugarAVisitar,
            SUM(Monto) AS MontoAnticipo
          FROM TB_Anticipo_Gastos_Viaje_Detalle_Mision
          GROUP BY NumeroAutorizacionAnticipo, LugarAVisitar
        )
        SELECT
          e.NumeroAutorizacion,
          ve.Empleado,
          va.Area,
          CONVERT(varchar(10), e.FechaIngreso, 120) AS FechaIngreso,
          et.Etapa,
          d.LugarAVisitar,
          d.MontoAnticipo
        FROM TB_Anticipo_Gastos_Viaje_Encabezado e
        JOIN Detalle d
          ON d.NumeroAutorizacionAnticipo = e.NumeroAutorizacion
        JOIN View_Empleados ve
          ON e.CodigoEmpleado = ve.CodigoEmpleado
        JOIN View_Cargo vc
          ON ve.CodigoCargo = vc.CodigoCargo
        JOIN View_Area va
          ON vc.CodigoArea = va.CodigoArea
        JOIN TB_Viajes_Etapas et
          ON et.CodigoEtapa = e.CodigoEtapa
        WHERE
          e.CodigoEtapa IN ('ETP_ANT_APROBADO','ETP_DAP_ANT_ASISTENTE')
          AND e.FechaIngreso >= DATEFROMPARTS(@year, 1, 1)
          AND e.FechaIngreso <  DATEFROMPARTS(@year + 1, 1, 1);
      `);

    const anticipos = anticiposResult.recordset || [];

    if (anticipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron anticipos para el área." });
    }

    // 5) No cachear la respuesta
    res.set("Cache-Control", "no-store");
    return res.json(anticipos);
  } catch (err) {
    console.error(
      "❌ getHistorialAnticipos error:",
      err?.message || err
    );
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

export const getHistorialLiquidacionesDIFAByYear = async (req, res) => {
  try {
    const pool = await getConnection();
    const yearRaw = req.params.Year;

    const currentYear = new Date().getFullYear();
    // Si no viene nada, usamos el año actual
    const year = yearRaw ? Number(yearRaw) : currentYear;

    // Validar que sea número entero
    if (!Number.isInteger(year)) {
      return res
        .status(400)
        .json({ message: "Parámetro 'year' inválido. Debe ser un número entero." });
    }

    const anticiposResult = await pool
      .request()
      .input("year", sql.Int, year)
      .query(`
        SELECT 
            TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion, 
            TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroAutorizacionAnticipo, 
            CONVERT(varchar(10), TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso, 120) AS FechaIngreso,
            view_Empleados.Empleado, 
            View_Area.Area, 
            viajes.Etapa,
            TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.Monto
        FROM TB_Liquidacion_Gastos_Viaje_Encabezado 
            INNER JOIN view_Empleados 
        ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEmpleado = view_Empleados.CodigoEmpleado 
            INNER JOIN View_Cargo 
        ON view_Empleados.CodigoCargo = View_Cargo.CodigoCargo 
            INNER JOIN View_Area 
        ON View_Cargo.CodigoArea = View_Area.CodigoArea 
            INNER JOIN TB_Viajes_Etapas AS viajes 
        ON TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = viajes.CodigoEtapa
            INNER JOIN TB_Liquidacion_Gastos_Viaje_Detalle_Gastos 
        ON TB_Liquidacion_Gastos_Viaje_Detalle_Gastos.NumeroLiquidacion = TB_Liquidacion_Gastos_Viaje_Encabezado.NumeroLiquidacion
        WHERE 
          (
            TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = 'ETP_LIQ_APROBADO' 
            or TB_Liquidacion_Gastos_Viaje_Encabezado.CodigoEtapa = 'ETP_DAP_LIQ_ASISTENTE'
          )
          and YEAR(TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso) = @year
        ORDER BY TB_Liquidacion_Gastos_Viaje_Encabezado.FechaIngreso DESC
      `);

    const anticipos = anticiposResult.recordset || [];

    if (anticipos.length === 0) {
      return res
        .status(200)
        .json({ message: "No se encontraron anticipos para el área." });
    }

    // 5) No cachear la respuesta
    res.set("Cache-Control", "no-store");
    return res.json(anticipos);
  } catch (err) {
    console.error(
      "❌ getHistorialAnticipos error:",
      err?.message || err
    );
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

export const updateAprobarAnticipo = async (req, res) => {
  try {
    const pool = await getConnection();

    const { numeroAutorizacion } = req.params;
    const { Estado, observacion } = req.body;
    // 1) Validar entrada
    if (!numeroAutorizacion) {
      return res.status(400).json({
        message: "El número de autorización es obligatorio.",
      });
    }

    const numeroAutorizacionInt = Number(numeroAutorizacion);
    if (!Number.isInteger(numeroAutorizacionInt)) {
      return res.status(400).json({
        message: "El número de autorización debe ser numérico.",
      });
    }

    // Usuario que aprueba (desde el token)
    const sistemaUsuario = req.usuario?.username || "desconocido";

    // 2) Hacer el UPDATE solo si está en la etapa esperada
    const result = await pool
      .request()
      .input("NumeroAutorizacion", sql.Int, numeroAutorizacionInt)
      .input("Observacion", sql.VarChar(500), observacion || null)
      .input("SistemaUsuario", sql.VarChar(100), sistemaUsuario)
      .input("CodigoEtapa", sql.VarChar(100), Estado)
      .query(`
        UPDATE TB_Anticipo_Gastos_Viaje_Encabezado
        SET 
          CodigoEtapa = @CodigoEtapa,
          Observaciones = @Observacion,
          SistemaUsuario = @SistemaUsuario,
          FechaAutorizacionJefe = GETDATE()
        WHERE 
          NumeroAutorizacion = @NumeroAutorizacion
      `);

    // 3) Validar si realmente se actualizó algo
    if (!result.rowsAffected || result.rowsAffected[0] === 0) {
      return res.status(400).json({
        message:
          "No se pudo aprobar el anticipo. Verifique que exista y que se encuentre en la etapa pendiente del jefe.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Anticipo aprobado correctamente.",
      numeroAutorizacion: numeroAutorizacionInt,
      sistemaUsuario,
    });
  } catch (error) {
    console.error("❌ Error en aprobarAnticipo:", error?.message || error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor al aprobar el anticipo." });
  }
};

export const updateAprobarLiquidacion = async (req, res) => {
  try {
    const pool = await getConnection();

    const { NumeroLiquidacion } = req.params;
    const { observacion, Estado } = req.body;
    // 1) Validar entrada
    if (!NumeroLiquidacion) {
      return res.status(400).json({
        message: "El número de autorización es obligatorio.",
      });
    }

    const NumeroLiquidacionInt = Number(NumeroLiquidacion);
    if (!Number.isInteger(NumeroLiquidacionInt)) {
      return res.status(400).json({
        message: "El número de autorización debe ser numérico.",
      });
    }

    // Usuario que aprueba (desde el token)
    const sistemaUsuario = req.usuario?.username || "desconocido";

    // 2) Hacer el UPDATE solo si está en la etapa esperada
    const result = await pool
      .request()
      .input("NumeroLiquidacion", sql.Int, NumeroLiquidacionInt)
      .input("Observacion", sql.VarChar(500), observacion ?? null)
      .input("SistemaUsuario", sql.VarChar(100), sistemaUsuario)
      .input("CodigoEtapa", sql.VarChar(100), Estado)
      .query(`
        UPDATE TB_Liquidacion_Gastos_Viaje_Encabezado
        SET 
          CodigoEtapa = @CodigoEtapa,
          ObservacionesAsistente = @Observacion,
          SistemaUsuario = @SistemaUsuario,
          FechaAutorizacionAsistente = GETDATE()
        WHERE 
          NumeroLiquidacion = @NumeroLiquidacion
      `);

    // 3) Validar si realmente se actualizó algo
    if (!result.rowsAffected || result.rowsAffected[0] === 0) {
      return res.status(400).json({
        message:
          "No se pudo aprobar la liquidacion. Verifique que exista y que se encuentre en la etapa pendiente del jefe.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Liquidacion aprobada correctamente.",
      numeroAutorizacion: NumeroLiquidacionInt,
      sistemaUsuario,
    });
  } catch (error) {
    console.error("❌ Error en aprobarLiquidacion:", error?.message || error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor al aprobar la liquidacion." });
  }
};

export const putReemplazarArchivoLiquidacion = async (req, res) => {
  try {
    const pool = await getConnection();

    const codigoArchivo = Number(req.params.codigoArchivo);

    if (!Number.isInteger(codigoArchivo) || codigoArchivo <= 0) {
      return res.status(400).json({ message: "Código de archivo inválido." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ningún archivo." });
    }

    const validacion = await pool
      .request()
      .input("CodigoArchivo", sql.Int, codigoArchivo)
      .query(`
        SELECT TOP 1
          a.CodigoArchivo,
          a.NumeroLiquidacion,
          e.CodigoEtapa
        FROM TB_Liquidacion_Gastos_Archivos a
        INNER JOIN TB_Liquidacion_Gastos_Viaje_Encabezado e
          ON e.NumeroLiquidacion = a.NumeroLiquidacion
        WHERE a.CodigoArchivo = @CodigoArchivo
      `);

    const registro = validacion.recordset?.[0];

    if (!registro) {
      return res.status(404).json({ message: "Archivo no encontrado." });
    }

    if (registro.CodigoEtapa === "ETP_LIQ_APROBADO") {
      return res.status(403).json({
        message: "No se puede reemplazar el archivo porque la liquidación ya está aprobada."
      });
    }

    const fileContent = req.file.buffer;
    const contentType = req.file.mimetype;
    const filename = req.file.originalname;

    const queryArchivo = `
      UPDATE TB_Liquidacion_Gastos_Archivos
      SET
        Nombre = @Nombre,
        ContenidoTipo = @ContenidoTipo,
        Data = @Data,
        Fecha_Ingreso = GETDATE()
      WHERE CodigoArchivo = @CodigoArchivo
    `;

    const result = await pool
      .request()
      .input("CodigoArchivo", sql.Int, codigoArchivo)
      .input("Nombre", sql.VarChar(255), filename)
      .input("ContenidoTipo", sql.VarChar(100), contentType)
      .input("Data", sql.VarBinary(sql.MAX), fileContent)
      .query(queryArchivo);

    if (result.rowsAffected?.[0] === 0) {
      return res.status(404).json({ message: "Archivo no encontrado para reemplazar." });
    }

    return res.status(200).json({
      message: "Archivo reemplazado exitosamente."
    });
  } catch (error) {
    console.error("❌ putReemplazarArchivoLiquidacion error:", error?.message || error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};