import mssql from "mssql";

const connectionSettings = {
    server: "srv-bd.cntlocal.gob.hn",
    database: "SIBIN",
    user: "eduardo.rosales",
    password: "WBt5#P9R*itAm2",
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

export async function getConnection(){
    try{
        const pool = await mssql.connect(connectionSettings);
        return pool;
    }
    catch(error){
        console.error(error)
    }
}

export { mssql };