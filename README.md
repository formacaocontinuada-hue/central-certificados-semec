# Central de Certificados — Portal SEMEC

Área institucional de consulta de participações e certificados da Secretaria Municipal de Educação de Tangará da Serra.

## Escopo atual

A Central existe para:

- validar o acesso institucional e identificar a unidade;
- pesquisar qualquer servidor pelo nome;
- consultar participações e certificados;
- visualizar e baixar certificados existentes;
- gerar relatório individual anual por pessoa, separando as participações disponíveis em 2026 nas três etapas institucionais e permitindo impressão ou salvamento em PDF;
- orientar os gestores autorizados sobre o registro de dúvidas e pedidos de correção pelo 1Doc interno da Prefeitura.

Não fazem parte desta etapa: fluxo interno de solicitações, painel de análise, aprovação de reparos, pedido de complemento, acompanhamento de status, correção ou reemissão. Não existe botão de correção vinculado ao certificado: o gestor autorizado recebe as orientações e registra a solicitação diretamente no 1Doc interno.

O acesso à área de certificados é restrito aos gestores autorizados. A conta do 1Doc interno é criada e fornecida previamente pela Prefeitura; não existe cadastro ou criação de acesso por esta página. O endereço institucional utilizado é `https://tangaradaserra.1doc.com.br/b.php?pg=o/login&redirecionar=cGc9cGFpbmVsL2xpc3Rhcg==&n=3`.

## Páginas

- `index.html`: certificados, pesquisa, relatório anual e envio por e-mail;
- `entrar-em-contato.html`: ajuda de uso + pedido de correção pelo 1Doc + canais da SEMEC (a antiga `ajuda.html` só redireciona para cá);
- `politica-privacidade.html`, `acessibilidade.html`, `validar-certificado.html`.

## Imagens leves

As páginas usam as versões leves em `assets/` (`assets/marca`, `assets/mascote`, `assets/brasoes/<ID>.webp`, um arquivo por unidade, mapeados em `js/logos.js`). A pasta `assents/` guarda os originais em alta resolução e não deve ser carregada pelas páginas.

## Identidade visual

Os arquivos têm funções diferentes e não devem ser trocados:

- `assents/sem_fundo/brasao_portal_semec.png`: identidade própria do Portal SEMEC, usada na navegação e no ícone das páginas;
- `assents/sem_fundo/brasao_tangara.png`: brasão oficial da Prefeitura de Tangará da Serra, usado para representar a Prefeitura/SEMEC e como fallback institucional das unidades.
- `assents/sem_fundo/assinatura_roselaine_mezz.png`: assinatura institucional exibida no relatório anual emitido pelo Portal SEMEC.

Os brasões específicos das unidades continuam vinculados por ID estável em `js/escolas.js`. O parâmetro `?escola=` serve somente para pré-visualização; em produção, a unidade autenticada pelo backend prevalece.

## Integração

As únicas ações de backend usadas pela área principal são:

- `IDENTIFICAR_UNIDADE`;
- `LISTAR_CERTIFICADOS`;
- `BUSCAR_CERTIFICADOS`;
- `REGISTRAR_ACESSO_CERTIFICADO`;
- `ENVIAR_CERTIFICADO` (um certificado);
- `ENVIAR_CERTIFICADOS` (vários certificados da mesma pessoa num e-mail só, com os PDFs anexados).

A entrada é feita numa página do Google (implantação institucional do Apps Script), que devolve uma autorização temporária válida por 30 dias neste navegador. As ações vão por `fetch` para a implantação pública, que confere a conta e a unidade em toda ação (`js/backend.js`). A unidade identificada fica guardada por 30 minutos no navegador para as páginas abrirem na hora; ações de leitura são repetidas uma vez sozinhas se a conexão falhar.

O validador público permanece separado em `validar-certificado.html` e exige o ID do certificado e o código completo de autenticidade. A resposta pública não deve expor CPF, matrícula, e-mail, ID interno do servidor, ID do Drive, observações internas ou o hash completo.

## Interface preservada

O projeto mantém o padrão visual aprovado do Portal SEMEC, a navegação lateral, os estados de carregamento/erro/lista vazia, os brasões das unidades e as páginas de Ajuda, Contato, Privacidade e Acessibilidade.

Os nomes estáveis das formações são:

- `FORMACAO_REDE` — Formação em Rede;
- `FORMACAO_CENTRO_ENSINO` — Formação do Centro de Ensino;
- `PALESTRAS_SEMINARIOS` — Palestras e Seminários.

O relatório anual usa essas três etapas em blocos separados. Ele apresenta o campo genérico `Cargo`, não soma as cargas horárias de etapas distintas e identifica o Portal SEMEC como emissor do documento.

## Validação local

O teste usa dados fictícios e uma ponte simulada; não acessa a base institucional:

```text
node tests/integration.spec.js
```

Ele verifica autenticação simulada, listagem, pesquisa por nome, relatório anual por pessoa, orientação de correção via 1Doc, ausência das ações antigas, responsividade e validação da origem/janela dos serviços.

## Menu lateral

O menu lateral é o mesmo das áreas do Portal SEMEC (`portalsemec_tgamt`, ver `DECISOES.md` de lá). Os itens com `data-nav-area="escola"` ou `data-nav-area="semec"` aparecem conforme o tipo da conta (feito em `js/app.js`). Ferramenta nova com página própria entra no menu do Portal e no menu destas cinco páginas (index, ajuda, entrar-em-contato, politica-privacidade, acessibilidade).
