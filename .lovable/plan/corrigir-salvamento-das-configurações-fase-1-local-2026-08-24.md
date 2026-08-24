# Corrigir salvamento das Configurações (Fase 1 — local)

## Diagnóstico (verificado no código)

- O botão "Salvar Todas as Configurações" funciona: `saveStoredSettings` grava tudo em `localStorage` (`meupdv_mock_settings_v1`).
- Bug real 1 — tema revertido: o seletor de paleta grava direto no storage via `useTheme`, mas o estado do formulário mantém o `theme` antigo. Ao salvar, o tema volta ao valor anterior.
- Bug real 2 — nada consome as configurações: nenhum componente além da própria tela lê `getStoredSettings()`. Nome da loja no cabeçalho/sidebar, mensagem do cupom, desconto máximo, balança e NFC-e estão fixos no código, então o usuário salva e "não muda nada".
- Não há feedback de alterações pendentes, então dá a impressão de que nada foi persistido.

## O que será feito

1. Hook central `useSettings`
   - Provider único (junto ao `ThemeProvider` no root) que lê o storage, expõe `settings`, `updateSettings` e `saveSettings`, e reage ao evento `meupdv_settings_updated` para manter todas as telas em sincronia.

2. Corrigir o conflito do tema
   - A escolha de paleta passa a alterar o estado do formulário (aplicando o tema na hora) e é gravada junto no "Salvar", em vez de escrever no storage por fora. O `useTheme` passa a ler o tema do `useSettings`.

3. Fazer o app usar as configurações salvas
   - Cabeçalho/sidebar: nome fantasia da empresa vindo das configurações.
   - Frente de caixa: mensagem do rodapé do cupom, pedir identificação do cliente, permitir desconto manual e percentual máximo, impressão automática.
   - Modal de peso / teste de balança: modelo e porta configurados.
   - Modal de NFC-e: ambiente (Homologação/Produção), série e próximo número exibidos a partir das configurações.

4. UX de salvamento
   - Indicador de "alterações não salvas" e botão de salvar desabilitado quando não há mudanças; toast de sucesso mantido; botão "Descartar alterações" que recarrega do storage.

## Detalhes técnicos

- Arquivos novos: `src/hooks/useSettings.tsx`.
- Alterados: `src/data/mock-settings.ts` (merge/validação ao ler), `src/hooks/useTheme.tsx`, `src/routes/configuracoes.tsx`, `src/components/pos/ThemePicker.tsx`, `src/components/pos/AppTopBar.tsx`, `src/components/pos/AppSidebar.tsx`, `src/components/layout/AppLayout.tsx`, `src/components/pos/CouponPanel.tsx`, `src/components/pos/WeightPromptModal.tsx`, `src/components/pos/NfceStepperModal.tsx`, `src/routes/__root.tsx`.
- Persistência continua 100% local (localStorage), sem backend nesta fase; a migração para banco fica para quando o Lovable Cloud for ativado.
- Verificação com Playwright: alterar nome fantasia + paleta, salvar, recarregar a página e confirmar que os valores persistem e aparecem no cabeçalho do PDV.
