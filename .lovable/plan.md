# Estudo: balança de bancada (peso automático) + emissão de NFC-e

Escopo desta entrega: apenas o estudo/plano. Nenhum código será alterado agora.

## Parte 1 — Peso automático da balança de bancada

A balança fala por porta serial (RS-232 ou USB-serial) no PC do caixa. Isso é acesso a hardware local: nem o navegador comum nem o servidor do app alcançam a porta sozinhos. Existem dois caminhos viáveis.

### Opção A — Web Serial API no próprio navegador (recomendada para começar)
- Funciona em Chrome/Edge desktop, em página HTTPS, com um clique inicial do operador autorizando a porta ("Conectar balança"). A permissão é lembrada por origem.
- O app abre a porta (baud rate/paridade conforme o modelo), lê o fluxo de texto e extrai o peso.
- Sem instalar nada na loja. Não funciona em Firefox/Safari nem no iOS/Android.

### Opção B — Agente local (bridge)
- Um pequeno serviço instalado no PC do caixa expõe o peso via WebSocket/HTTP em `localhost`, e o app consome.
- Funciona em qualquer navegador e com balanças mais exóticas, mas exige instalador, atualização e suporte em cada máquina.

Sugestão: implementar A e deixar a camada de leitura abstraída, de forma que B entre depois como "driver" alternativo sem mexer na tela.

### O que precisa existir no app
- Camada de leitura de peso com uma interface única (`readWeight()` / assinatura de eventos), com implementações: `web-serial`, `bridge-local`, `manual` (o modal de digitação que já existe) e `mock`.
- Parsers por protocolo de balança. Cada fabricante tem seu formato de string; Toledo, Filizola e Urano diferem em prefixos, casas decimais e caractere terminador. Precisamos saber os modelos reais para escrever/validar os parsers — sem isso ficam genéricos.
- Estado de conexão visível: conectada / sem resposta / peso instável, e sempre a saída manual como plano B.
- Regras de operação: só aceitar peso estável, ignorar peso zero ou negativo, tara, peso máximo, e travar o lançamento se a balança sumir no meio da venda.
- Tela de configuração: escolher porta, protocolo, baud rate, e um botão de teste que mostra o peso lido em tempo real.
- Integração com o fluxo atual: ao ler um produto com `soldByWeight`, se a balança estiver conectada o peso entra sozinho (com confirmação rápida); se não, abre o modal de digitação como hoje.

### Limitações a assumir
- Fiscalmente, balança usada em venda direta ao consumidor precisa ser aferida/selada pelo INMETRO — isso é da loja, não do software.
- Web Serial só em HTTPS e navegador desktop baseado em Chromium.

## Parte 2 — Emissão de NFC-e via provedor (API REST)

Emitir por provedor (PlugNotas, Focus NFe, WebmaniaBR, Nuvem Fiscal e similares) evita XML, assinatura digital e comunicação direta com a SEFAZ. O app envia um JSON da venda e recebe a nota autorizada, a chave de acesso, o XML e o DANFE.

### Pré-requisitos do lado da loja (bloqueantes, não são código)
- Certificado digital A1 (arquivo + senha) da empresa.
- Inscrição estadual habilitada para NFC-e e credenciamento na SEFAZ do estado.
- CSC / Token do CSC emitido pela SEFAZ (obrigatório para o QR Code da NFC-e).
- Regime tributário e dados fiscais por produto: NCM, CFOP, CEST quando aplicável, origem, unidade tributável, CST/CSOSN, alíquotas de ICMS/PIS/COFINS.

Sem esses dados por produto não existe emissão válida — hoje o mock de produtos não os tem.

### O que precisa existir no app
- Cadastro fiscal da empresa (emitente): CNPJ, IE, endereço, CRT, série e numeração da NFC-e, ambiente (homologação/produção).
- Campos fiscais no cadastro de produto, mais um cadastro de perfis tributários reutilizáveis para não preencher item por item.
- Persistência real das vendas (hoje tudo é estado local em memória): venda, itens, pagamentos, e uma tabela de documentos fiscais com status, chave de acesso, número, protocolo, XML e URL do DANFE.
- Camada de emissão no servidor: monta o payload a partir da venda, chama o provedor, guarda o retorno. Chave da API do provedor fica como segredo do servidor, nunca no navegador.
- Máquina de estados do documento: rascunho → enviado → autorizado / rejeitado → cancelado / inutilizado, com reenvio idempotente para não duplicar nota em caso de timeout.
- Tratamento de rejeição legível para o operador (a SEFAZ devolve códigos crus) e retentativa.
- Cancelamento (janela legal curta, geralmente 30 minutos) e carta de correção não se aplica a NFC-e.
- Contingência offline (modelo "offline" da NFC-e): permitir concluir a venda sem internet e transmitir depois. Isso é um bloco de trabalho por si só; pode ficar para uma fase seguinte.
- Impressão: DANFE NFC-e em 80mm na impressora térmica, mais QR Code. Impressão direta de térmica pelo navegador é limitada — na prática vai por PDF/HTML de 80mm ou pelo agente local (o mesmo da Opção B da balança).
- Substituir o `NfceStepperModal` mockado pelo status real da emissão, reaproveitando a interface que já existe.

## Ordem sugerida de implementação

1. Backend e persistência de vendas (pré-requisito de tudo em NFC-e).
2. Cadastro fiscal do emitente e campos fiscais de produto com perfis tributários.
3. Integração com um provedor em ambiente de homologação, ligada ao stepper existente.
4. Cancelamento, reenvio, tratamento de rejeições e impressão do DANFE 80mm.
5. Leitura de peso por Web Serial, com fallback manual e tela de configuração.
6. Contingência offline e, se necessário, o agente local para balanças/impressoras fora do padrão.

## Informações que preciso de você para detalhar as fases

- Modelo(s) e protocolo das balanças de bancada.
- Provedor de NFC-e preferido (ou se quer uma recomendação com custo/cobertura).
- Estado(s) de operação e regime tributário da empresa (Simples Nacional muda CSOSN).
- Modelo da impressora térmica.
- Se a loja opera com internet instável (define a prioridade da contingência offline).
