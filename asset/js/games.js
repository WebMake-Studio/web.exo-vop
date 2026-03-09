/* ================================================================
   EXO VOP — asset/js/games.js
   Chargement des annonces depuis Supabase
   © 2025 Rafael ISTE / FarTekTV
   ================================================================ */

let allAnnouncements = [];
let activeFilter = 'all';


/* ══════════════════════════════════════════════
   CHARGEMENT DES JEUX DEPUIS SUPABASE
══════════════════════════════════════════════ */
const GAME_PALETTE = [
  { color: 'var(--cyan)', bg: 'rgba(0,229,255,.08)',  border: 'rgba(0,229,255,.25)',  cls: 'cyan' },
  { color: 'var(--red)',  bg: 'rgba(255,61,90,.08)',   border: 'rgba(255,61,90,.25)',  cls: 'red'  },
  { color: 'var(--violet)', bg: 'rgba(123,47,255,.08)', border: 'rgba(123,47,255,.25)', cls: 'violet' },
  { color: 'var(--green)', bg: 'rgba(0,255,136,.08)',  border: 'rgba(0,255,136,.25)', cls: 'green' },
];

async function loadGames() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 0">
      <div class="loader"></div>
      <p style="color:var(--text-dim);font-size:.88rem">${t('gp_loading_games')}</p>
    </div>`;

  let gamesData = [];

  if (!db) {
    gamesData = getDemoGamesPublic();
  } else {
    try {
      const { data, error } = await db
        .from('games')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      gamesData = data && data.length ? data : getDemoGamesPublic();
    } catch (err) {
      console.error('Erreur chargement jeux:', err);
      gamesData = getDemoGamesPublic();
    }
  }

  renderGamesPublic(gamesData);
  updateAnnouncementFilters(gamesData);
}

function renderGamesPublic(gamesData) {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  if (!gamesData.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-dim)">
        ${t('gp_no_games')}
      </div>`;
    return;
  }

  /* Après injection du HTML, forcer la visibilité des éléments reveal */
  const forceReveal = () => {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  };

  grid.innerHTML = gamesData.map((g, i) => {
    const pal = GAME_PALETTE[i % GAME_PALETTE.length];
    const ini = (g.name || '?').charAt(0).toUpperCase();
    const features = g.description
      ? ''  /* si pas de features array, on affiche juste la description */
      : '';

    /* Découper la description en features si elle contient des "\n" */
    let featureList = '';
    if (g.features && Array.isArray(g.features)) {
      featureList = g.features.map(f =>
        `<div class="game-feature">${escHtml(f)}</div>`
      ).join('');
    }

    const playBtn = g.roblox_url
      ? `<a class="btn-game" href="${escHtml(g.roblox_url)}" target="_blank" rel="noopener noreferrer"
           style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:9px;
                  background:${pal.bg};border:1px solid ${pal.border};color:${pal.color};
                  font-family:var(--font-head);font-size:.75rem;font-weight:700;letter-spacing:1px;text-decoration:none;">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
           <span>${t('gp_play_now')}</span>
         </a>`
      : `<span style="font-size:.78rem;color:var(--text-dim)">Lien Roblox non configuré</span>`;

    const maxP = g.max_players
      ? `<div style="font-size:.75rem;color:${pal.color};margin-top:6px;font-family:var(--font-head);letter-spacing:.5px">
           👥 ${g.max_players} ${t('gp_players_max')}
         </div>`
      : '';

    return `
      <div class="game-info-card ${pal.cls} reveal visible" style="animation:gameCardIn .45s ease forwards;animation-delay:${i * 0.12}s;opacity:0">
        <div class="game-info-header">
          <div class="game-info-icon">${escHtml(ini)}</div>
          <div>
            <div class="game-info-title">${escHtml(g.name)}</div>
            <span class="game-info-tag">${escHtml(g.genre || 'Roblox')}</span>
          </div>
        </div>
        <p class="game-info-desc">${escHtml(g.description || 'Découvrez ce jeu sur Roblox.')}</p>
        ${featureList ? `<div class="game-info-features">${featureList}</div>` : ''}
        ${maxP}
        <div style="margin-top:20px">${playBtn}</div>
      </div>`;
  }).join('');

  /* Forcer la visibilité après injection dynamique */
  requestAnimationFrame(forceReveal);
}

/* Met à jour les onglets de filtre des annonces selon les jeux actifs */
function updateAnnouncementFilters(gamesData) {
  const tabsEl = document.querySelector('.game-tabs');
  if (!tabsEl || !gamesData.length) return;

  /* Conserver le bouton "Toutes les annonces" */
  const allBtn = tabsEl.querySelector('[data-filter="all"]');
  if (!allBtn) return;

  /* Supprimer les anciens boutons spécifiques */
  tabsEl.querySelectorAll('[data-filter]:not([data-filter="all"])').forEach(b => b.remove());

  /* Ajouter un bouton par jeu */
  gamesData.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.filter = g.slug || g.id;
    btn.onclick = () => setFilterBySlug(g.slug || g.id);
    btn.textContent = g.name;
    tabsEl.appendChild(btn);
  });
}

/* Filtre les annonces par slug de jeu */
function setFilterBySlug(slug) {
  activeFilter = slug;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === slug);
  });
  renderAnnouncements();
}

function getDemoGamesPublic() {
  return [
    {
      id:'dg1', name:'Silix RP', slug:'silix_rp', genre:'Jeu de rôle',
      description:"Un jeu de rôle immersif où chaque décision façonne ton destin. Crée ton personnage, bâtis ta réputation et explore un monde vivant.",
      roblox_url:'#LIEN_ROBLOX_SILIX_ICI', max_players:20, active:true, sort_order:0
    },
    {
      id:'dg2', name:'Kill a Monster', slug:'kill_a_monster', genre:'Action / Combat',
      description:"Un jeu d'action intense où la survie est ta seule priorité. Chasse, combats et prouve ta valeur.",
      roblox_url:'#LIEN_ROBLOX_KAM_ICI', max_players:6, active:true, sort_order:1
    },
  ];
}

/* ── Fetch announcements ── */
async function loadAnnouncements() {
  const grid = document.getElementById('announcements-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="loader-wrap" style="grid-column:1/-1">
      <div class="loader"></div>
      <p class="loader-text" data-i18n="gp_loading">${t('gp_loading')}</p>
    </div>`;

  if (!db) {
    // Demo data if Supabase not configured
    allAnnouncements = getDemoAnnouncements();
    renderAnnouncements();
    return;
  }

  try {
    const { data, error } = await db
      .from('announcements')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    allAnnouncements = data || [];
    renderAnnouncements();
  } catch (err) {
    console.error('Supabase error:', err);
    allAnnouncements = getDemoAnnouncements();
    renderAnnouncements();
  }
}

/* ── Filter tabs ── */
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderAnnouncements();
}

/* ── Render ── */
function renderAnnouncements() {
  const grid = document.getElementById('announcements-grid');
  if (!grid) return;

  const filtered = activeFilter === 'all'
    ? allAnnouncements
    : allAnnouncements.filter(a => a.game === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">📢</div>
        <p class="empty-state-title">${t('gp_no_ann')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((ann, i) => `
    <div class="announcement-card" data-game="${ann.game}"
         style="animation-delay:${i * 0.07}s">
      ${ann.image_url
        ? `<img class="ann-image" src="${ann.image_url}" alt="${escHtml(ann.title)}" loading="lazy" />`
        : `<div class="ann-image-placeholder">${gameEmoji(ann.game)}</div>`
      }
      <div class="ann-body">
        <div class="ann-meta">
          <span class="ann-game-badge ${ann.game}">${gameName(ann.game)}</span>
          <span class="ann-date">${formatDate(ann.created_at)}</span>
        </div>
        <h3 class="ann-title">${escHtml(ann.title)}</h3>
        <p class="ann-content">${escHtml(ann.content)}</p>
      </div>
    </div>`).join('');
}

/* ── Helpers ── */
function gameEmoji(game) {
  return { silix_rp: '🏙️', kill_a_monster: '⚔️', general: '📢' }[game] || '📢';
}
function gameName(game) {
  const known = { silix_rp: 'Silix RP', kill_a_monster: 'Kill a Monster', general: 'Général' };
  return known[game] || game;
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Demo data (when Supabase not configured) ── */
function getDemoAnnouncements() {
  return [
    {
      id: '1', game: 'silix_rp', published: true,
      title: 'Mise à jour 2.0 — Nouveau quartier disponible !',
      content: 'Un tout nouveau quartier fait son apparition dans Silix RP. Explorez les rues de la zone commerciale, découvrez de nouveaux commerces et de nouvelles opportunités de roleplay !',
      image_url: null, created_at: new Date(Date.now() - 86400000*2).toISOString()
    },
    {
      id: '2', game: 'kill_a_monster', published: true,
      title: 'Nouveau boss : Le Dragon Ancien',
      content: 'Le Dragon Ancien fait son entrée dans Kill a Monster ! Ce boss légendaire vous défiera comme jamais auparavant. Préparez vos meilleures armes et formez des équipes pour l\'affronter.',
      image_url: null, created_at: new Date(Date.now() - 86400000*5).toISOString()
    },
    {
      id: '3', game: 'general', published: true,
      title: 'Exo VOP recrute !',
      content: 'Notre studio est à la recherche de nouveaux talents passionnés par Roblox. Builders, scripters, designers — rejoignez l\'aventure Exo VOP !',
      image_url: null, created_at: new Date(Date.now() - 86400000*7).toISOString()
    },
    {
      id: '4', game: 'silix_rp', published: true,
      title: 'Événement de Noël — Décorations & Quêtes spéciales',
      content: 'Pour les fêtes, Silix RP se pare de décorations hivernales. Des quêtes spéciales sont disponibles jusqu\'au 31 décembre avec des récompenses exclusives !',
      image_url: null, created_at: new Date(Date.now() - 86400000*10).toISOString()
    },
    {
      id: '5', game: 'kill_a_monster', published: true,
      title: 'Patch notes v1.4 — Équilibrage des classes',
      content: 'Amélioration des classes Guerrier et Mage suite à vos retours. Les temps de recharge des compétences ont été ajustés pour une meilleure expérience de jeu.',
      image_url: null, created_at: new Date(Date.now() - 86400000*14).toISOString()
    },
  ];
}

/* ── i18n update hook ── */
function onLangChange(lang) {
  /* Re-render tout en nouvelle langue */
  renderAnnouncements();
  /* Recharger les cartes jeux dynamiques (contiennent du t()) */
  const grid = document.getElementById('games-grid');
  if (grid && grid.children.length > 0 && !grid.querySelector('.loader')) {
    loadGames();
  }
  /* Mettre à jour les data-i18n dans la section annonces qui sont injectés dynamiquement */
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadGames();       /* cartes de jeux dynamiques */
  loadAnnouncements(); /* annonces */
});