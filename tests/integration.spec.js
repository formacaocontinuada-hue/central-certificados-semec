const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const bridgeHtml = `<!doctype html><meta charset="utf-8"><script>
  const channel = new MessageChannel();
  const unidade = {
    idEscola: 'ESC-000001',
    tipo: 'SEMEC',
    nome: 'Departamento de Gestão Pedagógica e Políticas Educacionais - SEMEC',
    status: 'ATIVO'
  };
  channel.port1.onmessage = ({ data }) => {
    let resultado;
    if (data.acao === 'IDENTIFICAR_UNIDADE') {
      resultado = { ok: true, unidade, perfilAcesso: 'SEMEC', acessoInstitucionalAutorizado: true };
    } else if (data.acao === 'LISTAR_CERTIFICADOS') {
      resultado = {
        ok: true,
        total: 2,
        unidade,
        perfilAcesso: 'SEMEC',
        certificados: [
          {
            idCertificado: 'CERT-1',
            nomeServidor: 'Rose Maria da Silva',
            formacaoId: 'FORMACAO_REDE',
            unidadeNome: 'CME Atacílio de Souza',
            cargaHoraria: 20,
            ano: '2026',
            situacao: 'ATIVO',
            urlPdf: 'https://example.test/cert-1.pdf'
          },
          {
            certificadoId: 'CERT-2',
            servidor: { nome: 'João de Souza' },
            formacao: { id: 'PALESTRAS_SEMINARIOS' },
            unidade: { nome: 'CME Dona Nena' },
            horas: '8h',
            exercicio: 2026,
            status: 'SUBSTITUIDO',
            arquivo: { url: 'https://example.test/cert-2.pdf' }
          }
        ]
      };
    } else if (data.acao === 'BUSCAR_CERTIFICADOS') {
      resultado = {
        ok: true,
        total: 1,
        unidade,
        certificados: [{
          'ID_CERTIFICADO': 'CERT-1',
          'NOME_SERVIDOR': 'Rose Maria da Silva',
          'FORMAÇÃO': 'Formação em Rede',
          'UNIDADE_VINCULADA': 'CME Atacílio de Souza',
          'CARGA_HORÁRIA': '20',
          'ANO_REFERÊNCIA': '2026',
          'SITUAÇÃO': 'ATIVO',
          'LINK_PDF': 'https://example.test/cert-1.pdf'
        }]
      };
    } else if (data.acao === 'ENVIAR_CERTIFICADO') {
      resultado = data.dados.idCertificado === 'CERT-1' && data.dados.emailDestino === 'rose@example.com' && data.dados.confirmado === true
        ? {
            ok: true,
            idEnvio: 'ENV-TESTE-001',
            emailDestinoMascarado: 'ro***@example.com',
            formaEnvio: 'ANEXO_E_LINK'
          }
        : { ok: false, codigo: 'DADOS_INVALIDOS', mensagem: 'Dados de envio inválidos.' };
    } else if (data.acao === 'LISTAR_HISTORICO_ENVIOS') {
      resultado = {
        ok: true,
        unidade,
        total: 1,
        envios: [{
          idEnvio: 'ENV-TESTE-001',
          dataHora: '29/09/2026 10:30:00',
          idCertificado: 'CERT-1',
          nomeCompleto: 'Rose Maria da Silva',
          formacao: 'Formação em Rede',
          escola: 'CME Atacílio de Souza',
          emailDestinoMascarado: 'ro***@example.com',
          status: 'ENVIADO',
          formaEnvio: 'ANEXO_E_LINK'
        }]
      };
    } else if (data.acao === 'SOLICITAR_REPARO') {
      resultado = data.dados.idCertificado === 'CERT-1' && data.dados.descricao.length >= 10
        ? { ok: true, idSolicitacao: 'REP-TESTE-001', status: 'EM_ANALISE' }
        : { ok: false, codigo: 'DADOS_INVALIDOS', mensagem: 'Dados de reparo inválidos.' };
    } else if (data.acao === 'LISTAR_SOLICITACOES_REPARO') {
      resultado = {
        ok: true,
        unidade,
        total: 1,
        solicitacoes: [{
          idSolicitacao: 'REP-TESTE-001',
          dataHora: '29/09/2026 10:35:00',
          idCertificado: 'CERT-1',
          nomeCompleto: 'Rose Maria da Silva',
          formacao: 'Formação em Rede',
          escola: 'CME Atacílio de Souza',
          categoria: 'Carga horária',
          descricao: 'Conferir a carga horária registrada.',
          status: 'EM_ANALISE',
          resposta: ''
        }]
      };
    } else {
      resultado = { ok: false, codigo: 'ACAO_INVALIDA', mensagem: 'Ação inválida.' };
    }
    channel.port1.postMessage({
      canal: 'CENTRAL_CERTIFICADOS_SEMEC',
      requestId: data.requestId,
      ok: true,
      resultado
    });
  };
  channel.port1.start();
  parent.postMessage({
    canal: 'CENTRAL_CERTIFICADOS_SEMEC',
    tipo: 'BRIDGE_READY',
    versaoBridge: 'BRIDGE-TESTE'
  }, '*', [channel.port2]);
<\/script>`;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CENTRAL_BROWSER_PATH ? {executablePath: process.env.CENTRAL_BROWSER_PATH} : {})
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.route('https://script.google.com/**', route => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: bridgeHtml
  }));

  const indexUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
  await page.goto(indexUrl, { waitUntil: 'load' });
  await page.locator('[data-central-status][data-state="ready"]').waitFor({ state: 'visible' });

  assert.equal(
    await page.locator('[data-school-name]').innerText(),
    'Departamento de Gestão Pedagógica e Políticas Educacionais - SEMEC'
  );
  assert.equal(await page.locator('[data-existing-count]').innerText(), '2 certificados');
  assert.equal(await page.locator('[data-summary-active]').innerText(), '1');
  assert.equal(await page.locator('[data-summary-people]').innerText(), '1');
  assert.equal(await page.locator('[data-summary-repairs]').innerText(), '1');
  assert.equal(await page.locator('[data-central-retry]').isVisible(), false);
  assert.equal(await page.locator('[data-central-logged-out]').isVisible(), false);
  assert.deepEqual(
    await page.locator('[data-existing-results] h3').allTextContents(),
    ['Rose Maria da Silva', 'João de Souza']
  );
  assert.equal(await page.locator('[data-existing-results] button:disabled').count(), 2);
  assert.equal(await page.locator('[data-existing-results] [data-person-name="Rose Maria da Silva"] button:disabled').count(), 0);
  assert.equal(await page.locator('[data-existing-results] [data-certificate-send]').count(), 2);
  assert.equal(await page.locator('[data-existing-results] [data-certificate-repair]').count(), 2);
  assert.equal(await page.getByText('Claudia Maria Ribas de Sousa').count(), 0);

  await page.locator('[name="busca"]').fill('ro');
  await page.getByRole('button', { name: 'Pesquisar' }).click();
  assert.equal(await page.locator('[data-search-empty] strong').innerText(), 'Informe pelo menos 3 caracteres');

  await page.locator('[name="busca"]').fill('rose');
  await page.getByRole('button', { name: 'Pesquisar' }).click();
  await page.locator('[data-search-results-list] h3').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-search-result-count]').innerText(), '1 certificado');
  assert.equal(await page.locator('[data-search-results-list] h3').innerText(), 'Rose Maria da Silva');
  assert.equal(await page.locator('[data-search-results-list] dd').first().innerText(), 'Formação em Rede');

  await page.locator('[data-existing-results] [data-certificate-send="CERT-1"]').click();
  await page.locator('[data-send-certificate-form] [name="emailDestino"]').fill('rose@example.com');
  await page.locator('[data-send-certificate-form] [name="confirmacao"]').check();
  await page.getByRole('button', { name: 'Confirmar envio' }).click();
  await page.getByRole('heading', { name: 'Certificado enviado' }).waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-action-result-message]').innerText(), /ro\*\*\*@example\.com/);
  assert.equal(await page.locator('[data-action-result-protocol]').innerText(), 'ENV-TESTE-001');
  await page.getByRole('button', { name: 'Concluir' }).click();

  await page.locator('[data-existing-results] [data-certificate-repair="CERT-1"]').click();
  await page.locator('[data-repair-form] [name="categoria"]').selectOption('Carga horária');
  await page.locator('[data-repair-form] [name="descricao"]').fill('Conferir a carga horária registrada.');
  await page.locator('[data-repair-form] [name="campo"]').selectOption('CH_CERTIFICADA');
  await page.locator('[data-repair-form] [name="valorProposto"]').fill('24');
  await page.getByRole('button', { name: 'Enviar solicitação' }).click();
  await page.getByRole('heading', { name: 'Reparo enviado para análise' }).waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-action-result-protocol]').innerText(), 'REP-TESTE-001');
  await page.getByRole('button', { name: 'Concluir' }).click();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `A página apresentou overflow horizontal em ${width}px: ${overflow}px`);
  }

  const historyUrl = pathToFileURL(path.resolve(__dirname, '..', 'historico-envios.html')).href;
  await page.goto(historyUrl, { waitUntil: 'load' });
  await page.locator('[data-central-status][data-state="ready"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-send-history-count]').innerText(), '1 envio');
  assert.equal(await page.locator('[data-send-history-list] h3').innerText(), 'Rose Maria da Silva');
  assert.match(await page.locator('[data-send-history-list]').innerText(), /ro\*\*\*@example\.com/);

  const repairsUrl = pathToFileURL(path.resolve(__dirname, '..', 'solicitacoes-reparo.html')).href;
  await page.goto(repairsUrl, { waitUntil: 'load' });
  await page.locator('[data-central-status][data-state="ready"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-repair-page-count]').innerText(), '1 solicitação');
  assert.equal(await page.locator('[data-repair-page-list] h3').innerText(), 'Rose Maria da Silva');
  assert.match(await page.locator('[data-repair-page-list]').innerText(), /Conferir a carga horária registrada/);

  if (process.env.CENTRAL_SCREENSHOT_PATH) {
    await page.goto(indexUrl, { waitUntil: 'load' });
    await page.locator('[data-central-status][data-state="ready"]').waitFor({ state: 'visible' });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: process.env.CENTRAL_SCREENSHOT_PATH, fullPage: true });
  }

  assert.deepEqual(pageErrors, []);
  await browser.close();
  process.stdout.write('Integração visual e contrato do backend validados.\n');
})().catch(error => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
