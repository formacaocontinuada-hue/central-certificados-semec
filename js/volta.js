/*
 * CAMINHO DE IDA E VOLTA (25/11/2026)
 *
 * Quem chega à Central vindo de outra área do Portal SEMEC traz ?de=:
 *   de=formador  -> menu da Área do Formador (sem os itens da escola)
 *   de=publico   -> só a página inicial, as funções adicionais e a assistência
 * Sem ?de=, o menu continua sendo o da conta (escola ou SEMEC), definido pelo js/app.js.
 *
 * O ?de= segue nos links internos da Central e vai para o Tangará Sorteia e a
 * Calculadora, para que o botão Voltar deles leve à mesma área.
 * Nada de dado pessoal na URL: só o nome da área.
 */
(function () {
  'use strict';

  var PORTAL = 'https://formacaocontinuada-hue.github.io/portalsemec_tgamt/';
  var AREAS = {
    escola: { pagina: 'escola.html', nome: 'Área da Escola' },
    semec: { pagina: 'semec.html', nome: 'Área da SEMEC' },
    formador: { pagina: 'formador.html', nome: 'Área do Formador' },
    publico: { pagina: 'index.html', nome: 'Portal SEMEC' }
  };

  var de = '';
  try { de = new URLSearchParams(window.location.search).get('de') || ''; } catch (e) { de = ''; }
  if (!AREAS[de]) de = '';

  /* formador e público não têm conta na Central: o menu é decidido aqui */
  var forcado = de === 'formador' || de === 'publico';
  var raiz = document.documentElement;

  if (forcado) {
    raiz.setAttribute('data-de', de);
    var estilo = document.createElement('style');
    estilo.textContent =
      'html[data-de] [data-so-central],' +
      'html[data-de] .server-nav [data-nav-area]{display:none!important}';
    document.head.appendChild(estilo);
  }

  function definirLeva(area) {
    document.querySelectorAll('a[data-leva-de]').forEach(function (a) {
      var u = new URL(a.getAttribute('href'), window.location.href);
      if (area && area !== 'publico') u.searchParams.set('de', area);
      else u.searchParams.delete('de');
      a.setAttribute('href', u.href);
    });
  }

  function manterNosLinksInternos() {
    if (!de) return;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:|javascript:)/i.test(h)) return;
      var partes = h.split('#');
      var u = new URL(partes[0], window.location.href);
      u.searchParams.set('de', de);
      a.setAttribute('href', u.pathname.split('/').pop() + u.search + (partes[1] ? '#' + partes[1] : ''));
    });
  }

  function aplicarMenu() {
    if (!forcado) return;
    document.querySelectorAll('[data-so-de]').forEach(function (el) {
      el.hidden = (' ' + el.getAttribute('data-so-de') + ' ').indexOf(' ' + de + ' ') < 0;
    });
    document.querySelectorAll('.server-sidebar__brand span').forEach(function (el) {
      el.textContent = de === 'formador' ? 'Área do Formador' : 'Informações';
    });
    document.querySelectorAll('.server-sidebar').forEach(function (el) {
      el.setAttribute('aria-label', de === 'formador' ? 'Menu da Área do Formador' : 'Menu do Portal SEMEC');
    });
  }

  /* páginas sem menu lateral (validar certificado): o link de volta leva à área de origem */
  function aplicarVolta() {
    if (!de) return;
    var area = AREAS[de];
    document.querySelectorAll('a[data-volta-portal]').forEach(function (a) {
      a.setAttribute('href', PORTAL + area.pagina);
      if (de !== 'publico') a.textContent = 'Voltar para a ' + area.nome;
    });
  }

  function iniciar() {
    aplicarMenu();
    aplicarVolta();
    manterNosLinksInternos();
    if (de) definirLeva(de);
  }

  window.PortalVolta = {
    de: de,
    forcado: forcado,
    /* chamado pelo js/app.js quando a conta (escola ou SEMEC) é confirmada */
    definirArea: function (area) { if (!forcado) definirLeva(area); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
