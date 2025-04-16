
import mysql from 'mysql2';

const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',   
  database: 'doubts',
  port: 3307   
});

conexao.connect((err) => {
  if (err) throw err;
  console.log('✅ Conectado ao banco de dados!');
});

export default conexao;
