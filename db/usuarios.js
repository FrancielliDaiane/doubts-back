// db/usuarios.js
import conexao from '../config/db.js';

// Função para cadastrar um usuário
export function cadastrarUsuario(nome, email, senha, callback) {
  const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  conexao.query(sql, [nome, email, senha], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

// Função para listar todos os usuários
export function listarUsuarios(callback) {
  const sql = 'SELECT * FROM usuarios';
  conexao.query(sql, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
}

// Função para modificar os dados de um usuário
export function modificarUsuario(id, nome, email, senha, callback) {
  const sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?';
  conexao.query(sql, [nome, email, senha, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

// Função para deletar um usuário
export function deletarUsuario(id, callback) {
  const sql = 'DELETE FROM usuarios WHERE id = ?';
  conexao.query(sql, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}
