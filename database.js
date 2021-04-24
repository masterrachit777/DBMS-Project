
const mysql = require("mysql");

//creating sql connection

const sqlConnect = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    password: '',
    database: "institute_db1"
});

module.exports = sqlConnect;
