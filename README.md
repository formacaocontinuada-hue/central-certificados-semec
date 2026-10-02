# Central de Certificados SEMEC — visual aprovado + backend

Esta versão mantém o visual aprovado da Área da Escola, os brasões já disponíveis e a integração validada com o backend institucional.

- Identificação automática da unidade e do perfil de acesso pelo Bridge.
- Listagem e pesquisa no `REGISTRO_CERTIFICADOS_2026`.
- Abertura e download do PDF quando o registro oficial fornece o link.
- Envio confirmado por e-mail, com anexo quando disponível e auditoria no backend.
- Histórico de envios com destinatário mascarado na interface.
- Solicitações de reparo com protocolo e acompanhamento de status.
- Estados reais de carregamento, lista vazia, erro e nova tentativa.
- A antiga tela técnica permanece disponível em `teste-backend.html`.

- 33 brasões/identidades específicas de unidades.
- Identidade geral da Educação Escolar Indígena como fallback para escola indígena sem brasão próprio.
- Brasão municipal como fallback para escola não indígena ainda sem brasão.
- Vínculo visual por ID estável da unidade em `js/escolas.js`.
- Para pré-visualizar localmente outra escola, use `index.html?escola=ESC-000009` e troque o ID.

Brasões não indígenas ainda faltantes:
ESC-000002, ESC-000012, ESC-000024 e ESC-000035.

Observação: o parâmetro `?escola=` é somente para teste visual. Em produção, a unidade definida pela autenticação institucional no backend sempre prevalece.


## Regra de nomenclatura das formações
A interface não deve exibir "Etapa 1", "Etapa 2" ou "Etapa 3".
Devem aparecer os nomes das formações:
- Formação em Rede
- Formação do Centro de Ensino
- Palestras e Seminários

O filtro de ano da interface foi mantido somente com 2026.

## Identificadores permanentes das formações
A numeração de etapa não faz parte da interface nem deve ser usada como identificador permanente.

Usar:
- `FORMACAO_REDE` → Formação em Rede
- `FORMACAO_CENTRO_ENSINO` → Formação do Centro de Ensino
- `PALESTRAS_SEMINARIOS` → Palestras e Seminários

Se a ordem/número das etapas mudar durante o ano, a interface permanece correta.

## Ajustes de interface
- Nome institucional exibido: **Secretaria Municipal de Educação de Tangará da Serra**.
- O resultado da pesquisa é exibido imediatamente abaixo do formulário de busca.
- A lista de certificados já disponíveis permanece separada e não é escondida pela pesquisa.

## Páginas de apoio integradas
Conteúdo reaproveitado das páginas já existentes do Portal SEMEC:
- `ajuda.html`: base de Ajuda.
- `entrar-em-contato.html`: conteúdo do Contato Técnico + canais institucionais da página pública de Contato.
- `politica-privacidade.html`: mantém o status **Diretrizes em consolidação**; não foi tratada como política final.
- `acessibilidade.html`: mantém somente os compromissos e orientações já presentes na página original.

O menu de Assistência inclui: Ajuda, Entrar em Contato, Política de Privacidade e Acessibilidade.

## Navegação interna e menu hambúrguer
O menu usa o mesmo contrato do Portal SEMEC:
- inicia fechado também no desktop;
- abre como painel lateral;
- usa backdrop;
- o botão se transforma em fechar;
- fecha ao clicar em item, backdrop, redimensionar, trocar hash ou sair da página.

Páginas de acompanhamento:
- `historico-envios.html`
- `solicitacoes-reparo.html`

O botão `Sair` usa a mesma confirmação visual do Portal e encerra a visualização local no navegador. A autenticação institucional continua sendo controlada pela conta Google reconhecida pelo backend.

Os fluxos de envio, histórico e reparo exigem a implantação da etapa de ações no mesmo Web App do Apps Script. O pacote correspondente fica fora do conteúdo público do GitHub Pages para não expor a implementação interna do backend.


## Validador público
A página `validar-certificado.html` consulta o registro oficial por meio de um Web App público separado do backend institucional da Central.

- Configuração do endpoint em `js/validator-config.js`.
- Validação exige `ID_CERTIFICADO` + código de autenticidade completo.
- A resposta pública não expõe CPF, matrícula, e-mail, ID_SRV, ID do Drive, observações internas ou o hash completo.
- Estados tratados na interface: válido, substituído, cancelado, inativo, inválido e erro.
- A URL pública usada nos QR Codes permanece a do GitHub Pages; o Web App pode ser trocado internamente sem reemitir os certificados.
