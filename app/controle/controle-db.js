const mysql = require('mysql2/promise');

function getPool() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '1234',
        database: process.env.DB_NAME || 'player_musicas'
    });

    return pool;
}


exports.getPool = getPool;

// function insert(sql, values, callback) {
//     con.query(sql, values, function (erro, result) {
//         if (erro) {
//             console.log("erro ao inserir", erro);
//             callback(-1);
//         } else {
//             callback(result.insertId);
//         }
//     });
// }

// function selectAll(table, callback) {
//     var sql = "SELECT * FROM " + table;        

//     con.query(sql, function (erro, result, fields) {        
//         if (erro) {
//             console.log("erro ao inserir", erro);
//             callback(-1);
//         } else {
//             callback(result.insertId);
//         }

//         callback(lista_artistas);
//     });
// }

// exports.con = con;
// exports.insert = insert;
// exports.selectAll = selectAll;

