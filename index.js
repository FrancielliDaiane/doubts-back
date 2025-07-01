// index.js
import express from 'express';
import bodyParser from 'body-parser';
import { cadastrarUsuario, listarUsuarios, modificarUsuario, deletarUsuario } from './db/usuarios.js';
import { criarCanal, adicionarUsuarioCanal, enviarMensagem, verificarDonoCanal, atualizarCanal, excluirCanal } from './db/canais.js';
import jwt from 'jsonwebtoken';
import conexao from './config/db.js';
const app = express();
app.use(bodyParser.json());


// Middleware para verificar se o usuário está autenticado
//export function autenticarUsuareq, res, next) {
  // Middleware para verificar se o usuário está autenticado
function autenticarUsuario(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send('Token de autenticação não fornecido');
  }

  jwt.verify(token, 'seu-segredo-jwt', (err, decoded) => {
    if (err) {
      return res.status(401).send('Token inválido');
    }

    req.user = decoded; // Adiciona o usuário autenticado ao objeto req
    next(); // Continua para a próxima função
  });
}





const JWT_SECRET = 'seu-segredo-jwt'; // guarde isso com carinho em produção

// ROTA DE LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).send('Email e senha são obrigatórios!');
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  conexao.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).send('Erro no servidor');
    }

    if (results.length === 0) {
      return res.status(401).send('Usuário não encontrado');
    }

    const usuario = results[0];

    if (usuario.senha !== senha) {
      return res.status(401).send('Senha incorreta');
    }

    // Criação do token com os dados do usuário
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  });
});

// Rota para cadastrar usuário
app.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).send('Preencha todos os campos!');
  }

  cadastrarUsuario(nome, email, senha, (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar usuário:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.status(201).send('Usuário cadastrado com sucesso!');
  });
});

// Rota para listar todos os usuário
app.get('/usuarios', (req, res) => {
  listarUsuarios((err, users) => {
    if (err) {
      console.error('Erro ao listar usuários:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.status(200).json(users); 
  });
});


app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).send('Preencha todos os campos!');
  }

  modificarUsuario(id, nome, email, senha, (err, result) => {
    if (err) {
      console.error('Erro ao modificar usuário:', err);
      return res.status(500).send('Erro no servidor');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.status(200).send('Usuário modificado com sucesso!');
  });
});


app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;

  deletarUsuario(id, (err, result) => {
    if (err) {
      console.error('Erro ao deletar usuário:', err);
      return res.status(500).send('Erro no servidor');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.status(200).send('Usuário deletado com sucesso!');
  });
});

// Rota para criar um canal
app.post('/canais', autenticarUsuario,  (req, res) => {
  const { nome, descricao, foto_url } = req.body;
  const usuario_id = req.user.id;  // Supondo que você tenha a autenticação configurada

  if (!nome) {
    return res.status(400).send('Nome do canal é obrigatório!');
  }

  criarCanal(nome, descricao || '', foto_url || '', usuario_id, (err, result) => {
    if (err) {
      console.error('Erro ao criar canal:', err);
      return res.status(500).send('Erro no servidor');
    }

    res.status(201).send('Canal criado com sucesso!');
  });
});

// Rota para adicionar um usuário a um canal
app.post('/canais/:canal_id/usuarios/:usuario_id', (req, res) => {
  const { canal_id, usuario_id } = req.params;

  adicionarUsuarioCanal(usuario_id, canal_id, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar usuário ao canal:', err);
      return res.status(500).send('Erro no servidor');
    }

    res.status(200).send('Usuário adicionado ao canal com sucesso!');
  });
});

//ATUALIZAR CANAL
app.put('/canais/:id', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const { nome, descricao, foto_url } = req.body;
  const usuario_id = req.user.id;

  verificarDonoCanal(id, (err, donoId) => {
    if (err) return res.status(500).send('Erro no servidor');
    if (!donoId) return res.status(404).send('Canal não encontrado');
    if (donoId !== usuario_id) return res.status(403).send('Você não tem permissão');

    atualizarCanal(id, nome, descricao, foto_url, (err, result) => {
      if (err) return res.status(500).send('Erro ao atualizar canal');
      res.status(200).send('Canal atualizado com sucesso!');
    });
  });
});


// Rota para excluir o canal
app.delete('/canais/:id', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;

  verificarDonoCanal(id, (err, donoId) => {
    if (err) return res.status(500).send('Erro no servidor');
    if (!donoId) return res.status(404).send('Canal não encontrado');
    if (donoId !== usuario_id) return res.status(403).send('Você não tem permissão');

    excluirCanal(id, (err, result) => {
      if (err) return res.status(500).send('Erro ao excluir canal');
      res.status(200).send('Canal excluído com sucesso!');
    });
  });
});



// Rota para enviar uma mensagem no canal
app.post('/canais/:canal_id/mensagem', (req, res) => {
  const { usuario_id, mensagem } = req.body;
  const { canal_id } = req.params;

  if (!mensagem || !usuario_id) {
    return res.status(400).send('Usuário e mensagem são obrigatórios!');
  }

  enviarMensagem(usuario_id, canal_id, mensagem, (err, result) => {
    if (err) {
      console.error('Erro ao enviar mensagem:', err);
      return res.status(500).send('Erro no servidor');
    }

    res.status(200).send('Mensagem enviada com sucesso!');
  });
});



app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
