// ── Música inicial ──
let musica = new Audio();
musica.src = "./img/trilha.mp3";
musica.volume = 0.4;
musica.loop = true;

// Navegadores bloqueiam autoplay sem interação do usuário.
// A música inicia no primeiro clique/tecla na página.
function tentarTocarMusica() {
  musica.play().catch(() => {});
  document.removeEventListener('click',   tentarTocarMusica);
  document.removeEventListener('keydown', tentarTocarMusica);
}
document.addEventListener('click',   tentarTocarMusica);
document.addEventListener('keydown', tentarTocarMusica);

// ── Modais ──
function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
}

function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) el.classList.remove('open');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

// ── Iniciar jogo ──
function iniciarJogo() {
  musica.pause();
  musica.currentTime = 0;
  window.location.href = './pablo.html';
}