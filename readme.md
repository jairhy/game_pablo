# The Bizarre Adventures of Pablo and Argemilio

![Banner do Jogo](https://i.imgur.com/zPauFeS.png)

## 1. Identificação do Projeto

- **Título do Projeto:** The Bizarre Adventures of Pablo and Argemilio
- **Desenvolvedor:** Jair Hyan Fernandes da Silva
- **Status:** Em produção (Vercel)

---

## 2. Visão Geral do Sistema

### Estrutura de Pastas

```
game_pablo/
├── index.html
├── index.js
├── style.css
├── pablo.html
├── readme.md
├── banner.png
├── background3.jpg
├── jk1.png
├── jk2.png
├── jk3.png
├── diagrama_caso_de_uso.png
├── diagrama_classe.png
├── diagrama_sequencia.png
├── diagramas_UML.asta
├── img/
└── models/
```

### Descrição

Este software é um game de ação espacial (Shoot 'em up) desenvolvido em JavaScript puro utilizando a API Canvas. O jogador controla naves em um ambiente bizarro e perigoso.

### Objetivo

Sobreviver às hordas de meteoros e projéteis inimigos, acumulando pontuação para progredir e derrotar o grande vilão final: **John Cracker**.

### 🛠 Regras de Negócio (Lógica do Jogo)

1. **Sistema de Pontuação:**
   - O jogador ganha pontos ao destruir inimigos e meteoros na fase.
2. **Progressão de Fases:**
   - A mudança de fase não é por tempo, mas por desempenho. O jogo troca automaticamente de nível assim que o jogador atinge uma quantidade determinada de pontos.
3. **Mecânica de Vida (HP):**
   - Cada jogador possui uma barra de saúde. Colisões com inimigos ou lasers vermelhos reduzem a vida.
   - O jogo termina (Game Over) se a vida chegar a 0.
4. **Coletáveis de Cura:**
   - O item de **Coração (❤️)** aparece aleatoriamente. Ao colidir com ele, o jogador recupera exatamente **2 pontos de HP**.
5. **Combate de Chefe (Boss Fight):**
   - Ao chegar no estágio final, surge o "John Cracker". Ele possui uma barra de vida persistente (60 HP) e padrões de ataque em leque que exigem desvio preciso.

---

## 3. Instruções de Jogabilidade

O jogo suporta modo cooperativo local:

| Comando              | Player 1 (Pablo) | Player 2 (Argemilio) |
| :------------------- | :--------------- | :------------------- |
| **Mover para Cima**  | Tecla `W`        | `Seta para Cima`     |
| **Mover para Baixo** | Tecla `S`        | `Seta para Baixo`    |
| **Atirar**           | Tecla `F`        | `Tecla Espaço`       |

---

## 4. Especificações Técnicas e Créditos

### Tecnologias

- **Linguagem:** JavaScript (ES6+)
- **Renderização:** HTML5 Canvas API
- **Hospedagem:** Vercel

### Créditos (Sobre)

- **Desenvolvedor:** Jair Hyan Fernandes da Silva (17 anos, Dev)
- **Product Owner / Orientador:** Professor Carlos (Dev experiente desde a década de 90)

---

## 5. Instruções de Instalação e Execução

1. **Clonagem:**
   ```bash
   git clone https://github.com/jairhy/game_pablo.git
   ```
2. **Execução:**
   - Abra o arquivo `index.html` em qualquer navegador moderno.

---

## 6. Link de Produção

🚀 **[Acesse o jogo no Vercel](https://game-pablo.vercel.app)**

---

## 7. Especificações de Engenharia (RNFs)

- **Tecnologia (RNF01):** Desenvolvido em **JavaScript Moderno (ES6+)** com Programação Orientada a Objetos, sem necessidade de compiladores.
- **Portabilidade (RNF02):** Execução nativa via **HTML5 Canvas**, garantindo que o jogo rode em qualquer sistema operacional via navegador.
- **Interface (RNF03):** Layout otimizado para **1920x1080px**, com elementos de UI (HUD, barras de vida e notificações) posicionados via lógica matemática de coordenadas.
- **Performance (RNF04):** Motor de renderização focado em fluidez, utilizando ciclos de atualização otimizados para manter **60 FPS** estáveis.