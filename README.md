# Central de Certificados SEMEC — visual aprovado + brasões

Esta versão mantém o visual aprovado da Área da Escola e adiciona os brasões já disponíveis.

- 33 brasões/identidades específicas de unidades.
- Identidade geral da Educação Escolar Indígena como fallback para escola indígena sem brasão próprio.
- Brasão municipal como fallback para escola não indígena ainda sem brasão.
- Vínculo visual por ID estável da unidade em `js/escolas.js`.
- Para pré-visualizar localmente outra escola, use `index.html?escola=ESC-000009` e troque o ID.

Brasões não indígenas ainda faltantes:
ESC-000002, ESC-000012, ESC-000024 e ESC-000035.

Observação: o parâmetro `?escola=` é somente para teste visual. Em produção, a unidade será definida pela autenticação institucional no backend.


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

O botão `Sair` usa a mesma confirmação visual do Portal. Nesta versão estática, encerra a sessão da prévia no navegador. Quando a autenticação institucional for conectada ao backend, esse mesmo botão será ligado ao encerramento real da sessão.
