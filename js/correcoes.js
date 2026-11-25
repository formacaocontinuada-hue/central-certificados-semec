(() => {
  'use strict';

  /*
   * PEDIDOS DE CORREÇÃO (25/11/2026)
   * A escola pede a correção e vê para quem o pedido vai. O pedido é
   * resolvido pelo grupo responsável na Área do Formador. Sem CPF na tela.
   * O certificado escolhido na Central chega aqui pelo sessionStorage
   * (nada de dados pessoais na URL).
   */

  const CHAVE_CERT = 'centralPedidoCorrecao';
  const form = document.querySelector('[data-pc-form]');
  if (!form || !window.CENTRAL_BACKEND) return;

  const backend = new window.CENTRAL_BACKEND.BridgeClient();
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let OP = null;
  let cert = null;
  let pedidos = [];
  let filtro = 'andamento';

  const AJUDA = {
    NOME: 'O nome saiu escrito errado.',
    HORAS: 'As horas não batem com a participação.',
    FALTA: 'Estava no evento e o certificado não saiu.',
    OUTRO: 'Qualquer outra coisa. Explique abaixo.'
  };
  const STATUS = { ABERTO: 'atencao', EM_REEMISSAO: 'informativa', RESOLVIDO: 'aprovado', NAO_PROCEDE: 'com_pendencias' };

  async function chamar(acao, dados) {
    const r = await backend.request(acao, dados || {});
    if (!r || r.ok === false) throw new Error((r && (r.mensagem || r.erro)) || 'A Central não concluiu agora. Tente de novo.');
    const x = r.resultado || r;
    if (x.ok === false) throw new Error(x.mensagem || x.erro || 'A Central não concluiu agora. Tente de novo.');
    return x;
  }

  function lerCert() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE_CERT) || 'null'); } catch (_) { return null; }
  }
  function esquecerCert() {
    try { sessionStorage.removeItem(CHAVE_CERT); } catch (_) { /* nada */ }
    cert = null;
  }

  function msg(texto, tipo) {
    $('[data-pc-msg]').innerHTML = texto ? '<p class="pc-msg pc-msg--' + (tipo || 'erro') + '">' + esc(texto) + '</p>' : '';
  }

  function tipoAtual() {
    const r = form.querySelector('input[name="pcTipo"]:checked');
    return r ? r.value : '';
  }

  function montarTipos() {
    const ids = cert ? ['NOME', 'HORAS', 'OUTRO'] : ['FALTA'];
    $('[data-pc-tipos]').innerHTML = ids.map((id) => {
      const t = OP.tipos.find((x) => x.id === id) || { nome: id };
      return '<label class="pc-tipo"><input type="radio" name="pcTipo" value="' + id + '"' + (ids.length === 1 ? ' checked' : '') + '>' +
        '<span><b>' + esc(t.nome.replace(' (pendente)', '').replace(' no certificado', '')) + '</b><small>' + esc(AJUDA[id]) + '</small></span></label>';
    }).join('');
  }

  function montarSelects() {
    $('[data-pc-formacao]').innerHTML = '<option value="">Escolha a formação</option>' +
      OP.formacoes.map((f) => '<option value="' + esc(f.id) + '">' + esc(f.rotulo) + '</option>').join('');
    $('[data-pc-evento]').innerHTML = '<option value="">Escolha o evento</option>' +
      OP.eventosEtapa1.map((e) => '<option value="' + esc(e.id) + '">' + esc(e.rotulo) + '</option>').join('');
  }

  function mostrar(campo, sim) { const el = form.querySelector('[data-pc-campo="' + campo + '"]'); if (el) el.hidden = !sim; }

  function etapa1() {
    if (cert) return cert.etapa1;
    const f = OP.formacoes.find((x) => x.id === $('[data-pc-formacao]').value);
    return !!(f && f.etapa1);
  }

  /** Para quem vai (mesma regra do servidor, com os nomes que ele mandou). */
  function paraQuem() {
    const tipo = tipoAtual();
    if (!tipo) return '';
    if (etapa1()) {
      if (tipo === 'NOME') return OP.nomeEtapa1;
      const e = OP.eventosEtapa1.find((x) => x.id === $('[data-pc-evento]').value);
      return e ? e.responsavel : (tipo === 'OUTRO' ? OP.nomeEtapa1 : '');
    }
    if (cert) return cert.responsavel;
    const f = OP.formacoes.find((x) => x.id === $('[data-pc-formacao]').value);
    return f ? f.responsavel : '';
  }

  function atualizar() {
    const tipo = tipoAtual();
    mostrar('formacao', !cert);
    mostrar('evento', etapa1() && tipo && tipo !== 'NOME');
    mostrar('nome', tipo === 'NOME');
    mostrar('horas', tipo === 'HORAS');
    mostrar('falta', tipo === 'FALTA');
    $('[data-pc-desc-rotulo]').textContent = tipo === 'OUTRO' ? 'O que está errado? *' : 'Explique (opcional)';
    const p = paraQuem();
    $('[data-pc-para]').hidden = !p;
    $('[data-pc-para-texto]').textContent = p ? 'Este pedido vai para: ' + p + '. Quem resolve confere a lista de presença e, se estiver certo, reemite o certificado.' : '';
  }

  function desenharCert() {
    const box = $('[data-pc-cert]');
    box.hidden = !cert;
    $('[data-pc-semcert]').hidden = !!cert;
    if (!cert) { box.innerHTML = ''; return; }
    box.innerHTML = '<strong>' + esc(cert.nome) + '</strong>' +
      '<span>' + esc([cert.formacao, cert.ch].filter(Boolean).join(' · ')) + '</span>' +
      '<small>Certificado ' + esc(cert.id) + ' · <a href="#" data-pc-trocar>pedir para quem não recebeu</a></small>';
  }

  async function carregarOpcoes() {
    const salvo = lerCert();
    OP = await chamar('OPCOES_CORRECAO', { idCertificado: salvo && salvo.id ? salvo.id : '' });
    cert = OP.certificado || null;
    if (!cert) esquecerCert();
    desenharCert();
    montarTipos();
    montarSelects();
    atualizar();
    $('[data-pc-carregando]').hidden = true;
    form.hidden = false;
  }

  function limpar() {
    form.reset();
    msg('');
    montarTipos();
    atualizar();
  }

  form.addEventListener('change', atualizar);
  form.addEventListener('input', (ev) => {
    if (ev.target.matches('[data-pc-cpf]')) {
      const d = ev.target.value.replace(/\D/g, '').slice(0, 11);
      ev.target.value = d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
  });
  form.addEventListener('click', (ev) => {
    if (ev.target.matches('[data-pc-trocar]')) {
      ev.preventDefault();
      esquecerCert();
      desenharCert();
      limpar();
    }
  });
  $('[data-pc-limpar]').addEventListener('click', limpar);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    msg('');
    const tipo = tipoAtual();
    if (!tipo) return msg('Escolha o que está errado.');
    const dados = { tipo, descricao: $('[data-pc-desc]').value.trim() };
    if (cert) dados.idCertificado = cert.id;
    else {
      dados.formacao = $('[data-pc-formacao]').value;
      if (!dados.formacao) return msg('Escolha a formação.');
    }
    if (etapa1() && tipo !== 'NOME') {
      dados.evento = $('[data-pc-evento]').value;
      if (!dados.evento && tipo !== 'OUTRO') return msg('Escolha em qual evento da Etapa I está o erro.');
    }
    if (tipo === 'NOME') dados.nomeCorreto = $('[data-pc-nome]').value.trim();
    if (tipo === 'HORAS') dados.horas = $('[data-pc-horas]').value.trim();
    if (tipo === 'FALTA') {
      dados.nomeCompleto = $('[data-pc-nomecompleto]').value.trim();
      dados.cpf = $('[data-pc-cpf]').value.replace(/\D/g, '');
    }
    const botao = $('[data-pc-enviar]');
    botao.disabled = true; botao.textContent = 'Enviando...';
    try {
      const r = await chamar('PEDIR_CORRECAO', dados);
      $('[data-pc-cpf]').value = '';
      esquecerCert();
      desenharCert();
      limpar();
      msg(r.mensagem, 'ok');
      carregarLista();
    } catch (e) {
      $('[data-pc-cpf]').value = '';
      msg(e.message);
    } finally {
      botao.disabled = false; botao.textContent = 'Enviar pedido';
    }
  });

  /* ---------- lista ---------- */
  async function carregarLista() {
    const lista = $('[data-pc-lista]');
    lista.innerHTML = '<p class="pc-vazio">Carregando os pedidos…</p>';
    try {
      const r = await chamar('LISTAR_PEDIDOS_CORRECAO', {});
      pedidos = r.pedidos || [];
      desenharLista();
    } catch (e) {
      lista.innerHTML = '<p class="pc-msg pc-msg--erro">' + esc(e.message) + '</p>';
    }
  }
  function desenharLista() {
    const andamento = (p) => p.situacao === 'ABERTO' || p.situacao === 'EM_REEMISSAO';
    const lista = pedidos.filter((p) => filtro === 'todos' || (filtro === 'andamento' ? andamento(p) : !andamento(p)));
    $('[data-pc-lista]').innerHTML = lista.length ? lista.map(item).join('') :
      '<p class="pc-vazio">' + (pedidos.length ? 'Nenhum pedido com esse filtro.' : 'A escola ainda não fez pedidos de correção.') + '</p>';
  }
  function item(p) {
    const c = p.certificado;
    return '<article class="pc-item">' +
      '<div class="pc-item__topo"><span>' + esc(p.id) + ' · ' + esc(p.data) + (p.unidade ? ' · ' + esc(p.unidade) : '') + '</span>' +
        '<span class="school-status school-status--' + (STATUS[p.situacao] || 'informativa') + '">' + esc(p.situacaoNome) + '</span></div>' +
      '<h3>' + esc(p.pessoa) + '</h3>' +
      '<p>' + [p.formacao, p.evento, p.tipoNome.replace(' (pendente)', ''), p.valor && p.tipo !== 'FALTA' ? 'certo: ' + p.valor : ''].filter(Boolean).map(esc).join(' · ') + '</p>' +
      '<p><small>Responsável: ' + esc(p.responsavel) + '</small></p>' +
      (p.resposta ? '<div class="pc-resposta"><strong>Resposta' + (p.respondido ? ' (' + esc(p.respondido) + ')' : '') + ':</strong> ' + esc(p.resposta) + '</div>' : '') +
      (c ? '<div class="pc-novo"><span>Certificado novo ' + esc(c.id) + (c.ch ? ' · ' + esc(c.ch) : '') + '</span><span style="display:flex;gap:8px">' +
        (c.verUrl ? '<a class="server-button server-button--ghost" href="' + esc(c.verUrl) + '" target="_blank" rel="noopener">Ver</a>' : '') +
        (c.baixarUrl ? '<a class="server-button server-button--ghost" href="' + esc(c.baixarUrl) + '" target="_blank" rel="noopener">Baixar</a>' : '') + '</span></div>' : '') +
      '</article>';
  }
  document.querySelectorAll('[data-pc-filtro]').forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.pcFiltro;
    document.querySelectorAll('[data-pc-filtro]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    desenharLista();
  }));
  $('[data-pc-atualizar]').addEventListener('click', carregarLista);

  /* ---------- início ---------- */
  (async () => {
    try {
      await backend.connect();
      await carregarOpcoes();
      await carregarLista();
    } catch (e) {
      $('[data-pc-carregando]').textContent = e.message || 'Não foi possível abrir os pedidos agora.';
    }
  })();
})();
