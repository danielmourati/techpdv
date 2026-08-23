# Frente de Caixa — Sidebar, área do produto e venda por peso

## O que muda na tela

1. **Menu lateral com ícones (novo)**
  - Sidebar sempre retraída com botão de expandir fixa à esquerda em todas as telas, recolhível (modo ícone) via botão de menu.
  - Itens padrão: Caixa (Frente de caixa), Vendas, Produtos, Clientes, Fornecedores, Estoque, Financeiro, Relatórios, Configurações.
  - Grupos: "Operação" (Caixa, Vendas), "Cadastros" (Produtos, Clientes, Fornecedores, Estoque), "Gestão" (Financeiro, Relatórios), "Sistema" (Configurações).
  - Apenas o item Caixa navega para `/` nesta fase; os demais ficam visíveis e marcados como em breve (sem rota, sem página em branco).
  - Rodapé da sidebar com operador (DANIEL) e caixa aberto.
2. **Header atual removido/remodelado**
  - O topbar com breadcrumb + ícones de notificação/sincronizar/preferências sai.
  - No lugar, uma faixa fina no topo da área de conteúdo: botão de recolher sidebar, nome da loja e título "Frente de caixa", e à direita apenas status do caixa (aberto/valor) — sem ícones decorativos.
3. **Barra de atendimentos removida**
  - Saem as abas "Venda 7/8/9", os cards de venda e o botão "+ Nova venda".
  - A venda ativa passa a ser única na tela; o atalho F9 (nova venda) deixa de existir e o hook continua servindo uma sessão só.
4. **Área do produto ampliada**
  - A faixa "Produto atual" cresce: bloco maior, respirando mais, com nome do produto em fonte bem maior (escala tipo `text-4xl`/`text-6xl` conforme largura) e código/unidade abaixo.
  - A coluna lateral do produto (imagem + estoque/valores/status) fica mais larga e a imagem ganha mais altura, aproveitando o espaço liberado pela barra de atendimentos.
  - Nada de scroll vertical no conteúdo principal: continua tudo em grid de altura fixa.
5. **Fator de multiplicação no input de código**
  - No mesmo campo de "Código de barras, código ou nome", aceitar `3*7891000100101`, `3x refrigerante` ou `2 * 5` (quantidade antes do separador `*` ou `x`).
  - O fator preenche automaticamente o campo Quantidade e o total do item; ao dar Enter lança o produto com a quantidade multiplicada.
  - Dica visual dentro do campo ("use 3*código para multiplicar") e badge mostrando o fator detectado enquanto digita.
6. **Produto vendido por peso (mock)**
  - Novos itens no mock com `unit: "KG"` e `soldByWeight: true` (ex.: BANANA PRATA KG, TOMATE KG, FILE DE FRANGO KG, QUEIJO MUSSARELA KG).
  - Ao selecionar/ler um produto por peso, abre um passo de digitação de peso: teclado numérico simples, campo em kg com 3 decimais, prévia do total (peso × preço/kg) e confirmação por Enter.
  - No cupom, itens por peso exibem `1,250 KG × R$ 8,90/kg`; os botões +/- ajustam em 0,100 kg em vez de 1 unidade.
  - Também suporta código de balança (prefixo `2` + código + peso) como atalho de mock, preenchendo o peso automaticamente.

## Detalhes técnicos

- Sidebar com `@/components/ui/sidebar` (`SidebarProvider`, `collapsible="icon"`), envolvendo o layout em `src/routes/__root.tsx`; `w-full` no wrapper. Trigger sempre visível na faixa superior.
- Novo `src/components/pos/AppSidebar.tsx`; `AppTopBar.tsx` reescrito como faixa enxuta (ou substituído por `PosHeader.tsx`); `SaleTabs.tsx` removido do layout e do arquivo de rota.
- `CurrentProductBar.tsx`: tipografia/altura maiores; `ProductSidebar.tsx` mais larga (grid de `index.tsx` passa de `11rem` para ~`16rem`).
- Parsing do fator em `src/lib/parse-input.ts` (`parseFactorTerm`) usado por `ProductSearch.tsx`, sem tocar no hook de vendas.
- `mock-products.ts`: campo opcional `soldByWeight`; `mock-sales.ts` sem mudança estrutural. `useSalesSessions` ganha incremento configurável por unidade (0,1 para KG) mantendo o resto igual.
- Novo `WeightPromptModal.tsx` (dialog shadcn) para digitar o peso; foco automático no input e Enter confirma, Esc cancela.