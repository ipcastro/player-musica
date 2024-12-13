const Musica = require("../modelo/musica");
const getPool = require("./controle-db").getPool;

exports.insertMusica = async function(musica, id_album) {
    try {
        const pool = getPool();
        const sql = "INSERT INTO musica (titulo, arquivo, duracao, genero, id_album) VALUES (?, ?, ?, ?, ?)";
        const values = [musica.titulo, musica.arquivo, musica.duracao, musica.genero, id_album];
        const [result] = await pool.execute(sql, values);
        await pool.end();
        return result.insertId;
    } catch (error) {
        console.error('Erro ao inserir música:', error);
        throw error;
    }
}

exports.insertMusicaArtista = async function(musica_id, lista_artistas_id) {
    var pool = getPool();

    var sql = "";
    
    var values = null;
    if (Array.isArray(lista_artistas_id)) {
        values = lista_artistas_id.map(item => [musica_id, item]);
        sql = "INSERT INTO artista_musica (id_musica, id_artista) VALUES ?";
    } else {
        values = [musica_id, lista_artistas_id];
        sql = "INSERT INTO artista_musica (id_musica, id_artista) VALUES (?, ?)";
    }

    console.log(values);    

    var result = await pool.execute(sql, values);

    pool.end();

    return result[0].insertId;
}

exports.selectAllMusicas = async function() {
    var pool = getPool();

    var sql = "SELECT * FROM musica";
    var [rows, fields] = await pool.execute(sql);

    // var lista_artistas = []
    // for (r of rows) {
    //     var a = new Artista(r.nome, r.pais, r.data_nasc, r.foto);
    //     a.id = r.id;

    //     lista_artistas.push(a);
    // }

    pool.end();

    return rows;
    // return lista_artistas;
}

exports.selectMusicasDoAlbum = async function(id_album) {
    var pool = getPool();

    var sql = "SELECT * FROM musica WHERE id_album = ?";
    var [rows, fields] = await pool.execute(sql, [id_album]);

    pool.end();

    return rows;
}

exports.selectAllMusicasDetalhadas = async function() {
    var pool = getPool();

    var sql = `
        SELECT m.*, 
               a.titulo as album_titulo,
               GROUP_CONCAT(ar.nome) as artistas
        FROM musica m
        LEFT JOIN album a ON m.id_album = a.id
        LEFT JOIN artista_musica am ON m.id = am.id_musica
        LEFT JOIN artista ar ON am.id_artista = ar.id
        GROUP BY m.id
        ORDER BY m.id DESC
    `;
    
    var [rows] = await pool.execute(sql);
    
    pool.end();
    
    return rows;
}

exports.selectMusicaPorId = async function(id) {
    const pool = getPool();
    const sql = "SELECT * FROM musica WHERE id = ?";
    const [rows] = await pool.execute(sql, [id]);
    await pool.end();
    return rows[0];
}

exports.deleteMusica = async function(id) {
    const pool = getPool();
    
    // Primeiro deleta as referências na tabela artista_musica
    await pool.execute("DELETE FROM artista_musica WHERE id_musica = ?", [id]);
    
    // Depois deleta a música
    await pool.execute("DELETE FROM musica WHERE id = ?", [id]);
    
    await pool.end();
}