import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"senai",
    database: "dblivraria",
    port: 3306,
});

console.log("conectado ao banco de dados dblivraria!! <3")