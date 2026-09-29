(() => {
  'use strict';

  const centralMainLogo = (window.CENTRAL_LOGOS && window.CENTRAL_LOGOS.MUNICIPIO) || '';
  if (centralMainLogo) {
    document.querySelectorAll('[data-central-main-logo]').forEach((img) => { img.src = centralMainLogo; });
  }
  const menuToggle = document.querySelector('[data-server-menu-toggle]');
  const sidebar = document.querySelector('#server-sidebar');
  const backdrop = document.querySelector('[data-server-backdrop]');
  const dialog = document.querySelector('[data-school-dialog]');
  const dialogTitle = document.querySelector('[data-dialog-title]');
  const dialogKicker = document.querySelector('[data-dialog-kicker]');
  const dialogBody = document.querySelector('[data-dialog-body]');
  const dialogActions = document.querySelector('[data-dialog-actions]');
  const catalogoFormacoes = window.CENTRAL_FORMACOES || {};

  // Identidade visual da unidade. O parâmetro ?escola= continua disponível
  // para pré-visualização, mas a resposta autenticada do backend sempre prevalece.
  const catalogoEscolas = window.CENTRAL_ESCOLAS || {};
  const params = new URLSearchParams(window.location.search);
  const escolaSolicitada = params.get('escola');
  const escolaPreviaId = escolaSolicitada && catalogoEscolas[escolaSolicitada] ? escolaSolicitada : '';

  const iniciaisUnidade = (nome = '') => {
    const ignorar = new Set(['de','da','do','das','dos','e','municipal','centro','ensino','escola']);
    const partes = nome.split(/\s+/).filter(Boolean).filter(p => !ignorar.has(p.toLocaleLowerCase('pt-BR')));
    return (partes.slice(0, 2).map(p => p[0]).join('') || 'CE').toUpperCase();
  };

  const aplicarIdentidadeUnidade = (unidade = {}, { carregando = false } = {}) => {
    const unidadeId = String(unidade.idEscola || unidade.idUnidade || unidade.codigo || '').trim();
    const escolaCatalogada = catalogoEscolas[unidadeId] || null;
    const tipo = String(unidade.tipo || unidade.perfilAcesso || '').toLocaleUpperCase('pt-BR');
    const nome = String(
      unidade.nome ||
      escolaCatalogada?.nome ||
      (carregando ? 'Identificando unidade...' : 'Unidade institucional')
    ).trim();
    const indigena = escolaCatalogada?.indigena === true;
    const possuiBrasaoProprio = escolaCatalogada?.possuiBrasaoProprio === true;
    const brasao = escolaCatalogada?.brasao || centralMainLogo;

    document.querySelectorAll('[data-school-name], [data-school-name-topbar]').forEach(el => {
      el.textContent = nome;
    });
    document.querySelectorAll('[data-school-avatar]').forEach(el => {
      el.textContent = iniciaisUnidade(nome);
    });
    document.querySelectorAll('[data-school-network]').forEach(el => {
      el.textContent = tipo === 'SEMEC' ? 'Secretaria Municipal de Educação' : 'Rede Municipal de Ensino';
    });
    document.querySelectorAll('[data-account-kind]').forEach(el => {
      el.textContent = tipo === 'SEMEC' ? 'Acesso SEMEC' : 'Conta institucional';
    });

    const textoAltBrasao = indigena && !possuiBrasaoProprio
      ? `Identidade da Educação Escolar Indígena — ${nome}`
      : `Brasão de ${nome}`;

    document.querySelectorAll('[data-school-logo], [data-school-avatar-img]').forEach(img => {
      img.src = brasao;
      img.alt = textoAltBrasao;
      img.onerror = () => {
        img.onerror = null;
        img.src = indigena
          ? (window.CENTRAL_LOGOS && window.CENTRAL_LOGOS.INDIGENA) || ''
          : (window.CENTRAL_LOGOS && window.CENTRAL_LOGOS.MUNICIPIO) || '';
      };
    });

    document.body.dataset.unidadeId = unidadeId;
    document.body.dataset.perfilAcesso = tipo;
  };

  if (escolaPreviaId) {
    aplicarIdentidadeUnidade({ idEscola: escolaPreviaId, ...catalogoEscolas[escolaPreviaId] });
  } else {
    aplicarIdentidadeUnidade({}, { carregando: true });
  }

  // Mantém a mesma unidade durante a navegação local entre as páginas da Central.
  // Em produção, a identificação da unidade virá da autenticação do backend.
  if (escolaPreviaId) {
    document.querySelectorAll('a[data-preserve-school]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;

      const [pathPart, hashPart = ''] = href.split('#');
      const url = new URL(pathPart, window.location.href);
      url.searchParams.set('escola', escolaPreviaId);
      link.setAttribute('href', `${url.pathname.split('/').pop()}${url.search}${hashPart ? `#${hashPart}` : ''}`);
    });
  }

  const initializeInternalMenu = () => {
    if (!sidebar || !menuToggle || !backdrop) return { close: () => {} };

    const toggleSlot = document.createElement('span');
    toggleSlot.className = 'server-menu-toggle-slot';
    toggleSlot.setAttribute('aria-hidden', 'true');

    let animationTimer = null;

    const clearAnimationTimer = () => {
      if (animationTimer) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
      }
    };

    const finishClose = ({ restoreFocus = false } = {}) => {
      clearAnimationTimer();

      if (toggleSlot.isConnected) {
        toggleSlot.replaceWith(menuToggle);
      }

      sidebar.setAttribute('aria-hidden', 'true');
      sidebar.inert = true;
      backdrop.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');

      if (restoreFocus) {
        window.requestAnimationFrame(() => menuToggle.focus());
      }
    };

    const close = ({ restoreFocus = false, immediate = false } = {}) => {
      clearAnimationTimer();

      if (immediate) {
        sidebar.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        document.body.classList.remove('server-menu-open', 'server-menu-animating');
        finishClose({ restoreFocus });
        return;
      }

      document.body.classList.add('server-menu-animating');

      // Dispara a animação inversa: X -> três barras e menu -> fora da tela.
      menuToggle.classList.remove('is-open');
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.classList.remove('server-menu-open');

      animationTimer = window.setTimeout(() => {
        document.body.classList.remove('server-menu-animating');
        finishClose({ restoreFocus });
      }, 490);
    };

    const open = () => {
      clearAnimationTimer();

      sidebar.removeAttribute('aria-hidden');
      sidebar.inert = false;
      backdrop.hidden = false;

      // Mantém o espaço do botão no topbar enquanto o botão acompanha o painel.
      if (!toggleSlot.isConnected) {
        menuToggle.replaceWith(toggleSlot);
        document.body.append(menuToggle);
      }

      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fechar menu');

      // Estado inicial ainda é "hambúrguer + painel fechado".
      menuToggle.classList.remove('is-open');
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.classList.add('server-menu-animating');

      // No frame seguinte, todos os elementos começam a transição juntos.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          document.body.classList.add('server-menu-open');
          sidebar.classList.add('is-open');
          backdrop.classList.add('is-open');
          menuToggle.classList.add('is-open');

          animationTimer = window.setTimeout(() => {
            document.body.classList.remove('server-menu-animating');
            sidebar.querySelector('a, button')?.focus();
          }, 490);
        });
      });
    };

    menuToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('is-open')) {
        close({ restoreFocus: true });
      } else {
        open();
      }
    });

    backdrop.addEventListener('click', () => close({ restoreFocus: true }));

    sidebar.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => close());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
        close({ restoreFocus: true });
      }
    });

    window.addEventListener('resize', () => close({ immediate: true }));
    window.addEventListener('pagehide', () => close({ immediate: true }));
    window.addEventListener('hashchange', () => close());

    close({ immediate: true });

    return {
      close: () => close({ restoreFocus: true })
    };
  };

  const internalMenu = initializeInternalMenu();

  const closeDialog = () => { if (dialog) dialog.hidden = true; };
  const openDialog = ({ kicker = 'Área da Escola', title, html, actions = '' }) => {
    if (!dialog) return;
    dialogKicker.textContent = kicker;
    dialogTitle.textContent = title;
    dialogBody.innerHTML = html;
    dialogActions.innerHTML = actions;
    dialog.hidden = false;
    dialog.querySelector('.server-modal__panel')?.focus();
  };
  document.querySelector('[data-dialog-close]')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-dialog-close], [data-modal-close]')) {
      closeDialog();
    }
  });


  const logoutDialog = document.querySelector('[data-server-logout-dialog]');
  const logoutCancel = document.querySelector('[data-server-logout-cancel]');
  const logoutConfirm = document.querySelector('[data-server-logout-confirm]');
  const appShell = document.querySelector('[data-server-app]');
  const loggedOutScreen = document.querySelector('[data-central-logged-out]');

  const openLogoutDialog = (trigger) => {
    if (!logoutDialog) return;
    logoutDialog.hidden = false;
    document.body.classList.add('server-modal-open');
    logoutDialog.dataset.returnFocus = trigger ? 'true' : 'false';
    logoutCancel?.focus();
  };

  const closeLogoutDialog = () => {
    if (!logoutDialog) return;
    logoutDialog.hidden = true;
    document.body.classList.remove('server-modal-open');
  };

  document.querySelectorAll('[data-server-logout]').forEach((button) => {
    button.addEventListener('click', () => openLogoutDialog(button));
  });

  logoutCancel?.addEventListener('click', closeLogoutDialog);

  logoutDialog?.addEventListener('click', (event) => {
    if (event.target === logoutDialog) closeLogoutDialog();
  });

  logoutConfirm?.addEventListener('click', () => {
    closeLogoutDialog();
    internalMenu.close();
    sessionStorage.setItem('centralCertificadosSessaoEncerrada', '1');
    if (appShell) appShell.hidden = true;
    if (loggedOutScreen) loggedOutScreen.hidden = false;
  });

  document.querySelector('[data-central-enter-again]')?.addEventListener('click', () => {
    sessionStorage.removeItem('centralCertificadosSessaoEncerrada');
    if (loggedOutScreen) loggedOutScreen.hidden = true;
    if (appShell) appShell.hidden = false;
  });

  if (sessionStorage.getItem('centralCertificadosSessaoEncerrada') === '1') {
    if (appShell) appShell.hidden = true;
    if (loggedOutScreen) loggedOutScreen.hidden = false;
  }


  const filterForm = document.querySelector('[data-certificate-filter-form]');
  const resultSection = document.querySelector('#certificate-results');
  const existingResultList = document.querySelector('[data-existing-results]');
  const existingEmpty = document.querySelector('[data-existing-empty]');
  const searchResultSection = document.querySelector('#search-results');
  const searchResultList = document.querySelector('[data-search-results-list]');
  const searchEmpty = document.querySelector('[data-search-empty]');
  const repairSection = document.querySelector('#solicitacoes-reparo');
  const centralStatus = document.querySelector('[data-central-status]');
  const centralStatusTitle = document.querySelector('[data-central-status-title]');
  const centralStatusDetail = document.querySelector('[data-central-status-detail]');
  const centralRetry = document.querySelector('[data-central-retry]');
  const backend = window.CENTRAL_BACKEND ? new window.CENTRAL_BACKEND.BridgeClient() : null;
  let certificadosAtuais = [];

  const chaveCanonica = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLocaleLowerCase('pt-BR');

  const primeiroValor = (registro, ...campos) => {
    if (!registro || typeof registro !== 'object') return '';

    for (const campo of campos) {
      if (Object.prototype.hasOwnProperty.call(registro, campo) && registro[campo] !== '' && registro[campo] != null) {
        return registro[campo];
      }
    }

    const chaves = Object.keys(registro);
    for (const campo of campos) {
      const chaveEncontrada = chaves.find(chave => chaveCanonica(chave) === chaveCanonica(campo));
      if (chaveEncontrada && registro[chaveEncontrada] !== '' && registro[chaveEncontrada] != null) {
        return registro[chaveEncontrada];
      }
    }

    return '';
  };

  const urlSegura = (value) => {
    if (!value) return '';
    try {
      const url = new URL(String(value), window.location.href);
      return url.protocol === 'https:' ? url.href : '';
    } catch (_) {
      return '';
    }
  };

  const nomeFormacao = (valor, registro) => {
    const objeto = valor && typeof valor === 'object' ? valor : null;
    const idInformado = String(
      objeto?.id ||
      primeiroValor(registro, 'formacaoId', 'idFormacao', 'codigoFormacao', 'tipoFormacao') ||
      ''
    ).trim();
    const nomeInformado = String(
      objeto?.nome ||
      primeiroValor(registro, 'formacaoNome', 'nomeFormacao') ||
      (typeof valor === 'string' ? valor : '') ||
      ''
    ).trim();
    const etapa = String(primeiroValor(registro, 'etapa', 'numeroEtapa') || '').match(/[123]/)?.[0] ||
      nomeInformado.match(/etapa\s*([123])/i)?.[1] || '';
    const idPorEtapa = {
      '1': 'FORMACAO_REDE',
      '2': 'FORMACAO_CENTRO_ENSINO',
      '3': 'PALESTRAS_SEMINARIOS'
    }[etapa] || '';
    const id = idInformado || idPorEtapa;

    if (catalogoFormacoes[id]) return { id, nome: catalogoFormacoes[id].nome };
    if (catalogoFormacoes[nomeInformado]) {
      return { id: nomeInformado, nome: catalogoFormacoes[nomeInformado].nome };
    }

    const formacaoCatalogada = Object.values(catalogoFormacoes).find(item =>
      chaveCanonica(item.nome) === chaveCanonica(nomeInformado)
    );
    if (formacaoCatalogada) return { id: formacaoCatalogada.id, nome: formacaoCatalogada.nome };

    return { id, nome: nomeInformado || 'Formação não informada' };
  };

  const formatarCargaHoraria = (value) => {
    const carga = String(value || '').trim();
    if (!carga) return 'Não informada';
    return /^\d+(?:[.,]\d+)?$/.test(carga) ? `${carga}h` : carga;
  };

  const formatarSituacao = (value) => {
    const situacao = chaveCanonica(value || 'ativo');
    if (situacao === 'substituido') return 'Substituído';
    if (situacao === 'cancelado') return 'Cancelado';
    if (situacao === 'inativo') return 'Inativo';
    return 'Ativo';
  };

  const normalizarCertificado = (registro = {}) => {
    const servidor = primeiroValor(registro, 'servidor');
    const unidade = primeiroValor(registro, 'unidade');
    const formacao = primeiroValor(registro, 'formacao');
    const arquivo = primeiroValor(registro, 'arquivo', 'pdf');
    const formacaoNormalizada = nomeFormacao(formacao, registro);
    const situacao = formatarSituacao(primeiroValor(registro, 'situacao', 'status', 'estado'));
    const visualizacao = primeiroValor(
      registro,
      'urlVisualizacao', 'linkVisualizacao', 'visualizarUrl', 'urlPdf', 'linkPdf', 'pdfUrl', 'arquivoUrl', 'urlArquivo'
    ) || (arquivo && typeof arquivo === 'object' ? primeiroValor(arquivo, 'url', 'visualizacao', 'link') : '');
    const download = primeiroValor(registro, 'urlDownload', 'downloadUrl', 'linkDownload') ||
      (arquivo && typeof arquivo === 'object' ? primeiroValor(arquivo, 'downloadUrl', 'urlDownload') : '') ||
      visualizacao;

    return {
      id: String(primeiroValor(registro, 'idCertificado', 'certificadoId', 'id', 'codigo') || ''),
      nome: String(
        (servidor && typeof servidor === 'object' ? primeiroValor(servidor, 'nome', 'nomeCompleto') : '') ||
        primeiroValor(registro, 'nomeServidor', 'servidorNome', 'nomeCompleto', 'nome') ||
        (typeof servidor === 'string' ? servidor : '') ||
        'Servidor não informado'
      ).trim(),
      formacaoId: formacaoNormalizada.id,
      formacaoNome: formacaoNormalizada.nome,
      unidadeNome: String(
        (unidade && typeof unidade === 'object' ? primeiroValor(unidade, 'nome', 'nomeUnidade') : '') ||
        primeiroValor(registro, 'unidadeNome', 'nomeUnidade', 'unidadeVinculada', 'escola', 'lotacao') ||
        (typeof unidade === 'string' ? unidade : '') ||
        document.querySelector('[data-school-name]')?.textContent ||
        'Unidade não informada'
      ).trim(),
      cargaHoraria: formatarCargaHoraria(primeiroValor(registro, 'cargaHoraria', 'cargaHorariaTotal', 'carga', 'horas')),
      ano: String(primeiroValor(registro, 'ano', 'anoReferencia', 'exercicio') || '2026').trim(),
      situacao,
      situacaoId: chaveCanonica(situacao),
      visualizacaoUrl: urlSegura(visualizacao),
      downloadUrl: urlSegura(download)
    };
  };

  const extrairResultado = (response) => {
    if (!response || response.ok === false) {
      const message = response?.mensagem || response?.message || 'O backend não concluiu a solicitação.';
      const error = new Error(message);
      error.code = response?.codigo || 'BACKEND_ERROR';
      throw error;
    }

    const result = response.resultado || response.result || response;
    if (result.ok === false) {
      const error = new Error(result.mensagem || result.message || 'O backend não concluiu a solicitação.');
      error.code = result.codigo || 'BACKEND_ERROR';
      throw error;
    }
    return result;
  };

  const extrairCertificados = (result) => {
    const list = result.certificados || result.resultados || result.itens || result.registros || [];
    return Array.isArray(list) ? list.map(normalizarCertificado) : [];
  };

  const definirStatus = (state, title, detail, { retry = false } = {}) => {
    if (!centralStatus) return;
    centralStatus.hidden = false;
    centralStatus.dataset.state = state;
    if (centralStatusTitle) centralStatusTitle.textContent = title;
    if (centralStatusDetail) centralStatusDetail.textContent = detail;
    if (centralRetry) centralRetry.hidden = !retry;
  };

  const definirFormularioOcupado = (busy) => {
    filterForm?.querySelectorAll('input, select, button').forEach(control => {
      control.disabled = busy;
    });
    filterForm?.setAttribute('aria-busy', String(busy));
  };

  const atualizarContagem = (selector, total) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = `${total} certificado${total === 1 ? '' : 's'}`;
  };

  const adicionarDetalhe = (list, term, description) => {
    const wrapper = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = description;
    wrapper.append(dt, dd);
    list.appendChild(wrapper);
  };

  const criarLinhaCertificado = (certificado) => {
    const article = document.createElement('article');
    article.className = 'school-record-row';
    article.dataset.personName = certificado.nome;
    article.dataset.ano = certificado.ano;
    article.dataset.formacao = certificado.formacaoId;
    article.dataset.situacao = certificado.situacaoId;

    const type = document.createElement('span');
    type.className = 'school-type';
    type.textContent = 'Servidor';

    const title = document.createElement('h3');
    title.textContent = certificado.nome;

    const details = document.createElement('dl');
    details.className = 'school-detail-list';
    adicionarDetalhe(details, 'Formação', certificado.formacaoNome);
    adicionarDetalhe(details, 'Unidade vinculada', certificado.unidadeNome);
    adicionarDetalhe(details, 'Carga horária', certificado.cargaHoraria);
    adicionarDetalhe(details, 'Ano / situação', `${certificado.ano} - ${certificado.situacao}`);

    const actions = document.createElement('div');
    actions.className = 'school-table-actions';

    const viewButton = document.createElement('button');
    viewButton.className = 'server-button server-button--primary';
    viewButton.type = 'button';
    viewButton.textContent = 'Visualizar';
    viewButton.dataset.certificateView = certificado.visualizacaoUrl;
    viewButton.disabled = !certificado.visualizacaoUrl;

    const downloadButton = document.createElement('button');
    downloadButton.className = 'server-button server-button--ghost';
    downloadButton.type = 'button';
    downloadButton.textContent = 'Baixar PDF';
    downloadButton.dataset.certificateDownload = certificado.downloadUrl;
    downloadButton.disabled = !certificado.downloadUrl;

    if (!certificado.visualizacaoUrl || !certificado.downloadUrl) {
      const unavailable = 'O PDF ainda não foi disponibilizado pelo registro oficial.';
      if (!certificado.visualizacaoUrl) viewButton.title = unavailable;
      if (!certificado.downloadUrl) downloadButton.title = unavailable;
    }

    actions.append(viewButton, downloadButton);
    article.append(type, title, details, actions);
    return article;
  };

  const renderizarCertificados = (container, certificados) => {
    if (!container) return;
    container.replaceChildren(...certificados.map(criarLinhaCertificado));
  };

  const mostrarVazioExistente = (title, detail, visible = true) => {
    if (!existingEmpty) return;
    existingEmpty.hidden = !visible;
    const strong = existingEmpty.querySelector('strong');
    const span = existingEmpty.querySelector('span');
    if (strong) strong.textContent = title;
    if (span) span.textContent = detail;
  };

  const mostrarVazioPesquisa = (title, detail, visible = true) => {
    if (!searchEmpty) return;
    searchEmpty.hidden = !visible;
    const strong = searchEmpty.querySelector('strong');
    const span = searchEmpty.querySelector('span');
    if (strong) strong.textContent = title;
    if (span) span.textContent = detail;
  };

  const updateSummaryCards = () => {
    const activeRows = certificadosAtuais.filter(certificado => certificado.situacaoId === 'ativo');
    const uniquePeople = new Set(
      activeRows.map(certificado => certificado.nome.toLocaleLowerCase('pt-BR')).filter(Boolean)
    );

    const yearSelect = filterForm?.querySelector('[name="ano"]');
    const year = yearSelect?.value || '2026';

    const activeEl = document.querySelector('[data-summary-active]');
    const peopleEl = document.querySelector('[data-summary-people]');
    const yearEl = document.querySelector('[data-summary-year]');
    const repairsEl = document.querySelector('[data-summary-repairs]');

    if (activeEl) activeEl.textContent = String(activeRows.length);
    if (peopleEl) peopleEl.textContent = String(uniquePeople.size);
    if (yearEl) yearEl.textContent = year;
    if (repairsEl) repairsEl.textContent = String(
      document.querySelectorAll('[data-repair-list] [data-repair-status="em_analise"]').length
    );
  };

  const submitFilters = () => {
    if (!filterForm) return;
    filterForm.requestSubmit ? filterForm.requestSubmit() : filterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const scrollToResults = () => {
    resultSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filtrarCertificados = (certificados, { ano = '', formacao = '', situacao = '' } = {}) => certificados.filter(certificado => {
    const matchAno = !ano || certificado.ano === ano;
    const matchFormacao = !formacao || certificado.formacaoId === formacao;
    const matchSituacao = !situacao || certificado.situacaoId === chaveCanonica(situacao);
    return matchAno && matchFormacao && matchSituacao;
  });

  const carregarCertificados = async () => {
    if (!filterForm || !backend) return;
    const ano = String(filterForm.elements.ano?.value || '2026');
    definirFormularioOcupado(true);
    renderizarCertificados(existingResultList, []);
    mostrarVazioExistente('Carregando certificados', 'Consultando o registro oficial da Central.');
    atualizarContagem('[data-existing-count]', 0);

    try {
      const result = extrairResultado(await backend.request('LISTAR_CERTIFICADOS', { ano }));
      if (result.unidade) aplicarIdentidadeUnidade(result.unidade);
      certificadosAtuais = extrairCertificados(result);
      renderizarCertificados(existingResultList, certificadosAtuais);
      mostrarVazioExistente(
        'Nenhum certificado disponível',
        'A unidade ainda não possui certificados registrados para o ano selecionado.',
        certificadosAtuais.length === 0
      );
      atualizarContagem('[data-existing-count]', certificadosAtuais.length);
      updateSummaryCards();
      definirStatus(
        'ready',
        'Central conectada',
        certificadosAtuais.length === 0
          ? 'Unidade identificada. Nenhum certificado oficial foi registrado para 2026.'
          : 'Unidade identificada e certificados atualizados pelo registro oficial.'
      );
    } finally {
      definirFormularioOcupado(false);
    }
  };

  const iniciarBackend = async () => {
    if (!backend) {
      definirStatus('error', 'Integração indisponível', 'Os arquivos da ponte não foram carregados.', { retry: true });
      return;
    }

    definirFormularioOcupado(true);
    definirStatus('loading', 'Conectando à Central', 'Validando a conta institucional e identificando a unidade.');

    try {
      const connection = await backend.connect();
      const identityResult = extrairResultado(await backend.request('IDENTIFICAR_UNIDADE'));
      if (identityResult.acessoInstitucionalAutorizado === false || !identityResult.unidade) {
        const error = new Error('A conta institucional não está autorizada para acessar a Central.');
        error.code = 'ACESSO_NAO_AUTORIZADO';
        throw error;
      }
      aplicarIdentidadeUnidade(identityResult.unidade);

      if (filterForm) {
        definirStatus(
          'loading',
          'Unidade identificada',
          `Carregando certificados${connection.version ? ` pela ponte ${connection.version}` : ''}.`
        );
        await carregarCertificados();
      }
    } catch (error) {
      certificadosAtuais = [];
      renderizarCertificados(existingResultList, []);
      mostrarVazioExistente('Não foi possível carregar os certificados', error.message || 'Tente novamente em instantes.');
      atualizarContagem('[data-existing-count]', 0);
      updateSummaryCards();
      definirStatus('error', 'Não foi possível conectar', error.message || 'Tente novamente em instantes.', { retry: true });
      definirFormularioOcupado(true);
    }
  };

  document.querySelectorAll('[data-summary-action]').forEach((card) => {
    card.addEventListener('click', () => {
      const action = card.dataset.summaryAction;
      if (!filterForm) return;

      const busca = filterForm.querySelector('[name="busca"]');
      const ano = filterForm.querySelector('[name="ano"]');
      const formacao = filterForm.querySelector('[name="formacao"]');
      const situacao = filterForm.querySelector('[name="situacao"]');

      if (action === 'ativos') {
        if (busca) busca.value = '';
        if (formacao) formacao.value = '';
        if (situacao) situacao.value = 'ativo';
        submitFilters();
        scrollToResults();
        return;
      }

      if (action === 'servidores') {
        if (busca) busca.value = '';
        if (formacao) formacao.value = '';
        if (situacao) situacao.value = 'ativo';
        submitFilters();
        scrollToResults();
        return;
      }

      if (action === 'ano') {
        filterForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => ano?.focus(), 350);
        return;
      }

      if (action === 'reparos') {
        if (repairSection) {
          repairSection.hidden = false;
          repairSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  filterForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('busca') || '').trim();
    const ano = String(formData.get('ano') || '').trim();
    const formacao = String(formData.get('formacao') || '').trim();
    const situacao = String(formData.get('situacao') || '').trim();

    if (searchResultSection) {
      searchResultSection.hidden = false;
      searchResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (query && query.length < 3) {
      renderizarCertificados(searchResultList, []);
      atualizarContagem('[data-search-result-count]', 0);
      mostrarVazioPesquisa('Informe pelo menos 3 caracteres', 'Digite um trecho maior do nome do servidor para pesquisar.');
      return;
    }

    definirFormularioOcupado(true);
    renderizarCertificados(searchResultList, []);
    mostrarVazioPesquisa('Pesquisando certificados', 'Consultando o registro oficial da Central.');

    try {
      let matches;
      if (query) {
        const result = extrairResultado(await backend.request('BUSCAR_CERTIFICADOS', {
          busca: query,
          ano,
          formacao,
          situacao
        }));
        if (result.unidade) aplicarIdentidadeUnidade(result.unidade);
        matches = filtrarCertificados(extrairCertificados(result), { ano, formacao, situacao });
      } else {
        matches = filtrarCertificados(certificadosAtuais, { ano, formacao, situacao });
      }

      renderizarCertificados(searchResultList, matches);
      atualizarContagem('[data-search-result-count]', matches.length);
      mostrarVazioPesquisa(
        'Nenhum certificado encontrado',
        'Revise o nome pesquisado ou altere os filtros.',
        matches.length === 0
      );
    } catch (error) {
      renderizarCertificados(searchResultList, []);
      atualizarContagem('[data-search-result-count]', 0);
      mostrarVazioPesquisa('Não foi possível concluir a pesquisa', error.message || 'Tente novamente em instantes.');
    } finally {
      definirFormularioOcupado(false);
    }
  });

  document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
    filterForm?.reset();
    searchResultList?.replaceChildren();
    if (searchEmpty) searchEmpty.hidden = true;
    if (searchResultSection) searchResultSection.hidden = true;
    updateSummaryCards();
  });

  document.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-certificate-view]');
    if (viewButton) {
      const url = urlSegura(viewButton.dataset.certificateView);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const downloadButton = event.target.closest('[data-certificate-download]');
    if (downloadButton) {
      const url = urlSegura(downloadButton.dataset.certificateDownload);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = '';
        link.click();
      }
      return;
    }
  });

  centralRetry?.addEventListener('click', iniciarBackend);


  document.querySelector('[data-contact-placeholder]')?.addEventListener('click', () => {
    openDialog({
      kicker: 'Contato técnico',
      title: 'Nova solicitação',
      html: '<p>Esta tela já está preparada. A gravação da solicitação será ligada ao backend institucional na etapa de integração.</p>',
      actions: '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
    });
  });

  document.querySelector('[data-contact-history-placeholder]')?.addEventListener('click', () => {
    openDialog({
      kicker: 'Contato técnico',
      title: 'Minhas solicitações',
      html: '<p>O histórico de chamados será carregado aqui quando a Central estiver conectada ao backend institucional.</p>',
      actions: '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
    });
  });

  updateSummaryCards();
  iniciarBackend();
})();
