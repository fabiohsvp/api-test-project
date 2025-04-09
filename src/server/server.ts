import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// API 1: Cadastro de Usuário
app.post('/api/cadastro', (req, res) => {
  const { nome, email, senha, origem } = req.body;
  
  // Validação básica
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }
  
  // Gera um usuarioId aleatório entre 10000 e 99999
  const usuarioId = Math.floor(Math.random() * 90000) + 10000;
  
  // Retorna o usuarioId gerado
  res.status(200).json({ usuarioId });
});

// API 2: Login
app.get('/api/login', (req, res) => {
  const usuarioId = Number(req.query.usuarioId);
  
  if (!usuarioId) {
    return res.status(400).json({ erro: 'usuarioId não fornecido' });
  }
  
  // Falha se o usuarioId for múltiplo de 5
  if (usuarioId % 5 === 0) {
    return enviarErroAleatorio(res);
  }
  
  // Sucesso caso contrário
  res.status(200).json({ mensagem: 'Login realizado com sucesso' });
});

// API 3: Alteração de Dados
app.put('/api/alteracao', (req, res) => {
  const usuarioId = Number(req.query.usuarioId);
  
  if (!usuarioId) {
    return res.status(400).json({ erro: 'usuarioId não fornecido' });
  }
  
  // Falha se o usuarioId for múltiplo de 3
  if (usuarioId % 3 === 0) {
    return enviarErroAleatorio(res);
  }
  
  // Sucesso caso contrário
  res.status(200).json({ mensagem: 'Dados alterados com sucesso' });
});

// API 4: Listagem de Pedidos
app.get('/api/pedidos', (req, res) => {
  const usuarioId = Number(req.query.usuarioId);
  
  if (!usuarioId) {
    return res.status(400).json({ erro: 'usuarioId não fornecido' });
  }
  
  // 90% de chance de sucesso, 10% de falha
  if (Math.random() < 0.1) {
    return enviarErroAleatorio(res);
  }
  
  // Gera uma lista de pedidos fictícia
  const pedidos = [
    { id: 1, valor: 150.0, data: '2023-01-15' },
    { id: 2, valor: 89.9, data: '2023-02-20' },
    { id: 3, valor: 200.5, data: '2023-03-10' }
  ];
  
  // Retorna a lista de pedidos
  res.status(200).json({ pedidos });
});

// Função para enviar um erro aleatório
function enviarErroAleatorio(res: express.Response) {
  const erros = [
    { status: 504, mensagem: 'Gateway Timeout' },
    { status: 401, mensagem: 'Unauthorized' },
    { status: 400, mensagem: 'Bad Request' },
    { status: 500, mensagem: 'Internal Server Error' }
  ];
  
  const erroAleatorio = erros[Math.floor(Math.random() * erros.length)];
  return res.status(erroAleatorio.status).json({ erro: erroAleatorio.mensagem });
}

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});