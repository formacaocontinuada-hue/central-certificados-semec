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
        ? centralMainLogo
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
        ? 'Brasão do Portal SEMEC'
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
                  ? centralMainLogo
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
   * ELEMENTOS DA CENTRAL
   * ===================================================== */


  const filterForm =
    document.querySelector(
      '[data-certificate-filter-form]'
    );


  const resultSection =
    document.querySelector(
      '#certificate-results'
    );


  const existingResultList =
    document.querySelector(
      '[data-existing-results]'
    );


  const existingEmpty =
    document.querySelector(
      '[data-existing-empty]'
    );


  const searchResultSection =
    document.querySelector(
      '#search-results'
    );


  const searchResultList =
    document.querySelector(
      '[data-search-results-list]'
    );


  const searchEmpty =
    document.querySelector(
      '[data-search-empty]'
    );


  const repairSection =
    document.querySelector(
      '#solicitacoes-reparo'
    );


  const repairList =
    document.querySelector(
      '[data-repair-list]'
    );


  const repairEmpty =
    document.querySelector(
      '[data-repair-empty]'
    );


  const repairPageList =
    document.querySelector(
      '[data-repair-page-list]'
    );


  const repairPageEmpty =
    document.querySelector(
      '[data-repair-page-empty]'
    );


  const sendHistoryList =
    document.querySelector(
      '[data-send-history-list]'
    );


  const sendHistoryEmpty =
    document.querySelector(
      '[data-send-history-empty]'
    );


  const centralStatus =
    document.querySelector(
      '[data-central-status]'
    );


  const centralStatusTitle =
    document.querySelector(
      '[data-central-status-title]'
    );


  const centralStatusDetail =
    document.querySelector(
      '[data-central-status-detail]'
    );


  const centralRetry =
    document.querySelector(
      '[data-central-retry]'
    );


  const backend =
    window.CENTRAL_BACKEND
      ? new window
          .CENTRAL_BACKEND
          .BridgeClient()
      : null;


  let certificadosAtuais =
    [];


  let solicitacoesAtuais =
    [];


  const certificadosPorId =
    new Map();


  /* =====================================================
   * UTILITÁRIOS
   * ===================================================== */


  const chaveCanonica = (
    value = ''
  ) =>
    String(value)

      .normalize(
        'NFD'
      )

      .replace(
        /[\u0300-\u036f]/g,
        ''
      )

      .replace(
        /[^a-z0-9]/gi,
        ''
      )

      .toLocaleLowerCase(
        'pt-BR'
      );


  const primeiroValor = (
    registro,
    ...campos
  ) => {

    if (
      !registro ||
      typeof registro !==
        'object'
    ) {
      return '';
    }


    for (
      const campo
      of campos
    ) {

      if (
        Object
          .prototype
          .hasOwnProperty
          .call(
            registro,
            campo
          ) &&

        registro[campo] !==
          '' &&

        registro[campo] !=
          null
      ) {
        return registro[
          campo
        ];
      }
    }


    const chaves =
      Object.keys(
        registro
      );


    for (
      const campo
      of campos
    ) {

      const chaveEncontrada =
        chaves.find(
          chave =>
            chaveCanonica(
              chave
            ) ===
            chaveCanonica(
              campo
            )
        );


      if (
        chaveEncontrada &&
        registro[
          chaveEncontrada
        ] !== '' &&
        registro[
          chaveEncontrada
        ] != null
      ) {

        return registro[
          chaveEncontrada
        ];
      }
    }


    return '';
  };


  const urlSegura = (
    value
  ) => {

    if (
      !value
    ) {
      return '';
    }


    try {

      const url =
        new URL(
          String(value),
          window.location.href
        );


      return (
        url.protocol ===
        'https:'
      )
        ? url.href
        : '';

    } catch (_) {

      return '';
    }
  };


  const nomeFormacao = (
    valor,
    registro
  ) => {

    const objeto =
      valor &&
      typeof valor ===
        'object'
        ? valor
        : null;


    const idInformado =
      String(
        objeto?.id ||

        primeiroValor(
          registro,
          'formacaoId',
          'idFormacao',
          'codigoFormacao',
          'tipoFormacao'
        ) ||

        ''
      ).trim();


    const nomeInformado =
      String(
        objeto?.nome ||

        primeiroValor(
          registro,
          'formacaoNome',
          'nomeFormacao'
        ) ||

        (
          typeof valor ===
          'string'
            ? valor
            : ''
        ) ||

        ''
      ).trim();


    const etapa =
      String(
        primeiroValor(
          registro,
          'etapa',
          'numeroEtapa'
        ) || ''
      )
        .match(
          /[123]/
        )?.[0] ||

      nomeInformado
        .match(
          /etapa\s*([123])/i
        )?.[1] ||

      '';


    const idPorEtapa = {
      '1':
        'FORMACAO_REDE',

      '2':
        'FORMACAO_CENTRO_ENSINO',

      '3':
        'PALESTRAS_SEMINARIOS'
    }[etapa] || '';


    const id =
      idInformado ||
      idPorEtapa;


    if (
      catalogoFormacoes[
        id
      ]
    ) {
      return {
        id:
          id,

        nome:
          catalogoFormacoes[
            id
          ].nome
      };
    }


    if (
      catalogoFormacoes[
        nomeInformado
      ]
    ) {

      return {
        id:
          nomeInformado,

        nome:
          catalogoFormacoes[
            nomeInformado
          ].nome
      };
    }


    const formacaoCatalogada =
      Object
        .values(
          catalogoFormacoes
        )
        .find(
          item =>
            chaveCanonica(
              item.nome
            ) ===
            chaveCanonica(
              nomeInformado
            )
        );


    if (
      formacaoCatalogada
    ) {
      return {
        id:
          formacaoCatalogada
            .id,

        nome:
          formacaoCatalogada
            .nome
      };
    }


    return {
      id:
        id,

      nome:
        nomeInformado ||
        'Formação não informada'
    };
  };


  const formatarCargaHoraria = (
    value
  ) => {

    const carga =
      String(
        value || ''
      ).trim();


    if (
      !carga
    ) {
      return 'Não informada';
    }


    return (
      /^\d+(?:[.,]\d+)?$/
        .test(
          carga
        )
    )
      ? `${carga}h`
      : carga;
  };


  const formatarSituacao = (
    value
  ) => {

    const situacao =
      chaveCanonica(
        value || 'ativo'
      );


    if (
      situacao ===
      'substituido'
    ) {
      return 'Substituído';
    }


    if (
      situacao ===
      'cancelado'
    ) {
      return 'Cancelado';
    }


    if (
      situacao ===
      'inativo'
    ) {
      return 'Inativo';
    }


    return 'Ativo';
  };


  /* =====================================================
   * CERTIFICADOS
   * ===================================================== */


  const normalizarCertificado = (
    registro = {}
  ) => {

    const servidor =
      primeiroValor(
        registro,
        'servidor'
      );


    const unidade =
      primeiroValor(
        registro,
        'unidade'
      );


    const formacao =
      primeiroValor(
        registro,
        'formacao'
      );


    const arquivo =
      primeiroValor(
        registro,
        'arquivo',
        'pdf'
      );


    const formacaoNormalizada =
      nomeFormacao(
        formacao,
        registro
      );


    const situacao =
      formatarSituacao(
        primeiroValor(
          registro,
          'situacao',
          'status',
          'estado'
        )
      );


    const visualizacao =
      primeiroValor(
        registro,
        'urlVisualizacao',
        'linkVisualizacao',
        'visualizarUrl',
        'urlPdf',
        'linkPdf',
        'pdfUrl',
        'arquivoUrl',
        'urlArquivo',
        'linkCertificado'
      ) ||

      (
        arquivo &&
        typeof arquivo ===
          'object'
          ? primeiroValor(
              arquivo,
              'url',
              'visualizacao',
              'link'
            )
          : ''
      );


    const download =
      primeiroValor(
        registro,
        'urlDownload',
        'downloadUrl',
        'linkDownload',
        'linkCertificado'
      ) ||

      (
        arquivo &&
        typeof arquivo ===
          'object'
          ? primeiroValor(
              arquivo,
              'downloadUrl',
              'urlDownload'
            )
          : ''
      ) ||

      visualizacao;


    return {

      id:
        String(
          primeiroValor(
            registro,
            'idCertificado',
            'certificadoId',
            'id',
            'codigo'
          ) || ''
        ),


      nome:
        String(

          (
            servidor &&
            typeof servidor ===
              'object'
              ? primeiroValor(
                  servidor,
                  'nome',
                  'nomeCompleto'
                )
              : ''
          ) ||

          primeiroValor(
            registro,
            'nomeServidor',
            'servidorNome',
            'nomeCompleto',
            'nome'
          ) ||

          (
            typeof servidor ===
              'string'
              ? servidor
              : ''
          ) ||

          'Servidor não informado'

        ).trim(),


      formacaoId:
        formacaoNormalizada
          .id,


      formacaoNome:
        formacaoNormalizada
          .nome,


      unidadeNome:
        String(

          (
            unidade &&
            typeof unidade ===
              'object'
              ? primeiroValor(
                  unidade,
                  'nome',
                  'nomeUnidade'
                )
              : ''
          ) ||

          primeiroValor(
            registro,
            'unidadeNome',
            'nomeUnidade',
            'unidadeVinculada',
            'escola',
            'lotacao'
          ) ||

          (
            typeof unidade ===
              'string'
              ? unidade
              : ''
          ) ||

          document
            .querySelector(
              '[data-school-name]'
            )
            ?.textContent ||

          'Unidade não informada'

        ).trim(),


      cargaHoraria:
        formatarCargaHoraria(
          primeiroValor(
            registro,
            'cargaHoraria',
            'cargaHorariaTotal',
            'carga',
            'horas'
          )
        ),


      cpfMascarado:
        String(
          primeiroValor(
            registro,
            'cpfMascarado',
            'cpf'
          ) || ''
        ).trim(),


      percentual:
        String(
          primeiroValor(
            registro,
            'percentual',
            'presenca',
            'frequencia'
          ) || ''
        ).trim(),


      dataEmissao:
        String(
          primeiroValor(
            registro,
            'dataEmissao',
            'emitidoEm'
          ) || ''
        ).trim(),


      ano:
        String(
          primeiroValor(
            registro,
            'ano',
            'anoReferencia',
            'exercicio'
          ) || '2026'
        ).trim(),


      situacao:
        situacao,


      situacaoId:
        chaveCanonica(
          situacao
        ),


      visualizacaoUrl:
        urlSegura(
          visualizacao
        ),


      downloadUrl:
        urlSegura(
          download
        )
    };
  };


  const extrairResultado = (
    response
  ) => {

    if (
      !response ||
      response.ok ===
        false
    ) {

      const message =
        response?.mensagem ||
        response?.message ||
        'O backend não concluiu a solicitação.';


      const error =
        new Error(
          message
        );


      error.code =
        response?.codigo ||
        'BACKEND_ERROR';


      throw error;
    }


    const result =
      response.resultado ||
      response.result ||
      response;


    if (
      result.ok ===
      false
    ) {

      const error =
        new Error(
          result.mensagem ||
          result.message ||
          'O backend não concluiu a solicitação.'
        );


      error.code =
        result.codigo ||
        'BACKEND_ERROR';


      throw error;
    }


    return result;
  };


  const extrairCertificados = (
    result
  ) => {

    const list =
      result.certificados ||
      result.resultados ||
      result.itens ||
      result.registros ||
      [];


    return Array.isArray(
      list
    )
      ? list.map(
          normalizarCertificado
        )
      : [];
  };


  const definirStatus = (
    state,
    title,
    detail,
    {
      retry = false
    } = {}
  ) => {

    if (
      !centralStatus
    ) {
      return;
    }


    centralStatus.hidden =
      false;


    centralStatus.dataset
      .state =
        state;


    if (
      centralStatusTitle
    ) {
      centralStatusTitle
        .textContent =
          title;
    }


    if (
      centralStatusDetail
    ) {
      centralStatusDetail
        .textContent =
          detail;
    }


    if (
      centralRetry
    ) {
      centralRetry.hidden =
        !retry;
    }
  };


  const definirFormularioOcupado = (
    busy
  ) => {

    filterForm
      ?.querySelectorAll(
        'input, select, button'
      )
      .forEach(
        control => {

          control.disabled =
            busy;
        }
      );


    filterForm
      ?.setAttribute(
        'aria-busy',
        String(
          busy
        )
      );
  };


  const atualizarContagem = (
    selector,
    total
  ) => {

    const element =
      document.querySelector(
        selector
      );


    if (
      element
    ) {

      element.textContent =
        `${total} certificado${
          total === 1
            ? ''
            : 's'
        }`;
    }
  };


  const adicionarDetalhe = (
    list,
    term,
    description
  ) => {

    const wrapper =
      document.createElement(
        'div'
      );


    const dt =
      document.createElement(
        'dt'
      );


    const dd =
      document.createElement(
        'dd'
      );


    dt.textContent =
      term;


    dd.textContent =
      description;


    wrapper.append(
      dt,
      dd
    );


    list.appendChild(
      wrapper
    );
  };


  const criarLinhaCertificado = (
    certificado
  ) => {

    const article =
      document.createElement(
        'article'
      );


    article.className =
      'school-record-row';


    article.dataset
      .personName =
        certificado.nome;


    article.dataset
      .ano =
        certificado.ano;


    article.dataset
      .formacao =
        certificado
          .formacaoId;


    article.dataset
      .situacao =
        certificado
          .situacaoId;


    const type =
      document.createElement(
        'span'
      );


    type.className =
      'school-type';


    type.textContent =
      'Servidor';


    const title =
      document.createElement(
        'h3'
      );


    title.textContent =
      certificado.nome;


    const details =
      document.createElement(
        'dl'
      );


    details.className =
      'school-detail-list';


    adicionarDetalhe(
      details,
      'Formação',
      certificado
        .formacaoNome
    );


    adicionarDetalhe(
      details,
      'Unidade vinculada',
      certificado
        .unidadeNome
    );


    adicionarDetalhe(
      details,
      'Carga horária',
      certificado
        .cargaHoraria
    );


    adicionarDetalhe(
      details,
      'Ano / situação',
      `${
        certificado.ano
      } - ${
        certificado.situacao
      }`
    );


    const actions =
      document.createElement(
        'div'
      );


    actions.className =
      'school-table-actions';


    const viewButton =
      document.createElement(
        'button'
      );


    viewButton.className =
      'server-button server-button--primary';


    viewButton.type =
      'button';


    viewButton.textContent =
      'Visualizar';


    viewButton.dataset
      .certificateView =
        certificado
          .visualizacaoUrl;


    viewButton.disabled =
      !certificado
        .visualizacaoUrl;


    const downloadButton =
      document.createElement(
        'button'
      );


    downloadButton.className =
      'server-button server-button--ghost';


    downloadButton.type =
      'button';


    downloadButton.textContent =
      'Baixar PDF';


    downloadButton.dataset
      .certificateDownload =
        certificado
          .downloadUrl;


    downloadButton.disabled =
      !certificado
        .downloadUrl;


    const sendButton =
      document.createElement(
        'button'
      );


    sendButton.className =
      'server-button server-button--ghost';


    sendButton.type =
      'button';


    sendButton.textContent =
      'Enviar ao servidor';


    sendButton.dataset
      .certificateSend =
        certificado.id;


    sendButton.disabled =
      !certificado.id ||
      certificado
        .situacaoId !==
        'ativo';


    const repairButton =
      document.createElement(
        'button'
      );


    repairButton.className =
      'server-button server-button--ghost';


    repairButton.type =
      'button';


    repairButton.textContent =
      'Solicitar reparo';


    repairButton.dataset
      .certificateRepair =
        certificado.id;


    repairButton.disabled =
      !certificado.id ||
      certificado
        .situacaoId !==
        'ativo';


    if (
      certificado
        .situacaoId !==
      'ativo'
    ) {

      const unavailableAction =
        'Esta ação está disponível somente para certificados ativos.';


      sendButton.title =
        unavailableAction;


      repairButton.title =
        unavailableAction;
    }


    if (
      !certificado
        .visualizacaoUrl ||
      !certificado
        .downloadUrl
    ) {

      const unavailable =
        'O PDF ainda não foi disponibilizado pelo registro oficial.';


      if (
        !certificado
          .visualizacaoUrl
      ) {
        viewButton.title =
          unavailable;
      }


      if (
        !certificado
          .downloadUrl
      ) {
        downloadButton.title =
          unavailable;
      }
    }


    actions.append(
      viewButton,
      downloadButton,
      sendButton,
      repairButton
    );


    article.append(
      type,
      title,
      details,
      actions
    );


    return article;
  };


  const renderizarCertificados = (
    container,
    certificados
  ) => {

    if (
      !container
    ) {
      return;
    }


    certificados.forEach(
      certificado => {

        if (
          certificado.id
        ) {

          certificadosPorId
            .set(
              certificado.id,
              certificado
            );
        }
      }
    );


    container.replaceChildren(
      ...certificados.map(
        criarLinhaCertificado
      )
    );
  };


  const mostrarVazioExistente = (
    title,
    detail,
    visible = true
  ) => {

    if (
      !existingEmpty
    ) {
      return;
    }


    existingEmpty.hidden =
      !visible;


    const strong =
      existingEmpty
        .querySelector(
          'strong'
        );


    const span =
      existingEmpty
        .querySelector(
          'span'
        );


    if (
      strong
    ) {
      strong.textContent =
        title;
    }


    if (
      span
    ) {
      span.textContent =
        detail;
    }
  };


  const mostrarVazioPesquisa = (
    title,
    detail,
    visible = true
  ) => {

    if (
      !searchEmpty
    ) {
      return;
    }


    searchEmpty.hidden =
      !visible;


    const strong =
      searchEmpty
        .querySelector(
          'strong'
        );


    const span =
      searchEmpty
        .querySelector(
          'span'
        );


    if (
      strong
    ) {
      strong.textContent =
        title;
    }


    if (
      span
    ) {
      span.textContent =
        detail;
    }
  };


  const atualizarEstadoVazio = (
    element,
    title,
    detail,
    visible = true
  ) => {

    if (
      !element
    ) {
      return;
    }


    element.hidden =
      !visible;


    const strong =
      element.querySelector(
        'strong'
      );


    const span =
      element.querySelector(
        'span'
      );


    if (
      strong
    ) {
      strong.textContent =
        title;
    }


    if (
      span
    ) {
      span.textContent =
        detail;
    }
  };


  const atualizarContagemNomeada = (
    selector,
    total,
    singular,
    plural
  ) => {

    const element =
      document.querySelector(
        selector
      );


    if (
      element
    ) {

      element.textContent =
        `${total} ${
          total === 1
            ? singular
            : plural
        }`;
    }
  };


  /* =====================================================
   * HISTÓRICOS
   * ===================================================== */


  const formatarStatusAcao = (
    valor
  ) => {

    const status =
      chaveCanonica(
        valor
      );


    if (
      status ===
      'enviado'
    ) {
      return 'Enviado';
    }


    if (
      status ===
      'erro'
    ) {
      return 'Falha no envio';
    }


    if (
      status ===
      'recebida'
    ) {
      return 'Recebida';
    }


    if (
      status ===
      'emanalise'
    ) {
      return 'Em análise';
    }


    if (
      status ===
        'corrigida' ||
      status ===
        'concluida' ||
      status ===
        'concluido'
    ) {
      return 'Corrigida';
    }


    if (
      status ===
        'naoprocede' ||
      status ===
        'recusada' ||
      status ===
        'indeferida'
    ) {
      return 'Não procede';
    }


    return String(
      valor ||
      'Registrado'
    ).replace(
      /_/g,
      ' '
    );
  };


  const normalizarEnvio = (
    registro = {}
  ) => ({

    id:
      String(
        primeiroValor(
          registro,
          'idEnvio',
          'id'
        ) || ''
      ).trim(),


    dataHora:
      String(
        primeiroValor(
          registro,
          'dataHora',
          'data',
          'enviadoEm'
        ) || ''
      ).trim(),


    idCertificado:
      String(
        primeiroValor(
          registro,
          'idCertificado',
          'certificadoId'
        ) || ''
      ).trim(),


    nome:
      String(
        primeiroValor(
          registro,
          'nomeCompleto',
          'nomeServidor',
          'nome'
        ) ||
        'Servidor não informado'
      ).trim(),


    formacao:
      String(
        primeiroValor(
          registro,
          'formacao',
          'nomeFormacao'
        ) ||
        'Formação não informada'
      ).trim(),


    escola:
      String(
        primeiroValor(
          registro,
          'escola',
          'unidade'
        ) ||
        'Unidade não informada'
      ).trim(),


    email:
      String(
        primeiroValor(
          registro,
          'emailDestinoMascarado',
          'emailMascarado'
        ) || ''
      ).trim(),


    status:
      formatarStatusAcao(
        primeiroValor(
          registro,
          'status'
        )
      ),


    formaEnvio:
      String(
        primeiroValor(
          registro,
          'formaEnvio'
        ) || ''
      )
        .replace(
          /_/g,
          ' '
        )
        .toLocaleLowerCase(
          'pt-BR'
        )
  });


  const normalizarSolicitacao = (
    registro = {}
  ) => ({

    id:
      String(
        primeiroValor(
          registro,
          'idSolicitacao',
          'protocolo',
          'id'
        ) || ''
      ).trim(),


    dataHora:
      String(
        primeiroValor(
          registro,
          'dataHora',
          'data',
          'criadoEm'
        ) || ''
      ).trim(),


    idCertificado:
      String(
        primeiroValor(
          registro,
          'idCertificado',
          'certificadoId'
        ) || ''
      ).trim(),


    nome:
      String(
        primeiroValor(
          registro,
          'nomeCompleto',
          'nomeServidor',
          'nome'
        ) ||
        'Servidor não informado'
      ).trim(),


    formacao:
      String(
        primeiroValor(
          registro,
          'formacao',
          'nomeFormacao'
        ) ||
        'Formação não informada'
      ).trim(),


    escola:
      String(
        primeiroValor(
          registro,
          'escola',
          'unidade'
        ) ||
        'Unidade não informada'
      ).trim(),


    idUnidadeSolicitante:
      String(
        primeiroValor(
          registro,
          'idUnidadeSolicitante',
          'idEscolaSolicitante'
        ) || ''
      ).trim(),


    unidadeSolicitante:
      String(
        primeiroValor(
          registro,
          'unidadeSolicitante',
          'escolaSolicitante'
        ) || ''
      ).trim(),


    categoria:
      String(
        primeiroValor(
          registro,
          'categoria'
        ) ||
        'Outro'
      ).trim(),


    descricao:
      String(
        primeiroValor(
          registro,
          'descricao'
        ) || ''
      ).trim(),


    statusOriginal:
      String(
        primeiroValor(
          registro,
          'status'
        ) ||
        'RECEBIDA'
      ).trim(),


    status:
      formatarStatusAcao(
        primeiroValor(
          registro,
          'status'
        ) ||
        'RECEBIDA'
      ),


    resposta:
      String(
        primeiroValor(
          registro,
          'resposta',
          'respostaSemec'
        ) || ''
      ).trim(),


    dataAtualizacao:
      String(
        primeiroValor(
          registro,
          'dataAtualizacao',
          'atualizadoEm'
        ) || ''
      ).trim(),


    dataResolucao:
      String(
        primeiroValor(
          registro,
          'dataResolucao',
          'resolvidoEm'
        ) || ''
      ).trim(),


    atualizadoPor:
      String(
        primeiroValor(
          registro,
          'atualizadoPor'
        ) || ''
      ).trim(),


    resolvidoPor:
      String(
        primeiroValor(
          registro,
          'resolvidoPor'
        ) || ''
      ).trim()
  });


  const criarLinhaHistorico = (
    envio
  ) => {

    const article =
      document.createElement(
        'article'
      );


    article.className =
      'school-record-row';


    article.dataset
      .sendStatus =
        chaveCanonica(
          envio.status
        );


    const type =
      document.createElement(
        'span'
      );


    type.className =
      'school-type';


    type.textContent =
      envio.status;


    const title =
      document.createElement(
        'h3'
      );


    title.textContent =
      envio.nome;


    const details =
      document.createElement(
        'dl'
      );


    details.className =
      'school-detail-list';


    adicionarDetalhe(
      details,
      'Formação',
      envio.formacao
    );


    adicionarDetalhe(
      details,
      'Destinatário',
      envio.email ||
      'E-mail protegido'
    );


    adicionarDetalhe(
      details,
      'Data do envio',
      envio.dataHora ||
      'Não informada'
    );


    adicionarDetalhe(
      details,
      'Protocolo',
      envio.id ||
      'Não informado'
    );


    article.append(
      type,
      title,
      details
    );


    return article;
  };


  const criarLinhaSolicitacao = (
    solicitacao,
    {
      administrativo = false
    } = {}
  ) => {

    const article =
      document.createElement(
        'article'
      );


    article.className =
      'school-record-row';


    article.dataset
      .repairStatus =
        chaveCanonica(
          solicitacao
            .statusOriginal
        );


    const type =
      document.createElement(
        'span'
      );


    type.className =
      'school-type';


    type.textContent =
      solicitacao.status;


    const title =
      document.createElement(
        'h3'
      );


    title.textContent =
      solicitacao.nome;


    const details =
      document.createElement(
        'dl'
      );


    details.className =
      'school-detail-list';


    if (
      administrativo &&
      solicitacao.unidadeSolicitante
    ) {

      adicionarDetalhe(
        details,
        'Unidade solicitante',
        solicitacao
          .unidadeSolicitante
      );
    }


    if (
      administrativo
    ) {

      adicionarDetalhe(
        details,
        'Formação',
        solicitacao
          .formacao
      );


      if (
        solicitacao.escola
      ) {

        adicionarDetalhe(
          details,
          'Unidade do certificado',
          solicitacao
            .escola
        );
      }
    }


    adicionarDetalhe(
      details,
      'Categoria',
      solicitacao
        .categoria
    );


    adicionarDetalhe(
      details,
      'Descrição',
      solicitacao
        .descricao ||
      'Não informada'
    );


    adicionarDetalhe(
      details,
      'Data da solicitação',
      solicitacao
        .dataHora ||
      'Não informada'
    );


    adicionarDetalhe(
      details,
      'Protocolo',
      solicitacao.id ||
      'Não informado'
    );


    if (
      solicitacao.dataAtualizacao &&
      solicitacao.dataAtualizacao !==
        solicitacao.dataHora
    ) {

      adicionarDetalhe(
        details,
        'Última atualização',
        solicitacao
          .dataAtualizacao
      );
    }


    if (
      solicitacao.dataResolucao
    ) {

      adicionarDetalhe(
        details,
        'Resolvida em',
        solicitacao
          .dataResolucao
      );
    }


    if (
      solicitacao.resposta
    ) {

      adicionarDetalhe(
        details,
        'Resposta da SEMEC',
        solicitacao.resposta
      );
    }


    article.append(
      type,
      title,
      details
    );


    const perfilSemec =
      String(
        document.body
          .dataset
          .perfilAcesso ||
        ''
      )
        .toLocaleUpperCase(
          'pt-BR'
        ) ===
      'SEMEC';


    if (
      administrativo &&
      perfilSemec
    ) {

      const status =
        chaveCanonica(
          solicitacao
            .statusOriginal
        );


      const actions =
        document.createElement(
          'div'
        );


      actions.className =
        'school-table-actions';


      if (
        status ===
        'recebida'
      ) {

        const analisarButton =
          document.createElement(
            'button'
          );


        analisarButton.type =
          'button';


        analisarButton.className =
          'server-button server-button--primary';


        analisarButton.textContent =
          'Iniciar análise';


        analisarButton.dataset
          .repairAdminAction =
            'EM_ANALISE';


        analisarButton.dataset
          .repairAdminId =
            solicitacao.id;


        actions.appendChild(
          analisarButton
        );
      }


      if (
        status ===
        'emanalise'
      ) {

        const corrigidaButton =
          document.createElement(
            'button'
          );


        corrigidaButton.type =
          'button';


        corrigidaButton.className =
          'server-button server-button--primary';


        corrigidaButton.textContent =
          'Marcar como corrigida';


        corrigidaButton.dataset
          .repairAdminAction =
            'CORRIGIDA';


        corrigidaButton.dataset
          .repairAdminId =
            solicitacao.id;


        const naoProcedeButton =
          document.createElement(
            'button'
          );


        naoProcedeButton.type =
          'button';


        naoProcedeButton.className =
          'server-button server-button--ghost';


        naoProcedeButton.textContent =
          'Não procede';


        naoProcedeButton.dataset
          .repairAdminAction =
            'NAO_PROCEDE';


        naoProcedeButton.dataset
          .repairAdminId =
            solicitacao.id;


        actions.append(
          corrigidaButton,
          naoProcedeButton
        );
      }


      if (
        actions.childElementCount >
        0
      ) {

        article.appendChild(
          actions
        );
      }
    }


    return article;
  };


  const renderizarHistorico = (
    envios
  ) => {

    if (
      !sendHistoryList
    ) {
      return;
    }


    sendHistoryList
      .replaceChildren(
        ...envios.map(
          criarLinhaHistorico
        )
      );
  };


  const renderizarSolicitacoes = (
    solicitacoes
  ) => {

    const linhasPagina =
      solicitacoes.map(
        item =>
          criarLinhaSolicitacao(
            item,
            {
              administrativo:
                true
            }
          )
      );


    const linhasResumo =
      solicitacoes.map(
        item =>
          criarLinhaSolicitacao(
            item,
            {
              administrativo:
                false
            }
          )
      );


    repairPageList
      ?.replaceChildren(
        ...linhasPagina
      );


    repairList
      ?.replaceChildren(
        ...linhasResumo
      );
  };


  const updateSummaryCards =
    () => {

      const activeRows =
        certificadosAtuais
          .filter(
            certificado =>
              certificado
                .situacaoId ===
              'ativo'
          );


      const uniquePeople =
        new Set(

          activeRows
            .map(
              certificado =>
                certificado
                  .nome
                  .toLocaleLowerCase(
                    'pt-BR'
                  )
            )
            .filter(
              Boolean
            )
        );


      const yearSelect =
        filterForm
          ?.querySelector(
            '[name="ano"]'
          );


      const year =
        yearSelect?.value ||
        '2026';


      const activeEl =
        document.querySelector(
          '[data-summary-active]'
        );


      const peopleEl =
        document.querySelector(
          '[data-summary-people]'
        );


      const yearEl =
        document.querySelector(
          '[data-summary-year]'
        );


      const repairsEl =
        document.querySelector(
          '[data-summary-repairs]'
        );


      if (
        activeEl
      ) {
        activeEl.textContent =
          String(
            activeRows.length
          );
      }


      if (
        peopleEl
      ) {
        peopleEl.textContent =
          String(
            uniquePeople.size
          );
      }


      if (
        yearEl
      ) {
        yearEl.textContent =
          year;
      }


      if (
        repairsEl
      ) {

        repairsEl.textContent =
          String(

            solicitacoesAtuais
              .filter(
                item => {

                  const status =
                    chaveCanonica(
                      item
                        .statusOriginal
                    );


                  return (
                    status ===
                      'recebida' ||
                    status ===
                      'emanalise'
                  );
                }
              )
              .length
          );
      }
    };


  const submitFilters =
    () => {

      if (
        !filterForm
      ) {
        return;
      }


      filterForm
        .requestSubmit
        ? filterForm
            .requestSubmit()

        : filterForm
            .dispatchEvent(
              new Event(
                'submit',
                {
                  bubbles:
                    true,

                  cancelable:
                    true
                }
              )
            );
    };


  const scrollToResults =
    () => {

      resultSection
        ?.scrollIntoView({
          behavior:
            'smooth',

          block:
            'start'
        });
    };


  const filtrarCertificados = (
    certificados,
    {
      ano = '',
      formacao = '',
      situacao = ''
    } = {}
  ) =>
    certificados.filter(
      certificado => {

        const matchAno =
          !ano ||
          certificado.ano ===
          ano;


        const matchFormacao =
          !formacao ||
          certificado
            .formacaoId ===
          formacao;


        const matchSituacao =
          !situacao ||
          certificado
            .situacaoId ===
          chaveCanonica(
            situacao
          );


        return (
          matchAno &&
          matchFormacao &&
          matchSituacao
        );
      }
    );


  /* =====================================================
   * CARREGAMENTO DE CERTIFICADOS
   * ===================================================== */


  const carregarCertificados =
    async () => {

      if (
        !filterForm ||
        !backend
      ) {
        return;
      }


      const ano =
        String(
          filterForm
            .elements
            .ano
            ?.value ||
          '2026'
        );


      definirFormularioOcupado(
        true
      );


      renderizarCertificados(
        existingResultList,
        []
      );


      mostrarVazioExistente(
        'Carregando certificados',
        'Consultando o registro oficial da Central.'
      );


      atualizarContagem(
        '[data-existing-count]',
        0
      );


      try {

        const result =
          extrairResultado(

            await backend.request(
              'LISTAR_CERTIFICADOS',
              {
                ano:
                  ano
              }
            )
          );


        if (
          result.unidade
        ) {

          aplicarIdentidadeUnidade(
            result.unidade
          );
        }


        certificadosAtuais =
          extrairCertificados(
            result
          );


        renderizarCertificados(
          existingResultList,
          certificadosAtuais
        );


        mostrarVazioExistente(
          'Nenhum certificado disponível',
          'A unidade ainda não possui certificados registrados para o ano selecionado.',
          certificadosAtuais
            .length === 0
        );


        atualizarContagem(
          '[data-existing-count]',
          certificadosAtuais
            .length
        );


        updateSummaryCards();


        definirStatus(
          'ready',
          'Central conectada',

          certificadosAtuais
            .length === 0

            ? 'Unidade identificada. Nenhum certificado oficial foi registrado para 2026.'

            : 'Unidade identificada e certificados atualizados pelo registro oficial.'
        );

      } finally {

        definirFormularioOcupado(
          false
        );
      }
    };


  /* =====================================================
   * HISTÓRICO DE ENVIOS
   * ===================================================== */


  const carregarHistoricoEnvios =
    async () => {

      if (
        !sendHistoryList ||
        !backend
      ) {
        return;
      }


      definirStatus(
        'loading',
        'Carregando histórico',
        'Consultando os envios registrados pela unidade.'
      );


      renderizarHistorico(
        []
      );


      atualizarEstadoVazio(
        sendHistoryEmpty,
        'Carregando histórico',
        'Consultando o registro oficial da Central.'
      );


      atualizarContagemNomeada(
        '[data-send-history-count]',
        0,
        'envio',
        'envios'
      );


      const result =
        extrairResultado(

          await backend.request(
            'LISTAR_HISTORICO_ENVIOS',
            {
              limite:
                200
            }
          )
        );


      if (
        result.unidade
      ) {

        aplicarIdentidadeUnidade(
          result.unidade
        );
      }


      const registros =
        Array.isArray(
          result.envios
        )

          ? result.envios.map(
              normalizarEnvio
            )

          : [];


      renderizarHistorico(
        registros
      );


      atualizarContagemNomeada(
        '[data-send-history-count]',
        registros.length,
        'envio',
        'envios'
      );


      atualizarEstadoVazio(
        sendHistoryEmpty,
        'Nenhum envio registrado',
        'Quando um certificado for enviado ao servidor, o registro aparecerá aqui.',
        registros.length ===
          0
      );


      definirStatus(
        'ready',
        'Histórico atualizado',

        `${
          registros.length
        } envio${
          registros.length === 1
            ? ''
            : 's'
        } localizado${
          registros.length === 1
            ? ''
            : 's'
        }.`
      );
    };


  /* =====================================================
   * REPAROS
   * ===================================================== */


  const carregarSolicitacoesReparo =
    async ({
      silencioso = false
    } = {}) => {

      if (
        (
          !repairPageList &&
          !repairList
        ) ||
        !backend
      ) {
        return;
      }


      if (
        !silencioso
      ) {

        definirStatus(
          'loading',
          'Carregando solicitações',
          'Consultando os reparos registrados pela unidade.'
        );
      }


      renderizarSolicitacoes(
        []
      );


      atualizarEstadoVazio(
        repairPageEmpty,
        'Carregando solicitações',
        'Consultando o registro oficial da Central.'
      );


      atualizarEstadoVazio(
        repairEmpty,
        'Carregando solicitações',
        'Consultando o registro oficial da Central.'
      );


      const result =
        extrairResultado(

          await backend.request(
            'LISTAR_SOLICITACOES_REPARO',
            {
              limite:
                200
            }
          )
        );


      if (
        result.unidade
      ) {

        aplicarIdentidadeUnidade(
          result.unidade
        );
      }


      solicitacoesAtuais =
        Array.isArray(
          result.solicitacoes
        )

          ? result
              .solicitacoes
              .map(
                normalizarSolicitacao
              )

          : [];


      renderizarSolicitacoes(
        solicitacoesAtuais
      );


      if (
        String(
          result.perfilAcesso ||
          document.body
            .dataset
            .perfilAcesso ||
          ''
        )
          .toLocaleUpperCase(
            'pt-BR'
          ) ===
        'SEMEC'
      ) {

        const heading =
          document.querySelector(
            '.school-page-heading--training h2'
          );


        const description =
          document.querySelector(
            '.school-page-heading--training h2 + p'
          );


        if (
          heading
        ) {

          heading.textContent =
            'Tratamento de solicitações de reparo';
        }


        if (
          description
        ) {

          description.textContent =
            'Analise as solicitações recebidas, registre a resposta da SEMEC e acompanhe a conclusão dos reparos.';
        }
      }


      atualizarContagemNomeada(
        '[data-repair-page-count]',
        solicitacoesAtuais
          .length,
        'solicitação',
        'solicitações'
      );


      atualizarContagemNomeada(
        '[data-repair-count]',
        solicitacoesAtuais
          .length,
        'solicitação',
        'solicitações'
      );


      atualizarEstadoVazio(
        repairPageEmpty,
        'Nenhuma solicitação registrada',
        'As solicitações enviadas pela unidade aparecerão aqui para acompanhamento.',
        solicitacoesAtuais
          .length === 0
      );


      atualizarEstadoVazio(
        repairEmpty,
        'Nenhum reparo em análise',
        'As solicitações enviadas pela unidade aparecerão aqui para acompanhamento.',
        solicitacoesAtuais
          .length === 0
      );


      updateSummaryCards();


      if (
        !silencioso
      ) {

        definirStatus(
          'ready',
          'Solicitações atualizadas',

          `${
            solicitacoesAtuais
              .length
          } solicitaç${
            solicitacoesAtuais
              .length === 1
              ? 'ão localizada'
              : 'ões localizadas'
          }.`
        );
      }
    };


  /* =====================================================
   * INICIALIZAÇÃO DO BACKEND
   * ===================================================== */


  const iniciarBackend =
    async () => {

      if (
        !backend
      ) {

        definirStatus(
          'error',
          'Integração indisponível',
          'Os arquivos da ponte não foram carregados.',
          {
            retry:
              true
          }
        );


        return;
      }


      definirFormularioOcupado(
        true
      );


      definirStatus(
        'loading',
        'Conectando à Central',
        'Validando a conta institucional e identificando a unidade.'
      );


      try {

        const connection =
          await backend
            .connect();


        const identityResult =
          extrairResultado(

            await backend.request(
              'IDENTIFICAR_UNIDADE'
            )
          );


        if (
          identityResult
            .acessoInstitucionalAutorizado ===
              false ||

          !identityResult.unidade
        ) {

          const error =
            new Error(
              'A conta institucional não está autorizada para acessar a Central.'
            );


          error.code =
            'ACESSO_NAO_AUTORIZADO';


          throw error;
        }


        aplicarIdentidadeUnidade(
          identityResult
            .unidade
        );


        if (
          filterForm
        ) {

          definirStatus(
            'loading',
            'Unidade identificada',

            `Carregando certificados${
              connection.version
                ? ` pela ponte ${connection.version}`
                : ''
            }.`
          );


          await carregarCertificados();


          try {

            await carregarSolicitacoesReparo({
              silencioso:
                true
            });

          } catch (_) {

            solicitacoesAtuais =
              [];


            renderizarSolicitacoes(
              []
            );


            updateSummaryCards();
          }


          return;
        }


        if (
          sendHistoryList
        ) {

          await carregarHistoricoEnvios();

          return;
        }


        if (
          repairPageList
        ) {

          await carregarSolicitacoesReparo();

          return;
        }


        definirStatus(
          'ready',
          'Central conectada',
          'Conta institucional e unidade identificadas.'
        );

      } catch (
        error
      ) {

        certificadosAtuais =
          [];


        renderizarCertificados(
          existingResultList,
          []
        );


        mostrarVazioExistente(
          'Não foi possível carregar os certificados',

          error.message ||
          'Tente novamente em instantes.'
        );


        atualizarEstadoVazio(
          sendHistoryEmpty,

          'Não foi possível carregar o histórico',

          error.message ||
          'Tente novamente em instantes.'
        );


        atualizarEstadoVazio(
          repairPageEmpty,

          'Não foi possível carregar as solicitações',

          error.message ||
          'Tente novamente em instantes.'
        );


        atualizarContagem(
          '[data-existing-count]',
          0
        );


        updateSummaryCards();


        definirStatus(
          'error',
          'Não foi possível conectar',

          error.message ||
          'Tente novamente em instantes.',

          {
            retry:
              true
          }
        );


        definirFormularioOcupado(
          true
        );
      }
    };


  /* =====================================================
   * CARDS RESUMO
   * ===================================================== */


  document
    .querySelectorAll(
      '[data-summary-action]'
    )
    .forEach(
      card => {

        card
          .addEventListener(
            'click',
            () => {

              const action =
                card.dataset
                  .summaryAction;


              if (
                !filterForm
              ) {
                return;
              }


              const busca =
                filterForm
                  .querySelector(
                    '[name="busca"]'
                  );


              const ano =
                filterForm
                  .querySelector(
                    '[name="ano"]'
                  );


              const formacao =
                filterForm
                  .querySelector(
                    '[name="formacao"]'
                  );


              const situacao =
                filterForm
                  .querySelector(
                    '[name="situacao"]'
                  );


              if (
                action ===
                'ativos'
              ) {

                if (
                  busca
                ) {
                  busca.value =
                    '';
                }


                if (
                  formacao
                ) {
                  formacao.value =
                    '';
                }


                if (
                  situacao
                ) {
                  situacao.value =
                    'ativo';
                }


                submitFilters();


                scrollToResults();


                return;
              }


              if (
                action ===
                'servidores'
              ) {

                if (
                  busca
                ) {
                  busca.value =
                    '';
                }


                if (
                  formacao
                ) {
                  formacao.value =
                    '';
                }


                if (
                  situacao
                ) {
                  situacao.value =
                    'ativo';
                }


                submitFilters();


                scrollToResults();


                return;
              }


              if (
                action ===
                'ano'
              ) {

                filterForm
                  .scrollIntoView({
                    behavior:
                      'smooth',

                    block:
                      'center'
                  });


                setTimeout(
                  () =>
                    ano?.focus(),
                  350
                );


                return;
              }


              if (
                action ===
                'reparos'
              ) {

                if (
                  repairSection
                ) {

                  repairSection.hidden =
                    false;


                  repairSection
                    .scrollIntoView({
                      behavior:
                        'smooth',

                      block:
                        'start'
                    });
                }
              }
            }
          );
      }
    );


  /* =====================================================
   * PESQUISA
   * ===================================================== */


  filterForm
    ?.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const formData =
          new FormData(
            event.currentTarget
          );


        const query =
          String(
            formData.get(
              'busca'
            ) || ''
          ).trim();


        const ano =
          String(
            formData.get(
              'ano'
            ) || ''
          ).trim();


        const formacao =
          String(
            formData.get(
              'formacao'
            ) || ''
          ).trim();


        const situacao =
          String(
            formData.get(
              'situacao'
            ) || ''
          ).trim();


        if (
          searchResultSection
        ) {

          searchResultSection.hidden =
            false;


          searchResultSection
            .scrollIntoView({
              behavior:
                'smooth',

              block:
                'start'
            });
        }


        if (
          query &&
          query.length < 3
        ) {

          renderizarCertificados(
            searchResultList,
            []
          );


          atualizarContagem(
            '[data-search-result-count]',
            0
          );


          mostrarVazioPesquisa(
            'Informe pelo menos 3 caracteres',

            'Digite um trecho maior do nome do servidor para pesquisar.'
          );


          return;
        }


        definirFormularioOcupado(
          true
        );


        renderizarCertificados(
          searchResultList,
          []
        );


        mostrarVazioPesquisa(
          'Pesquisando certificados',

          'Consultando o registro oficial da Central.'
        );


        try {

          let matches;


          if (
            query
          ) {

            const result =
              extrairResultado(

                await backend.request(
                  'BUSCAR_CERTIFICADOS',
                  {
                    busca:
                      query,

                    ano:
                      ano,

                    formacao:
                      formacao,

                    situacao:
                      situacao
                  }
                )
              );


            if (
              result.unidade
            ) {

              aplicarIdentidadeUnidade(
                result.unidade
              );
            }


            matches =
              filtrarCertificados(

                extrairCertificados(
                  result
                ),

                {
                  ano:
                    ano,

                  formacao:
                    formacao,

                  situacao:
                    situacao
                }
              );

          } else {

            matches =
              filtrarCertificados(

                certificadosAtuais,

                {
                  ano:
                    ano,

                  formacao:
                    formacao,

                  situacao:
                    situacao
                }
              );
          }


          renderizarCertificados(
            searchResultList,
            matches
          );


          atualizarContagem(
            '[data-search-result-count]',
            matches.length
          );


          mostrarVazioPesquisa(
            'Nenhum certificado encontrado',

            'Revise o nome pesquisado ou altere os filtros.',

            matches.length ===
              0
          );

        } catch (
          error
        ) {

          renderizarCertificados(
            searchResultList,
            []
          );


          atualizarContagem(
            '[data-search-result-count]',
            0
          );


          mostrarVazioPesquisa(
            'Não foi possível concluir a pesquisa',

            error.message ||
            'Tente novamente em instantes.'
          );

        } finally {

          definirFormularioOcupado(
            false
          );
        }
      }
    );


  document
    .querySelector(
      '[data-clear-filters]'
    )
    ?.addEventListener(
      'click',
      () => {

        filterForm
          ?.reset();


        searchResultList
          ?.replaceChildren();


        if (
          searchEmpty
        ) {
          searchEmpty.hidden =
            true;
        }


        if (
          searchResultSection
        ) {
          searchResultSection.hidden =
            true;
        }


        updateSummaryCards();
      }
    );


  /* =====================================================
   * AÇÕES
   * ===================================================== */


  const mostrarErroAcao = (
    form,
    message
  ) => {

    const error =
      form
        ?.querySelector(
          '[data-action-error]'
        );


    if (
      !error
    ) {
      return;
    }


    error.textContent =
      message;


    error.hidden =
      false;
  };


  const definirAcaoOcupada = (
    form,
    submit,
    busy,
    busyLabel,
    idleLabel
  ) => {

    form
      ?.querySelectorAll(
        'input, select, textarea, button'
      )
      .forEach(
        control => {

          control.disabled =
            busy;
        }
      );


    if (
      submit
    ) {

      submit.disabled =
        busy;


      submit.textContent =
        busy
          ? busyLabel
          : idleLabel;
    }


    dialogActions
      ?.querySelectorAll(
        'button'
      )
      .forEach(
        button => {

          button.disabled =
            busy;
        }
      );
  };


  /* =====================================================
   * ENVIO POR E-MAIL
   * ===================================================== */


  const abrirDialogoEnvio = (
    certificado
  ) => {

    openDialog({

      kicker:
        'Enviar certificado',

      title:
        certificado.nome,

      html:
        '<form class="school-dialog-form" data-send-certificate-form>' +
          '<p>Informe o e-mail confirmado pelo servidor. O envio e a conta solicitante ficarão registrados no histórico.</p>' +
          '<label>' +
            '<span>E-mail do servidor</span>' +
            '<input type="email" name="emailDestino" autocomplete="email" placeholder="nome@exemplo.com" required maxlength="254">' +
          '</label>' +
          '<label class="school-check-line">' +
            '<input type="checkbox" name="confirmacao" required> Conferi o endereço e confirmo que ele pertence ao destinatário correto.' +
          '</label>' +
          '<label class="school-check-line">' +
            '<input type="checkbox" name="salvarContato"> Salvar este e-mail para facilitar futuros envios ao mesmo servidor.' +
          '</label>' +
          '<p class="central-action-message" role="alert" data-action-error hidden></p>' +
        '</form>',

      actions:
        '<button class="server-button server-button--ghost" type="button" data-modal-close>Cancelar</button>' +
        '<button class="server-button server-button--primary" type="button" data-submit-certificate-send>Confirmar envio</button>'
    });


    const form =
      dialogBody
        ?.querySelector(
          '[data-send-certificate-form]'
        );


    const submit =
      dialogActions
        ?.querySelector(
          '[data-submit-certificate-send]'
        );


    form
      ?.querySelector(
        '[name="emailDestino"]'
      )
      ?.focus();


    submit
      ?.addEventListener(
        'click',
        async () => {

          if (
            !form
              ?.reportValidity()
          ) {
            return;
          }


          const error =
            form.querySelector(
              '[data-action-error]'
            );


          if (
            error
          ) {
            error.hidden =
              true;
          }


          const data =
            new FormData(
              form
            );


          definirAcaoOcupada(
            form,
            submit,
            true,
            'Enviando...',
            'Confirmar envio'
          );


          try {

            const result =
              extrairResultado(

                await backend.request(
                  'ENVIAR_CERTIFICADO',
                  {
                    idCertificado:
                      certificado.id,

                    emailDestino:
                      String(
                        data.get(
                          'emailDestino'
                        ) || ''
                      ).trim(),

                    confirmado:
                      data.get(
                        'confirmacao'
                      ) === 'on',

                    salvarContato:
                      data.get(
                        'salvarContato'
                      ) === 'on'
                  }
                )
              );


            openDialog({

              kicker:
                'Envio registrado',

              title:
                'Certificado enviado',

              html:
                '<p data-action-result-message></p>' +
                '<p><strong>Protocolo:</strong> <span data-action-result-protocol></span></p>',

              actions:
                '<button class="server-button server-button--primary" type="button" data-modal-close>Concluir</button>'
            });


            const message =
              dialogBody
                ?.querySelector(
                  '[data-action-result-message]'
                );


            const protocol =
              dialogBody
                ?.querySelector(
                  '[data-action-result-protocol]'
                );


            if (
              message
            ) {

              message.textContent =
                `Envio confirmado para ${
                  result
                    .emailDestinoMascarado ||
                  'o e-mail informado'
                }.`;
            }


            if (
              protocol
            ) {

              protocol.textContent =
                result.idEnvio ||
                'Registrado';
            }

          } catch (
            error
          ) {

            mostrarErroAcao(
              form,
              error.message ||
              'Não foi possível enviar o certificado.'
            );


            definirAcaoOcupada(
              form,
              submit,
              false,
              'Enviando...',
              'Confirmar envio'
            );
          }
        }
      );
  };


  /* =====================================================
   * REPARO
   * ===================================================== */


  const abrirDialogoReparo = (
    certificado
  ) => {

    openDialog({

      kicker:
        'Solicitar reparo',

      title:
        certificado.nome,

      html:
        '<form class="school-dialog-form" data-repair-form>' +
          '<p>Descreva a informação que precisa ser conferida ou corrigida pela SEMEC.</p>' +
          '<label>' +
            '<span>Informação a corrigir</span>' +
            '<select name="categoria" required>' +
              '<option value="Nome do servidor">Nome do servidor</option>' +
              '<option value="CPF">CPF</option>' +
              '<option value="Escola / unidade">Escola / unidade</option>' +
              '<option value="Carga horária">Carga horária</option>' +
              '<option value="Percentual / presença">Percentual / presença</option>' +
              '<option value="Formação / histórico dos encontros">Formação / histórico dos encontros</option>' +
              '<option value="Assinatura">Assinatura</option>' +
              '<option value="Outro">Outro</option>' +
            '</select>' +
          '</label>' +
          '<label>' +
            '<span>Descreva o problema</span>' +
            '<textarea name="descricao" required minlength="10" maxlength="1500" placeholder="Informe o que precisa ser corrigido"></textarea>' +
          '</label>' +
          '<p class="central-action-message" role="alert" data-action-error hidden></p>' +
        '</form>',

      actions:
        '<button class="server-button server-button--ghost" type="button" data-modal-close>Cancelar</button>' +
        '<button class="server-button server-button--primary" type="button" data-submit-repair>Enviar solicitação</button>'
    });


    const form =
      dialogBody
        ?.querySelector(
          '[data-repair-form]'
        );


    const submit =
      dialogActions
        ?.querySelector(
          '[data-submit-repair]'
        );


    submit
      ?.addEventListener(
        'click',
        async () => {

          if (
            !form
              ?.reportValidity()
          ) {
            return;
          }


          const error =
            form.querySelector(
              '[data-action-error]'
            );


          if (
            error
          ) {
            error.hidden =
              true;
          }


          const data =
            new FormData(
              form
            );


          definirAcaoOcupada(
            form,
            submit,
            true,
            'Registrando...',
            'Enviar solicitação'
          );


          try {

            const result =
              extrairResultado(

                await backend.request(
                  'SOLICITAR_REPARO',
                  {
                    idCertificado:
                      certificado.id,

                    categoria:
                      String(
                        data.get(
                          'categoria'
                        ) || ''
                      ).trim(),

                    descricao:
                      String(
                        data.get(
                          'descricao'
                        ) || ''
                      ).trim()
                  }
                )
              );


            try {

              await carregarSolicitacoesReparo({
                silencioso:
                  true
              });

            } catch (_) {

              /*
               * O registro foi confirmado.
               * Falha na atualização visual
               * não desfaz a solicitação.
               */
            }


            openDialog({

              kicker:
                'Solicitação registrada',

              title:
                'Reparo enviado para análise',

              html:
                '<p>A SEMEC recebeu a solicitação e ela já pode ser acompanhada na página de reparos.</p>' +
                '<p><strong>Protocolo:</strong> <span data-action-result-protocol></span></p>',

              actions:
                '<button class="server-button server-button--primary" type="button" data-modal-close>Concluir</button>'
            });


            const protocol =
              dialogBody
                ?.querySelector(
                  '[data-action-result-protocol]'
                );


            if (
              protocol
            ) {

              protocol.textContent =
                result.idSolicitacao ||
                'Registrado';
            }

          } catch (
            error
          ) {

            mostrarErroAcao(
              form,
              error.message ||
              'Não foi possível registrar a solicitação.'
            );


            definirAcaoOcupada(
              form,
              submit,
              false,
              'Registrando...',
              'Enviar solicitação'
            );
          }
        }
      );
  };


  /* =====================================================
   * TRATAMENTO DE REPAROS PELA SEMEC
   * ===================================================== */


  const escaparHtmlFrontend = (
    valor = ''
  ) =>
    String(
      valor
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#39;'
      );


  const atualizarReparoParaAnalise =
    async (
      solicitacao,
      button
    ) => {

      if (
        !solicitacao?.id ||
        !backend
      ) {
        return;
      }


      const textoOriginal =
        button?.textContent ||
        'Iniciar análise';


      if (
        button
      ) {

        button.disabled =
          true;


        button.textContent =
          'Iniciando...';
      }


      try {

        const result =
          extrairResultado(

            await backend.request(
              'ATUALIZAR_SOLICITACAO_REPARO',
              {
                idSolicitacao:
                  solicitacao.id,

                status:
                  'EM_ANALISE'
              }
            )
          );


        await carregarSolicitacoesReparo({
          silencioso:
            true
        });


        definirStatus(
          'ready',
          'Solicitação em análise',
          'O protocolo ' +
            solicitacao.id +
            ' foi colocado em análise pela SEMEC.'
        );


        return result;

      } catch (
        error
      ) {

        if (
          button
        ) {

          button.disabled =
            false;


          button.textContent =
            textoOriginal;
        }


        openDialog({

          kicker:
            'Tratamento de reparo',

          title:
            'Não foi possível iniciar a análise',

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
            'Não foi possível atualizar a solicitação.';
        }
      }
    };


  const abrirDialogoConclusaoReparo = (
    solicitacao,
    novoStatus
  ) => {

    const corrigida =
      novoStatus ===
      'CORRIGIDA';


    const titulo =
      corrigida
        ? 'Concluir como corrigida'
        : 'Marcar como não procede';


    const descricao =
      corrigida
        ? 'Registre uma resposta objetiva informando o que foi corrigido. Esta resposta ficará visível para a unidade solicitante.'
        : 'Registre uma resposta objetiva explicando por que a solicitação não procede. Esta resposta ficará visível para a unidade solicitante.';


    const textoBotao =
      corrigida
        ? 'Confirmar correção'
        : 'Confirmar não procede';


    openDialog({

      kicker:
        'Tratamento de reparo',

      title:
        titulo,

      html:
        '<form class="school-dialog-form" data-repair-admin-form>' +
          '<p><strong>Servidor(a):</strong> ' +
            escaparHtmlFrontend(
              solicitacao.nome
            ) +
          '</p>' +
          '<p><strong>Protocolo:</strong> ' +
            escaparHtmlFrontend(
              solicitacao.id
            ) +
          '</p>' +
          '<p>' +
            descricao +
          '</p>' +
          '<label>' +
            '<span>Resposta da SEMEC</span>' +
            '<textarea name="resposta" required minlength="10" maxlength="1500" placeholder="Escreva a resposta que ficará disponível para a unidade"></textarea>' +
          '</label>' +
          '<p class="central-action-message" role="alert" data-action-error hidden></p>' +
        '</form>',

      actions:
        '<button class="server-button server-button--ghost" type="button" data-modal-close>Cancelar</button>' +
        '<button class="server-button server-button--primary" type="button" data-submit-repair-admin>' +
          textoBotao +
        '</button>'
    });


    const form =
      dialogBody
        ?.querySelector(
          '[data-repair-admin-form]'
        );


    const submit =
      dialogActions
        ?.querySelector(
          '[data-submit-repair-admin]'
        );


    form
      ?.querySelector(
        '[name="resposta"]'
      )
      ?.focus();


    submit
      ?.addEventListener(
        'click',
        async () => {

          if (
            !form
              ?.reportValidity()
          ) {
            return;
          }


          const error =
            form.querySelector(
              '[data-action-error]'
            );


          if (
            error
          ) {

            error.hidden =
              true;
          }


          const data =
            new FormData(
              form
            );


          const resposta =
            String(
              data.get(
                'resposta'
              ) || ''
            ).trim();


          definirAcaoOcupada(
            form,
            submit,
            true,
            'Salvando...',
            textoBotao
          );


          try {

            const result =
              extrairResultado(

                await backend.request(
                  'ATUALIZAR_SOLICITACAO_REPARO',
                  {
                    idSolicitacao:
                      solicitacao.id,

                    status:
                      novoStatus,

                    resposta:
                      resposta
                  }
                )
              );


            await carregarSolicitacoesReparo({
              silencioso:
                true
            });


            openDialog({

              kicker:
                'Tratamento concluído',

              title:
                corrigida
                  ? 'Solicitação corrigida'
                  : 'Solicitação encerrada como não procede',

              html:
                '<p>A atualização foi registrada e já está disponível para a unidade solicitante.</p>' +
                '<p><strong>Protocolo:</strong> ' +
                  escaparHtmlFrontend(
                    result.idSolicitacao ||
                    solicitacao.id
                  ) +
                '</p>',

              actions:
                '<button class="server-button server-button--primary" type="button" data-modal-close>Concluir</button>'
            });


            definirStatus(
              'ready',
              'Solicitação atualizada',
              'O protocolo ' +
                solicitacao.id +
                ' foi encerrado pela SEMEC.'
            );

          } catch (
            error
          ) {

            mostrarErroAcao(
              form,
              error.message ||
              'Não foi possível concluir a solicitação.'
            );


            definirAcaoOcupada(
              form,
              submit,
              false,
              'Salvando...',
              textoBotao
            );
          }
        }
      );
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
   * CLIQUES NAS AÇÕES DOS CERTIFICADOS
   * ===================================================== */


  document
    .addEventListener(
      'click',
      event => {

        const repairAdminButton =
          event.target.closest(
            '[data-repair-admin-action]'
          );


        if (
          repairAdminButton
        ) {

          const idSolicitacao =
            String(
              repairAdminButton
                .dataset
                .repairAdminId ||
              ''
            );


          const novoStatus =
            String(
              repairAdminButton
                .dataset
                .repairAdminAction ||
              ''
            );


          const solicitacao =
            solicitacoesAtuais
              .find(
                item =>
                  item.id ===
                  idSolicitacao
              );


          if (
            solicitacao
          ) {

            if (
              novoStatus ===
              'EM_ANALISE'
            ) {

              atualizarReparoParaAnalise(
                solicitacao,
                repairAdminButton
              );

            } else if (
              novoStatus ===
                'CORRIGIDA' ||
              novoStatus ===
                'NAO_PROCEDE'
            ) {

              abrirDialogoConclusaoReparo(
                solicitacao,
                novoStatus
              );
            }
          }


          return;
        }


        const viewButton =
          event.target.closest(
            '[data-certificate-view]'
          );


        if (
          viewButton
        ) {

          const certificado =
            Array.from(
              certificadosPorId
                .values()
            )
              .find(
                item =>
                  item
                    .visualizacaoUrl ===
                  String(
                    viewButton
                      .dataset
                      .certificateView ||
                    ''
                  )
              );


          if (
            certificado
          ) {

            abrirCertificadoComAuditoria(
              certificado,
              'VISUALIZAR'
            );
          }


          return;
        }


        const downloadButton =
          event.target.closest(
            '[data-certificate-download]'
          );


        if (
          downloadButton
        ) {

          const certificado =
            Array.from(
              certificadosPorId
                .values()
            )
              .find(
                item =>
                  item
                    .downloadUrl ===
                  String(
                    downloadButton
                      .dataset
                      .certificateDownload ||
                    ''
                  )
              );


          if (
            certificado
          ) {

            abrirCertificadoComAuditoria(
              certificado,
              'BAIXAR_PDF',
              downloadButton
            );
          }


          return;
        }


        const sendButton =
          event.target.closest(
            '[data-certificate-send]'
          );


        if (
          sendButton
        ) {

          const certificado =
            certificadosPorId
              .get(
                String(
                  sendButton
                    .dataset
                    .certificateSend ||
                  ''
                )
              );


          if (
            certificado
          ) {

            abrirDialogoEnvio(
              certificado
            );
          }


          return;
        }


        const repairButton =
          event.target.closest(
            '[data-certificate-repair]'
          );


        if (
          repairButton
        ) {

          const certificado =
            certificadosPorId
              .get(
                String(
                  repairButton
                    .dataset
                    .certificateRepair ||
                  ''
                )
              );


          if (
            certificado
          ) {

            abrirDialogoReparo(
              certificado
            );
          }
        }
      }
    );


  /* =====================================================
   * TENTAR NOVAMENTE
   * ===================================================== */


  centralRetry
    ?.addEventListener(
      'click',
      iniciarBackend
    );


  /* =====================================================
   * CONTATO — AINDA SERÁ INTEGRADO
   * ===================================================== */


  document
    .querySelector(
      '[data-contact-placeholder]'
    )
    ?.addEventListener(
      'click',
      () => {

        openDialog({

          kicker:
            'Contato técnico',

          title:
            'Nova solicitação',

          html:
            '<p>Esta tela já está preparada. A gravação da solicitação será ligada ao backend institucional na etapa de integração.</p>',

          actions:
            '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
        });
      }
    );


  document
    .querySelector(
      '[data-contact-history-placeholder]'
    )
    ?.addEventListener(
      'click',
      () => {

        openDialog({

          kicker:
            'Contato técnico',

          title:
            'Minhas solicitações',

          html:
            '<p>O histórico de chamados será carregado aqui quando a Central estiver conectada ao backend institucional.</p>',

          actions:
            '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
        });
      }
    );


  /* =====================================================
   * INÍCIO
   * ===================================================== */


  updateSummaryCards();

  iniciarBackend();

})();
