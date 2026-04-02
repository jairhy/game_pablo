let des;

// ── Utilitários ──
const TAU = Math.PI * 2;

function dist(ax, ay, bx, by) {
  const dx = ax - bx,
    dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── Classe base ──
class Obj {
  constructor(x, y, w, h, a) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.a = a;
  }

  des_carro() {
    let img = new Image();
    img.src = this.a;
    des.drawImage(img, this.x, this.y, this.w, this.h);
  }

  des_quad() {
    des.fillStyle = this.a;
    des.fillRect(this.x, this.y, this.w, this.h);
  }
}

// ── Nave do jogador ──
class NavePlayer extends Obj {
  constructor(x, y, w, h, a, numero) {
    super(x, y, w, h, a);
    this.dir = 0;
    this.vida = 10;
    this.numero = numero;
    this.img = new Image();
    this.img.src = a;
  }

  mov_car() {
    if (this.vida <= 0) return;
    this.y = Math.max(0, Math.min(canvas.height - this.h, this.y + this.dir));
  }

  des_carro() {
    if (this.img.complete && this.img.naturalWidth !== 0)
      des.drawImage(this.img, this.x, this.y, this.w, this.h);
  }

  des_carro_morto() {
    if (!this.img.complete || this.img.naturalWidth === 0) return;
    des.save();
    des.globalAlpha = 0.2;
    des.drawImage(this.img, this.x, this.y, this.w, this.h);
    des.restore();
  }

  colid(obj) {
    const ox = 380,
      oy = 380;
    return (
      this.x + ox < obj.x + obj.w &&
      this.x + this.w - ox > obj.x &&
      this.y + oy < obj.y + obj.h &&
      this.y + this.h - oy > obj.y
    );
  }
}

// ── Meteoro (CarroInimigo adaptado) ──
class Meteoro extends Obj {
  constructor(x, y, w, h, a) {
    super(x, y, w, h, a);
    this.vel = 1;
    this.img = new Image();
    this.img.src = a;
  }

  recomeca() {
    this.x = canvas.width + Math.floor(Math.random() * 400);
    const centro = canvas.height / 2 - this.h / 2;
    const variacao = 429;
    this.y = centro + (Math.random() * variacao * 2 - variacao);
  }

  mov_car() {
    this.x -= this.vel;
    if (this.x <= -200) {
      this.recomeca();
    }
  }

  des_carro() {
    if (this.img.complete && this.img.naturalWidth !== 0)
      des.drawImage(this.img, this.x, this.y, this.w, this.h);
  }
}

// ── Laser do jogador ──
class Laser {
  constructor(cor) {
    this.x = -100;
    this.y = -100;
    this.raio = 25;
    this.vel = 20;
    this.ativo = false;
    this.cor = cor || "cyan";
  }

  atirar(nave) {
    if (!this.ativo && nave.vida > 0) {
      this.x = nave.x + nave.w;
      this.y = nave.y + nave.h / 2;
      this.ativo = true;
      return true;
    }
    return false;
  }

  mover() {
    if (!this.ativo) return;
    this.x += this.vel;
    if (this.x > 1980) this.ativo = false;
  }

  des_carro() {
    if (!this.ativo) return;
    des.save();
    des.globalAlpha = 1;
    des.beginPath();
    des.arc(this.x, this.y, this.raio, 0, TAU);
    des.fillStyle = this.cor;
    des.fill();
    des.closePath();
    des.beginPath();
    des.arc(this.x, this.y, this.raio + 4, 0, TAU);
    des.fillStyle = "rgba(255,255,255,0.15)";
    des.fill();
    des.closePath();
    des.restore();
  }

  colid(meteoro) {
    if (!this.ativo) return false;
    return (
      dist(
        this.x,
        this.y,
        meteoro.x + meteoro.w / 2,
        meteoro.y + meteoro.h / 2,
      ) <
      this.raio + meteoro.w * 0.12
    );
  }
}

// ── Texto ──
class Text {
  des_text(text, x, y, cor, font) {
    des.fillStyle = cor;
    des.font = font;
    des.fillText(text, x, y);
  }
}

// ── Explosão ──
const CORES_EXPLOSAO = [
  "#FF4500",
  "#FF8C00",
  "#FFD700",
  "#FF6347",
  "#FFA07A",
  "#FFFFFF",
  "#FF0000",
  "#FF3300",
];

class Explosion {
  constructor() {
    this.particulas = [];
    this.ativo = false;
    this.cx = 0;
    this.cy = 0;
    this.raio_dano = 430;
    this.tempo = 0;
    this.tempo_dano = 25;
  }

  explodir(x, y) {
    this.ativo = true;
    this.cx = x;
    this.cy = y;
    this.tempo = 0;
    this.particulas = [];
    for (let i = 0; i < 60; i++) {
      const angulo = Math.random() * TAU;
      const vel = Math.random() * 18 + 5;
      this.particulas.push({
        x,
        y,
        vx: Math.cos(angulo) * vel,
        vy: Math.sin(angulo) * vel,
        raio: Math.random() * 22 + 8,
        cor: CORES_EXPLOSAO[Math.floor(Math.random() * CORES_EXPLOSAO.length)],
        vida: 1.0,
        decaimento: Math.random() * 0.02 + 0.01,
      });
    }
  }

  atualizar() {
    if (!this.ativo) return;
    this.tempo++;
    for (let p of this.particulas) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.vx *= 0.98;
      p.vida -= p.decaimento;
      p.raio *= 0.97;
    }
    this.particulas = this.particulas.filter((p) => p.vida > 0);
    if (this.particulas.length === 0) this.ativo = false;
  }

  acertou_nave(nave) {
    if (!this.ativo || this.tempo > this.tempo_dano) return false;
    return (
      dist(nave.x + nave.w / 2, nave.y + nave.h / 2, this.cx, this.cy) <
      this.raio_dano
    );
  }

  des_carro() {
    if (!this.ativo) return;
    if (this.tempo < 20) {
      const prog = this.tempo / 20;
      des.save();
      des.globalAlpha = (1 - prog) * 0.4;
      des.beginPath();
      des.arc(this.cx, this.cy, prog * this.raio_dano, 0, TAU);
      des.fillStyle = "#FF8C00";
      des.fill();
      des.closePath();
      des.restore();
    }
    for (let p of this.particulas) {
      des.save();
      des.globalAlpha = p.vida;
      des.beginPath();
      des.arc(p.x, p.y, p.raio, 0, TAU);
      des.fillStyle = p.cor;
      des.fill();
      des.closePath();
      des.restore();
    }
  }
}

// ── Notificação ──
class Notificacao {
  constructor() {
    this.mensagens = [];
  }

  adicionar(texto, cor) {
    this.mensagens.push({
      texto,
      cor,
      y: canvas.height / 2,
      alpha: 1.0,
      timer: 0,
    });
  }

  atualizar() {
    for (let m of this.mensagens) {
      m.timer++;
      m.y -= 2;
      if (m.timer > 40) m.alpha -= 0.04;
    }
    this.mensagens = this.mensagens.filter((m) => m.alpha > 0);
  }

  des_carro() {
    for (let m of this.mensagens) {
      des.save();
      des.globalAlpha = m.alpha;
      des.font = "bold 52px Arial";
      des.fillStyle = m.cor;
      des.textAlign = "center";
      des.shadowColor = "rgba(0,0,0,0.8)";
      des.shadowBlur = 10;
      des.fillText(m.texto, canvas.width / 2, m.y);
      des.textAlign = "left";
      des.restore();
    }
  }
}

// ── Coração coletável ──
class Coracao extends Obj {
  constructor() {
    super(0, 0, 60, 60, null);
    this.vel = 8;
    this.ativo = true;
    this.recomeca();
  }

  recomeca() {
    this.x = canvas.width + Math.floor(Math.random() * 800);
    const variacao = 440;
    this.y =
      canvas.height / 2 -
      this.h / 2 +
      (Math.random() * variacao * 2 - variacao);
    this.y = Math.max(10, Math.min(canvas.height - this.h - 10, this.y));
    this.ativo = true;
  }

  mov_car() {
    if (!this.ativo) return;
    this.x -= this.vel;
    if (this.x < -100) {
      if (typeof fase !== "undefined" && fase >= 3) {
        this.ativo = false;
      } else {
        this.recomeca();
      }
    }
  }

  des_carro() {
    if (!this.ativo) return;
    des.save();
    des.globalAlpha = 1;
    des.font = "bold 50px Arial";
    des.textAlign = "center";
    des.textBaseline = "middle";
    des.shadowColor = "#FF0044";
    des.shadowBlur = 20;
    des.fillText("❤️", this.x + this.w / 2, this.y + this.h / 2);
    des.restore();
  }

  colid(nave) {
    if (!this.ativo) return false;
    return (
      nave.x < this.x + this.w &&
      nave.x + nave.w > this.x &&
      nave.y < this.y + this.h &&
      nave.y + nave.h > this.y
    );
  }
}

// ── Boss ──
class Boss extends Obj {
  constructor(x, y, w, h, a) {
    super(x, y, w, h, a);
    this.img = new Image();
    this.img.src = a;
    this.vida = 50
    this.vidaMax = 50;
    this.vel = 2.5;
    this.dir = 1;
    this.ativo = false;
    this.lasers = [];
    this.cadencia = 67;
    this.timer_tiro = 5;
    this.morreu = false;
    this.dano_cooldown = 0;
    this.fragmentos = [];
    this.desintegrando = false;
    this.flash_morte = 0;
    this.timer_morte = 0;
  }

  aparecer() {
    Object.assign(this, {
      ativo: true,
      morreu: false,
      desintegrando: false,
      flash_morte: 0,
      timer_morte: 0,
      fragmentos: [],
      vida: this.vidaMax,
      lasers: [],
      x: canvas.width + 100,
      y: canvas.height / 2 - this.h / 2,
    });
  }

  mov_car() {
    if (!this.ativo || this.morreu) return;
    if (this.x > canvas.width - this.w - 20) {
      this.x -= 4;
      return;
    }
    this.y += this.vel * this.dir;
    if (this.y <= 20) this.dir = 1;
    if (this.y + this.h >= canvas.height - 20) this.dir = -1;
  }

  atirar() {
    if (!this.ativo || this.morreu || this.x > canvas.width - this.w - 20)
      return;
    if (++this.timer_tiro >= this.cadencia) {
      this.timer_tiro = 0;
      this._disparo_leque();
    }
  }

  _disparo_leque() {
    const cx = this.x,
      cy = this.y + this.h / 2;
    for (let ang of [-0.6, -0.3, 0, 0.3, 0.6]) {
      this.lasers.push({
        x: cx,
        y: cy,
        vx: -14 * Math.cos(ang),
        vy: -14 * Math.sin(ang),
        raio: 12,
        ativo: true,
      });
    }
  }

  atualizar_lasers() {
    for (let l of this.lasers) {
      if (!l.ativo) continue;
      l.x += l.vx;
      l.y += l.vy;
      if (l.y - l.raio <= 0 || l.y + l.raio >= canvas.height) l.vy *= -1;
      if (l.x < -50) l.ativo = false;
    }
    this.lasers = this.lasers.filter((l) => l.ativo);
  }

  colid_laser_player_multi(naves) {
    if (this.dano_cooldown > 0) {
      this.dano_cooldown--;
      return;
    }
    for (let l of this.lasers) {
      if (!l.ativo) continue;
      for (let nave of naves) {
        if (nave.vida <= 0) continue;
        if (
          dist(nave.x + nave.w / 2, nave.y + nave.h / 2, l.x, l.y) <
          l.raio + 60
        ) {
          l.ativo = false;
          nave.vida -= 1;
          batida.play();
          this.dano_cooldown = 30;
          return;
        }
      }
    }
  }

  receber_laser(laser_player) {
    if (!this.ativo || this.morreu || !laser_player.ativo) return false;
    if (
      dist(
        laser_player.x,
        laser_player.y,
        this.x + this.w / 2,
        this.y + this.h / 2,
      ) <
      laser_player.raio + this.w * 0.3
    ) {
      this.vida -= 1;
      laser_player.ativo = false;
      if (this.vida <= 0) this._iniciar_morte();
      return true;
    }
    return false;
  }

  _iniciar_morte() {
    this.morreu = true;
    this.ativo = false;
    this.desintegrando = true;
    this.flash_morte = 1.0;
    this.timer_morte = 0;
    this._gerar_fragmentos();
  }

  _gerar_fragmentos() {
    this.fragmentos = [];
    const cols = 8,
      rows = 7;
    const fw = this.w / cols,
      fh = this.h / rows;
    const cx = this.x + this.w / 2,
      cy = this.y + this.h / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const fx = this.x + c * fw,
          fy = this.y + r * fh;
        const angulo = Math.atan2(fy + fh / 2 - cy, fx + fw / 2 - cx);
        const vel = Math.random() * 6 + 3;
        this.fragmentos.push({
          x: fx,
          y: fy,
          w: fw - 1,
          h: fh - 1,
          vx: Math.cos(angulo) * vel * (0.6 + Math.random() * 0.8),
          vy:
            Math.sin(angulo) * vel * (0.6 + Math.random() * 0.8) -
            Math.random() * 3,
          rot: 0,
          rotVel: (Math.random() - 0.5) * 0.25,
          alpha: 1,
          decay: Math.random() * 0.012 + 0.006,
          sx: c * fw,
          sy: r * fh,
          sw: fw,
          sh: fh,
        });
      }
    }
  }

  atualizar_morte() {
    if (!this.desintegrando) return;
    this.timer_morte++;
    if (this.flash_morte > 0) this.flash_morte -= 0.05;
    let algumVivo = false;
    for (let f of this.fragmentos) {
      if (f.alpha <= 0) continue;
      algumVivo = true;
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.15;
      f.vx *= 0.99;
      f.rot += f.rotVel;
      f.alpha -= f.decay;
    }
    if (!algumVivo) this.desintegrando = false;
  }

  des_carro() {
    if (!this.ativo && !this.morreu) return;
    if (this.ativo && this.img.complete && this.img.naturalWidth !== 0)
      des.drawImage(this.img, this.x, this.y, this.w, this.h);
  }

  des_morte() {
    if (!this.desintegrando) return;
    if (this.flash_morte > 0) {
      des.save();
      des.globalAlpha = this.flash_morte * 0.6;
      des.fillStyle = "#FF8C00";
      des.fillRect(0, 0, canvas.width, canvas.height);
      des.restore();
    }
    if (this.timer_morte < 40) {
      const prog = this.timer_morte / 40;
      des.beginPath();
      des.arc(this.x + this.w / 2, this.y + this.h / 2, prog * 600, 0, TAU);
      des.strokeStyle = `rgba(255,120,20,${(1 - prog) * 0.5})`;
      des.lineWidth = 5;
      des.stroke();
    }
    const imgOk = this.img.complete && this.img.naturalWidth !== 0;
    for (let f of this.fragmentos) {
      if (f.alpha <= 0) continue;
      des.save();
      des.globalAlpha = Math.max(0, f.alpha);
      des.translate(f.x + f.w / 2, f.y + f.h / 2);
      des.rotate(f.rot);
      if (imgOk)
        des.drawImage(
          this.img,
          f.sx,
          f.sy,
          f.sw,
          f.sh,
          -f.w / 2,
          -f.h / 2,
          f.w,
          f.h,
        );
      des.strokeStyle = "rgba(255,150,50,0.6)";
      des.lineWidth = 0.8;
      des.strokeRect(-f.w / 2, -f.h / 2, f.w, f.h);
      des.restore();
    }
  }

  des_lasers() {
    for (let l of this.lasers) {
      if (!l.ativo) continue;
      des.beginPath();
      des.arc(l.x, l.y, l.raio, 0, TAU);
      des.fillStyle = "#FF0055";
      des.fill();
      des.closePath();
      des.beginPath();
      des.arc(l.x, l.y, l.raio + 5, 0, TAU);
      des.fillStyle = "rgba(255,0,80,0.25)";
      des.fill();
      des.closePath();
    }
  }

  des_barra_vida() {
    if (!this.ativo) return;
    const bw = 340,
      bh = 30;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height - 60;
    const pct = this.vida / this.vidaMax;
    const raio = bh / 2;

    des.save();
    des.shadowColor = "rgba(0,0,0,0.7)";
    des.shadowBlur = 10;
    des.fillStyle = "#1a0010";
    des.beginPath();
    des.roundRect(bx, by, bw, bh, raio);
    des.fill();
    des.restore();

    des.fillStyle = pct > 0.5 ? "#FF0055" : pct > 0.25 ? "#FF6600" : "#FF0000";
    des.beginPath();
    des.roundRect(bx, by, bw * pct, bh, raio);
    des.fill();

    des.fillStyle = "rgba(255,255,255,0.2)";
    des.beginPath();
    des.roundRect(bx + 4, by + 4, bw * pct - 8, bh / 3, raio / 2);
    des.fill();

    des.strokeStyle = "#FF0055";
    des.lineWidth = 2.5;
    des.beginPath();
    des.roundRect(bx, by, bw, bh, raio);
    des.stroke();

    des.fillStyle = "#FF88AA";
    des.font = "bold 18px Arial";
    des.fillText("John Cracker", bx + bw + 10, by + 21);
  }
}

// ── Mensagem do boss ──
class BossMessage {
  constructor() {
    this.ativo = false;
    this.timer = 0;
    this.duracao = 180;
    this.alpha = 0;
  }

  iniciar() {
    this.ativo = true;
    this.timer = 0;
    this.alpha = 0;
  }

  atualizar() {
    if (!this.ativo) return;
    this.timer++;
    if (this.timer < 30) this.alpha = this.timer / 30;
    else if (this.timer < this.duracao - 40) this.alpha = 1;
    else this.alpha = (this.duracao - this.timer) / 40;
    if (this.timer >= this.duracao) {
      this.ativo = false;
      this.alpha = 0;
    }
  }

  des_carro() {
    if (!this.ativo) return;
    des.save();
    des.globalAlpha = this.alpha;
    des.fillStyle = "rgba(0,0,0,0.55)";
    des.fillRect(0, canvas.height / 2 - 120, canvas.width, 180);

    const linha = (y) => {
      des.beginPath();
      des.moveTo(100, y);
      des.lineTo(canvas.width - 100, y);
      des.stroke();
    };
    des.strokeStyle = "#FF0055";
    des.lineWidth = 2;
    linha(canvas.height / 2 - 115);

    const escala = 1 + Math.sin(this.timer * 0.15) * 0.025;
    des.translate(canvas.width / 2, canvas.height / 2);
    des.scale(escala, escala);
    des.translate(-canvas.width / 2, -canvas.height / 2);
    des.shadowColor = "#FF0055";
    des.shadowBlur = 35;
    des.fillStyle = "#FFFFFF";
    des.font = "bold 72px Arial";
    des.textAlign = "center";
    des.fillText(
      "John Cracker is coming...",
      canvas.width / 2,
      canvas.height / 2 + 15,
    );
    des.shadowBlur = 0;
    linha(canvas.height / 2 + 52);
    des.restore();
    des.textAlign = "left";
  }
}

// ── Tela de vitória ──
const CORES_CONFETE = [
  "#FFD700",
  "#FF69B4",
  "#00CFFF",
  "#7FFF00",
  "#FF6347",
  "#DA70D6",
  "#FFA500",
  "#FFFFFF",
];

class TelaVitoria {
  constructor() {
    this.ativo = false;
    this.timer = 0;
    this.particulas = [];
    this._gerar_confete();
  }

  _gerar_confete() {
    this.particulas = Array.from({ length: 120 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * -1080,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 5 + 2,
      rot: Math.random() * TAU,
      rotVel: (Math.random() - 0.5) * 0.15,
      w: Math.random() * 24 + 10,
      h: Math.random() * 14 + 6,
      cor: CORES_CONFETE[Math.floor(Math.random() * CORES_CONFETE.length)],
      alpha: 1,
    }));
  }

  iniciar() {
    this.ativo = true;
    this.timer = 0;
    this._gerar_confete();
  }

  atualizar() {
    if (!this.ativo) return;
    this.timer++;
    for (let p of this.particulas) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotVel;
      if (p.y > 1120) {
        p.y = -30;
        p.x = Math.random() * 1920;
      }
    }
  }

  des_carro(pontos) {
    if (!this.ativo) return;
    des.fillStyle = "rgba(0,0,20,0.88)";
    des.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of this.particulas) {
      des.save();
      des.globalAlpha = p.alpha;
      des.translate(p.x, p.y);
      des.rotate(p.rot);
      des.fillStyle = p.cor;
      des.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      des.restore();
    }

    const pw = 900,
      ph = 460;
    const px = canvas.width / 2 - pw / 2,
      py = canvas.height / 2 - ph / 2;

    des.save();
    des.shadowColor = "#FFD700";
    des.shadowBlur = 50;
    des.fillStyle = "rgba(0,0,30,0.92)";
    des.beginPath();
    des.roundRect(px, py, pw, ph, 30);
    des.fill();
    des.restore();

    des.strokeStyle = "#FFD700";
    des.lineWidth = 4;
    des.beginPath();
    des.roundRect(px, py, pw, ph, 30);
    des.stroke();
    des.strokeStyle = "rgba(255,215,0,0.3)";
    des.lineWidth = 1.5;
    des.beginPath();
    des.roundRect(px + 12, py + 12, pw - 24, ph - 24, 22);
    des.stroke();

    const escala_titulo = 1 + Math.sin(this.timer * 0.06) * 0.03;
    des.save();
    des.translate(canvas.width / 2, py + 110);
    des.scale(escala_titulo, escala_titulo);
    des.fillStyle = "#FFD700";
    des.shadowColor = "#FFD700";
    des.shadowBlur = 30;
    des.font = "bold 100px Arial";
    des.textAlign = "center";
    des.textBaseline = "middle";
    des.fillText("VITÓRIA!", 0, 0);
    des.restore();

    des.textAlign = "center";
    des.textBaseline = "middle";
    des.shadowColor = "rgba(255,255,255,0.4)";
    des.shadowBlur = 10;

    des.fillStyle = "#FFFFFF";
    des.font = "bold 40px Arial";
    des.fillText("John Cracker foi derrotado!", canvas.width / 2, py + 210);

    des.fillStyle = "#00FFAA";
    des.font = "bold 32px Arial";
    des.fillText("Parabéns, dupla!", canvas.width / 2, py + 265);

    des.fillStyle = "#FFD700";
    des.font = "bold 48px Arial";
    des.shadowColor = "#FFD700";
    des.shadowBlur = 20;
    des.fillText("Pontuação Final: " + pontos, canvas.width / 2, py + 325);

    // ── Botão Jogar Novamente ──
    const bw = 400,
      bh = 55;
    const bx = canvas.width / 2 - bw / 2;
    const by = py + 385;
    const pulse = 1 + Math.sin(this.timer * 0.08) * 0.04;

    des.save();
    des.translate(canvas.width / 2, by + bh / 2);
    des.scale(pulse, pulse);
    des.translate(-canvas.width / 2, -(by + bh / 2));

    des.shadowColor = "#00FFAA";
    des.shadowBlur = 20;
    des.fillStyle = "rgba(0, 30, 20, 0.85)";
    des.beginPath();
    des.roundRect(bx, by, bw, bh, bh / 2);
    des.fill();

    des.strokeStyle = "#00FFAA";
    des.lineWidth = 2.5;
    des.beginPath();
    des.roundRect(bx, by, bw, bh, bh / 2);
    des.stroke();

    des.fillStyle = "#00FFAA";
    des.font = "bold 26px Arial";
    des.shadowColor = "#00FFAA";
    des.shadowBlur = 10;
    des.textAlign = "center";
    des.textBaseline = "middle";
    des.fillText("▶  Jogar Novamente", canvas.width / 2, by + bh / 2);
    des.restore();

    des.shadowBlur = 0;
    des.fillStyle = "rgba(255,255,255,0.35)";
    des.font = "18px Arial";
    des.textAlign = "center";
    des.textBaseline = "middle";
    des.shadowBlur = 0;
    des.textAlign = "left";
    des.textBaseline = "alphabetic";
  }
}
