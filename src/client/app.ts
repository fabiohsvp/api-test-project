// Interfaces
interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  origem: string;
}

interface CadastroResponse {
  usuarioId: number;
}

interface ApiResponse {
  mensagem?: string;
  erro?: string;
  pedidos?: Array<{ id: number; valor: number; data: string }>;
}

// Classe principal para gerenciar os testes de API
class ApiTestManager {
  private baseUrl: string = 'http://localhost:3000/api';
  private resultadosElement: HTMLElement;
  private statusIndicator: HTMLElement;
  private usuarioId: number | null = null;
  private isMonitorMode: boolean = false;

  constructor() {
    this.resultadosElement = document.getElementById('resultados') as HTMLElement;
    this.statusIndicator = document.getElementById('statusIndicator') as HTMLElement;
    
    // Verifica se está no modo de monitoramento
    this.checkMonitorMode();
    
    this.inicializarEventos();
    this.setupModeToggle();
  }
  
  private checkMonitorMode(): void {
    // Verifica se há um parâmetro na URL indicando modo de monitoramento
    const urlParams = new URLSearchParams(window.location.search);
    this.isMonitorMode = urlParams.get('mode') === 'monitor';
    
    // Atualiza a interface com base no modo
    this.updateInterfaceForMode();
  }
  
  private updateInterfaceForMode(): void {
    const modeIndicator = document.createElement('div');
    modeIndicator.className = `mode-indicator ${this.isMonitorMode ? 'monitor-mode' : 'client-mode'}`;
    modeIndicator.textContent = this.isMonitorMode ? 'Modo Monitor' : 'Modo Cliente';
    
    // Adiciona ou atualiza o indicador na interface
    const existingIndicator = document.querySelector('.mode-indicator');
    if (existingIndicator) {
      existingIndicator.replaceWith(modeIndicator);
    } else {
      document.querySelector('.card-header')?.appendChild(modeIndicator);
    }
    
    // Atualiza classes no body para estilização diferente
    document.body.classList.toggle('monitor-mode', this.isMonitorMode);
    document.body.classList.toggle('client-mode', !this.isMonitorMode);
  }
  
  private setupModeToggle(): void {
    // Cria botão para alternar entre modos
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn btn-sm btn-outline-secondary ms-2';
    toggleButton.textContent = this.isMonitorMode ? 'Mudar para Modo Cliente' : 'Mudar para Modo Monitor';
    toggleButton.addEventListener('click', () => this.toggleMode());
    
    // Adiciona o botão na interface
    document.querySelector('.card-header .d-flex')?.appendChild(toggleButton);
  }
  
  private toggleMode(): void {
    // Alterna o modo e recarrega a página com o parâmetro apropriado
    const newMode = this.isMonitorMode ? '' : 'monitor';
    window.location.href = newMode ? `?mode=${newMode}` : window.location.pathname;
  }

  private inicializarEventos(): void {
    // Botão de Cadastro
    document.getElementById('btnCadastro')?.addEventListener('click', () => {
      this.limparResultados();
      this.executarFluxoCadastro();
    });

    // Botão de Login
    document.getElementById('btnLogin')?.addEventListener('click', () => {
      this.limparResultados();
      this.executarFluxoLogin();
    });

    // Botão de Edição
    document.getElementById('btnEdicao')?.addEventListener('click', () => {
      this.limparResultados();
      this.executarFluxoEdicao();
    });

    // Botão de Listagem
    document.getElementById('btnListagem')?.addEventListener('click', () => {
      this.limparResultados();
      this.executarFluxoListagem();
    });
  }

  private limparResultados(): void {
    this.resultadosElement.innerHTML = '';
    this.usuarioId = null;
    this.atualizarStatus('Aguardando', 'info');
  }
  
  private atualizarStatus(mensagem: string, tipo: 'info' | 'success' | 'warning' | 'danger'): void {
    this.statusIndicator.textContent = mensagem;
    this.statusIndicator.className = `badge bg-${tipo}`;
  }

  private adicionarResultado(titulo: string, conteudo: any, sucesso: boolean = true): void {
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${sucesso ? 'result-success' : 'result-error'}`;
    
    const tituloElement = document.createElement('h5');
    tituloElement.textContent = titulo;
    resultItem.appendChild(tituloElement);
    
    // No modo monitor, não filtra nenhum dado
    if (this.isMonitorMode) {
      // Não faz nenhuma filtragem, mostra tudo
      const preElement = document.createElement('pre');
      preElement.textContent = typeof conteudo === 'object' ? 
        JSON.stringify(conteudo, null, 2) : conteudo.toString();
      resultItem.appendChild(preElement);
    } 
    // No modo cliente, filtra os dados sensíveis
    else {
      let conteudoFiltrado: any;
      if (typeof conteudo === 'object' && conteudo !== null) {
        // Criar uma cópia do objeto para não modificar o original
        conteudoFiltrado = { ...conteudo };
        
        // Remover dados sensíveis
        if (conteudoFiltrado.data) {
          // Ocultar usuarioId e outros dados sensíveis
          if (conteudoFiltrado.data.usuarioId) {
            conteudoFiltrado.data = { status: 'ID gerado com sucesso' };
          }
          
          // Ocultar payloads detalhados
          if (conteudoFiltrado.data.pedidos) {
            conteudoFiltrado.data = { status: `${conteudoFiltrado.data.pedidos.length} pedidos encontrados` };
          }
          
          // Remover detalhes de erro, mantendo apenas a mensagem
          if (conteudoFiltrado.data.erro) {
            conteudoFiltrado.data = { status: 'Erro: ' + conteudoFiltrado.data.erro };
          }
        }
      } else {
        // Se for uma string, verificar se contém informações sensíveis
        conteudoFiltrado = conteudo.toString();
        if (conteudoFiltrado.includes('usuarioId:')) {
          conteudoFiltrado = 'Processando requisição...';
        }
      }
      
      const preElement = document.createElement('pre');
      preElement.textContent = typeof conteudoFiltrado === 'object' ? 
        JSON.stringify(conteudoFiltrado, null, 2) : conteudoFiltrado.toString();
      resultItem.appendChild(preElement);
    }
    
    this.resultadosElement.appendChild(resultItem);
  }

  // API 1: Cadastro de Usuário
  private async cadastrarUsuario(): Promise<number | null> {
    try {
      this.adicionarResultado('Iniciando Cadastro de Usuário', 'Enviando requisição...');
      
      const dadosCadastro: CadastroRequest = {
        nome: 'Usuário Teste',
        email: 'usuario@teste.com',
        senha: 'senha123',
        origem: 'teste-api'
      };
      
      const response = await fetch(`${this.baseUrl}/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosCadastro)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // No modo monitor, mostra todos os dados incluindo o usuarioId
        if (this.isMonitorMode) {
          this.adicionarResultado('Cadastro Realizado com Sucesso', {
            status: response.status,
            data: data,
            request: dadosCadastro
          });
        } else {
          this.adicionarResultado('Cadastro Realizado com Sucesso', {
            status: response.status,
            mensagem: 'Usuário cadastrado com sucesso'
          });
        }
        return (data as CadastroResponse).usuarioId;
      } else {
        // No modo monitor, mostra detalhes completos do erro
        if (this.isMonitorMode) {
          this.adicionarResultado('Erro no Cadastro', {
            status: response.status,
            error: data,
            request: dadosCadastro
          }, false);
        } else {
          this.adicionarResultado('Erro no Cadastro', {
            status: response.status,
            mensagem: 'Falha ao cadastrar usuário'
          }, false);
        }
        return null;
      }
    } catch (error) {
      this.adicionarResultado('Erro na Requisição de Cadastro', 
        this.isMonitorMode ? error : 'Falha na comunicação com o servidor', 
        false);
      return null;
    }
  }

  // API 2: Login
  private async realizarLogin(usuarioId: number): Promise<boolean> {
    try {
      this.adicionarResultado('Iniciando Login', 'Enviando requisição...');
      
      const response = await fetch(`${this.baseUrl}/login?usuarioId=${usuarioId}`, {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (this.isMonitorMode) {
          this.adicionarResultado('Login Realizado com Sucesso', {
            status: response.status,
            data: data,
            usuarioId: usuarioId
          });
        } else {
          this.adicionarResultado('Login Realizado com Sucesso', {
            status: response.status,
            mensagem: 'Autenticação realizada com sucesso'
          });
        }
        return true;
      } else {
        if (this.isMonitorMode) {
          this.adicionarResultado('Erro no Login', {
            status: response.status,
            error: data,
            usuarioId: usuarioId
          }, false);
        } else {
          this.adicionarResultado('Erro no Login', {
            status: response.status,
            mensagem: `Falha na autenticação: ${data.erro || 'Erro desconhecido'}`
          }, false);
        }
        return false;
      }
    } catch (error) {
      this.adicionarResultado('Erro na Requisição de Login', 
        this.isMonitorMode ? error : 'Falha na comunicação com o servidor', 
        false);
      return false;
    }
  }

  // API 3: Alteração de Dados
  private async alterarDados(usuarioId: number): Promise<boolean> {
    try {
      this.adicionarResultado('Iniciando Alteração de Dados', 'Enviando requisição...');
      
      const response = await fetch(`${this.baseUrl}/alteracao?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (this.isMonitorMode) {
          this.adicionarResultado('Dados Alterados com Sucesso', {
            status: response.status,
            data: data,
            usuarioId: usuarioId,
          });
        } else {
          this.adicionarResultado('Dados Alterados com Sucesso', {
            status: response.status,
            mensagem: 'Dados do usuário atualizados com sucesso'
          });
        }
        return true;
      } else {
        if (this.isMonitorMode) {
          this.adicionarResultado('Erro na Alteração de Dados', {
            status: response.status,
            error: data,
            usuarioId: usuarioId,
          }, false);
        } else {
          this.adicionarResultado('Erro na Alteração de Dados', {
            status: response.status,
            mensagem: `Falha na atualização: ${data.erro || 'Erro desconhecido'}`
          }, false);
        }
        return false;
      }
    } catch (error) {
      this.adicionarResultado('Erro na Requisição de Alteração', 
        this.isMonitorMode ? error : 'Falha na comunicação com o servidor', 
        false);
      return false;
    }
  }

  // API 4: Listagem de Pedidos
  private async listarPedidos(usuarioId: number): Promise<boolean> {
    try {
      this.adicionarResultado('Iniciando Listagem de Pedidos', 'Enviando requisição...');
      
      const response = await fetch(`${this.baseUrl}/pedidos?usuarioId=${usuarioId}`, {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (this.isMonitorMode) {
          this.adicionarResultado('Pedidos Listados com Sucesso', {
            status: response.status,
            data: data,
            usuarioId: usuarioId,
          });
        } else {
          const numeroPedidos = data.pedidos ? data.pedidos.length : 0;
          this.adicionarResultado('Pedidos Listados com Sucesso', {
            status: response.status,
            mensagem: `${numeroPedidos} pedido(s) encontrado(s)`
          });
        }
        return true;
      } else {
        if (this.isMonitorMode) {
          this.adicionarResultado('Erro na Listagem de Pedidos', {
            status: response.status,
            error: data,
            usuarioId: usuarioId,
          }, false);
        } else {
          this.adicionarResultado('Erro na Listagem de Pedidos', {
            status: response.status,
            mensagem: `Falha ao listar pedidos: ${data.erro || 'Erro desconhecido'}`
          }, false);
        }
        return false;
      }
    } catch (error) {
      this.adicionarResultado('Erro na Requisição de Listagem', 
        this.isMonitorMode ? error : 'Falha na comunicação com o servidor', 
        false);
      return false;
    }
  }

  // Fluxos de Teste
  private async executarFluxoCadastro(): Promise<void> {
    this.atualizarStatus('Executando', 'warning');
    this.usuarioId = await this.cadastrarUsuario();
    if (!this.usuarioId) {
      this.adicionarResultado('Fluxo de Cadastro Abortado', 'O teste foi interrompido devido a falha na etapa de cadastro.', false);
      this.atualizarStatus('Falha', 'danger');
    } else {
      this.atualizarStatus('Concluído', 'success');
    }
  }

  private async executarFluxoLogin(): Promise<void> {
    this.atualizarStatus('Executando', 'warning');
    this.usuarioId = await this.cadastrarUsuario();
    if (!this.usuarioId) {
      this.adicionarResultado('Fluxo de Login Abortado', 'O teste foi interrompido devido a falha na etapa de cadastro.', false);
      this.atualizarStatus('Falha', 'danger');
      return;
    }
    
    const loginSucesso = await this.realizarLogin(this.usuarioId);
    if (!loginSucesso) {
      this.adicionarResultado('Fluxo de Login Abortado', 'O teste foi interrompido devido a falha na etapa de login.', false);
      this.atualizarStatus('Falha', 'danger');
    } else {
      this.atualizarStatus('Concluído', 'success');
    }
  }

  private async executarFluxoEdicao(): Promise<void> {
    this.atualizarStatus('Executando', 'warning');
    this.usuarioId = await this.cadastrarUsuario();
    if (!this.usuarioId) {
      this.adicionarResultado('Fluxo de Edição Abortado', 'O teste foi interrompido devido a falha na etapa de cadastro.', false);
      this.atualizarStatus('Falha', 'danger');
      return;
    }
    
    const loginSucesso = await this.realizarLogin(this.usuarioId);
    if (!loginSucesso) {
      this.adicionarResultado('Fluxo de Edição Abortado', 'O teste foi interrompido devido a falha na etapa de login.', false);
      this.atualizarStatus('Falha', 'danger');
      return;
    }
    
    const alteracaoSucesso = await this.alterarDados(this.usuarioId);
    if (!alteracaoSucesso) {
      this.adicionarResultado('Fluxo de Edição Abortado', 'O teste foi interrompido devido a falha na etapa de alteração de dados.', false);
      this.atualizarStatus('Falha', 'danger');
    } else {
      this.atualizarStatus('Concluído', 'success');
    }
  }

  private async executarFluxoListagem(): Promise<void> {
    this.atualizarStatus('Executando', 'warning');
    this.usuarioId = await this.cadastrarUsuario();
    if (!this.usuarioId) {
      this.adicionarResultado('Fluxo de Listagem Abortado', 'O teste foi interrompido devido a falha na etapa de cadastro.', false);
      this.atualizarStatus('Falha', 'danger');
      return;
    }
    
    const loginSucesso = await this.realizarLogin(this.usuarioId);
    if (!loginSucesso) {
      this.adicionarResultado('Fluxo de Listagem Abortado', 'O teste foi interrompido devido a falha na etapa de login.', false);
      this.atualizarStatus('Falha', 'danger');
      return;
    }
    
    const alteracaoSucesso = await this.alterarDados(this.usuarioId);
    if (!alteracaoSucesso) {
      this.adicionarResultado('Fluxo de Listagem Abortado', 'O teste foi interrompido devido a falha na etapa de alteração de dados.', false);
      this.atualizarStatus('Falha', 'danger');
      return;
    }
    
    const listagemSucesso = await this.listarPedidos(this.usuarioId);
    if (!listagemSucesso) {
      this.adicionarResultado('Fluxo de Listagem Abortado', 'O teste foi interrompido devido a falha na etapa de listagem de pedidos.', false);
      this.atualizarStatus('Falha', 'danger');
    } else {
      this.adicionarResultado('Fluxo de Teste Completo', 'Todas as etapas foram executadas com sucesso.');
      this.atualizarStatus('Concluído', 'success');
    }
  }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new ApiTestManager();
});