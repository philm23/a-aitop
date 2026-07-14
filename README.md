# Padaria Contemporânea — Viseu 🥖

Site one-page da Padaria Contemporânea (Rua Quinta D'El Rei 265, Viseu), construído em HTML, CSS e JavaScript puros — sem frameworks nem dependências.

## Destaques de motion & interatividade

- **Loader de entrada** com transição para o hero
- **Hero** com animação letra a letra, blobs em parallax e elementos SVG flutuantes
- **Marquees infinitos** cuja velocidade reage à velocidade do scroll
- **Secção "Conceito"** pinned — o texto acende palavra a palavra à medida que se desliza
- **Contadores animados** (4,7 ★, 210+ avaliações, …) disparados ao entrar no viewport
- **Galeria de produtos** com scroll horizontal ligado ao scroll vertical (secção pinned)
- **Cartões de avaliações** com efeito tilt 3D ao passar o rato
- **Horário inteligente** — destaca o dia de hoje e mostra "Aberto/Fechado agora" em tempo real
- **Barra de progresso** de leitura e navegação que se esconde ao descer
- Suporte completo a `prefers-reduced-motion` (todas as animações são desativadas)

## Estrutura

```
index.html      — conteúdo e estrutura
css/style.css   — design system + animações
js/main.js      — scroll engine (rAF), IntersectionObserver, splits de texto
```

## Como correr

É um site estático — basta abrir o `index.html` ou servir a pasta:

```bash
python3 -m http.server 8000
```
