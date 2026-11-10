const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "empresa"
});

conexao.connect((erro) => {
    if (erro) {
        console.log(erro);
    } else {
        console.log("Banco conectado!");
    }
});

app.post("/clientes", (req, res) => {

    const { nome } = req.body;

    const sql = "INSERT INTO clientes(nome) VALUES (?)";

    conexao.query(sql, [nome], (erro) => {
        if (erro) return res.status(500).json(erro);

        res.json({
            mensagem: "Cliente cadastrado!"
        });
    });

});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});