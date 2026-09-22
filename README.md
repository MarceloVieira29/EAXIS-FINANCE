# Painel Financeiro EAXIS — Estrutura em Camadas

O painel foi dividido em arquivos separados para permitir corrigir **uma
camada isolada** sem reenviar (nem arriscar) as outras. A regra geral é:
**cada tipo de correção tem um único arquivo-alvo.**

```
index.html              <- Estrutura (HTML). Praticamente nunca muda.
css/
  tokens.css             <- Cores do tema (claro/escuro). Muda em ajuste visual de cor.
  components.css          <- Estilo dos componentes (cards, tags, botões, modais).
js/
  tailwind-config.js      <- Config do design system (tipografia, espaçamento, raio).
  business-logic.js       <- REGRA DE NEGÓCIO. Cálculos, dados, PIN, backup, export.
  ui-extras.js             <- Extras de interface (sincronismo de tema, foto do usuário).
```

## Qual arquivo editar em cada tipo de correção

| Tipo de correção que você pede                                  | Arquivo a atualizar         |
|-------------------------------------------------------------------|------------------------------|
| "A cor tal está errada", "fundo claro sem contraste"              | `css/tokens.css`             |
| "O botão X não tem destaque", "o badge de categoria sumiu"        | `css/components.css`         |
| "Corrige o cálculo de saldo", "o autozerar futuros está errado"   | `js/business-logic.js`       |
| "Quero trocar a foto do usuário", "o toggle de tema não aplica"   | `js/ui-extras.js`            |
| "Quero adicionar um novo campo no formulário de lançamento"       | `index.html` **+** possivelmente `js/business-logic.js` |
| Fonte, espaçamento, raio de borda do design system                | `js/tailwind-config.js`      |

## Por que isso protege a regra de negócio

`js/business-logic.js` é o único arquivo que:
- lê/grava no `localStorage` (`PF_CLIENTES_V5`, `PF_THEME_V1`, `PF_PIN_V1`);
- calcula receitas, despesas, saldo e futuros;
- gera a exportação Excel e o backup/import JSON;
- controla o bloqueio por PIN.

Nenhuma correção de estilo (`css/*`) ou de estrutura visual sem impacto de
dado (`index.html`, quando limitada a texto/classe) toca nesse arquivo.
Do mesmo jeito, ajustar `js/business-logic.js` nunca precisa mexer no CSS.

**Regra de ouro ao editar `index.html`:** nunca remova nem renomeie um
atributo `id="..."`. O `js/business-logic.js` procura os elementos exatamente
por esses IDs (`document.getElementById(...)`); removê-los quebra a lógica
mesmo sem tocar no arquivo de JS.

## Hospedagem

Qualquer host de arquivos estáticos serve (GitHub Pages, Netlify, Vercel,
S3 + CloudFront, cPanel, etc.) — é só subir a pasta inteira mantendo essa
estrutura de subpastas. Ao corrigir algo, suba **apenas o arquivo alterado**
para o mesmo caminho; os outros continuam servindo a versão anterior sem
precisar de novo deploy completo.

### Cache do navegador
Como os arquivos passam a ser referenciados por caminho fixo
(`css/tokens.css`, `js/business-logic.js`...), navegadores podem cachear a
versão antiga depois de uma correção. Para forçar atualização, acrescente
uma "versão" na URL do arquivo alterado, por exemplo:

```html
<script src="js/business-logic.js?v=2"></script>
```

Suba o arquivo normalmente e só troque o número `?v=` no `index.html`
quando quiser garantir que o navegador do usuário baixe a versão nova.
