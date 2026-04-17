const API = "https://anime-server-zt8x.onrender.com";

const resultsContainer = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const recentSearchesContainer = document.getElementById("recentSearches");
const statusMessage = document.getElementById("statusMessage");
const favoritesCountEl = document.getElementById("favoritesCount");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModal");
const modalContent = document.querySelector(".modal-content");

const FAVORITES_KEY = "animeExplorerFavorites";
const RECENT_SEARCHES_KEY = "animeExplorerRecentSearches";

let currentResults = [];
let showingFavorites = false;
let currentModalAnime = null;
let trailerVisible = false;

function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message = "") {
  statusMessage.textContent = message;
}

function setSearchingState(isSearching) {
  searchBtn.disabled = isSearching;
  searchBtn.textContent = isSearching ? "Buscando..." : "Buscar";
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function updateFavoritesCount() {
  favoritesCountEl.textContent = getFavorites().length;
}

function isFavorite(id) {
  return getFavorites().some((item) => item.malId === id);
}

function toggleFavorite(anime) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.malId === anime.malId);

  let updated;
  if (exists) {
    updated = favorites.filter((item) => item.malId !== anime.malId);
  } else {
    updated = [...favorites, anime];
  }

  saveFavorites(updated);
  updateFavoritesCount();

  if (showingFavorites) {
    renderResults(updated);
    setStatus(updated.length ? `Favoritos guardados: ${updated.length}` : "No tenés favoritos todavía.");
  } else {
    renderResults(currentResults);
  }
}

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  let items = getRecentSearches().filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  items.unshift(trimmed);
  items = items.slice(0, 8);

  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
  renderRecentSearches();
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  renderRecentSearches();
}

function renderRecentSearches() {
  const items = getRecentSearches();

  if (!items.length) {
    recentSearchesContainer.innerHTML = `<span class="card-meta">Sin historial todavía.</span>`;
    return;
  }

  recentSearchesContainer.innerHTML = items
    .map(
      (item) => `
        <button class="recent-chip" type="button" onclick="buscarReciente('${escapeHtml(item)}')">
          ${escapeHtml(item)}
        </button>
      `
    )
    .join("");
}

function renderResults(animes) {
  if (!animes.length) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron resultados.</p>
      </div>
    `;
    return;
  }

  const favorites = getFavorites();

  resultsContainer.innerHTML = animes
    .map((anime) => {
      const favoriteActive = favorites.some((item) => item.malId === anime.malId);

      return `
        <article class="card">
          <img
            class="card-poster"
            src="${escapeHtml(anime.image || "")}"
            alt="${escapeHtml(anime.title || "Anime")}"
          />
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(anime.title || "Sin título")}</h3>
            <p class="card-meta"><strong>Año:</strong> ${escapeHtml(anime.year || "N/D")}</p>
            <p class="card-meta"><strong>Estado:</strong> ${escapeHtml(anime.status || "N/D")}</p>
            <p class="card-meta"><strong>Score:</strong> ${escapeHtml(anime.score ?? "N/D")}</p>

            <div class="card-actions">
              <button class="card-button" onclick="verDetalle(${anime.malId})">Ver detalle</button>
              <button
                class="favorite-button ${favoriteActive ? "active" : ""}"
                onclick="toggleFavoriteById(${anime.malId})"
              >
                ${favoriteActive ? "★" : "☆"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function buscar() {
  const query = searchInput.value.trim();

  if (!query) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <p>Escribí algo para buscar.</p>
      </div>
    `;
    setStatus("");
    return;
  }

  showingFavorites = false;
  favoritesBtn.textContent = "Ver favoritos";

  setSearchingState(true);
  setStatus("Consultando anime...");
  resultsContainer.innerHTML = `
    <div class="loader-state">
      <p>Cargando resultados...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();

    if (!res.ok || !json.data) {
      throw new Error(json.message || "Error al buscar anime");
    }

    currentResults = json.data;
    renderResults(currentResults);
    setStatus(`Resultados encontrados: ${currentResults.length}`);
    saveRecentSearch(query);
  } catch (error) {
    console.error("Error en buscar:", error);
    resultsContainer.innerHTML = `
      <div class="error-state">
        <p>Error: ${escapeHtml(error.message)}</p>
      </div>
    `;
    setStatus("Ocurrió un error en la búsqueda.");
  } finally {
    setSearchingState(false);
  }
}

async function cargarTopAnime() {
  setStatus("Cargando top anime...");

  try {
    const res = await fetch(`${API}/api/search?q=top`);
    const json = await res.json();

    if (!res.ok || !json.data) {
      throw new Error(json.message || "No se pudo cargar el top anime");
    }

    currentResults = json.data;
    renderResults(currentResults);
    setStatus(`Top anime cargado: ${currentResults.length} resultados`);
  } catch (error) {
    console.error("Error cargando top anime:", error);
    resultsContainer.innerHTML = `
      <div class="error-state">
        <p>Error: ${escapeHtml(error.message)}</p>
      </div>
    `;
    setStatus("No se pudo cargar el top anime.");
  }
}

function buscarReciente(query) {
  searchInput.value = query;
  buscar();
}

function mostrarFavoritos() {
  const favorites = getFavorites();
  showingFavorites = true;
  favoritesBtn.textContent = "Volver a búsqueda";
  currentResults = favorites;
  renderResults(favorites);
  setStatus(favorites.length ? `Favoritos guardados: ${favorites.length}` : "No tenés favoritos todavía.");
}

function volverABusqueda() {
  showingFavorites = false;
  favoritesBtn.textContent = "Ver favoritos";
  currentResults = [];
  cargarTopAnime();
}

function toggleFavoritesView() {
  if (showingFavorites) {
    volverABusqueda();
  } else {
    mostrarFavoritos();
  }
}

function toggleFavoriteById(id) {
  const all = [...currentResults, ...getFavorites()];
  const anime = all.find((item) => item.malId === id);

  if (!anime) return;

  toggleFavorite(anime);
}

function renderGenres(genres = []) {
  if (!genres.length) {
    return "<p>No disponible</p>";
  }

  return `
    <div class="tags">
      ${genres.map((genre) => `<span class="tag">${escapeHtml(genre)}</span>`).join("")}
    </div>
  `;
}

function renderStreaming(streaming = []) {
  if (!streaming.length) {
    return "<p>No disponible</p>";
  }

  return `
    <div class="streaming-list">
      ${streaming
        .map(
          (item) => `
            <div class="streaming-item">
              ${
                item.logo
                  ? `<img class="streaming-logo" src="${escapeHtml(item.logo)}" alt="${escapeHtml(
                      item.name || "Streaming"
                    )}" />`
                  : ""
              }
              <span>${escapeHtml(item.name || "Desconocido")}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderTrailerToggle() {
  if (!currentModalAnime?.trailer?.videoId) {
    return "<p>No hay trailer disponible.</p>";
  }

  return `
    <button class="trailer-toggle-btn" onclick="toggleTrailer()">
      ${trailerVisible ? "Ocultar trailer" : "Ver trailer"}
    </button>
    ${
      trailerVisible
        ? `
          <iframe
            class="trailer-frame"
            src="https://www.youtube.com/embed/${escapeHtml(currentModalAnime.trailer.videoId)}"
            title="Trailer de ${escapeHtml(currentModalAnime.title || "anime")}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        `
        : ""
    }
  `;
}

function renderModal(anime) {
  currentModalAnime = anime;

  const favoriteActive = isFavorite(anime.malId);

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div>
        <img
          class="modal-poster"
          src="${escapeHtml(anime.image || "")}"
          alt="${escapeHtml(anime.title || "Anime")}"
        />
      </div>

      <div>
        <h2 class="detail-title">${escapeHtml(anime.title || "Sin título")}</h2>

        <div class="detail-meta">
          <div class="meta-box">
            <strong>Año</strong>
            <span>${escapeHtml(anime.year || "N/D")}</span>
          </div>
          <div class="meta-box">
            <strong>Episodios</strong>
            <span>${escapeHtml(anime.episodes || "N/D")}</span>
          </div>
          <div class="meta-box">
            <strong>Estado</strong>
            <span>${escapeHtml(anime.status || "N/D")}</span>
          </div>
          <div class="meta-box">
            <strong>Score</strong>
            <span>${escapeHtml(anime.score || "N/D")}</span>
          </div>
          <div class="meta-box">
            <strong>Título japonés</strong>
            <span>${escapeHtml(anime.titleJapanese || "N/D")}</span>
          </div>
          <div class="meta-box">
            <strong>Estudios</strong>
            <span>${escapeHtml((anime.studios || []).join(", ") || "N/D")}</span>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <button
            class="favorite-button ${favoriteActive ? "active" : ""}"
            onclick="toggleFavoriteFromModal()"
          >
            ${favoriteActive ? "★ Quitar de favoritos" : "☆ Guardar en favoritos"}
          </button>
        </div>

        <h3 class="section-title">Géneros</h3>
        ${renderGenres(anime.genres)}

        <h3 class="section-title">Sinopsis</h3>
        <p class="synopsis">${escapeHtml(anime.synopsis || "Sin descripción disponible.")}</p>

        <h3 class="section-title">Streaming</h3>
        ${renderStreaming(anime.streaming)}

        <h3 class="section-title">Trailer</h3>
        <div id="trailerContainer">
          ${renderTrailerToggle()}
        </div>
      </div>
    </div>
  `;
}

async function verDetalle(id) {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  modalBody.innerHTML = `
    <div class="loader-state">
      <p>Cargando detalle...</p>
    </div>
  `;

  modal.scrollTop = 0;
  modalContent?.scrollTo(0, 0);
  trailerVisible = false;

  try {
    const res = await fetch(`${API}/api/anime/${id}`);
    const json = await res.json();

    if (!res.ok || !json.data) {
      throw new Error(json.message || "Error al obtener detalle");
    }

    renderModal(json.data);

    modal.scrollTop = 0;
    modalContent?.scrollTo(0, 0);
  } catch (error) {
    console.error("Error en verDetalle:", error);
    modalBody.innerHTML = `
      <div class="error-state">
        <p>Error: ${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function toggleTrailer() {
  if (!currentModalAnime) return;
  trailerVisible = !trailerVisible;

  const trailerContainer = document.getElementById("trailerContainer");
  if (trailerContainer) {
    trailerContainer.innerHTML = renderTrailerToggle();
  }
}

function toggleFavoriteFromModal() {
  if (!currentModalAnime) return;
  toggleFavorite(currentModalAnime);
  renderModal(currentModalAnime);
}

function cerrarModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
  modal.scrollTop = 0;
  modalContent?.scrollTo(0, 0);
  currentModalAnime = null;
  trailerVisible = false;
}

closeModalBtn.addEventListener("click", cerrarModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    cerrarModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    cerrarModal();
  }
});

searchBtn.addEventListener("click", buscar);
favoritesBtn.addEventListener("click", toggleFavoritesView);
clearHistoryBtn.addEventListener("click", clearRecentSearches);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    buscar();
  }
});

function init() {
  renderRecentSearches();
  updateFavoritesCount();
  cargarTopAnime();
}

window.buscar = buscar;
window.verDetalle = verDetalle;
window.buscarReciente = buscarReciente;
window.toggleFavoriteById = toggleFavoriteById;
window.toggleFavoriteFromModal = toggleFavoriteFromModal;
window.toggleTrailer = toggleTrailer;

init();