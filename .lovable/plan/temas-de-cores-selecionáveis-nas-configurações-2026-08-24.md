# Temas de cores selecionáveis nas Configurações

Adiciona uma nova aba "Aparência" em Configurações onde o operador escolhe entre 3 paletas prontas, com pré-visualização e aplicação imediata em todo o app (PDV, cadastros, modais). A escolha fica salva no navegador, como as demais configurações mock.

## As 3 paletas

1. **Dark Operacional** — fundo azul profundo `#0A1128`, superfícies `#1E293B`, ação principal ciano neon `#00E5FF`, texto `#F8F9FA`, secundário `#94A3B8`.
2. **Clean Corporativa** (padrão) — fundo `#F3F4F6`, cartões `#FFFFFF`, ação principal azul `#2563EB`, texto `#1F2937`, acento `#E0E7FF`.
3. **Alto Contraste (Touch)** — fundo `#FFFFFF`, ação principal laranja `#F97316`, bordas `#E5E7EB`, tiles de produto `#F9FAFB` com borda escura no hover.

## Cores semânticas reservadas (iguais nas 3 paletas)

- Verde `#22C55E`: sucesso, pagamento aprovado, adicionar item, "Finalizar venda".
- Vermelho `#EF4444`: cancelar venda, excluir item, estorno, erro.
- Amarelo/Laranja `#F59E0B`: aguardando pagamento, estoque baixo, venda suspensa.

Essas cores não são usadas para estética geral. Em "Alto Contraste", o laranja de ação de checkout é um token separado (`primary`) para não colidir com o laranja de alerta.

## Onde aparece

- Nova aba **Aparência** em `/configuracoes`: 3 cartões clicáveis, cada um com miniatura da paleta (fundo, superfície, ação, texto) e marca de selecionado.
- Troca aplicada na hora, sem recarregar.
- Botão "Restaurar padrão" volta para Clean Corporativa.

## Detalhes técnicos

- `src/data/mock-settings.ts`: novo campo `theme: "DARK_OPERACIONAL" | "CLEAN_CORPORATIVA" | "ALTO_CONTRASTE"` com default `CLEAN_CORPORATIVA`, persistido no mesmo `localStorage` já usado (com fallback para settings antigos sem o campo).
- `src/styles.css`: manter os tokens semânticos atuais; adicionar blocos de paleta por atributo `[data-theme="..."]` sobrescrevendo `--background`, `--card`, `--surface`, `--primary`, `--foreground`, `--muted-foreground`, `--border`, `--accent`, `--sidebar*`, e fixar `--success` / `--destructive` / `--warning` nos valores semânticos em todas as paletas (convertidos para `oklch`, formato exigido pelo projeto).
- Novo `src/hooks/useTheme.tsx` (provider montado em `src/routes/__root.tsx` dentro de `AuthProvider`): lê o tema salvo, escreve `data-theme` e a classe `dark` no `<html>`, ouve o evento `meupdv_settings_updated` já disparado por `saveStoredSettings`, e evita mismatch de hidratação aplicando o atributo em `useEffect`.
- Novo `src/components/pos/ThemePicker.tsx` com os 3 cartões de paleta, usado na aba Aparência.
- `src/routes/configuracoes.tsx`: adicionar o `TabsTrigger`/`TabsContent` "Aparência" (ícone de paleta) e renderizar o `ThemePicker`.
- Sem mudanças em regras de negócio; nenhum componente passa a usar cor fixa — tudo continua via tokens semânticos.
