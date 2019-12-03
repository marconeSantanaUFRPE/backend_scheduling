

module.exports =  function chamarBanco(){

    const mysql = require("mysql2/promise");
    const connection =  mysql.createPool({
        host: "34.95.128.63",
        user: "root",
        port: "3306",
        password: "agenda",
        database: "schedulingdb",
        waitForConnections:true
        
    
    })


    
    return connection
}