//----- configurar servidor -----//
const express = require("express");
const app = express();
const port = 3000;

app.use(express.static(__dirname + '/app/visao', {
    maxAge: '1d',
    etag: true
}));
app.use(express.static(__dirname + '/files'));

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: false });

//----- configurar pacote para salvar arquivos -----//
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'files/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

//----- configurar pacote para mover arquivos -----//
const fs = require('fs-extra');

function moverArquivo(tipo, arquivo) {
    fs.move('files/' + arquivo, 'files/' + tipo + '/' + arquivo, { overwrite: true }, (err) => {
        if (err) return console.error(err);
    });
}

//----- importar classes -----//
const Musica = require("./app/modelo/musica");
const Album = require("./app/modelo/album");
const Artista = require("./app/modelo/artista");

const controleArtista = require("./app/controle/controle-artista");
const controleMusica = require("./app/controle/controle-musica");
const controleAlbum = require("./app/controle/controle-album");

app.set('view engine', 'ejs');
app.set('views', './app/visao');

//----- <----- Rotas -----> -----//
app.get("/", (req, res) => {
    async function abrirIndex() {
        var lista_albums = await controleAlbum.selectAllAlbums();
        res.render("index", { musicas: [], albums: lista_albums });
    }
    abrirIndex();
});

app.post("/", urlParser, (req, res) => {
    async function abrirIndex() {
        var lista_albums = await controleAlbum.selectAllAlbums();
        var lista_musicas = await controleMusica.selectMusicasDoAlbum(req.body.id_album);
        res.render("index", { musicas: lista_musicas, albums: lista_albums });
    }
    abrirIndex();
});

app.get("/lista-musicas", (req, res) => {
    async function abrirListaMusicas() {
        var lista_musicas = await controleMusica.selectAllMusicasDetalhadas();
        res.render("lista-musicas", { 
            musicas: lista_musicas,
            formatarDuracao: (segundos) => {
                const minutos = Math.floor(segundos / 60);
                const segsRestantes = segundos % 60;
                return `${minutos}:${segsRestantes.toString().padStart(2, '0')}`;
            }
        });
    }
    abrirListaMusicas();
});

//----- Cadastro artista -----//
app.get("/cadastro-artista", (req, res) => {
    res.render("cadastro-artista");
});

app.post("/confirmar-cadastro-artista", upload.single("foto"), (req, res) => {
    async function cadastrar_artista() {
        var artista = new Artista(req.body.nome, req.body.pais, req.body.data_nasc, req.file.filename);

        var resultado = await controleArtista.insertArtista(artista);

        if (resultado !== -1) {
            moverArquivo("fotos", req.file.filename);
            res.render("confirmar-cadastro-artista", { success: resultado, artista: artista });
        }
    }

    cadastrar_artista();
});

//----- Cadastro álbum -----//
app.get("/cadastro-album", (req, res) => {
    // async function abrirCadastroAlbum() {
    //     var artistas = await controleArtista.selectAllArtistas();
    //     res.render("cadastro-album", {artistas: artistas});
    // }
    // abrirCadastroAlbum();
    res.render("cadastro-album", { artistas: [] });
});

app.post("/confirmar-cadastro-album", upload.single("arquivo"), (req, res) => {
    async function cadastrar_album() {
        var album = new Album(req.body.titulo, req.file.filename, req.body.genero);
        var resultado = await controleAlbum.insertAlbum(album);
        moverArquivo("capas", req.file.filename);
        res.render("confirmar-cadastro-album", { success: resultado, album: album });
    }
    cadastrar_album();
});

//----- Cadastro música -----//
app.get("/cadastro-musica", (req, res) => {
    async function abrirCadastroMusica() {
        var lista_artistas = await controleArtista.selectAllArtistas();
        var lista_albums = await controleAlbum.selectAllAlbums();
        res.render("cadastro-musica", { artistas: lista_artistas, albums: lista_albums });
    }
    abrirCadastroMusica();
});

app.post("/confirmar-cadastro-musica", upload.single("arquivo"), (req, res) => {
    async function cadastrar_musica() {
        var m = new Musica(req.body.titulo, req.file.filename, req.body.duracao, req.body.genero);
        var resultado = await controleMusica.insertMusica(m, req.body.album);
        console.log("belaw ", resultado);
        
        var resultado2 = await controleMusica.insertMusicaArtista(resultado, req.body.artista);

        moverArquivo("musicas", req.file.filename);
        res.render("confirmar-cadastro-musica", { success: resultado2, musica: m });
    }
    cadastrar_musica();
});

app.delete("/deletar-musica/:id", (req, res) => {
    async function deletarMusica() {
        try {
            const id = req.params.id;
            
            // Primeiro obtém o nome do arquivo para poder deletá-lo
            const musica = await controleMusica.selectMusicaPorId(id);
            
            if (musica) {
                // Deleta o registro do banco
                await controleMusica.deleteMusica(id);
                
                // Remove o arquivo físico
                const caminhoArquivo = `files/musicas/${musica.arquivo}`;
                if (fs.existsSync(caminhoArquivo)) {
                    fs.unlinkSync(caminhoArquivo);
                }
                
                res.status(200).json({ message: 'Música deletada com sucesso' });
            } else {
                res.status(404).json({ error: 'Música não encontrada' });
            }
        } catch (error) {
            console.error('Erro ao deletar música:', error);
            res.status(500).json({ error: 'Erro ao deletar música' });
        }
    }
    deletarMusica();
});

//----- Inicia servidor -----//
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});