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

  const portalManagerSignature =
    new URL(
      'assents/sem_fundo/assinatura_roselaine_mezz.png',
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


  let certificadosPesquisa =
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


      cargo:
        String(

          (
            servidor &&
            typeof servidor ===
              'object'
              ? primeiroValor(
                  servidor,
                  'cargo',
                  'cargoNome',
                  'nomeCargo',
                  'funcao',
                  'funcaoNome',
                  'nomeFuncao',
                  'cargoFuncao'
                )
              : ''
          ) ||

          primeiroValor(
            registro,
            'cargo',
            'cargoNome',
            'nomeCargo',
            'cargoServidor',
            'funcao',
            'funcaoNome',
            'nomeFuncao',
            'funcaoServidor',
            'cargoFuncao'
          ) ||

          'Servidor'

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
        response?.erro ||
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
          result.erro ||
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
      'school-certificate-row';


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
      'Participação';


    const title =
      document.createElement(
        'h4'
      );


    title.textContent =
      certificado
        .formacaoNome;


    const details =
      document.createElement(
        'dl'
      );


    details.className =
      'school-detail-list';


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
      downloadButton
    );


    article.append(
      type,
      title,
      details,
      actions
    );


    return article;
  };


  const criarGrupoPessoa = (
    nome,
    certificados
  ) => {

    const article =
      document.createElement(
        'article'
      );


    article.className =
      'school-person-report-card';


    const header =
      document.createElement(
        'div'
      );


    header.className =
      'school-person-report-header';


    const identity =
      document.createElement(
        'div'
      );


    identity.className =
      'school-person-report-identity';


    const cargo =
      certificados
        .map(
          certificado =>
            certificado.cargo
        )
        .find(
          valor =>
            valor &&
            chaveCanonica(valor) !==
              'servidor'
        ) ||
      certificados[0]
        ?.cargo ||
      'Servidor';


    const type =
      document.createElement(
        'span'
      );


    type.className =
      'school-type';


    type.textContent =
      cargo;


    const title =
      document.createElement(
        'h3'
      );


    title.textContent =
      nome;


    const summary =
      document.createElement(
        'p'
      );


    summary.className =
      'school-person-report-summary';


    summary.textContent =
      `${certificados.length} participaç${
        certificados.length === 1
          ? 'ão localizada'
          : 'ões localizadas'
      } em 2026`;


    identity.append(
      type,
      title,
      summary
    );


    const reportButton =
      document.createElement(
        'button'
      );


    reportButton.className =
      'server-button server-button--ghost';


    reportButton.type =
      'button';


    reportButton.textContent =
      'Relatório anual 2026';


    reportButton.dataset
      .personReport =
        nome;


    header.append(
      identity,
      reportButton
    );


    const certificateList =
      document.createElement(
        'div'
      );


    certificateList.className =
      'school-person-certificate-list';


    certificateList.append(
      ...certificados.map(
        criarLinhaCertificado
      )
    );


    article.append(
      header,
      certificateList
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


    const grupos =
      new Map();


    certificados.forEach(
      certificado => {

        const chave =
          chaveCanonica(
            certificado.nome
          );


        if (!grupos.has(chave)) {
          grupos.set(
            chave,
            {
              nome:
                certificado.nome,
              certificados:
                []
            }
          );
        }


        grupos
          .get(chave)
          .certificados
          .push(
            certificado
          );
      }
    );


    container.replaceChildren(
      ...Array.from(
        grupos.values()
      ).map(
        grupo =>
          criarGrupoPessoa(
            grupo.nome,
            grupo.certificados
          )
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

          certificadosPesquisa =
            [];


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



          certificadosPesquisa =
            matches;


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

          certificadosPesquisa =
            [];


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


        certificadosPesquisa =
          [];


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
   * RELATÓRIO INDIVIDUAL ANUAL POR PESSOA
   * ===================================================== */


  const ANO_RELATORIO_PARTICIPACAO =
    '2026';


  const ETAPAS_RELATORIO_PARTICIPACAO =
    Object.freeze([
      {
        id:
          'FORMACAO_REDE',
        nome:
          'Formação em Rede'
      },
      {
        id:
          'FORMACAO_CENTRO_ENSINO',
        nome:
          'Formação do Centro de Ensino'
      },
      {
        id:
          'PALESTRAS_SEMINARIOS',
        nome:
          'Palestras e Seminários'
      }
    ]);


  const participacoesDoServidor = (
    nome
  ) => {

    const vistos =
      new Set();


    return [
      ...certificadosAtuais,
      ...certificadosPesquisa
    ]
      .filter(
        certificado =>
          chaveCanonica(
            certificado.nome
          ) ===
          chaveCanonica(
            nome
          ) &&
          certificado.ano ===
            ANO_RELATORIO_PARTICIPACAO
      )
      .filter(
        certificado => {

          const chave =
            certificado.id ||
            [
              certificado.nome,
              certificado.formacaoId,
              certificado.ano,
              certificado.unidadeNome
            ].join('|');


          if (
            vistos.has(
              chave
            )
          ) {
            return false;
          }


          vistos.add(
            chave
          );


          return true;
        }
      );
  };


  const adicionarTextoRelatorio = (
    parent,
    tag,
    text,
    className = ''
  ) => {

    const element =
      parent.ownerDocument
        .createElement(
          tag
        );


    element.textContent =
      text;


    if (
      className
    ) {
      element.className =
        className;
    }


    parent.appendChild(
      element
    );


    return element;
  };


  const carregarImagemNoRelatorio = async (
    image,
    url
  ) => {

    try {

      const response =
        await fetch(
          url,
          {
            cache:
              'force-cache'
          }
        );


      if (
        !response.ok
      ) {
        throw new Error(
          `Imagem indisponível: ${response.status}`
        );
      }


      const blob =
        await response.blob();


      const dataUrl =
        await new Promise(
          (
            resolve,
            reject
          ) => {

            const reader =
              new FileReader();


            reader.addEventListener(
              'load',
              () =>
                resolve(
                  reader.result
                ),
              {
                once:
                  true
              }
            );


            reader.addEventListener(
              'error',
              reject,
              {
                once:
                  true
              }
            );


            reader.readAsDataURL(
              blob
            );
          }
        );


      image.src =
        dataUrl;


      if (
        typeof image.decode ===
        'function'
      ) {
        await image.decode();
      }


      return true;
    } catch (
      error
    ) {

      image.src =
        url;


      return false;
    }
  };


  const gerarRelatorioServidor = (
    nome
  ) => {

    const participacoes =
      participacoesDoServidor(
        nome
      );


    if (
      participacoes.length ===
      0
    ) {
      return;
    }


    const cargo =
      participacoes
        .map(
          participacao =>
            participacao.cargo
        )
        .find(
          valor =>
            valor &&
            chaveCanonica(valor) !==
              'servidor'
        ) ||
      participacoes[0]
        .cargo ||
      'Servidor';


    const unidades =
      Array.from(
        new Set(
          participacoes
            .map(
              participacao =>
                participacao
                  .unidadeNome
            )
            .filter(
              Boolean
            )
        )
      );


    const popup =
      window.open(
        'about:blank',
        '_blank'
      );


    if (
      !popup
    ) {

      openDialog({

        kicker:
          'Relatório individual',

        title:
          'Não foi possível abrir o relatório',

        html:
          '<p>Permita a abertura de janelas para gerar a versão pronta para impressão.</p>',

        actions:
          '<button class="server-button server-button--primary" type="button" data-modal-close>Entendi</button>'
      });


      return;
    }


    const doc =
      popup.document;


    doc.title =
      `Relatório de participação 2026 - ${nome}`;


    const style =
      doc.createElement(
        'style'
      );


    style.textContent =
      '@page{size:A4;margin:14mm}' +
      'body{font:12.5px/1.45 Arial,sans-serif;color:#09224d;margin:0;padding:28px;background:#fff}' +
      'main{max-width:190mm;margin:0 auto}' +
      'header{display:flex;align-items:center;gap:18px;border-bottom:3px solid #062a5a;padding-bottom:16px;margin-bottom:18px}' +
      '.portal-logo{width:92px;height:92px;object-fit:contain;flex:0 0 auto}' +
      '.brand{min-width:0}.brand p{margin:2px 0}.brand-name{color:#062a5a;font-size:15px;font-weight:800}' +
      'h1{font-size:19px;line-height:1.25;margin:8px 0 0;text-transform:uppercase}' +
      'h2{font-size:16px;margin:0 0 10px}' +
      'p{margin:4px 0}.meta{color:#58708d}' +
      '.identification{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;padding:13px 15px;border:1px solid #c8d9ec;border-radius:7px;background:#f8fbff;margin-bottom:18px}' +
      '.identification p{margin:0}.identification .wide{grid-column:1/-1}' +
      '.stage{break-inside:avoid;margin-top:18px}.stage h2{padding:8px 10px;border-left:4px solid #e2a61a;background:#eef6ff;color:#062a5a}' +
      'table{width:100%;border-collapse:collapse;margin-top:9px}' +
      'th,td{border:1px solid #c8d9ec;padding:8px;text-align:left;vertical-align:top}' +
      'th{background:#eaf4ff}.empty-stage{padding:10px;border:1px dashed #c8d9ec;color:#58708d}' +
      '.official-note{margin-top:22px;padding:14px;border:1px solid #c8d9ec;border-radius:7px;background:#f8fbff;color:#294b70;text-align:justify}' +
      '.official-note h2{text-align:left}.source{font-size:11.5px;color:#58708d}' +
      '.signature-block{display:grid;justify-items:center;margin:28px auto 10px;text-align:center;break-inside:avoid}' +
      '.signature-block img{display:block;width:230px;max-width:70%;height:92px;object-fit:contain;margin-bottom:-4px}' +
      '.signature-block strong{font-size:14px}.signature-block span{display:block;color:#294b70}' +
      '.actions{margin:24px 0;text-align:center}.actions button{background:#062a5a;color:#fff;border:0;border-radius:6px;padding:10px 16px;font-weight:700;cursor:pointer}.actions button:disabled{cursor:wait;opacity:.68}' +
      '.document-footer{margin-top:16px;padding-top:10px;border-top:1px solid #c8d9ec;color:#58708d;font-size:11px;text-align:center}' +
      '@media(max-width:700px){body{padding:18px}.identification{grid-template-columns:1fr}.identification .wide{grid-column:auto}header{align-items:flex-start}.portal-logo{width:72px;height:72px}}' +
      '@media print{body{padding:0}.actions{display:none}}';


    doc.head.appendChild(
      style
    );


    const main =
      doc.createElement(
        'main'
      );


    const header =
      doc.createElement(
        'header'
      );


    const crest =
      doc.createElement(
        'img'
      );


    crest.src =
      portalMainLogo;


    crest.alt =
      'Brasão do Portal SEMEC';


    crest.className =
      'portal-logo';


    const heading =
      doc.createElement(
        'div'
      );


    heading.className =
      'brand';


    adicionarTextoRelatorio(
      heading,
      'p',
      'Portal SEMEC — Central de Certificados',
      'brand-name'
    );


    adicionarTextoRelatorio(
      heading,
      'p',
      'Prefeitura Municipal de Tangará da Serra — MT',
      'meta'
    );


    adicionarTextoRelatorio(
      heading,
      'p',
      'Secretaria Municipal de Educação — SEMEC',
      'meta'
    );


    adicionarTextoRelatorio(
      heading,
      'p',
      'Departamento Pedagógico',
      'meta'
    );


    adicionarTextoRelatorio(
      heading,
      'h1',
      'Relatório Individual de Participação e Certificação'
    );


    header.append(
      crest,
      heading
    );


    main.appendChild(
      header
    );


    const identification =
      doc.createElement(
        'section'
      );


    identification.className =
      'identification';


    adicionarTextoRelatorio(
      identification,
      'p',
      `Nome completo: ${nome}`
    );


    adicionarTextoRelatorio(
      identification,
      'p',
      `Cargo: ${cargo}`
    );


    adicionarTextoRelatorio(
      identification,
      'p',
      `Ano de referência: ${ANO_RELATORIO_PARTICIPACAO}`
    );


    adicionarTextoRelatorio(
      identification,
      'p',
      `Participações disponíveis: ${participacoes.length}`
    );


    const unidadesLinha =
      adicionarTextoRelatorio(
        identification,
        'p',
        `Unidade(s) vinculada(s) aos registros: ${unidades.join('; ') || 'Não informada'}`
      );


    unidadesLinha.className =
      'wide';


    const emissaoLinha =
      adicionarTextoRelatorio(
        identification,
        'p',
        `Data e hora de emissão: ${new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'long',
          timeStyle: 'short'
        }).format(new Date())}`,
        'meta'
      );


    emissaoLinha.classList.add(
      'wide'
    );


    main.appendChild(
      identification
    );


    ETAPAS_RELATORIO_PARTICIPACAO.forEach(
      (
        etapa,
        indice
      ) => {

        const section =
          doc.createElement(
            'section'
          );


        section.className =
          'stage';


        adicionarTextoRelatorio(
          section,
          'h2',
          `${indice + 1}. ${etapa.nome}`
        );


        const participacoesDaEtapa =
          participacoes.filter(
            participacao =>
              participacao.formacaoId ===
                etapa.id
          );


        if (
          participacoesDaEtapa.length ===
          0
        ) {

          adicionarTextoRelatorio(
            section,
            'p',
            'Nenhuma participação disponível nesta etapa até a data de emissão.',
            'empty-stage'
          );

          main.appendChild(
            section
          );

          return;
        }


        const table =
          doc.createElement(
            'table'
          );


        const thead =
          doc.createElement(
            'thead'
          );


        const headRow =
          doc.createElement(
            'tr'
          );


        [
          'Formação ou evento',
          'Unidade vinculada',
          'Carga horária',
          'Situação do registro'
        ].forEach(
          label =>
            adicionarTextoRelatorio(
              headRow,
              'th',
              label
            )
        );


        thead.appendChild(
          headRow
        );


        const tbody =
          doc.createElement(
            'tbody'
          );


        participacoesDaEtapa.forEach(
          participacao => {

            const row =
              doc.createElement(
                'tr'
              );


            [
              participacao.formacaoNome,
              participacao.unidadeNome,
              participacao.cargaHoraria,
              participacao.situacao
            ].forEach(
              value =>
                adicionarTextoRelatorio(
                  row,
                  'td',
                  value
                )
            );


            tbody.appendChild(
              row
            );
          }
        );


        table.append(
          thead,
          tbody
        );


        section.appendChild(
          table
        );


        main.appendChild(
          section
        );
      }
    );


    const actions =
      doc.createElement(
        'div'
      );


    actions.className =
      'actions';


    const printButton =
      doc.createElement(
        'button'
      );


    printButton.type =
      'button';


    printButton.textContent =
      'Preparando relatório...';


    printButton.disabled =
      true;


    printButton.addEventListener(
      'click',
      () =>
        popup.print()
    );


    actions.appendChild(
      printButton
    );


    const officialNote =
      doc.createElement(
        'section'
      );


    officialNote.className =
      'official-note';


    adicionarTextoRelatorio(
      officialNote,
      'h2',
      'Informações sobre o documento'
    );


    adicionarTextoRelatorio(
      officialNote,
      'p',
      'Documento oficial de consulta emitido pela Central de Certificados do Portal SEMEC, elaborado com base nos registros institucionais disponíveis na data de sua emissão. As informações apresentadas refletem os dados de eventos e formações, participação, presença e certificação mantidos pela Secretaria Municipal de Educação de Tangará da Serra — MT. Caso sejam identificadas divergências, omissões ou possíveis erros, a solicitação de análise e correção deverá ser formalizada exclusivamente pelo 1Doc, com identificação do servidor, do evento ou formação e descrição objetiva da inconsistência, para apreciação do setor responsável.'
    );


    adicionarTextoRelatorio(
      officialNote,
      'p',
      'Fonte das informações: dados consolidados a partir das bases institucionais de registro de eventos e formações, participação, presença e certificação mantidas pela Secretaria Municipal de Educação de Tangará da Serra — MT.',
      'source'
    );


    adicionarTextoRelatorio(
      officialNote,
      'p',
      'Novos registros serão incorporados ao relatório à medida que forem disponibilizados na Central. Este relatório não substitui os certificados individuais.',
      'source'
    );


    main.appendChild(
      officialNote
    );


    const signatureBlock =
      doc.createElement(
        'section'
      );


    signatureBlock.className =
      'signature-block';


    const signatureImage =
      doc.createElement(
        'img'
      );


    signatureImage.src =
      portalManagerSignature;


    signatureImage.alt =
      'Assinatura de Roselaine Mezz';


    signatureBlock.appendChild(
      signatureImage
    );


    adicionarTextoRelatorio(
      signatureBlock,
      'strong',
      'Roselaine Mezz'
    );


    adicionarTextoRelatorio(
      signatureBlock,
      'span',
      'Gestora do Portal SEMEC'
    );


    adicionarTextoRelatorio(
      signatureBlock,
      'span',
      'Departamento Pedagógico — SEMEC'
    );


    adicionarTextoRelatorio(
      signatureBlock,
      'span',
      'Tangará da Serra — MT'
    );


    main.appendChild(
      signatureBlock
    );


    adicionarTextoRelatorio(
      main,
      'p',
      'Documento gerado eletronicamente pela Central de Certificados do Portal SEMEC.',
      'document-footer'
    );


    main.appendChild(
      actions
    );


    doc.body.replaceChildren(
      main
    );


    Promise.all(
      [
        carregarImagemNoRelatorio(
          crest,
          portalMainLogo
        ),
        carregarImagemNoRelatorio(
          signatureImage,
          portalManagerSignature
        )
      ]
    ).finally(
      () => {

        popup.opener =
          null;


        printButton.disabled =
          false;


        printButton.textContent =
          'Imprimir ou salvar em PDF';
      }
    );


    popup.focus();
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


        const reportButton =
          event.target.closest(
            '[data-person-report]'
          );


        if (
          reportButton
        ) {

          gerarRelatorioServidor(
            String(
              reportButton
                .dataset
                .personReport ||
              ''
            )
          );


          return;
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
   * INÍCIO
   * ===================================================== */


  updateSummaryCards();

  iniciarBackend();

})();
