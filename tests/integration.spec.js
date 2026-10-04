const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const bridgeHtml = `<!doctype html><meta charset="utf-8"><script>
const handshakeNonce = new URL(location.href).searchParams.get('central_nonce') || '';
const channel = new MessageChannel();
const unidade = { idEscola: 'ESC-000001', tipo: 'SEMEC', nome: 'Departamento de Gestão Pedagógica e Políticas Educacionais - SEMEC' };
const certificados = [
  { idCertificado: 'CERT-1', nomeServidor: 'Rose Maria da Silva', formacaoId: 'FORMACAO_REDE', unidadeNome: 'CME Atacílio de Souza', cargaHoraria: 20, ano: '2026', situacao: 'ATIVO', urlPdf: 'https://example.test/cert-1.pdf' },
  { certificadoId: 'CERT-2', servidor: { nome: 'João de Souza' }, formacao: { id: 'PALESTRAS_SEMINARIOS' }, unidade: { nome: 'CME Dona Nena' }, horas: '8h', exercicio: 2026, status: 'SUBSTITUIDO', arquivo: { url: 'https://example.test/cert-2.pdf' } }
];
channel.port1.onmessage = ({ data }) => {
  let resultado;
  if (data.acao === 'IDENTIFICAR_UNIDADE') {
    resultado = { ok: true, unidade, perfilAcesso: 'SEMEC', acessoInstitucionalAutorizado: true };
  } else if (data.acao === 'LISTAR_CERTIFICADOS') {
    resultado = { ok: true, unidade, certificados };
  } else if (data.acao === 'BUSCAR_CERTIFICADOS') {
    resultado = { ok: true, unidade, certificados: [
      { 'ID_CERTIFICADO': 'CERT-1', 'NOME_SERVIDOR': 'Rose Maria da Silva', 'FORMAÇÃO': 'Formação em Rede', 'UNIDADE_VINCULADA': 'CME Atacílio de Souza', 'CARGA_HORÁRIA': '20', 'ANO_REFERÊNCIA': '2026', 'SITUAÇÃO': 'ATIVO', 'LINK_PDF': 'https://example.test/cert-1.pdf' },
      { 'ID_CERTIFICADO': 'CERT-3', 'NOME_SERVIDOR': 'Rose Maria da Silva', 'FORMAÇÃO': 'Palestras e Seminários', 'UNIDADE_VINCULADA': 'CME Atacílio de Souza', 'CARGA_HORÁRIA': '8', 'ANO_REFERÊNCIA': '2026', 'SITUAÇÃO': 'ATIVO', 'LINK_PDF': '' }
    ] };
  } else if (data.acao === 'REGISTRAR_ACESSO_CERTIFICADO') {
    resultado = { ok: true, url: 'https://example.test/cert-1.pdf' };
  } else {
    resultado = { ok: false, codigo: 'ACAO_INVALIDA', mensagem: 'Ação fora do escopo atual.' };
  }
  channel.port1.postMessage({ canal: 'CENTRAL_CERTIFICADOS_SEMEC', requestId: data.requestId, ok: true, resultado });
};
channel.port1.start();
const invalidChannel = new MessageChannel();
window.top.postMessage({
  canal: 'CENTRAL_CERTIFICADOS_SEMEC',
  tipo: 'BRIDGE_READY',
  versaoBridge: 'BRIDGE-INVALIDA',
  nonce: 'nonce-invalido'
}, '*', [invalidChannel.port2]);
setTimeout(() => {
  window.top.postMessage({
    canal: 'CENTRAL_CERTIFICADOS_SEMEC',
    tipo: 'BRIDGE_READY',
    versaoBridge: 'BRIDGE-TESTE',
    nonce: handshakeNonce
  }, '*', [channel.port2]);
}, 25);
<\/script>`;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CENTRAL_BROWSER_PATH ? { executablePath: process.env.CENTRAL_BROWSER_PATH } : {})
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const pageErrors = [];
  let receivedHandshakeNonce = '';
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.__centralBridgeReadyEvents = [];
    window.addEventListener('message', event => {
      const message = event.data || {};
      if (
        message.canal !== 'CENTRAL_CERTIFICADOS_SEMEC' ||
        message.tipo !== 'BRIDGE_READY'
      ) return;

      const outerIframe = document.querySelector('iframe[data-central-bridge]');
      window.__centralBridgeReadyEvents.push({
        nonce: String(message.nonce || ''),
        sameSource: Boolean(
          outerIframe &&
          event.source === outerIframe.contentWindow
        )
      });
    });
  });
  await page.route('https://script.google.com/**', route => {
    const requestUrl = new URL(route.request().url());
    receivedHandshakeNonce =
      requestUrl.searchParams.get('central_nonce') || '';
    const nestedUrl =
      'https://script.googleusercontent.com/bridge-test?central_nonce=' +
      encodeURIComponent(receivedHandshakeNonce);

    return route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><iframe src="' + nestedUrl + '"></iframe>'
    });
  });
  await page.context().route(
    'https://script.googleusercontent.com/**',
    route => route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: bridgeHtml
    })
  );
  await page.context().route('https://example.test/**', route => route.fulfill({
    status: 200, contentType: 'text/html; charset=utf-8', body: '<title>Certificado de teste</title><p>PDF oficial simulado</p>'
  }));

  const root = path.resolve(__dirname, '..');
  const pageUrl = file => pathToFileURL(path.join(root, file)).href;
  await page.goto(pageUrl('index.html'), { waitUntil: 'load' });
  await page.locator('[data-central-status][data-state="ready"]').waitFor({ state: 'visible' });

  assert.match(receivedHandshakeNonce, /^[a-f0-9]{48}$/);
  const bridgeReadyEvents =
    await page.evaluate(() => window.__centralBridgeReadyEvents);
  assert.equal(bridgeReadyEvents.length, 2);
  assert.equal(bridgeReadyEvents[0].nonce, 'nonce-invalido');
  assert.equal(bridgeReadyEvents[0].sameSource, false);
  assert.equal(bridgeReadyEvents[1].nonce, receivedHandshakeNonce);
  assert.equal(bridgeReadyEvents[1].sameSource, false);

  assert.equal(
    await page.locator('[data-school-name]').innerText(),
    'Departamento de Gestão Pedagógica e Políticas Educacionais - SEMEC'
  );
  assert.equal(await page.locator('[data-existing-count]').innerText(), '2 certificados');
  assert.equal(await page.locator('[data-summary-active]').innerText(), '1');
  assert.equal(await page.locator('[data-summary-people]').innerText(), '1');
  assert.deepEqual(await page.locator('[data-existing-results] h3').allTextContents(), ['Rose Maria da Silva', 'João de Souza']);
  assert.equal(await page.locator('[data-certificate-report]').count(), 2);
  assert.equal(await page.locator('[data-certificate-correction]').count(), 2);
  assert.equal(await page.locator('[data-certificate-send], [data-certificate-repair]').count(), 0);
  assert.equal(await page.getByText('Solicitações de reparo').count(), 0);
  assert.equal(await page.getByText('Histórico de envios').count(), 0);

  const certificatePopupPromise = page.waitForEvent('popup');
  await page.locator('[data-existing-results] [data-certificate-view]').first().click();
  const certificatePopup = await certificatePopupPromise;
  await certificatePopup.waitForURL('https://example.test/cert-1.pdf');
  assert.equal(await certificatePopup.title(), 'Certificado de teste');
  await certificatePopup.close();

  const downloadButton = page.locator('[data-existing-results] [data-certificate-download]').first();
  await downloadButton.click();
  await downloadButton.getByText('Download solicitado ✓').waitFor({ state: 'visible' });

  await page.locator('[name="busca"]').fill('ro');
  await page.getByRole('button', { name: 'Pesquisar' }).click();
  assert.equal(await page.locator('[data-search-empty] strong').innerText(), 'Informe pelo menos 3 caracteres');

  await page.locator('[name="busca"]').fill('rose');
  await page.getByRole('button', { name: 'Pesquisar' }).click();
  await page.locator('[data-search-results-list] h3').first().waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-search-result-count]').innerText(), '2 certificados');

  await page.locator('[data-search-results-list] [data-certificate-correction="CERT-1"]').click();
  await page.locator('[data-correction-email-form]').waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-correction-summary]').innerText(), /Formação em Rede.*CME Atacílio de Souza.*CERT-1/);
  assert.equal(await page.getByRole('button', { name: 'Preparar e-mail' }).count(), 1);
  await page.getByRole('button', { name: 'Cancelar' }).click();

  const popupPromise = page.waitForEvent('popup');
  await page.locator('[data-search-results-list] [data-certificate-report]').first().click();
  const report = await popupPromise;
  await report.waitForLoadState('load');
  assert.equal(await report.title(), 'Relatório individual - Rose Maria da Silva');
  assert.match(await report.locator('body').innerText(), /Relatório individual de participação e certificação/);
  assert.match(await report.locator('body').innerText(), /Registros localizados: 2/);
  assert.equal(await report.locator('tbody tr').count(), 2);
  assert.match(await report.locator('tbody').innerText(), /Certificado não localizado/);
  await report.close();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `Overflow horizontal em ${width}px: ${overflow}px`);
  }

  if (process.env.CENTRAL_SCREENSHOT_PATH) {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.screenshot({ path: process.env.CENTRAL_SCREENSHOT_PATH, fullPage: true });
  }

  for (const file of ['ajuda.html', 'entrar-em-contato.html', 'politica-privacidade.html', 'acessibilidade.html']) {
    await page.goto(pageUrl(file), { waitUntil: 'load' });
    assert.equal(await page.getByText('Solicitações de reparo').count(), 0);
    assert.equal(await page.getByText('Histórico de envios').count(), 0);
  }

  const appSource = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  for (const action of ['ENVIAR_CERTIFICADO', 'LISTAR_HISTORICO_ENVIOS', 'SOLICITAR_REPARO', 'LISTAR_SOLICITACOES_REPARO', 'ATUALIZAR_SOLICITACAO_REPARO', 'COMPLEMENTAR_SOLICITACAO_REPARO']) {
    assert.equal(appSource.includes(action), false, `Ação antiga ainda presente: ${action}`);
  }
  const backendSource = fs.readFileSync(path.join(root, 'js', 'backend.js'), 'utf8');
  assert.doesNotMatch(backendSource, /event\.source !== this\.iframe\.contentWindow/);
  assert.match(backendSource, /message\.nonce/);
  assert.match(backendSource, /crypto\.getRandomValues/);
  assert.match(fs.readFileSync(path.join(root, 'js', 'validator.js'), 'utf8'), /event\.source !== iframe\.contentWindow/);
  assert.deepEqual(pageErrors, []);

  await browser.close();
  process.stdout.write('Consulta, relatório individual, contato por e-mail e controles de segurança validados.\n');
})().catch(error => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
