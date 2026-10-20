(() => {
  'use strict';

  /*
   * CENTRAL DE CERTIFICADOS SEMEC — conexão com o backend
   *
   * Como funciona:
   *   1. Sem autorização válida, a Central mostra a tela de acesso
   *      do Portal com o botão "Entrar com a conta institucional".
   *   2. O botão leva à página de entrada do Apps Script (implantação
   *      institucional). O Google confirma a conta e devolve a pessoa
   *      para cá com uma autorização temporária no fragmento (#).
   *   3. As ações seguintes vão para a implantação pública, junto com
   *      a autorização. O backend confere a conta e a unidade em toda
   *      ação.
   *
   * Não depende de cookies de terceiros (Safari, InPrivate, celular).
   * O nome BridgeClient foi mantido para não alterar o app.js.
   */

  const CHANNEL = 'CENTRAL_CERTIFICADOS_SEMEC';

  // Implantação institucional (somente contas do domínio): tela de entrada.
  const URL_ENTRADA =
    'https://script.google.com/a/macros/edu.tangaradaserra.mt.gov.br/s/AKfycbwBzokI4suZwZmEOJilCJ2N6y7PfWEH26hlJaYdfqCYb6m6VO7JK_-ktGwMlO2MYus/exec';

  // Implantação pública: ações com autorização temporária.
  const URL_API =
    'https://script.google.com/macros/s/AKfycbx7ad67DJu8S4IJ7PPpaVvd7ihOHdGnvEKlyDSj5m2grQi7LrO3cZcnBq1Roer918I0/exec';

  const CHAVE_SESSAO = 'centralCertificadosEntrada';
  const CHAVE_NONCE = 'centralCertificadosNonceEntrada';
  const MARGEM_EXPIRACAO_MS = 60 * 1000;
  const REQUEST_TIMEOUT_MS = 45000;
  const CHAVE_IDENTIDADE = 'centralCertificadosUnidade';
  const IDENTIDADE_VALIDADE_MS = 30 * 60 * 1000;

  // Ações que só leem: podem ser repetidas sozinhas se a conexão falhar.
  const ACOES_SO_LEITURA = new Set([
    'IDENTIFICAR_UNIDADE',
    'LISTAR_CERTIFICADOS',
    'BUSCAR_CERTIFICADOS'
  ]);

  const MASCOTE_ENTRADA = 'assets/mascote/tangara-login.webp';
  const MASCOTE_EXPIRADA = 'assets/mascote/tangara-sessao-expirada.webp';
  const BRASAO = 'assets/marca/brasao-tangara.webp';


  class BridgeError extends Error {
    constructor(message, code = 'BRIDGE_ERROR') {
      super(message);
      this.name = 'BridgeError';
      this.code = code;
    }
  }


  /* =========================================================
   * AUTORIZAÇÃO GUARDADA NO NAVEGADOR
   * ========================================================= */

  let sessaoEmMemoria = null;

  const tokenValido = (token) => /^[a-f0-9]{64}$/.test(String(token || ''));

  const lerSessao = () => {
    let sessao = sessaoEmMemoria;

    try {
      sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null') || sessao;
    } catch (_) {
      // Armazenamento indisponível: usa a memória da página.
    }

    if (
      sessao &&
      tokenValido(sessao.token) &&
      Number(sessao.exp) > Date.now() + MARGEM_EXPIRACAO_MS
    ) {
      return sessao;
    }

    return null;
  };

  const salvarSessao = (token, exp) => {
    sessaoEmMemoria = { token, exp: Number(exp) };
    try {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessaoEmMemoria));
    } catch (_) {
      // Segue só com a memória da página.
    }
  };

  const limparSessao = () => {
    sessaoEmMemoria = null;
    try {
      localStorage.removeItem(CHAVE_SESSAO);
      localStorage.removeItem(CHAVE_IDENTIDADE);
    } catch (_) {
      // Nada a limpar.
    }
  };


  /*
   * A unidade identificada fica guardada por 30 minutos neste navegador,
   * presa à autorização atual. Assim as outras páginas (Contato,
   * Privacidade, Acessibilidade) abrem na hora, sem esperar o servidor.
   * O servidor continua conferindo a unidade em toda ação.
   */
  const lerIdentidade = (token) => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_IDENTIDADE) || 'null');
      if (salvo && salvo.token === token && Date.now() - salvo.em < IDENTIDADE_VALIDADE_MS) {
        return salvo.resposta;
      }
    } catch (_) { /* sem armazenamento */ }
    return null;
  };

  const salvarIdentidade = (token, resposta) => {
    try {
      localStorage.setItem(CHAVE_IDENTIDADE, JSON.stringify({ token, em: Date.now(), resposta }));
    } catch (_) { /* sem armazenamento */ }
  };


  /* =========================================================
   * RETORNO DA PÁGINA DE ENTRADA (#entrada=...)
   * ========================================================= */

  const lerRetornoDaEntrada = () => {
    const fragmento = window.location.hash.replace(/^#/, '');
    if (!fragmento || fragmento.indexOf('entrada=') === -1) return;

    const parametros = new URLSearchParams(fragmento);
    const token = parametros.get('entrada');
    const nonce = parametros.get('nonce');
    const exp = Number(parametros.get('exp'));

    let nonceEsperado = '';
    try {
      nonceEsperado = sessionStorage.getItem(CHAVE_NONCE) || '';
      sessionStorage.removeItem(CHAVE_NONCE);
    } catch (_) {
      nonceEsperado = '';
    }

    // Remove a autorização do endereço e do histórico do navegador.
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );

    if (
      tokenValido(token) &&
      nonce &&
      nonceEsperado &&
      nonce === nonceEsperado &&
      exp > Date.now()
    ) {
      salvarSessao(token, exp);
    }
  };

  lerRetornoDaEntrada();

  // Se o retorno chegar sem recarregar a página (mesmo endereço), trata igual.
  window.addEventListener('hashchange', () => {
    const tinhaSessao = Boolean(lerSessao());
    lerRetornoDaEntrada();
    if (!tinhaSessao && lerSessao()) {
      window.location.reload();
    }
  });


  /* =========================================================
   * TELA DE ACESSO (mesmo visual do login do Portal)
   * ========================================================= */

  let telaEntrada = null;

  const criarElemento = (tag, classe, texto) => {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto) el.textContent = texto;
    return el;
  };

  const montarTelaEntrada = () => {
    const raiz = criarElemento('div', 'servidor-auth-page central-entrada');
    raiz.setAttribute('role', 'dialog');
    raiz.setAttribute('aria-modal', 'true');
    raiz.setAttribute('aria-labelledby', 'central-entrada-titulo');
    raiz.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;overflow-y:auto;';

    const main = criarElemento('main', 'servidor-auth-main');
    const shell = criarElemento('div', 'servidor-auth-shell auth-flow-shell');

    // Lado esquerdo: identidade institucional.
    const intro = criarElemento('section', 'servidor-auth-intro');
    const marca = criarElemento('span', 'servidor-auth-brand');
    const brasao = criarElemento('img');
    brasao.src = BRASAO;
    brasao.alt = 'Brasão de Tangará da Serra';
    const nomes = criarElemento('span');
    nomes.appendChild(criarElemento('strong', '', 'Prefeitura Municipal de Tangará da Serra'));
    const sub = criarElemento('small', '', 'SEMEC — Secretaria Municipal de Educação');
    nomes.appendChild(sub);
    marca.appendChild(brasao);
    marca.appendChild(nomes);
    intro.appendChild(marca);
    intro.appendChild(criarElemento('p', 'servidor-auth-kicker', 'Portal SEMEC'));
    intro.appendChild(criarElemento('h2', '', 'Certificados das formações da Rede em um só lugar.'));

    // Lado direito: cartão de acesso.
    const card = criarElemento('section', 'servidor-auth-card servidor-login-card');
    card.setAttribute('aria-labelledby', 'central-entrada-titulo');

    const mascote = criarElemento('img', 'auth-state-mascot');
    mascote.src = MASCOTE_ENTRADA;
    mascote.alt = 'Tangará indicando o acesso à Central';
    mascote.dataset.centralEntradaMascote = '';

    const titulo = criarElemento('h1', '', 'Acesso à Central');
    titulo.id = 'central-entrada-titulo';
    titulo.dataset.centralEntradaTitulo = '';

    const texto = criarElemento(
      'p', '',
      'Entre com a conta institucional da sua unidade (@edu.tangaradaserra.mt.gov.br).'
    );
    texto.dataset.centralEntradaTexto = '';

    const alerta = criarElemento('div', 'servidor-alert');
    alerta.setAttribute('role', 'alert');
    alerta.hidden = true;
    alerta.dataset.centralEntradaAlerta = '';

    const botao = criarElemento('button', 'servidor-submit', 'Entrar com a conta institucional');
    botao.type = 'button';
    botao.style.marginTop = '24px';
    botao.style.width = '100%';
    botao.addEventListener('click', iniciarEntrada);

    const ajuda = criarElemento(
      'p', '',
      'Você será levado à página de login do Google e voltará para cá automaticamente.'
    );
    ajuda.style.fontSize = '0.9rem';

    card.appendChild(mascote);
    card.appendChild(criarElemento('p', 'servidor-card-kicker', 'Central de Certificados'));
    card.appendChild(titulo);
    card.appendChild(texto);
    card.appendChild(alerta);
    card.appendChild(botao);
    card.appendChild(ajuda);

    shell.appendChild(intro);
    shell.appendChild(card);
    main.appendChild(shell);
    raiz.appendChild(main);

    const rodape = criarElemento('footer', 'servidor-auth-footer');
    rodape.appendChild(criarElemento('p', '', 'Portal SEMEC — Secretaria Municipal de Educação de Tangará da Serra'));
    raiz.appendChild(rodape);

    document.body.appendChild(raiz);
    return raiz;
  };

  const mostrarTelaEntrada = (motivo) => {
    if (!telaEntrada) {
      telaEntrada = montarTelaEntrada();
    }

    const expirada = motivo === 'expirada';
    telaEntrada.querySelector('[data-central-entrada-mascote]').src =
      expirada ? MASCOTE_EXPIRADA : MASCOTE_ENTRADA;
    telaEntrada.querySelector('[data-central-entrada-titulo]').textContent =
      expirada ? 'Sua entrada expirou' : 'Acesso à Central';
    telaEntrada.querySelector('[data-central-entrada-texto]').textContent =
      expirada
        ? 'Por segurança, entre novamente com a conta institucional da sua unidade.'
        : 'Entre com a conta institucional da sua unidade (@edu.tangaradaserra.mt.gov.br).';

    telaEntrada.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    telaEntrada.querySelector('button').focus();
  };

  const mostrarAlertaEntrada = (mensagem) => {
    if (!telaEntrada) return;
    const alerta = telaEntrada.querySelector('[data-central-entrada-alerta]');
    alerta.textContent = mensagem;
    alerta.hidden = false;
  };

  function gerarNonce() {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  function iniciarEntrada() {
    const nonce = gerarNonce();

    try {
      sessionStorage.setItem(CHAVE_NONCE, nonce);
    } catch (_) {
      mostrarAlertaEntrada(
        'Este navegador está bloqueando o armazenamento da página. ' +
        'Saia do modo de navegação privada ou use outro navegador.'
      );
      return;
    }

    const retorno = window.location.origin + window.location.pathname;
    const destino = new URL(URL_ENTRADA);
    destino.searchParams.set('modo', 'entrar');
    destino.searchParams.set('nonce', nonce);
    destino.searchParams.set('retorno', retorno);

    window.location.assign(destino.href);
  }


  /* =========================================================
   * SAIR
   * ========================================================= */

  const enviarSaida = () => {
    const sessao = lerSessao();
    limparSessao();
    if (!sessao || !URL_API.startsWith('https://')) return;

    try {
      fetch(URL_API, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ canal: CHANNEL, acao: 'SAIR', token: sessao.token })
      }).catch(() => {});
    } catch (_) {
      // A autorização já foi apagada do navegador.
    }
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-server-logout-confirm]')) {
      enviarSaida();
    }
    if (event.target.closest('[data-central-enter-again]')) {
      window.setTimeout(() => window.location.reload(), 0);
    }
  });


  /* =========================================================
   * CLIENTE (mesma interface usada pelo app.js)
   * ========================================================= */

  class BridgeClient {

    connect() {
      if (lerSessao()) {
        return Promise.resolve({ version: 'entrada-institucional' });
      }

      mostrarTelaEntrada('entrada');

      // A página vai para o Google e volta recarregada; não há o que resolver aqui.
      return new Promise(() => {});
    }

    async request(action, data = {}, opcoes = {}) {

      if (!URL_API.startsWith('https://')) {
        throw new BridgeError('A Central ainda não foi configurada.', 'CONFIGURACAO_PENDENTE');
      }

      const sessao = lerSessao();

      if (!sessao) {
        mostrarTelaEntrada('expirada');
        throw new BridgeError('Entre novamente com a conta institucional.', 'SESSAO_INVALIDA');
      }

      if (action === 'IDENTIFICAR_UNIDADE') {
        const guardada = lerIdentidade(sessao.token);
        if (guardada) return guardada;
      }

      const limiteMs = Number(opcoes.timeoutMs) || REQUEST_TIMEOUT_MS;
      const tentativas = ACOES_SO_LEITURA.has(action) ? 2 : 1;

      let resposta;

      for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
        const controle = new AbortController();
        const limite = window.setTimeout(() => controle.abort(), limiteMs);

        try {
          const http = await fetch(URL_API, {
            method: 'POST',
            redirect: 'follow',
            signal: controle.signal,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              canal: CHANNEL,
              acao: action,
              dados: data,
              token: sessao.token
            })
          });

          resposta = await http.json();
          break;

        } catch (erro) {
          const tempo = erro && erro.name === 'AbortError';
          if (tentativa < tentativas) {
            // Falha passageira (rede ou servidor acordando): tenta mais uma vez.
            await new Promise((ok) => window.setTimeout(ok, 1200));
            continue;
          }
          throw new BridgeError(
            tempo
              ? 'A Central demorou para responder. Tente novamente.'
              : 'Não foi possível falar com a Central. Verifique a conexão e tente novamente.',
            tempo ? 'REQUEST_TIMEOUT' : 'REQUEST_SEND_FAILED'
          );
        } finally {
          window.clearTimeout(limite);
        }
      }

      if (resposta && resposta.codigo === 'SESSAO_INVALIDA') {
        limparSessao();
        mostrarTelaEntrada('expirada');
      }

      if (
        action === 'IDENTIFICAR_UNIDADE' &&
        resposta && resposta.ok !== false &&
        resposta.resultado && resposta.resultado.ok !== false
      ) {
        salvarIdentidade(sessao.token, resposta);
      }

      return resposta;
    }
  }

  window.CENTRAL_BACKEND = Object.freeze({
    URL_ENTRADA,
    BridgeClient,
    BridgeError
  });
})();
