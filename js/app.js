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

  // Identidade visual da unidade.
  // ?escola= serve apenas para pré-visualização local.
  // Em produção, o ID da unidade será informado pelo backend após autenticação.
  const catalogoEscolas = window.CENTRAL_ESCOLAS || {};
  const params = new URLSearchParams(window.location.search);
  const escolaSolicitada = params.get('escola');
  const escolaId = escolaSolicitada && catalogoEscolas[escolaSolicitada] ? escolaSolicitada : 'ESC-000009';
  const escolaAtual = catalogoEscolas[escolaId];

  const iniciaisUnidade = (nome = '') => {
    const ignorar = new Set(['de','da','do','das','dos','e','municipal','centro','ensino','escola']);
    const partes = nome.split(/\s+/).filter(Boolean).filter(p => !ignorar.has(p.toLocaleLowerCase('pt-BR')));
    return (partes.slice(0, 2).map(p => p[0]).join('') || 'CE').toUpperCase();
  };

  if (escolaAtual) {
    document.querySelectorAll('[data-school-name], [data-school-name-topbar]').forEach(el => {
      el.textContent = escolaAtual.nome;
    });
    document.querySelectorAll('[data-school-avatar]').forEach(el => {
      el.textContent = iniciaisUnidade(escolaAtual.nome);
    });

    const textoAltBrasao = escolaAtual.indigena && !escolaAtual.possuiBrasaoProprio
      ? `Identidade da Educação Escolar Indígena — ${escolaAtual.nome}`
      : `Brasão de ${escolaAtual.nome}`;

    document.querySelectorAll('[data-school-logo], [data-school-avatar-img]').forEach(img => {
      img.src = escolaAtual.brasao;
      img.alt = textoAltBrasao;
      img.onerror = () => {
        img.onerror = null;
        img.src = escolaAtual.indigena
          ? (window.CENTRAL_LOGOS && window.CENTRAL_LOGOS.INDIGENA) || ''
          : (window.CENTRAL_LOGOS && window.CENTRAL_LOGOS.MUNICIPIO) || '';
      };
    });
  }

  // Mantém a mesma unidade durante a navegação local entre as páginas da Central.
  // Em produção, a identificação da unidade virá da autenticação do backend.
  if (escolaId) {
    document.querySelectorAll('a[data-preserve-school]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;

      const [pathPart, hashPart = ''] = href.split('#');
      const url = new URL(pathPart, window.location.href);
      url.searchParams.set('escola', escolaId);
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
  const searchResultSection = document.querySelector('#search-results');
  const searchResultList = document.querySelector('[data-search-results-list]');
  const searchEmpty = document.querySelector('[data-search-empty]');
  const repairSection = document.querySelector('#solicitacoes-reparo');

  const getRows = () => [...document.querySelectorAll('[data-existing-results] [data-person-name]')];

  const updateSummaryCards = () => {
    const rows = getRows();
    const activeRows = rows.filter(row => String(row.dataset.situacao || '').toLowerCase() === 'ativo');
    const uniquePeople = new Set(
      activeRows.map(row => String(row.dataset.personName || '').trim().toLocaleLowerCase('pt-BR')).filter(Boolean)
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

  document.querySelector('[data-certificate-filter-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('busca') || '').trim().toLocaleLowerCase('pt-BR');
    const ano = String(formData.get('ano') || '').trim();
    const formacao = String(formData.get('formacao') || '').trim();
    const situacao = String(formData.get('situacao') || '').trim().toLocaleLowerCase('pt-BR');

    const rows = getRows();
    const matches = rows.filter((row) => {
      const nomeRegistro = String(row.dataset.personName || '').toLocaleLowerCase('pt-BR');
      const anoRegistro = String(row.dataset.ano || '');
      const formacaoRegistro = String(row.dataset.formacao || '');
      const situacaoRegistro = String(row.dataset.situacao || '').toLocaleLowerCase('pt-BR');

      const matchNome = !query || nomeRegistro.includes(query);
      const matchAno = !ano || anoRegistro === ano;
      const matchFormacao = !formacao || formacaoRegistro === formacao;
      const matchSituacao = !situacao || situacaoRegistro === situacao;

      return matchNome && matchAno && matchFormacao && matchSituacao;
    });

    if (searchResultList) {
      searchResultList.innerHTML = '';
      matches.forEach((row) => {
        const clone = row.cloneNode(true);
        clone.removeAttribute('hidden');
        searchResultList.appendChild(clone);
      });
    }

    const countEl = document.querySelector('[data-search-result-count]');
    if (countEl) {
      countEl.textContent = `${matches.length} certificado${matches.length === 1 ? '' : 's'}`;
    }

    if (searchEmpty) searchEmpty.hidden = matches.length !== 0;
    if (searchResultSection) {
      searchResultSection.hidden = false;
      searchResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateSummaryCards();
  });

  document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
    filterForm?.reset();
    if (searchResultList) searchResultList.innerHTML = '';
    if (searchEmpty) searchEmpty.hidden = true;
    if (searchResultSection) searchResultSection.hidden = true;
    updateSummaryCards();
  });

  document.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-demo-view]');
    if (viewButton) {
      openDialog({
        kicker: 'Certificado',
        title: 'Visualização do certificado',
        html: '<p>Na versão conectada, o PDF oficial será aberto aqui.</p>',
        actions: '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
      });
      return;
    }

    const downloadButton = event.target.closest('[data-demo-download]');
    if (downloadButton) {
      openDialog({
        kicker: 'Certificado',
        title: 'Baixar PDF',
        html: '<p>Na versão conectada, este botão baixará o PDF registrado no sistema.</p>',
        actions: '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
      });
      return;
    }

    const sendButton = event.target.closest('[data-demo-send]');
    if (sendButton) {
      openDialog({
        kicker: 'Enviar certificado',
        title: sendButton.dataset.person || 'Servidor',
        html: '<form class="school-dialog-form"><label><span>E-mail do servidor</span><input type="email" placeholder="nome@exemplo.com"></label><label style="display:flex;grid-template-columns:auto 1fr;align-items:center;text-transform:none;font-size:.9rem"><input type="checkbox" style="width:auto;min-height:auto"> Salvar este e-mail como contato do servidor</label></form>',
        actions: '<button class="server-button server-button--ghost" type="button" data-modal-close>Cancelar</button><button class="server-button server-button--primary" type="button" data-modal-close>Enviar certificado</button>'
      });
    }
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-demo-repair]');
    if (!button) return;

    const person = button.dataset.person || 'Servidor';
    openDialog({
      kicker: 'Solicitar reparo',
      title: person,
      html: '<form class="school-dialog-form" data-repair-form><label><span>Informação a corrigir</span><select name="categoria" required><option value="Nome">Nome do servidor</option><option value="CPF">CPF</option><option value="Escola / unidade">Escola / unidade</option><option value="Carga horária">Carga horária</option><option value="Percentual / presença">Percentual / presença</option><option value="Formação / histórico dos encontros">Formação / histórico dos encontros</option><option value="Assinatura">Assinatura</option><option value="Outro">Outro</option></select></label><label><span>Descreva o problema</span><textarea name="descricao" required placeholder="Informe o que precisa ser corrigido"></textarea></label></form>',
      actions: '<button class="server-button server-button--ghost" type="button" data-modal-close>Cancelar</button><button class="server-button server-button--primary" type="button" data-submit-repair>Enviar solicitação</button>'
    });

    dialogActions.querySelector('[data-submit-repair]')?.addEventListener('click', () => {
      const form = dialogBody.querySelector('[data-repair-form]');
      if (!form?.reportValidity()) return;

      const data = new FormData(form);
      const categoria = String(data.get('categoria') || '');
      const descricao = String(data.get('descricao') || '').trim();
      const list = document.querySelector('[data-repair-list]');
      const empty = document.querySelector('[data-repair-empty]');

      const item = document.createElement('article');
      item.className = 'school-record-row';
      item.dataset.repairStatus = 'em_analise';
      item.innerHTML = `<span class="school-type">Em análise</span><h3>${person}</h3><dl class="school-detail-list"><div><dt>Categoria</dt><dd>${categoria}</dd></div><div><dt>Descrição</dt><dd>${descricao}</dd></div><div><dt>Status</dt><dd>EM ANÁLISE</dd></div><div><dt>Ano</dt><dd>2026</dd></div></dl>`;
      list?.prepend(item);

      if (empty) empty.hidden = true;
      if (repairSection) repairSection.hidden = false;

      const count = document.querySelectorAll('[data-repair-list] [data-repair-status="em_analise"]').length;
      const countEl = document.querySelector('[data-repair-count]');
      if (countEl) countEl.textContent = `${count} solicitaç${count === 1 ? 'ão' : 'ões'}`;

      updateSummaryCards();
      closeDialog();
      repairSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


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
})();