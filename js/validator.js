(() => {
  'use strict';

  const CHANNEL = 'VALIDADOR_PUBLICO_CERTIFICADOS_SEMEC';
  const config = window.CENTRAL_VALIDATOR_CONFIG || {};
  const webappUrl = String(config.WEBAPP_URL || '').trim();

  const params = new URLSearchParams(window.location.search);
  const id = String(params.get('id') || '').trim();
  const hash = String(params.get('hash') || '').trim();

  const card = document.querySelector('.validator-card');
  const loadingState = document.querySelector('[data-validator-state="loading"]');
  const resultState = document.querySelector('[data-validator-state="result"]');
  const details = document.querySelector('[data-validator-details]');
  const title = document.querySelector('[data-validator-title]');
  const message = document.querySelector('[data-validator-message]');
  const icon = document.querySelector('[data-validator-result-icon]');
  const referenceId = document.querySelector('[data-validator-reference-id]');

  const fields = {
    id: document.querySelector('[data-certificate-id]'),
    name: document.querySelector('[data-certificate-name]'),
    training: document.querySelector('[data-certificate-training]'),
    school: document.querySelector('[data-certificate-school]'),
    hours: document.querySelector('[data-certificate-hours]'),
    percentage: document.querySelector('[data-certificate-percentage]'),
    year: document.querySelector('[data-certificate-year]'),
    date: document.querySelector('[data-certificate-date]')
  };

  const logo = (window.CENTRAL_LOGOS && window.CENTRAL_LOGOS.MUNICIPIO) || '';
  if (logo) {
    document.querySelectorAll('[data-validator-logo]').forEach((img) => {
      img.src = logo;
    });
  }

  const isTrustedBridgeOrigin = (origin) => {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' && (
        url.hostname === 'script.google.com' ||
        url.hostname.endsWith('.googleusercontent.com')
      );
    } catch (_) {
      return false;
    }
  };

  const safeText = (element, value, fallback = 'Não informado') => {
    if (element) element.textContent = String(value || fallback);
  };

  const iconForStatus = (status) => {
    if (status === 'VALIDO') return '✓';
    if (status === 'SUBSTITUIDO' || status === 'INATIVO') return '!';
    return '×';
  };

  const renderResult = (result) => {
    const situation = String(result?.situacao || 'ERRO').toUpperCase();
    card.dataset.result = situation;

    loadingState.hidden = true;
    resultState.hidden = false;

    safeText(title, result?.titulo, 'Validação indisponível');
    safeText(
      message,
      result?.mensagem,
      'Não foi possível consultar o registro oficial.'
    );

    if (icon) {
      icon.textContent = iconForStatus(situation);
    }

    const certificate = result?.certificado || null;

    if (certificate) {
      details.hidden = false;
      safeText(fields.id, certificate.idCertificado);
      safeText(fields.name, certificate.nomeCompleto);
      safeText(fields.training, certificate.formacao);
      safeText(fields.school, certificate.escola);
      safeText(fields.hours, certificate.cargaHoraria);
      safeText(fields.percentage, certificate.percentual);
      safeText(fields.year, certificate.ano);
      safeText(fields.date, certificate.dataEmissao);
    } else {
      details.hidden = true;
    }
  };

  const renderLocalError = (status, heading, detail) => {
    renderResult({
      ok: false,
      valido: false,
      situacao: status,
      titulo: heading,
      mensagem: detail,
      certificado: null
    });
  };

  safeText(referenceId, id || 'Não informado');

  if (!id || !hash) {
    renderLocalError(
      'INVALIDO',
      'Endereço de validação incompleto',
      'O QR Code ou link utilizado não contém todas as informações necessárias para validar o certificado.'
    );
    return;
  }

  if (!webappUrl) {
    renderLocalError(
      'ERRO',
      'Serviço de validação em configuração',
      'A página pública já está preparada. Falta apenas vincular a implantação pública do serviço de conferência ao registro oficial.'
    );
    return;
  }

  let timeoutId = null;
  let iframe = null;

  const finish = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (iframe) {
      iframe.remove();
      iframe = null;
    }
    window.removeEventListener('message', onMessage);
  };

  const onMessage = (event) => {
    const payload = event.data || {};

    if (
      payload.canal !== CHANNEL ||
      payload.tipo !== 'VALIDACAO_RESULTADO'
    ) {
      return;
    }

    if (!isTrustedBridgeOrigin(event.origin)) {
      return;
    }

    if (!iframe || event.source !== iframe.contentWindow) {
      return;
    }

    finish();
    renderResult(payload.resultado || {});
  };

  window.addEventListener('message', onMessage);

  timeoutId = window.setTimeout(() => {
    finish();
    renderLocalError(
      'ERRO',
      'Validação temporariamente indisponível',
      'O serviço não respondeu dentro do tempo esperado. Tente novamente em alguns instantes.'
    );
  }, 15000);

  iframe = document.createElement('iframe');
  const url = new URL(webappUrl);
  url.searchParams.set('id', id);
  url.searchParams.set('hash', hash);

  iframe.src = url.href;
  iframe.title = 'Consulta ao registro oficial de certificados';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:0;opacity:0;pointer-events:none;';

  document.body.appendChild(iframe);
})();
