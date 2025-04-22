
import mysql from 'mysql2';

const conexao = mysql.createConnection({
  host: 'ss04ggwskkwc0ksgcookg48w',
  user: 'doubts',
  password: '12345678',   
  database: 'doubts_db',
  port: 3306   
});

conexao.connect((err) => {
  if (err) throw err;
  console.log('✅ Conectado ao banco de dados!');
});

export default conexao;
