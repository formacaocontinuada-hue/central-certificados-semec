# Central de Certificados — Portal SEMEC

Área institucional de consulta de participações e certificados da Secretaria Municipal de Educação de Tangará da Serra.

## Escopo atual

A Central existe para:

- validar o acesso institucional e identificar a unidade;
- pesquisar qualquer servidor pelo nome;
- consultar participações e certificados;
- visualizar e baixar certificados existentes;
- gerar relatório individual de participação e certificação, pronto para impressão ou salvamento em PDF;
- encaminhar dúvidas e pedidos de correção por e-mail à SEMEC.

Não fazem parte desta etapa: fluxo interno de solicitações, painel de análise, aprovação de reparos, pedido de complemento, acompanhamento de status, correção ou reemissão. O botão **Pedir correção** apenas prepara um e-mail identificado; nenhuma solicitação é gravada no backend do Portal.

## Identidade visual

Os arquivos têm funções diferentes e não devem ser trocados:

- `assents/sem_fundo/brasao_portal_semec.png`: identidade própria do Portal SEMEC, usada na navegação e no ícone das páginas;
- `assents/sem_fundo/brasao_tangara.png`: brasão oficial da Prefeitura de Tangará da Serra, usado para representar a Prefeitura/SEMEC e como fallback institucional das unidades.

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

## Validação local

O teste usa dados fictícios e uma ponte simulada; não acessa a base institucional:

```text
node tests/integration.spec.js
```

Ele verifica autenticação simulada, listagem, pesquisa por nome, relatório individual, modal de correção por e-mail, ausência das ações antigas, responsividade e validação da origem/janela dos serviços.
