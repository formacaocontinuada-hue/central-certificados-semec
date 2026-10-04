(() => {
  'use strict';

  const municipioMainLogo =
    (window.CENTRAL_LOGOS &&
      window.CENTRAL_LOGOS.MUNICIPIO) ||
    '';

  const portalMainLogo =
    new URL(
      'assents/sem_fundo/brasao_portal_semec.png',
      window.location.href
    ).href;

  const centralMainLogo =
    portalMainLogo ||
    municipioMainLogo;

  if (centralMainLogo) {
    document
      .querySelectorAll(
        '[data-central-main-logo]'
      )
      .forEach(
        (img) => {
          img.src =
            centralMainLogo;

          img.alt =
            'Brasão do Portal SEMEC';
        }
      );
  }

  const menuToggle =
    document.querySelector(
      '[data-server-menu-toggle]'
    );

  const sidebar =
    document.querySelector(
      '#server-sidebar'
    );

  const backdrop =
    document.querySelector(
      '[data-server-backdrop]'
    );

  const dialog =
    document.querySelector(
      '[data-school-dialog]'
    );

  const dialogTitle =
    document.querySelector(
      '[data-dialog-title]'
    );

  const dialogKicker =
    document.querySelector(
      '[data-dialog-kicker]'
    );

  const dialogBody =
    document.querySelector(
      '[data-dialog-body]'
    );

  const dialogActions =
    document.querySelector(
      '[data-dialog-actions]'
    );

  const catalogoFormacoes =
    window.CENTRAL_FORMACOES || {};


  /*
   * Identidade visual da unidade.
   *
   * O parâmetro ?escola= continua disponível
   * para pré-visualização, mas a resposta
   * autenticada do backend sempre prevalece.
   */

  const catalogoEscolas =
    window.CENTRAL_ESCOLAS || {};

  const params =
    new URLSearchParams(
      window.location.search
    );

  const escolaSolicitada =
    params.get(
      'escola'
    );

  const escolaPreviaId =
    escolaSolicitada &&
    catalogoEscolas[escolaSolicitada]
      ? escolaSolicitada
      : '';


  const iniciaisUnidade = (
    nome = ''
  ) => {

    const ignorar =
      new Set([
        'de',
        'da',
        'do',
        'das',
        'dos',
        'e',
        'municipal',
        'centro',
        'ensino',
        'escola'
      ]);


    const partes =
      nome
        .split(/\s+/)
        .filter(Boolean)
        .filter(
          p =>
            !ignorar.has(
              p.toLocaleLowerCase(
                'pt-BR'
              )
            )
        );


    return (
      partes
        .slice(
          0,
          2
        )
        .map(
          p => p[0]
        )
        .join('') ||
      'CE'
    ).toUpperCase();
  };


  const aplicarIdentidadeUnidade = (
    unidade = {},
    {
      carregando = false
    } = {}
  ) => {

    const unidadeId =
      String(
        unidade.idEscola ||
        unidade.idUnidade ||
        unidade.codigo ||
        ''
      ).trim();


    const escolaCatalogada =
      catalogoEscolas[
        unidadeId
      ] || null;


    const tipo =
      String(
        unidade.tipo ||
        unidade.perfilAcesso ||
        ''
      ).toLocaleUpperCase(
        'pt-BR'
      );


    const nome =
      String(
        unidade.nome ||
        escolaCatalogada?.nome ||
        (
          carregando
            ? 'Identificando unidade...'
            : 'Unidade institucional'
        )
      ).trim();


    const indigena =
      escolaCatalogada?.indigena ===
      true;


    const possuiBrasaoProprio =
      escolaCatalogada
        ?.possuiBrasaoProprio ===
      true;


    const brasao =
      tipo === 'SEMEC'
        ? municipioMainLogo
        : (
            escolaCatalogada?.brasao ||
            municipioMainLogo
          );


    document
      .querySelectorAll(
        '[data-school-name], [data-school-name-topbar]'
      )
      .forEach(
        el => {
          el.textContent =
            nome;
        }
      );


    document
      .querySelectorAll(
        '[data-school-avatar]'
      )
      .forEach(
        el => {
          el.textContent =
            iniciaisUnidade(
              nome
            );
        }
      );


    document
      .querySelectorAll(
        '[data-school-network]'
      )
      .forEach(
        el => {
          el.textContent =
            tipo === 'SEMEC'
              ? 'Secretaria Municipal de Educação'
              : 'Rede Municipal de Ensino';
        }
      );


    document
      .querySelectorAll(
        '[data-account-kind]'
      )
      .forEach(
        el => {
          el.textContent =
            tipo === 'SEMEC'
              ? 'Acesso SEMEC'
              : 'Conta institucional';
        }
      );


    const textoAltBrasao =
      tipo === 'SEMEC'
        ? 'Brasão de Tangará da Serra'
        : (
            indigena &&
            !possuiBrasaoProprio
              ? (
                  'Identidade da Educação Escolar Indígena — ' +
                  nome
                )
              : (
                  'Brasão de ' +
                  nome
                )
          );


    document
      .querySelectorAll(
        '[data-school-logo], [data-school-avatar-img]'
      )
      .forEach(
        img => {

          img.src =
            brasao;

          img.alt =
            textoAltBrasao;


          img.onerror =
            () => {

              img.onerror =
                null;


              img.src =
                tipo === 'SEMEC'
                  ? municipioMainLogo
                  : (
                      indigena
                        ? (
                            window.CENTRAL_LOGOS &&
                            window.CENTRAL_LOGOS
                              .INDIGENA
                          ) || ''

                        : municipioMainLogo
                    );
            };
        }
      );


    document.body
      .dataset
      .unidadeId =
        unidadeId;


    document.body
      .dataset
      .perfilAcesso =
        tipo;
  };


  if (
    escolaPreviaId
  ) {

    aplicarIdentidadeUnidade({
      idEscola:
        escolaPreviaId,

      ...catalogoEscolas[
        escolaPreviaId
      ]
    });

  } else {

    aplicarIdentidadeUnidade(
      {},
      {
        carregando: true
      }
    );
  }


  /*
   * Mantém a mesma unidade durante
   * a navegação local entre as páginas.
   */

  if (
    escolaPreviaId
  ) {

    document
      .querySelectorAll(
        'a[data-preserve-school]'
      )
      .forEach(
        link => {

          const href =
            link.getAttribute(
              'href'
            ) || '';


          if (
            !href ||
            href.startsWith('#') ||
            href.startsWith(
              'mailto:'
            ) ||
            href.startsWith(
              'http'
            )
          ) {
            return;
          }


          const [
            pathPart,
            hashPart = ''
          ] =
            href.split(
              '#'
            );


          const url =
            new URL(
              pathPart,
              window.location.href
            );


          url.searchParams.set(
            'escola',
            escolaPreviaId
          );


          link.setAttribute(
            'href',
            `${
              url.pathname
                .split('/')
                .pop()
            }${
              url.search
            }${
              hashPart
                ? `#${hashPart}`
                : ''
            }`
          );
        }
      );
  }


  /* =====================================================
   * MENU
   * ===================================================== */


  const initializeInternalMenu =
    () => {

      if (
        !sidebar ||
        !menuToggle ||
        !backdrop
      ) {
        return {
          close: () => {}
        };
      }


      const toggleSlot =
        document.createElement(
          'span'
        );


      toggleSlot.className =
        'server-menu-toggle-slot';


      toggleSlot.setAttribute(
        'aria-hidden',
        'true'
      );


      let animationTimer =
        null;


      const clearAnimationTimer =
        () => {

          if (
            animationTimer
          ) {

            window.clearTimeout(
              animationTimer
            );


            animationTimer =
              null;
          }
        };


      const finishClose = ({
        restoreFocus = false
      } = {}) => {

        clearAnimationTimer();


        if (
          toggleSlot.isConnected
        ) {

          toggleSlot.replaceWith(
            menuToggle
          );
        }


        sidebar.setAttribute(
          'aria-hidden',
          'true'
        );


        sidebar.inert =
          true;


        backdrop.hidden =
          true;


        menuToggle.setAttribute(
          'aria-expanded',
          'false'
        );


        menuToggle.setAttribute(
          'aria-label',
          'Abrir menu'
        );


        if (
          restoreFocus
        ) {

          window.requestAnimationFrame(
            () =>
              menuToggle.focus()
          );
        }
      };


      const close = ({
        restoreFocus = false,
        immediate = false
      } = {}) => {

        clearAnimationTimer();


        if (
          immediate
        ) {

          sidebar.classList.remove(
            'is-open'
          );


          menuToggle.classList.remove(
            'is-open'
          );


          backdrop.classList.remove(
            'is-open'
          );


          document.body.classList.remove(
            'server-menu-open',
            'server-menu-animating'
          );


          finishClose({
            restoreFocus
          });


          return;
        }


        document.body.classList.add(
          'server-menu-animating'
        );


        menuToggle.classList.remove(
          'is-open'
        );


        sidebar.classList.remove(
          'is-open'
        );


        backdrop.classList.remove(
          'is-open'
        );


        document.body.classList.remove(
          'server-menu-open'
        );


        animationTimer =
          window.setTimeout(
            () => {

              document.body
                .classList
                .remove(
                  'server-menu-animating'
                );


              finishClose({
                restoreFocus
              });

            },
            490
          );
      };


      const open =
        () => {

          clearAnimationTimer();


          sidebar.removeAttribute(
            'aria-hidden'
          );


          sidebar.inert =
            false;


          backdrop.hidden =
            false;


          if (
            !toggleSlot
              .isConnected
          ) {

            menuToggle.replaceWith(
              toggleSlot
            );


            document.body.append(
              menuToggle
            );
          }


          menuToggle.setAttribute(
            'aria-expanded',
            'true'
          );


          menuToggle.setAttribute(
            'aria-label',
            'Fechar menu'
          );


          menuToggle.classList.remove(
            'is-open'
          );


          sidebar.classList.remove(
            'is-open'
          );


          backdrop.classList.remove(
            'is-open'
          );


          document.body.classList.add(
            'server-menu-animating'
          );


          window.requestAnimationFrame(
            () => {

              window.requestAnimationFrame(
                () => {

                  document.body
                    .classList
                    .add(
                      'server-menu-open'
                    );


                  sidebar.classList.add(
                    'is-open'
                  );


                  backdrop.classList.add(
                    'is-open'
                  );


                  menuToggle.classList.add(
                    'is-open'
                  );


                  animationTimer =
                    window.setTimeout(
                      () => {

                        document.body
                          .classList
                          .remove(
                            'server-menu-animating'
                          );


                        sidebar
                          .querySelector(
                            'a, button'
                          )
                          ?.focus();

                      },
                      490
                    );
                }
              );
            }
          );
        };


      menuToggle
        .addEventListener(
          'click',
          () => {

            if (
              sidebar.classList
                .contains(
                  'is-open'
                )
            ) {

              close({
                restoreFocus:
                  true
              });

            } else {

              open();
            }
          }
        );


      backdrop
        .addEventListener(
          'click',
          () =>
            close({
              restoreFocus:
                true
            })
        );


      sidebar
        .querySelectorAll(
          'a, button'
        )
        .forEach(
          item => {

            item.addEventListener(
              'click',
              () =>
                close()
            );
          }
        );


      document
        .addEventListener(
          'keydown',
          event => {

            if (
              event.key ===
                'Escape' &&
              sidebar.classList
                .contains(
                  'is-open'
                )
            ) {

              close({
                restoreFocus:
                  true
              });
            }
          }
        );


      window
        .addEventListener(
          'resize',
          () =>
            close({
              immediate:
                true
            })
        );


      window
        .addEventListener(
          'pagehide',
          () =>
            close({
              immediate:
                true
            })
        );


      window
        .addEventListener(
          'hashchange',
          () =>
            close()
        );


      close({
        immediate:
          true
      });


      return {
        close:
          () =>
            close({
              restoreFocus:
                true
            })
      };
    };


  const internalMenu =
    initializeInternalMenu();


  /* =====================================================
   * DIÁLOGOS
   * ===================================================== */


  const closeDialog =
    () => {
      if (
        dialog
      ) {
        dialog.hidden =
          true;
      }
    };


  const openDialog = ({
    kicker =
      'Área da Escola',

    title,

    html,

    actions = ''
  }) => {

    if (
      !dialog
    ) {
      return;
    }


    dialogKicker.textContent =
      kicker;


    dialogTitle.textContent =
      title;


    dialogBody.innerHTML =
      html;


    dialogActions.innerHTML =
      actions;

    dialogBody.scrollTop = 0;
    const panel = dialog.querySelector('.server-modal__panel');
    if (panel) panel.scrollTop = 0;


    dialog.hidden =
      false;


    dialog
      .querySelector(
        '.server-modal__panel'
      )
      ?.focus();
  };


  document
    .querySelector(
      '[data-dialog-close]'
    )
    ?.addEventListener(
      'click',
      closeDialog
    );


  dialog
    ?.addEventListener(
      'click',
      event => {

        if (
          event.target ===
            dialog ||

          event.target.closest(
            '[data-dialog-close], [data-modal-close]'
          )
        ) {

          closeDialog();
        }
      }
    );


  /* =====================================================
   * SAIR
   * ===================================================== */


  const logoutDialog =
    document.querySelector(
      '[data-server-logout-dialog]'
    );


  const logoutCancel =
    document.querySelector(
      '[data-server-logout-cancel]'
    );


  const logoutConfirm =
    document.querySelector(
      '[data-server-logout-confirm]'
    );


  const appShell =
    document.querySelector(
      '[data-server-app]'
    );


  const loggedOutScreen =
    document.querySelector(
      '[data-central-logged-out]'
    );


  const openLogoutDialog = (
    trigger
  ) => {

    if (
      !logoutDialog
    ) {
      return;
    }


    logoutDialog.hidden =
      false;


    document.body
      .classList
      .add(
        'server-modal-open'
      );


    logoutDialog.dataset
      .returnFocus =
        trigger
          ? 'true'
          : 'false';


    logoutCancel
      ?.focus();
  };


  const closeLogoutDialog =
    () => {

      if (
        !logoutDialog
      ) {
        return;
      }


      logoutDialog.hidden =
        true;


      document.body
        .classList
        .remove(
          'server-modal-open'
        );
    };


  document
    .querySelectorAll(
      '[data-server-logout]'
    )
    .forEach(
      button => {

        button
          .addEventListener(
            'click',
            () =>
              openLogoutDialog(
                button
              )
          );
      }
    );


  logoutCancel
    ?.addEventListener(
      'click',
      closeLogoutDialog
    );


  logoutDialog
    ?.addEventListener(
      'click',
      event => {

        if (
          event.target ===
          logoutDialog
        ) {
          closeLogoutDialog();
        }
      }
    );


  logoutConfirm
    ?.addEventListener(
      'click',
      () => {

        closeLogoutDialog();


        internalMenu.close();


        sessionStorage.setItem(
          'centralCertificadosSessaoEncerrada',
          '1'
        );


        if (
          appShell
        ) {
          appShell.hidden =
            true;
        }


        if (
          loggedOutScreen
        ) {
          loggedOutScreen.hidden =
            false;
        }
      }
    );


  document
    .querySelector(
      '[data-central-enter-again]'
    )
    ?.addEventListener(
      'click',
      () => {

        sessionStorage.removeItem(
          'centralCertificadosSessaoEncerrada'
        );


        if (
          loggedOutScreen
        ) {
          loggedOutScreen.hidden =
            true;
        }


        if (
          appShell
        ) {
          appShell.hidden =
            false;
        }
      }
    );


  if (
    sessionStorage.getItem(
      'centralCertificadosSessaoEncerrada'
    ) === '1'
  ) {

    if (
      appShell
    ) {
      appShell.hidden =
        true;
    }


    if (
      loggedOutScreen
    ) {
      loggedOutScreen.hidden =
        false;
    }
  }


  /* =====================================================
   * CENTRAL DE CERTIFICADOS — ESCOPO ATUAL
   * ===================================================== */

  const EMAIL_ATENDIMENTO = 'semec@tangaradaserra.mt.gov.br';
  const filterForm = document.querySelector('[data-certificate-filter-form]');
  const existingResultList = document.querySelector('[data-existing-results]');
  const existingEmpty = document.querySelector('[data-existing-empty]');
  const searchResultSection = document.querySelector('#search-results');
  const searchResultList = document.querySelector('[data-search-results-list]');
  const searchEmpty = document.querySelector('[data-search-empty]');
  const centralStatus = document.querySelector('[data-central-status]');
  const centralStatusTitle = document.querySelector('[data-central-status-title]');
  const centralStatusDetail = document.querySelector('[data-central-status-detail]');
  const centralRetry = document.querySelector('[data-central-retry]');

  const backend = window.CENTRAL_BACKEND
    ? new window.CENTRAL_BACKEND.BridgeClient()
    : null;

  let certificadosAtuais = [];
  const certificadosPorId = new Map();

  const chaveCanonica = (value = '') =>
    String(value)
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
      const encontrada = chaves.find(chave => chaveCanonica(chave) === chaveCanonica(campo));
      if (encontrada && registro[encontrada] !== '' && registro[encontrada] != null) return registro[encontrada];
    }
    return '';
  };

  const urlSegura = value => {
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
      objeto?.id || primeiroValor(registro, 'formacaoId', 'idFormacao', 'codigoFormacao', 'tipoFormacao') || ''
    ).trim();
    const nomeInformado = String(
      objeto?.nome || primeiroValor(registro, 'formacaoNome', 'nomeFormacao') ||
      (typeof valor === 'string' ? valor : '') || ''
    ).trim();
    const etapa =
      String(primeiroValor(registro, 'etapa', 'numeroEtapa') || '').match(/[123]/)?.[0] ||
      nomeInformado.match(/etapa\s*([123])/i)?.[1] || '';
    const idPorEtapa = {
      '1': 'FORMACAO_REDE',
      '2': 'FORMACAO_CENTRO_ENSINO',
      '3': 'PALESTRAS_SEMINARIOS'
    }[etapa] || '';
    const id = idInformado || idPorEtapa;
    if (catalogoFormacoes[id]) return { id, nome: catalogoFormacoes[id].nome };
    if (catalogoFormacoes[nomeInformado]) return { id: nomeInformado, nome: catalogoFormacoes[nomeInformado].nome };
    const catalogada = Object.values(catalogoFormacoes).find(item => chaveCanonica(item.nome) === chaveCanonica(nomeInformado));
    return catalogada
      ? { id: catalogada.id, nome: catalogada.nome }
      : { id, nome: nomeInformado || 'Formação não informada' };
  };

  const formatarCargaHoraria = value => {
    const carga = String(value || '').trim();
    if (!carga) return 'Não informada';
    return /^\d+(?:[.,]\d+)?$/.test(carga) ? carga + 'h' : carga;
  };

  const formatarParticipacao = value => {
    const percentual = String(value || '').trim();
    if (!percentual) return 'Não informada';
    return /^\d+(?:[.,]\d+)?$/.test(percentual) ? percentual + '%' : percentual;
  };

  const formatarSituacao = value => {
    const situacao = chaveCanonica(value || 'ativo');
    if (situacao === 'substituido') return 'Substituído';
    if (situacao === 'cancelado') return 'Cancelado';
    if (situacao === 'inativo') return 'Inativo';
    return 'Ativo';
  };

  const normalizarCertificado = registro => {
    const formacao = nomeFormacao(
      primeiroValor(registro, 'formacao', 'formacaoNome', 'nomeFormacao', 'tipoFormacao'),
      registro
    );
    const situacao = formatarSituacao(
      primeiroValor(registro, 'situacao', 'status', 'statusCertificado') || 'ativo'
    );
    const arquivo = primeiroValor(registro, 'arquivo', 'pdf', 'documento');
    const visualizacao =
      primeiroValor(registro, 'visualizacaoUrl', 'urlVisualizacao', 'linkCertificado', 'urlCertificado') ||
      (arquivo && typeof arquivo === 'object'
        ? primeiroValor(arquivo, 'visualizacaoUrl', 'urlVisualizacao', 'url')
        : '');
    const download =
      primeiroValor(registro, 'urlDownload', 'downloadUrl', 'linkDownload') ||
      (arquivo && typeof arquivo === 'object'
        ? primeiroValor(arquivo, 'downloadUrl', 'urlDownload')
        : '') ||
      visualizacao;

    return {
      id: String(primeiroValor(registro, 'idCertificado', 'certificadoId', 'id', 'codigo') || '').trim(),
      nome: String(primeiroValor(registro, 'nomeServidor', 'servidorNome', 'nomeCompleto', 'nome') || 'Servidor não informado').trim(),
      formacaoId: formacao.id,
      formacaoNome: formacao.nome,
      unidadeNome: String(
        primeiroValor(registro, 'unidadeNome', 'nomeUnidade', 'unidadeVinculada', 'escola', 'lotacao') ||
        document.querySelector('[data-school-name]')?.textContent ||
        'Unidade não informada'
      ).trim(),
      cargaHoraria: formatarCargaHoraria(primeiroValor(registro, 'cargaHoraria', 'cargaHorariaTotal', 'carga', 'horas')),
      cpfMascarado: String(primeiroValor(registro, 'cpfMascarado', 'cpf') || '').trim(),
      percentual: String(primeiroValor(registro, 'percentual', 'presenca', 'frequencia') || '').trim(),
      dataEmissao: String(primeiroValor(registro, 'dataEmissao', 'emitidoEm') || '').trim(),
      ano: String(primeiroValor(registro, 'ano', 'anoReferencia', 'exercicio') || '2026').trim(),
      situacao,
      situacaoId: chaveCanonica(situacao),
      visualizacaoUrl: urlSegura(visualizacao),
      downloadUrl: urlSegura(download)
    };
  };

  const extrairResultado = response => {
    if (!response || response.ok === false) {
      const error = new Error(response?.mensagem || response?.message || response?.erro || 'O backend não concluiu a solicitação.');
      error.code = response?.codigo || 'BACKEND_ERROR';
      throw error;
    }
    const result = response.resultado || response.result || response;
    if (result.ok === false) {
      const error = new Error(result.mensagem || result.message || result.erro || 'O backend não concluiu a solicitação.');
      error.code = result.codigo || 'BACKEND_ERROR';
      throw error;
    }
    return result;
  };

  const extrairCertificados = result => {
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

  const definirFormularioOcupado = busy => {
    filterForm?.querySelectorAll('input, select, button').forEach(control => { control.disabled = busy; });
    filterForm?.setAttribute('aria-busy', String(busy));
  };

  const atualizarContagem = (selector, total) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = total + ' certificado' + (total === 1 ? '' : 's');
  };

  const mostrarVazio = (element, title, detail, visible = true) => {
    if (!element) return;
    element.hidden = !visible;
    const strong = element.querySelector('strong');
    const span = element.querySelector('span');
    if (strong) strong.textContent = title;
    if (span) span.textContent = detail;
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

  const chavePessoa = certificado =>
    chaveCanonica(certificado?.nome || '') + '|' + chaveCanonica(certificado?.cpfMascarado || '');

  const criarLinhaCertificado = certificado => {
    const article = document.createElement('article');
    article.className = 'school-record-row';
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
    adicionarDetalhe(details, 'Participação', formatarParticipacao(certificado.percentual));
    adicionarDetalhe(details, 'Emissão', certificado.dataEmissao || 'Não informada');
    adicionarDetalhe(details, 'Ano / situação', certificado.ano + ' - ' + certificado.situacao);

    const actions = document.createElement('div');
    actions.className = 'school-table-actions';

    const viewButton = document.createElement('button');
    viewButton.className = 'server-button server-button--primary';
    viewButton.type = 'button';
    viewButton.textContent = 'Visualizar';
    viewButton.dataset.certificateView = certificado.id;
    viewButton.disabled = !certificado.visualizacaoUrl;

    const downloadButton = document.createElement('button');
    downloadButton.className = 'server-button server-button--ghost';
    downloadButton.type = 'button';
    downloadButton.textContent = 'Baixar PDF';
    downloadButton.dataset.certificateDownload = certificado.id;
    downloadButton.disabled = !certificado.downloadUrl;

    const reportButton = document.createElement('button');
    reportButton.className = 'server-button server-button--ghost';
    reportButton.type = 'button';
    reportButton.textContent = 'Relatório do servidor';
    reportButton.dataset.certificateReport = certificado.id;

    const issueButton = document.createElement('button');
    issueButton.className = 'server-button server-button--ghost';
    issueButton.type = 'button';
    issueButton.textContent = 'Informar problema';
    issueButton.dataset.certificateIssue = certificado.id;

    if (!certificado.visualizacaoUrl) viewButton.title = 'O PDF ainda não foi disponibilizado pelo registro oficial.';
    if (!certificado.downloadUrl) downloadButton.title = 'O PDF ainda não foi disponibilizado pelo registro oficial.';

    actions.append(viewButton, downloadButton, reportButton, issueButton);
    article.append(type, title, details, actions);
    return article;
  };

  const renderizarCertificados = (container, certificados) => {
    if (!container) return;
    certificados.forEach(certificado => {
      if (certificado.id) certificadosPorId.set(certificado.id, certificado);
    });
    container.replaceChildren(...certificados.map(criarLinhaCertificado));
  };

  const updateSummaryCards = () => {
    const ativos = certificadosAtuais.filter(item => item.situacaoId === 'ativo');
    const pessoas = new Set(ativos.map(chavePessoa).filter(Boolean));
    const ano = String(filterForm?.elements?.ano?.value || '2026');
    const activeEl = document.querySelector('[data-summary-active]');
    const peopleEl = document.querySelector('[data-summary-people]');
    const yearEl = document.querySelector('[data-summary-year]');
    if (activeEl) activeEl.textContent = String(ativos.length);
    if (peopleEl) peopleEl.textContent = String(pessoas.size);
    if (yearEl) yearEl.textContent = ano;
  };

  const filtrarCertificados = (certificados, { ano = '', formacao = '' } = {}) =>
    certificados.filter(certificado =>
      (!ano || certificado.ano === ano) &&
      (!formacao || certificado.formacaoId === formacao)
    );

  const carregarCertificados = async () => {
    if (!filterForm || !backend) return;
    const ano = String(filterForm.elements.ano?.value || '2026');
    definirFormularioOcupado(true);
    renderizarCertificados(existingResultList, []);
    mostrarVazio(existingEmpty, 'Carregando certificados', 'Consultando o registro oficial da Central.');
    atualizarContagem('[data-existing-count]', 0);
    try {
      const result = extrairResultado(await backend.request('LISTAR_CERTIFICADOS', { ano }));
      if (result.unidade) aplicarIdentidadeUnidade(result.unidade);
      certificadosAtuais = extrairCertificados(result);
      renderizarCertificados(existingResultList, certificadosAtuais);
      mostrarVazio(
        existingEmpty,
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
          'Carregando certificados' + (connection.version ? ' pela ponte ' + connection.version : '') + '.'
        );
        await carregarCertificados();
        return;
      }
      definirStatus('ready', 'Central conectada', 'Conta institucional e unidade identificadas.');
    } catch (error) {
      certificadosAtuais = [];
      renderizarCertificados(existingResultList, []);
      mostrarVazio(existingEmpty, 'Não foi possível carregar os certificados', error.message || 'Tente novamente em instantes.');
      atualizarContagem('[data-existing-count]', 0);
      updateSummaryCards();
      definirStatus('error', 'Não foi possível conectar', error.message || 'Tente novamente em instantes.', { retry: true });
      definirFormularioOcupado(true);
    }
  };

  document.querySelectorAll('[data-summary-action]').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.summaryAction;
      if (!filterForm) return;
      if (action === 'ano') {
        filterForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => filterForm.elements.ano?.focus(), 350);
        return;
      }
      if (action === 'ativos' || action === 'servidores') {
        filterForm.elements.busca.value = '';
        filterForm.elements.formacao.value = '';
        filterForm.requestSubmit();
      }
    });
  });

  filterForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('busca') || '').trim();
    const ano = String(formData.get('ano') || '').trim();
    const formacao = String(formData.get('formacao') || '').trim();

    if (searchResultSection) {
      searchResultSection.hidden = false;
      searchResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (query && query.length < 3) {
      renderizarCertificados(searchResultList, []);
      atualizarContagem('[data-search-result-count]', 0);
      mostrarVazio(searchEmpty, 'Informe pelo menos 3 caracteres', 'Digite um trecho maior do nome do servidor para pesquisar.');
      return;
    }

    definirFormularioOcupado(true);
    renderizarCertificados(searchResultList, []);
    mostrarVazio(searchEmpty, 'Pesquisando certificados', 'Consultando o registro oficial da Central.');

    try {
      let matches;
      if (query) {
        const result = extrairResultado(await backend.request('BUSCAR_CERTIFICADOS', { busca: query, ano, formacao }));
        if (result.unidade) aplicarIdentidadeUnidade(result.unidade);
        matches = filtrarCertificados(extrairCertificados(result), { ano, formacao });
      } else {
        matches = filtrarCertificados(certificadosAtuais, { ano, formacao });
      }
      renderizarCertificados(searchResultList, matches);
      atualizarContagem('[data-search-result-count]', matches.length);
      mostrarVazio(searchEmpty, 'Nenhum certificado encontrado', 'Revise o nome pesquisado ou altere os filtros.', matches.length === 0);
    } catch (error) {
      renderizarCertificados(searchResultList, []);
      atualizarContagem('[data-search-result-count]', 0);
      mostrarVazio(searchEmpty, 'Não foi possível concluir a pesquisa', error.message || 'Tente novamente em instantes.');
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

  const certificadosDaPessoa = certificado => {
    const chave = chavePessoa(certificado);
    return Array.from(certificadosPorId.values())
      .filter(item => chavePessoa(item) === chave)
      .sort((a, b) => String(b.dataEmissao || b.ano).localeCompare(String(a.dataEmissao || a.ano), 'pt-BR'));
  };

  const abrirRelatorioServidor = certificado => {
    const registros = certificadosDaPessoa(certificado);
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      openDialog({
        kicker: 'Relatório individual',
        title: 'Não foi possível abrir o relatório',
        html: '<p>O navegador bloqueou a nova janela. Autorize pop-ups para esta página e tente novamente.</p>',
        actions: '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
      });
      return;
    }

    const linhas = registros.map(item => {
      const tr = popup.document.createElement('tr');
      [
        item.formacaoNome,
        item.unidadeNome,
        item.cargaHoraria,
        formatarParticipacao(item.percentual),
        item.dataEmissao || 'Não informada',
        item.situacao
      ].forEach(valor => {
        const td = popup.document.createElement('td');
        td.textContent = valor;
        tr.appendChild(td);
      });
      return tr;
    });

    popup.document.title = 'Relatório individual de participação e certificação';
    popup.document.body.replaceChildren();

    const style = popup.document.createElement('style');
    style.textContent = 'body{font-family:Arial,sans-serif;color:#17213a;margin:36px}h1{font-size:22px;margin:0 0 8px}p{margin:4px 0 18px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border:1px solid #cbd5e1;padding:9px;text-align:left;font-size:12px}th{background:#f1f5f9}@media print{button{display:none}body{margin:15mm}}';
    const h1 = popup.document.createElement('h1');
    h1.textContent = 'Relatório individual de participação e certificação';
    const identification = popup.document.createElement('p');
    identification.textContent = certificado.nome + (certificado.cpfMascarado ? ' · CPF ' + certificado.cpfMascarado : '');
    const generated = popup.document.createElement('p');
    generated.textContent = 'Emitido pela Central de Certificados do Portal SEMEC em ' + new Date().toLocaleString('pt-BR') + '.';
    const table = popup.document.createElement('table');
    const thead = popup.document.createElement('thead');
    const header = popup.document.createElement('tr');
    ['Formação','Unidade','Carga horária','Participação','Emissão','Situação'].forEach(texto => {
      const th = popup.document.createElement('th');
      th.textContent = texto;
      header.appendChild(th);
    });
    thead.appendChild(header);
    const tbody = popup.document.createElement('tbody');
    linhas.forEach(linha => tbody.appendChild(linha));
    table.append(thead, tbody);
    const printButton = popup.document.createElement('button');
    printButton.type = 'button';
    printButton.textContent = 'Imprimir / salvar em PDF';
    printButton.addEventListener('click', () => popup.print());
    popup.document.head.appendChild(style);
    popup.document.body.append(h1, identification, generated, table, printButton);
  };

  const abrirSolicitacaoEmail = certificado => {
    openDialog({
      kicker: 'Correção de certificado',
      title: certificado.nome,
      html:
        '<form class="school-dialog-form" data-email-issue-form>' +
          '<p>Use este canal somente para informar divergência em um certificado já emitido. Nenhuma correção é feita automaticamente.</p>' +
          '<label><span>Informação a conferir</span><select name="categoria" required>' +
            '<option value="Nome do servidor">Nome do servidor</option>' +
            '<option value="CPF">CPF</option>' +
            '<option value="Escola / unidade">Escola / unidade</option>' +
            '<option value="Carga horária">Carga horária</option>' +
            '<option value="Percentual / presença">Percentual / presença</option>' +
            '<option value="Formação">Formação</option>' +
            '<option value="Outro">Outro</option>' +
          '</select></label>' +
          '<label><span>Descrição</span><textarea name="descricao" required minlength="10" maxlength="1500" placeholder="Descreva objetivamente o que precisa ser conferido. Não informe CPF completo."></textarea></label>' +
          '<p class="central-action-message" role="alert" data-email-issue-error hidden></p>' +
        '</form>',
      actions:
        '<button class="server-button server-button--ghost" type="button" data-modal-close>Cancelar</button>' +
        '<button class="server-button server-button--primary" type="button" data-email-issue-submit>Abrir e-mail</button>'
    });

    const form = dialogBody.querySelector('[data-email-issue-form]');
    dialogActions.querySelector('[data-email-issue-submit]')?.addEventListener('click', () => {
      if (!form?.reportValidity()) return;
      const categoria = form.elements.categoria.value;
      const descricao = form.elements.descricao.value.trim();
      const subject = 'Correção de certificado — ' + certificado.nome;
      const body = [
        'Solicitação de conferência de certificado',
        '',
        'Servidor: ' + certificado.nome,
        'CPF mascarado: ' + (certificado.cpfMascarado || 'Não informado'),
        'Certificado: ' + (certificado.id || 'Não informado'),
        'Formação: ' + certificado.formacaoNome,
        'Ano: ' + certificado.ano,
        'Informação a conferir: ' + categoria,
        '',
        'Descrição:',
        descricao,
        '',
        'Solicitação enviada a partir da Central de Certificados do Portal SEMEC.'
      ].join('\n');
      window.location.href =
        'mailto:' + EMAIL_ATENDIMENTO +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  };

  /* =====================================================
   * VISUALIZAR / BAIXAR COM AUDITORIA
   * ===================================================== */


  const abrirCertificadoComAuditoria =
    async (
      certificado,
      acao,
      botaoAcao = null
    ) => {

      if (
        !certificado?.id ||
        !backend
      ) {
        return;
      }


      const ehDownload =
        acao ===
        'BAIXAR_PDF';


      /*
       * Feedback visual do download.
       *
       * O botão muda de aparência imediatamente,
       * fica temporariamente desabilitado e informa
       * cada etapa sem tirar o usuário da Central.
       */

      let estadoOriginalBotao =
        null;


      const restaurarBotaoDownload =
        () => {

          if (
            !ehDownload ||
            !botaoAcao ||
            !estadoOriginalBotao
          ) {
            return;
          }


          botaoAcao.textContent =
            estadoOriginalBotao.texto;


          botaoAcao.className =
            estadoOriginalBotao.classe;


          botaoAcao.disabled =
            estadoOriginalBotao.disabled;


          botaoAcao.removeAttribute(
            'aria-busy'
          );


          botaoAcao.removeAttribute(
            'aria-label'
          );
        };


      if (
        ehDownload &&
        botaoAcao
      ) {

        estadoOriginalBotao = {
          texto:
            botaoAcao.textContent,

          classe:
            botaoAcao.className,

          disabled:
            botaoAcao.disabled
        };


        botaoAcao.disabled =
          true;


        botaoAcao.setAttribute(
          'aria-busy',
          'true'
        );


        botaoAcao.setAttribute(
          'aria-label',
          'Preparando download do certificado'
        );


        botaoAcao.textContent =
          'Preparando...';


        botaoAcao.classList.remove(
          'server-button--ghost'
        );


        botaoAcao.classList.add(
          'server-button--primary'
        );
      }


      /*
       * VISUALIZAR:
       * abre uma nova aba imediatamente para preservar
       * o gesto do clique e evitar bloqueio de pop-up.
       *
       * BAIXAR PDF:
       * não abre aba. Prepara um iframe invisível na
       * própria Central para receber a URL de download
       * depois que a auditoria for registrada.
       */

      const popup =
        ehDownload
          ? null
          : window.open(
              'about:blank',
              '_blank'
            );


      const downloadFrame =
        ehDownload
          ? document.createElement(
              'iframe'
            )
          : null;


      if (
        downloadFrame
      ) {

        downloadFrame.hidden =
          true;


        downloadFrame.setAttribute(
          'aria-hidden',
          'true'
        );


        downloadFrame.setAttribute(
          'title',
          'Download de certificado'
        );


        document.body.appendChild(
          downloadFrame
        );
      }


      if (
        popup &&
        !popup.closed
      ) {

        try {

          popup.document.title =
            'Abrindo certificado';


          popup.document.body.innerHTML =
            '<p style="font-family:Arial,sans-serif;padding:24px;">Abrindo certificado...</p>';

        } catch (_) {

          /*
           * Não interfere no fluxo principal.
           */
        }
      }


      try {

        const result =
          extrairResultado(

            await backend.request(
              'REGISTRAR_ACESSO_CERTIFICADO',
              {
                idCertificado:
                  certificado.id,

                acao:
                  acao
              }
            )
          );


        const fallback =
          ehDownload

            ? certificado
                .downloadUrl

            : certificado
                .visualizacaoUrl;


        const url =
          urlSegura(
            result.url ||
            fallback
          );


        if (
          !url
        ) {

          throw new Error(
            'O arquivo oficial não está disponível para esta ação.'
          );
        }


        /*
         * BAIXAR PDF
         *
         * O download é disparado dentro de um iframe
         * invisível. Assim a Central permanece na mesma
         * página e nenhuma nova aba é aberta.
         */

        if (
          ehDownload
        ) {

          if (
            !downloadFrame
          ) {

            throw new Error(
              'Não foi possível preparar o download do certificado.'
            );
          }


          downloadFrame.src =
            url;


          /*
           * Neste ponto a URL de download já foi entregue
           * ao navegador. Como o Google Drive não informa
           * ao JavaScript o instante exato em que o arquivo
           * começa ou termina de baixar, mostramos apenas
           * um estado que podemos confirmar com precisão.
           */

          if (
            botaoAcao &&
            botaoAcao.isConnected
          ) {

            botaoAcao.textContent =
              'Download solicitado ✓';


            botaoAcao.removeAttribute(
              'aria-busy'
            );


            botaoAcao.setAttribute(
              'aria-label',
              'Download do certificado solicitado'
            );
          }


          window.setTimeout(
            () => {

              restaurarBotaoDownload();

            },
            2800
          );


          /*
           * O iframe precisa permanecer por alguns
           * segundos para que o Google Drive processe
           * a solicitação. Depois ele é removido.
           */

          window.setTimeout(
            () => {

              try {

                downloadFrame.remove();

              } catch (_) {

                /*
                 * Não interfere no download.
                 */
              }

            },
            30000
          );


          return;
        }


        /*
         * VISUALIZAR
         *
         * A nova aba permanece aberta para consulta.
         */

        if (
          popup &&
          !popup.closed
        ) {

          popup.location.replace(
            url
          );

        } else {

          window.open(
            url,
            '_blank',
            'noopener,noreferrer'
          );
        }

      } catch (
        error
      ) {

        restaurarBotaoDownload();


        if (
          popup &&
          !popup.closed
        ) {

          popup.close();
        }


        if (
          downloadFrame
        ) {

          try {

            downloadFrame.remove();

          } catch (_) {

            /*
             * Não interfere no tratamento do erro.
             */
          }
        }


        openDialog({

          kicker:
            'Registro de acesso',

          title:
            ehDownload
              ? 'Não foi possível baixar o certificado'
              : 'Não foi possível abrir o certificado',

          html:
            '<p data-access-error-message></p>',

          actions:
            '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
        });


        const message =
          dialogBody
            ?.querySelector(
              '[data-access-error-message]'
            );


        if (
          message
        ) {

          message.textContent =
            error.message ||
            (
              ehDownload
                ? 'Não foi possível iniciar o download do certificado.'
                : 'Não foi possível registrar o acesso ao certificado.'
            );
        }
      }
    };


  /* =====================================================
   * AÇÕES DOS CERTIFICADOS
   * ===================================================== */

  document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-certificate-view]');
    if (viewButton) {
      const certificado = certificadosPorId.get(String(viewButton.dataset.certificateView || ''));
      if (certificado) abrirCertificadoComAuditoria(certificado, 'VISUALIZAR');
      return;
    }

    const downloadButton = event.target.closest('[data-certificate-download]');
    if (downloadButton) {
      const certificado = certificadosPorId.get(String(downloadButton.dataset.certificateDownload || ''));
      if (certificado) abrirCertificadoComAuditoria(certificado, 'BAIXAR_PDF', downloadButton);
      return;
    }

    const reportButton = event.target.closest('[data-certificate-report]');
    if (reportButton) {
      const certificado = certificadosPorId.get(String(reportButton.dataset.certificateReport || ''));
      if (certificado) abrirRelatorioServidor(certificado);
      return;
    }

    const issueButton = event.target.closest('[data-certificate-issue]');
    if (issueButton) {
      const certificado = certificadosPorId.get(String(issueButton.dataset.certificateIssue || ''));
      if (certificado) abrirSolicitacaoEmail(certificado);
    }
  });

  centralRetry?.addEventListener('click', iniciarBackend);

  updateSummaryCards();
  iniciarBackend();

})();
