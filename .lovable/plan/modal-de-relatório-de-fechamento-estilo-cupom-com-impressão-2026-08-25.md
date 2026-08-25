# Modal de Relatório de Fechamento (estilo cupom) com impressão resumida e completa

## O que será entregue

Um modal de relatório do turno de caixa, desenhado como um cupom de impressora térmica (fonte mono, bordas picotadas, largura estreita), com três ações no rodapé:

- **Fechar** — apenas fecha o modal.
- **Imprimir cupom (resumido)** — imprime o próprio cupom em formato 80mm, sem levar o resto da tela para a impressão.
- **Relatório completo (A4)** — abre uma nova aba com o relatório gerencial em layout A4 (preview de impressão), com o diálogo de impressão do navegador disparado automaticamente.

O modal aparece:
- automaticamente após o fechamento do caixa (substituindo o modo "comprovante" atual do fechamento);
- e por um botão "Relatório do turno" na lista de turnos já encerrados (histórico), reaproveitando o mesmo componente.

## Conteúdo do cupom (resumido)

Cabeçalho com nome fantasia/logo textual do estabelecimento, título "RELATÓRIO DE FECHAMENTO DE CAIXA", número/id do turno, operador, data e horas de abertura e encerramento. Corpo com: fundo inicial, vendas em dinheiro, PIX, cartão débito, cartão crédito, total de vendas, quantidade de cupons, saldo esperado na gaveta, valor contado e diferença (verde = exato, vermelho = quebra, amarelo = sobra). Quando houver divergência, a justificativa e o administrador autorizador. Rodapé com data/hora da emissão e aviso de documento não fiscal.

## Conteúdo do relatório completo (A4)

Mesmo conjunto de dados, apresentado em página A4 com: cabeçalho com identificação do estabelecimento e do turno, blocos de totais por forma de pagamento, bloco de conferência da gaveta (esperado × contado × diferença), tabela das vendas do turno (código, hora, forma de pagamento, valor, status) e área de assinaturas (operador / responsável). É gerado como HTML autocontido escrito em uma nova aba, então não depende do CSS do app nem afeta a tela atual.

## Detalhes técnicos

- Novo componente `src/components/pos/ShiftReportModal.tsx`: recebe `shift: CashShift`, `sales: CompletedSale[]`, `open`, `onOpenChange`. Renderiza o cupom dentro de um `Dialog` com um contêiner `id="shift-receipt-print"` e classe `print-receipt`.
- Novo módulo `src/lib/shift-report.ts`:
  - `buildShiftReportHtml(shift, sales, store)` → string HTML completa (com `@page { size: A4; margin: 12mm }` embutido) para o relatório A4;
  - `openShiftReportPreview(...)` → `window.open("", "_blank")`, `document.write` do HTML e `onload → window.print()`, com fallback em toast caso o popup seja bloqueado.
  - helper para filtrar as vendas do turno (mesma regra de janela temporal já usada em `useCashShift`), extraída para reuso.
- Impressão do cupom: regras `@media print` em `src/styles.css` escondendo tudo exceto `.print-receipt` (largura 80mm, fonte mono, sem sombras/bordas coloridas), evitando imprimir o app inteiro como hoje.
- `src/components/pos/CashShiftModal.tsx`: o modo `RECEIPT` passa a delegar para `ShiftReportModal` (mesmos dados de `closedSummary`), mantendo o fluxo e as validações de fechamento intactos.
- Loja/estabelecimento vem de `useSettings` (nome fantasia, CNPJ e logo quando houver); as vendas vêm de `getStoredSalesHistory()`. Nenhuma mudança em regras de fechamento, cálculo de divergência ou persistência.
