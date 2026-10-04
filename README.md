# Central de Certificados — Portal SEMEC

Área institucional de consulta de participações e certificados da Secretaria Municipal de Educação de Tangará da Serra.

## Escopo atual

A Central existe para:

- validar o acesso institucional e identificar a unidade;
- pesquisar qualquer servidor pelo nome;
- consultar participações e certificados;
- visualizar e baixar certificados existentes;
- gerar relatório individual anual por pessoa, separando as participações disponíveis em 2026 nas três etapas institucionais e permitindo impressão ou salvamento em PDF;
- orientar o registro de dúvidas e pedidos de correção pelo 1Doc, canal oficial da Prefeitura.

Não fazem parte desta etapa: fluxo interno de solicitações, painel de análise, aprovação de reparos, pedido de complemento, acompanhamento de status, correção ou reemissão. Não existe botão de correção vinculado ao certificado: a pessoa recebe as orientações e registra a solicitação diretamente na Central de Atendimento 1Doc.

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
- `REGISTRAR_ACESSO_CERTIFICADO`.

A comunicação ocorre por um iframe do Apps Script e uma `MessagePort`. A página valida tanto a origem Google quanto a janela exata do iframe antes de aceitar o canal.

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
