const canvas = document.getElementById("des");
des = canvas.getContext("2d");

// ── Jogador 1: WASD + F para atirar ──
// ── Jogador 2: Setas + Espaço para atirar ──
let nave1 = new NavePlayer(330, 300, 220, 240, "./img/pingu67.png", 1);
let nave2 = new NavePlayer(330, 650, 220, 240, "./img/nave2.png", 2);

const meteoros = [
  new Meteoro(
    canvas.width + 100,
    Math.random() * (canvas.height - 745),
    745,
    745,
    "./img/meteoro.png",
  ),
  new Meteoro(
    canvas.width + 500,
    Math.random() * (canvas.height - 745),
    745,
    745,
    "./img/meteoro.png",
  ),
  new Meteoro(
    canvas.width + 900,
    Math.random() * (canvas.height - 745),
    745,
    745,
    "./img/meteoro.png",
  ),
];
meteoros.forEach((m) => (m.vel = 11));

const explosoes = [new Explosion(), new Explosion(), new Explosion()];
const explosao_boss = new Explosion();

let boss = new Boss(0, 0, 600, 600, "./img/boss.png");
let boss_apareceu = false;
let boss_message = new BossMessage();

let laser1 = new Laser("#00FFFF");
let laser2 = new Laser("#FFFF00");
const lasers_player = [laser1, laser2];

let notificacoes = new Notificacao();
let tela_vitoria = new TelaVitoria();
let venceu = false;

let t1 = new Text();
let t2 = new Text();
let fase_txt = new Text();

let coracao = new Coracao();

let trilha = new Audio();
trilha.src = "./img/trilha.mp3";
trilha.volume = 0.2;
trilha.loop = true;

let batida = new Audio("./img/batida.mp3");
batida.volume = 0.5;

let som_laser = new Audio("./img/laser.mp3");
som_laser.volume = 0.4;

let som_explosao = new Audio("./img/explosion.mp3");
som_explosao.volume = 0.6;

let som_vitoria = new Audio("./img/vitoria.mp3");
som_vitoria.volume = 0.8;

let som_tiro_boss = new Audio("./img/laser_boss.mp3");
som_tiro_boss.volume = 0.5;

let som_dano_boss = new Audio("./img/danoBoss.mp3");
som_dano_boss.volume = 0.5;

let som_game_over = new Audio("./img/gameOver.mp3");
som_game_over.volume = 0.9;

let som_boss_aparece = new Audio("./img/inicio.mp3");
som_boss_aparece.volume = 0.9;

let jogar = true;
let fase = 1;
let motorCarregado = false;
let dano_cooldown = 0;

const LASER_COOLDOWN_MAX = 30;
let laser_cooldown1 = 0;
let laser_cooldown2 = 0;

const PONTOS_FASE2 = 200;
const PONTOS_FASE3 = 400;
let pontos_compartilhados = 0;

const teclas = {};
const naves = [nave1, nave2];

function atualizar_bg() {
  document.body.className = "fase-" + fase;
}
atualizar_bg();

trilha.addEventListener("canplaythrough", () => {
  motorCarregado = true;
});

// ── Reiniciar jogo ──
function reiniciar() {
  nave1.x = 330;
  nave1.y = 300;
  nave1.vida = 10;
  nave1.dir = 0;
  nave2.x = 330;
  nave2.y = 650;
  nave2.vida = 10;
  nave2.dir = 0;

  meteoros.forEach((m, i) => {
    m.x = canvas.width + 100 + i * 400;
    m.y = Math.random() * (canvas.height - 745);
    m.vel = 11;
  });

  explosoes.forEach((e) => {
    e.ativo = false;
    e.particulas = [];
  });
  explosao_boss.ativo = false;
  explosao_boss.particulas = [];

  laser1.ativo = false;
  laser2.ativo = false;

  boss.ativo = false;
  boss.morreu = false;
  boss.desintegrando = false;
  boss.vida = boss.vidaMax;
  boss.lasers = [];
  boss.fragmentos = [];
  boss.flash_morte = 0;
  boss.timer_morte = 0;
  boss_apareceu = false;

  coracao.recomeca();

  pontos_compartilhados = 0;
  fase = 1;
  jogar = true;
  venceu = false;
  dano_cooldown = 0;
  laser_cooldown1 = 0;
  laser_cooldown2 = 0;
  boss_lasers_count_anterior = 0;
  boss_vida_anterior = 60;

  atualizar_bg();

  som_vitoria.pause();
  som_vitoria.currentTime = 0;
  trilha.currentTime = 0;
  trilha.play();
}

document.addEventListener("keydown", (e) => {
  teclas[e.key] = true;
  if (jogar && motorCarregado && trilha.paused) trilha.play();

  if (venceu && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    reiniciar();
    return;
  }

  if ((e.key === "f" || e.key === "F") && laser_cooldown1 <= 0) {
    if (laser1.atirar(nave1)) {
      som_laser.currentTime = 0;
      som_laser.play();
      laser_cooldown1 = LASER_COOLDOWN_MAX;
    }
  }
  if (e.key === " ") {
    e.preventDefault();
    if (laser_cooldown2 <= 0) {
      if (laser2.atirar(nave2)) {
        som_laser.currentTime = 0;
        som_laser.play();
        laser_cooldown2 = LASER_COOLDOWN_MAX;
      }
    }
  }
});

document.addEventListener("keyup", (e) => {
  teclas[e.key] = false;
});

canvas.addEventListener("click", (e) => {
  if (!venceu) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  const pw = 900;
  const px = canvas.width / 2 - pw / 2;
  const py = canvas.height / 2 - 420 / 2;
  const bx = canvas.width / 2 - 200;
  const by = py + 385;
  if (mx >= bx && mx <= bx + 400 && my >= by && my <= by + 55) {
    reiniciar();
  }
});

// ── Lógica de jogo ──
function mover_naves() {
  nave1.dir =
    teclas["w"] || teclas["W"] ? -10 : teclas["s"] || teclas["S"] ? 10 : 0;
  nave2.dir = teclas["ArrowUp"] ? -10 : teclas["ArrowDown"] ? 10 : 0;
  nave1.mov_car();
  nave2.mov_car();
}

function game_over() {
  if (nave1.vida <= 0 && nave2.vida <= 0) {
    jogar = false;
    trilha.pause();
    trilha.currentTime = 0;
    som_game_over.currentTime = 0;
    som_game_over.play();
  }
}

function ver_vitoria() {
  if (fase === 3 && boss.morreu && !boss.desintegrando && !venceu) {
    venceu = true;
    jogar = false;
    trilha.pause();
    trilha.currentTime = 0;
    tela_vitoria.iniciar();
    som_vitoria.currentTime = 0;
    som_vitoria.play();
  }
}

function ver_fase() {
  if (pontos_compartilhados >= PONTOS_FASE2 && fase === 1) {
    fase = 2;
    atualizar_bg();
    meteoros.forEach((m) => (m.vel = 12));
  } else if (pontos_compartilhados >= PONTOS_FASE3 && fase === 2) {
    fase = 3;
    atualizar_bg();
  }

  if (fase === 3 && !boss_apareceu) {
    boss_apareceu = true;
    boss_message.iniciar();
    meteoros.forEach((m) => {
      m.x = 99999;
      m.vel = 0;
    });
    coracao.ativo = false;
    som_boss_aparece.currentTime = 0;
    som_boss_aparece.play();
    setTimeout(() => boss.aparecer(), 3500);
  }
}

function colisao() {
  for (let m of meteoros) {
    for (let nave of naves) {
      if (nave.vida > 0 && nave.colid(m)) {
        batida.play();
        m.recomeca();
        nave.vida -= 1;
        break;
      }
    }
  }
}

function colisao_laser() {
  for (let i = 0; i < lasers_player.length; i++) {
    const lsr = lasers_player[i];
    for (let j = 0; j < meteoros.length; j++) {
      if (lsr.colid(meteoros[j])) {
        lsr.ativo = false;
        explosoes[j].explodir(
          meteoros[j].x + meteoros[j].w / 2,
          meteoros[j].y + meteoros[j].h / 2,
        );
        som_explosao.currentTime = 0;
        som_explosao.play();
        meteoros[j].recomeca();
        pontos_compartilhados += 5;
        break;
      }
    }
    if (boss.receber_laser(lsr) && boss.morreu && !boss.desintegrando) {
      explosao_boss.explodir(boss.x + boss.w / 2, boss.y + boss.h / 2);
      pontos_compartilhados += 30;
    }
  }
}

function dano_explosao() {
  if (dano_cooldown > 0) {
    dano_cooldown--;
    return;
  }
  const todas = [...explosoes, explosao_boss];
  for (let nave of naves) {
    if (nave.vida <= 0) continue;
    for (let exp of todas) {
      if (exp.acertou_nave(nave)) {
        batida.play();
        nave.vida -= 1;
        dano_cooldown = 30;
        break;
      }
    }
  }
}

function pontuacao() {
  for (let m of meteoros) {
    if (m.x <= -100) {
      pontos_compartilhados += 5;
      m.recomeca();
    }
  }
}

function atualizar_cooldowns() {
  if (laser_cooldown1 > 0) laser_cooldown1--;
  if (laser_cooldown2 > 0) laser_cooldown2--;
}

function colisao_coracao() {
  for (let nave of naves) {
    if (nave.vida > 0 && coracao.colid(nave)) {
      nave.vida = Math.min(10, nave.vida + 2);
      notificacoes.adicionar("+2 HP ❤️", "#FF4466");
      coracao.recomeca();
    }
  }
}

function tocar_tiro_boss() {
  som_tiro_boss.currentTime = 0;
  som_tiro_boss.play();
}

function tocar_dano_boss() {
  som_dano_boss.currentTime = 0;
  som_dano_boss.play();
}

let boss_lasers_count_anterior = 0;
let boss_vida_anterior = 60;

function atualizar_jogo() {
  if (!jogar) return;
  mover_naves();
  atualizar_cooldowns();
  meteoros.forEach((m) => m.mov_car());
  colisao();
  pontuacao();
  laser1.mover();
  laser2.mover();

  if (boss.ativo && boss.vida < boss_vida_anterior) {
    tocar_dano_boss();
  }
  boss_vida_anterior = boss.ativo ? boss.vida : 60;

  colisao_laser();
  dano_explosao();
  ver_fase();
  ver_vitoria();
  game_over();
  explosoes.forEach((e) => e.atualizar());
  explosao_boss.atualizar();
  notificacoes.atualizar();
  boss.mov_car();
  boss.atirar();
  boss.atualizar_lasers();

  if (boss.lasers.length > boss_lasers_count_anterior) {
    tocar_tiro_boss();
  }
  boss_lasers_count_anterior = boss.lasers.length;

  boss.colid_laser_player_multi(naves);
  boss.atualizar_morte();
  boss_message.atualizar();
  coracao.mov_car();
  colisao_coracao();
}

// ── HUD ──
function desenhar_cooldown_laser(
  barra_x,
  barra_y,
  cooldown,
  cor_pronto,
  label,
) {
  const bw = 220,
    bh = 16,
    raio = bh / 2;
  const pct = 1 - cooldown / LASER_COOLDOWN_MAX;
  const pronto = cooldown <= 0;

  des.save();
  des.fillStyle = "#050518";
  des.beginPath();
  des.roundRect(barra_x, barra_y, bw, bh, raio);
  des.fill();

  const g = des.createLinearGradient(barra_x, 0, barra_x + bw, 0);
  if (pronto) {
    g.addColorStop(0, cor_pronto);
    g.addColorStop(1, cor_pronto);
  } else {
    g.addColorStop(0, "#003366");
    g.addColorStop(Math.min(1, pct), cor_pronto);
    g.addColorStop(1, "#001122");
  }
  des.fillStyle = g;
  des.beginPath();
  des.roundRect(barra_x, barra_y, bw * pct, bh, raio);
  des.fill();

  des.strokeStyle = pronto ? cor_pronto : "#004466";
  des.lineWidth = 1.5;
  des.beginPath();
  des.roundRect(barra_x, barra_y, bw, bh, raio);
  des.stroke();

  des.fillStyle = pronto ? cor_pronto : "#3399BB";
  des.font = "bold 12px Arial";
  des.textBaseline = "middle";
  const label_dir = barra_x > canvas.width / 2;
  if (label_dir) {
    des.textAlign = "right";
    des.fillText(
      label + (pronto ? " ▶" : "..."),
      barra_x - 8,
      barra_y + bh / 2,
    );
  } else {
    des.textAlign = "left";
    des.fillText(
      label + (pronto ? " ▶" : "..."),
      barra_x + bw + 8,
      barra_y + bh / 2,
    );
  }
  des.textAlign = "left";
  des.textBaseline = "alphabetic";
  des.restore();
}

function desenhar_hud_jogador(nave, lado, cooldown, cor_laser) {
  const bw = 220,
    bh = 28,
    raio = bh / 2;
  const vida_pct = Math.max(0, nave.vida / 10);
  const barra_x = lado === 1 ? 30 : canvas.width - bw - 120;
  const barra_y = 16;

  des.save();
  des.shadowColor = "rgba(0,0,0,0.6)";
  des.shadowBlur = 6;
  des.fillStyle = "#3B1A08";
  des.beginPath();
  des.roundRect(barra_x, barra_y, bw, bh, raio);
  des.fill();
  des.restore();

  des.fillStyle =
    nave.vida <= 0
      ? "#444"
      : vida_pct > 0.6
        ? "#FF69B4"
        : vida_pct > 0.3
          ? "#F5A623"
          : "#C0392B";
  des.beginPath();
  des.roundRect(barra_x, barra_y, bw * vida_pct, bh, raio);
  des.fill();

  if (vida_pct > 0.05) {
    des.fillStyle = "rgba(255,255,255,0.2)";
    des.beginPath();
    des.roundRect(
      barra_x + 3,
      barra_y + 3,
      bw * vida_pct - 6,
      bh / 3,
      raio / 2,
    );
    des.fill();
  }

  des.strokeStyle = "#D4A017";
  des.lineWidth = 2;
  des.beginPath();
  des.roundRect(barra_x, barra_y, bw, bh, raio);
  des.stroke();

  des.fillStyle = "#FFD700";
  des.font = "bold 14px Arial";
  des.textBaseline = "middle";
  des.textAlign = lado === 1 ? "right" : "left";
  const label_x = lado === 1 ? barra_x - 6 : barra_x + bw + 6;
  des.fillText(`P${lado} HP`, label_x, barra_y + bh / 2);
  des.textAlign = "left";
  des.textBaseline = "alphabetic";

  if (nave.vida <= 0) {
    des.save();
    des.fillStyle = "rgba(200,0,0,0.85)";
    des.font = "bold 14px Arial";
    des.textAlign = "center";
    des.fillText("ELIMINADO", barra_x + bw / 2, barra_y + bh / 2);
    des.textAlign = "left";
    des.restore();
  }

  desenhar_cooldown_laser(
    barra_x,
    barra_y + bh + 6,
    cooldown,
    cor_laser,
    lado === 1 ? "F" : "Espaço",
  );
}

// ── Renderização ──
function desenha() {
  des.clearRect(0, 0, canvas.width, canvas.height);

  if (jogar) {
    if (fase < 3) meteoros.forEach((m) => m.des_carro());

    for (let nave of naves) {
      if (nave.vida > 0) nave.des_carro();
      else nave.des_carro_morto();
    }

    coracao.des_carro();

    laser1.des_carro();
    laser2.des_carro();
    explosoes.forEach((e) => e.des_carro());
    explosao_boss.des_carro();

    boss.des_carro();
    boss.des_lasers();
    boss.des_barra_vida();
    boss.des_morte();

    desenhar_hud_jogador(nave1, 1, laser_cooldown1, "#00FFFF");
    desenhar_hud_jogador(nave2, 2, laser_cooldown2, "#FFFF00");

    des.save();
    des.textAlign = "center";
    des.fillStyle = "white";
    des.font = "bold 36px Arial";
    des.fillText("Fase: " + fase, canvas.width / 2, 48);
    des.fillStyle = "yellow";
    des.font = "bold 32px Arial";
    des.fillText("Pontos: " + pontos_compartilhados, canvas.width / 2, 85);
    des.textAlign = "left";
    des.restore();

    notificacoes.des_carro();
    boss_message.des_carro();

    des.save();
    des.globalAlpha = 0.5;
    des.fillStyle = "white";
    des.font = "18px Arial";
    des.fillText("P1: WASD mover | F atirar", 20, canvas.height - 20);
    des.textAlign = "right";
    des.fillText(
      "P2: ↑↓ mover | Espaço atirar",
      canvas.width - 20,
      canvas.height - 20,
    );
    des.textAlign = "left";
    des.restore();
  } else if (venceu) {
    tela_vitoria.des_carro(pontos_compartilhados);
  } else {
    des.fillStyle = "rgba(0,0,0,0.7)";
    des.fillRect(0, 0, canvas.width, canvas.height);
    t1.des_text(
      "Não sobra nada",
      canvas.width / 2 - 230,
      canvas.height / 2 - 40,
      "red",
      "bold 90px Arial",
    );
    t2.des_text(
      "Pontuação Final: " + pontos_compartilhados,
      canvas.width / 2 - 210,
      canvas.height / 2 + 60,
      "white",
      "bold 42px Arial",
    );
  }
}

function main() {
  desenha();
  atualizar_jogo();
  if (venceu) tela_vitoria.atualizar();
  requestAnimationFrame(main);
}

main();
