# Frente de Caixa — Fase 1 (layout + design system, dados mock)

Tela única de PDV em `/`, sem backend, com todos os produtos e vendas vindo de JSON mock. Aguardo os prints (image_0 a image_3) para calibrar detalhes visuais; a estrutura abaixo já segue a descrição (azul profundo sobre fundo branco, densidade de caixa, sem scroll vertical na área central).

## Design system

- Tokens em `src/styles.css` (oklch): azul profundo como `primary`, verde de confirmação como `success`, cinzas neutros de superfície/borda, além de `warning`/`destructive` para status de caixa.
- Raio pequeno (cantos quase retos, estilo operacional), tipografia sem serifa condensada para números grandes, escala tabular nos valores monetários.
- Componentes reutilizáveis: `Button` (primário, sucesso, fantasma, tecla-atalho), `Card`/`Panel`, `Input` de leitura de código, `KeyHint` (badge de atalho F2/F4/etc.), `MoneyValue`, `StatusPill`.

## Layout da tela de caixa (sem scroll vertical)

```text
+------------------------------------------------------------------+
| Venda 7 R$20,00 | Venda 8 R$40,00 | ...        [+ Nova venda]    |
+---------------------------------------+--------------------------+
| PRODUTO ATUAL                         | CUPOM DA VENDA           |
|  2 x REFRIGERANTE     [imagem]        |  item / qtd -+ / unit    |
|  unit R$20,00   Total item R$40,00    |  ...                     |
|---------------------------------------|                          |
| [Digite ou leia o produto      ]      |  (lista rolável só aqui) |
| [Qtd] [Valor]   atalhos               +--------------------------+
|---------------------------------------|  TOTAL DA VENDA R$ 40,00 |
| tiles de adição rápida                |  [ Finalizar Venda ]     |
+---------------------------------------+--------------------------+
| Estoque: 42 | Valor unit: R$20,00 | CAIXA OCUPADO                |
+------------------------------------------------------------------+
```

- Header multi-venda: abas selecionáveis por sessão aberta + botão "Nova venda"; troca de venda muda cupom, produto atual e totais (estado local).
- Área central: bloco "Produto Atual" com nome, quantidade, preço unitário, total do item e imagem placeholder; busca estilo AJAX filtrando o mock a cada tecla; campos rápidos de quantidade e valor; grade de tiles de produtos frequentes.
- Cupom à direita: itens com +/-, remoção, unitário e total por item; rodapé fixo com TOTAL DA VENDA e botão verde "Finalizar Venda".
- Barra inferior: estoque, valor unitário e status do caixa.
- Responsivo: em telas estreitas o cupom vira painel deslizante; grid `minmax(0,1fr)` e `min-w-0` para não estourar textos.

## Fluxos de checkout (mockados)

- Modal PIX: placeholder de QR Code, contagem regressiva, botão "Copiar código PIX" (feedback via toast), lista de métodos alternativos (dinheiro, débito, crédito) e ação de cancelar.
- Modal NFC-e: stepper com checklist (preparando dados, reservando número, assinando, enviando à SEFAZ, autorizada), progresso animado simulado por timers, estados de sucesso e erro, ações "Imprimir DANFE" / "Fechar".
- Ambos disparados a partir de "Finalizar Venda", com estado de fluxo em memória.

## Teclado

Atalhos globais: foco automático na busca, `Enter` adiciona item, `F2` quantidade, `F4` finalizar, `Esc` fecha modal, setas navegam entre abas de venda. Dicas de tecla visíveis nos botões.

## Detalhes técnicos

- `src/routes/index.tsx` substitui o placeholder e monta a tela de caixa; `head()` próprio com título/descrição do PDV.
- Componentes em `src/components/pos/` (SaleTabs, CurrentProduct, ProductSearch, QuickAddGrid, CouponPanel, StatusBar, PixModal, NfceStepperModal) e primitivos em `src/components/ui/`.
- Mock em `src/data/mock-products.ts` e `src/data/mock-sales.ts`; estado das vendas em um hook `useSalesSessions` (reducer em memória, sem persistência).
- Toaster (sonner) montado uma vez no root para feedbacks.
- Sem Lovable Cloud, sem server functions nesta fase.

## Fora do escopo (fases seguintes)

Persistência de vendas, integração real de PIX/SEFAZ, autenticação, catálogo administrável e relatórios.
