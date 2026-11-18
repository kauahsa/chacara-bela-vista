const photos = [
  { file: "salao", title: "Salão de eventos", text: "Mesas postas junto às janelas, com o jardim ao fundo." },
  { file: "churrasqueira", title: "Cozinha e churrasqueira", text: "Churrasqueira de tijolos, fogão e balcão com banquetas." },
  { file: "quarto", title: "Acomodações", text: "Quarto com beliches de madeira, janela e ventilador de teto." },
  { file: "jogos", title: "Salão de jogos", text: "Uma mesa de jogos ocupa o centro da área coberta ao lado da cozinha." },
  { file: "estar", title: "Sala de estar", text: "Sofás com almofadas, aquário e televisão na área de convivência.", credit: "Foto de Patrícia Mendes · Google Maps, outubro de 2020" },
  { file: "refeicoes", title: "Espaço de refeições", text: "Buffet de saladas e pratos quentes ao lado das mesas do salão." },
  { file: "varanda", title: "Mesa junto às janelas", text: "Cadeiras verdes em volta da mesa de vidro, com o salão de jogos ao fundo." }
];
const pathFor = photo => "fotos/" + photo.file + ".jpg";
const byId = id => document.getElementById(id);
const cover = document.querySelector(".hero-photo");
const covers = [0, 1, 3];
let currentCover = 0;
function changeCover(step) {
  currentCover = (currentCover + step + covers.length) % covers.length;
  const photo = photos[covers[currentCover]];
  cover.style.backgroundImage = "url('" + pathFor(photo) + "')";
  byId("slide-number").textContent = String(currentCover + 1).padStart(2, "0");
  byId("slide-name").textContent = photo.title;
  document.querySelector(".track i").style.transform = "translateX(" + currentCover * 100 + "%)";
}
byId("hero-prev").addEventListener("click", () => changeCover(-1));
byId("hero-next").addEventListener("click", () => changeCover(1));

const dialog = byId("gallery");
const thumbs = document.querySelector(".thumbs");
let selected = 0;
function showPhoto(index) {
  selected = (index + photos.length) % photos.length;
  const photo = photos[selected];
  byId("gimage").src = pathFor(photo);
  byId("gimage").alt = photo.text;
  byId("gname").textContent = photo.title;
  byId("gdesc").textContent = photo.text;
  byId("gcredit").textContent = photo.credit || "";
  byId("gcount").textContent = String(selected + 1).padStart(2, "0") + " / 07";
  Array.from(thumbs.children).forEach((button, i) => button.setAttribute("aria-current", String(i === selected)));
  const thumb = thumbs.children[selected];
  if (dialog.open) thumbs.scrollLeft = thumb.offsetLeft - thumbs.offsetLeft - (thumbs.clientWidth - thumb.clientWidth) / 2;
}
photos.forEach((photo, index) => {
  const button = document.createElement("button");
  button.setAttribute("aria-label", "Mostrar " + photo.title);
  const image = document.createElement("img");
  image.src = pathFor(photo);
  image.loading = "lazy";
  image.alt = "";
  button.append(image);
  button.addEventListener("click", () => showPhoto(index));
  thumbs.append(button);
});
document.querySelectorAll("[data-gallery]").forEach(button => button.addEventListener("click", () => {
  dialog.showModal();
  showPhoto(Number(button.dataset.gallery));
  byId("gclose").focus();
}));
byId("gclose").addEventListener("click", () => dialog.close());
byId("gprev").addEventListener("click", () => showPhoto(selected - 1));
byId("gnext").addEventListener("click", () => showPhoto(selected + 1));
dialog.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(selected + (event.key === "ArrowLeft" ? -1 : 1));
  }
});
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
const menu = document.querySelector(".menu");
const nav = document.querySelector("header nav");
function toggleMenu(open) {
  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}
menu.addEventListener("click", () => toggleMenu(!nav.classList.contains("open")));
nav.addEventListener("click", () => toggleMenu(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    toggleMenu(false);
    menu.focus();
  }
});
const navLinks = Array.from(nav.querySelectorAll("a"));
function updateNav() {
  let current = "#inicio";
  for (const id of ["ambientes", "chacara", "localizacao"]) {
    if (byId(id).getBoundingClientRect().top < window.innerHeight * .5) current = "#" + id;
  }
  navLinks.forEach(link => {
    const active = link.hash === current;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", updateNav, {passive:true});
updateNav();

const backToTop = document.querySelector(".floating-top");
function updateBackToTop() {
  backToTop.hidden = window.scrollY < 180;
}
window.addEventListener("scroll", updateBackToTop, { passive: true });
window.addEventListener("pageshow", updateBackToTop);
updateBackToTop();

const film = byId("tour-film");
const tourToggle = document.querySelector(".tour-toggle");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let wantsPlayback = !reduceMotion.matches;
let tourVisible = false;

function updateTourButton() {
  const paused = film.paused;
  tourToggle.querySelector("span").textContent = paused ? "Reproduzir" : "Pausar";
  tourToggle.querySelector("path").setAttribute("d", paused ? "M7 3.8v16.4L20 12z" : "M6 4h4v16H6z M14 4h4v16h-4z");
}

function syncTour() {
  if (wantsPlayback && tourVisible && !document.hidden) {
    film.play().catch(updateTourButton);
  } else {
    film.pause();
  }
}

tourToggle.hidden = false;
film.addEventListener("play", updateTourButton);
film.addEventListener("pause", updateTourButton);
tourToggle.addEventListener("click", () => {
  wantsPlayback = film.paused;
  syncTour();
});
reduceMotion.addEventListener("change", () => {
  wantsPlayback = !reduceMotion.matches;
  syncTour();
});
document.addEventListener("visibilitychange", syncTour);
new IntersectionObserver(([entry]) => {
  tourVisible = entry.isIntersecting;
  syncTour();
}).observe(film);
