/* ================================================================
   EXO VOP — js/home.js
   Chargement dynamique des jeux sur la page d'accueil (max 2)
   © 2025 Rafael ISTE / FarTekTV
   ================================================================ */

/* Palette couleur — correspondance index → classe CSS */
const HOME_PALETTES = ['cyan', 'red', 'violet', 'green'];

async function loadHomeGames() {
  const grid = document.getElementById('home-games-grid');
  if (!grid) return;

  let gamesData = [];

  if (!db) {
    gamesData = getHomeGamesDemo();
  } else {
    try {
      const { data, error } = await db
        .from('games')
        .select('id, name, slug, genre, description, roblox_url, sort_order')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(2);  /* ← on ne récupère que les 2 premiers */
      if (error) throw error;
      gamesData = data && data.length ? data : getHomeGamesDemo();
    } catch (err) {
      console.warn('loadHomeGames:', err.message);
      gamesData = getHomeGamesDemo();
    }
  }

  renderHomeGames(gamesData);
}

function renderHomeGames(gamesData) {
  const grid = document.getElementById('home-games-grid');
  if (!grid) return;

  /* Toujours afficher exactement 2 cartes */
  const items = gamesData.slice(0, 2);

  grid.innerHTML = items.map((g, i) => {
    const pal = HOME_PALETTES[i % HOME_PALETTES.length];
    const ini = (g.name || '?').charAt(0).toUpperCase();
    const delay = i === 0 ? '0s' : '0.14s';

    const playBtn = g.roblox_url
      ? `<a class="btn-game" href="${escHtmlHome(g.roblox_url)}" target="_blank" rel="noopener noreferrer"
            style="animation:homeCardIn .45s ease forwards;animation-delay:${delay}">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
           <span>${t('btn_play')}</span>
         </a>`
      : '';

    return `
      <div class="game-preview-card ${pal} reveal visible"
           style="animation:homeCardIn .45s ease forwards;animation-delay:${delay};opacity:0">
        <div class="game-banner">
          <div class="game-banner-glow"></div>
          <div class="game-icon">${escHtmlHome(ini)}</div>
        </div>
        <div class="game-card-body">
          <span class="game-tag">${escHtmlHome(g.genre || 'Roblox')}</span>
          <h3 class="game-name">${escHtmlHome(g.name)}</h3>
          <p class="game-desc">${escHtmlHome(g.description || '')}</p>
          <div class="game-actions">
            ${playBtn}
            <a class="btn-details" href="jeux.html">${t('btn_details')}</a>
          </div>
        </div>
      </div>`;
  }).join('');

  /* Appliquer i18n sur les éventuels data-i18n générés */
  if (typeof setLang === 'function') setLang(currentLang);
}

function escHtmlHome(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getHomeGamesDemo() {
  return [
    {
      id: 'dg1', name: 'Silix RP', slug: 'silix_rp', genre: 'Jeu de rôle',
      description: "Un jeu de rôle immersif où chaque décision façonne ton destin. Crée ton personnage, bâtis ta réputation.",
      roblox_url: '#LIEN_ROBLOX_SILIX_ICI', sort_order: 0
    },
    {
      id: 'dg2', name: 'Kill a Monster', slug: 'kill_a_monster', genre: 'Action / Combat',
      description: "Un jeu d'action intense où la survie est ta seule priorité. Chasse, combats et prouve ta valeur.",
      roblox_url: '#LIEN_ROBLOX_KAM_ICI', sort_order: 1
    }
  ];
}

/* ── i18n hook — rerender si changement de langue ── */
const _origOnLangChange = typeof onLangChange === 'function' ? onLangChange : null;
function onLangChange(lang) {
  if (_origOnLangChange) _origOnLangChange(lang);
  loadHomeGames();
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', loadHomeGames);