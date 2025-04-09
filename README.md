# Plano de Testes de API

Este projeto implementa um plano de testes para quatro APIs diferentes, utilizando TypeScript nativo no front-end e Node.js com Express no back-end.

## Descrição

O sistema consiste em um dashboard de monitoramento que permite testar quatro fluxos de API. O sistema possui dois modos de visualização:

- **Modo Cliente**: Os dados sensíveis (payloads e IDs) são filtrados da interface
- **Modo Monitor**: Visibilidade completa dos dados, incluindo todos os detalhes de requisição/resposta

O fluxo de testes é abortado automaticamente quando ocorre uma falha em qualquer etapa, exibindo mensagens claras sobre o status de cada operação.

Fluxos disponíveis:

1. **Cadastro**: Executa apenas a chamada de cadastro.
2. **Login**: Executa as chamadas de cadastro e login sequencialmente.
3. **Edição de Dados**: Executa as chamadas de cadastro, login e alteração de dados em sequência.
4. **Listagem de Pedidos**: Executa as chamadas de cadastro, login, alteração de dados e listagem de pedidos, todas em sequência.

## APIs Implementadas

1. **Cadastro de Usuário [POST]**:
   - Entrada: JSON com nome, email, senha e origem.
   - Processamento: Gera um usuarioId aleatório entre 10000 e 99999.
   - Saída: JSON com o usuarioId gerado.

2. **Login [GET]**:
   - Entrada: usuarioId passado como parâmetro na query string.
   - Regra: Falha se o usuarioId for múltiplo de 5; caso contrário, sucesso.

3. **Alteração de Dados [PUT]**:
   - Entrada: usuarioId passado como parâmetro na query string.
   - Regra: Falha se o usuarioId for múltiplo de 3; caso contrário, sucesso.

4. **Listagem de Pedidos [GET]**:
   - Entrada: usuarioId passado como parâmetro na query string.
   - Regra: 90% de chance de sucesso; 10% de falha, determinada aleatoriamente.

## Tecnologias Utilizadas

- **Front-end**: TypeScript nativo, Bootstrap
- **Back-end**: Node.js, Express

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

## Execução

Para iniciar o projeto em modo de desenvolvimento:

```bash
npm run monitor
```

Este comando irá:
1. Compilar o código TypeScript do cliente
2. Iniciar o servidor Express

Acesse a aplicação em: http://localhost:3000

## Estrutura do Projeto

```
/
├── public/              # Arquivos estáticos e compilados do cliente
│   ├── index.html       # Página principal
│   ├── styles.css       # Estilos CSS
│   └── app.js           # JavaScript compilado do cliente
├── src/
│   ├── client/          # Código fonte do cliente
│   │   └── app.ts       # Lógica do cliente em TypeScript
│   └── server/          # Código fonte do servidor
│       └── server.ts    # Implementação do servidor Express
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração do TypeScript para o servidor
└── tsconfig.client.json # Configuração do TypeScript para o cliente
```

## Desenvolvido por:

[Fabio Henrique de Souza Venâncio Pinheiro](github.com/fabiohsvp)
Contato: (11) 95818-4521
E-mail: fabiohvp2012@gmail.com