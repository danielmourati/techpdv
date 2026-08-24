# Ajustes de layout do caixa (3 anexos)

Trabalho apenas visual/frontend, sem mexer em regras de venda.

## 1. Topo: espaço para o logo do estabelecimento (anexo 1)

- No topo (`AppTopBar`), colocar o logo do estabelecimento à esquerda, ao lado do botão do menu: quadro branco com o logo e, ao lado, "Frente de Caixa" + nome fantasia (como no anexo).
- O logo vem das Configurações: novo campo opcional `logoUrl` em Configurações > Empresa (URL da imagem). Sem imagem definida, mostra as iniciais da loja ("PD") no mesmo quadro — nada quebra.
- Faixa azul do "Produto Atual" (`CurrentProductBar`): remover o card branco "PRODUTO ATUAL / Item lançado no cupom" da esquerda, que hoje concorre com o topo. O nome do produto e o total do item ganham essa largura; o estado ("Aguardando leitura") passa a ser uma legenda discreta acima do nome, dentro do card central.

## 2. Cupom: voltar à paleta padrão e reduzir largura (anexo 2)

- `CouponPanel`: trocar todos os tons amarelados fixos (`#F3F4C9`, `#ebeca8`, `#dedfa8`, `#e2e39c`, `stone-*`) pelos tokens do design system (`bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`) — assim o cupom acompanha as paletas Clean / Dark / Alto Contraste.
- Item selecionado passa a usar `bg-accent` + borda esquerda `primary`; total e "Finalizar Venda" continuam em azul e verde semânticos.
- Reduzir a coluna do cupom na grade do caixa: de `28rem` para `22rem` (`24rem` em telas 2xl), devolvendo espaço ao centro.

## 3. Sidebar: largura e azul só quando expandido (anexo 3)

- Reduzir a largura da barra recolhida (trilha de ícones) para ficar mais justa, e a expandida para ~15rem, via variáveis `--sidebar-width` / `--sidebar-width-icon` no `SidebarProvider`.
- Recolhida: fundo neutro (`bg-sidebar`/card) com ícones em azul, ativo com fundo azul suave.
- Expandida: fundo azul cheio como hoje (itens brancos, ativo em branco com texto azul).
- Cabeçalho (logo) e rodapé (usuário) seguem a mesma regra de cor, então nada de bloco azul solto quando recolhida.

## Detalhes técnicos

- Arquivos: `src/components/pos/AppTopBar.tsx`, `CurrentProductBar.tsx`, `CouponPanel.tsx`, `AppSidebar.tsx`, `src/routes/index.tsx` (larguras da grade + provider), `src/data/mock-settings.ts` e `src/routes/configuracoes.tsx` (campo do logo).
- Cores por variante do sidebar via `group-data-[state=collapsed]:` / `group-data-[state=expanded]:` nas classes, sem estado extra em JS.
- Verificação com Playwright: caixa recolhido e expandido, cupom com item, e troca de paleta em Configurações.

## Correções de tipo pendentes (entram junto)

Erros de TypeScript já existentes no projeto, corrigidos na implementação:
- `CashShiftModal.tsx` / `useCashShift.tsx`: campos opcionais (`differenceReason`, `adminPassword`, `adminAuthorizedBy`) precisam aceitar `undefined` ou ser omitidos (regra `exactOptionalPropertyTypes`).
- `src/routes/index.tsx`: acessos a `MOCK_USERS[0]` / `MOCK_USERS[1]` sem verificação de existência.
