(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let rx = 0, ry = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';
  });

  (function animateRing() {
    rx += (tx - rx) * 0.1;
    ry += (ty - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="button"]')) {
      cursor.style.width  = '18px';
      cursor.style.height = '18px';
      cursor.style.background = 'var(--violet)';
      ring.style.width  = '50px';
      ring.style.height = '50px';
      ring.style.borderColor = 'rgba(123,47,255,.5)';
    } else {
      cursor.style.width  = '12px';
      cursor.style.height = '12px';
      cursor.style.background = 'var(--cyan)';
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(0,229,255,.45)';
    }
  });
})();

(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function create() {
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      o: Math.random() * 0.7 + 0.1,
      s: Math.random() * 0.35 + 0.05,
      d: Math.random() > 0.5 ? 1 : -1
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.o += s.s * s.d * 0.007;
      if (s.o > 0.9 || s.o < 0.05) s.d *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,214,240,${s.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize(); create(); draw();
  window.addEventListener('resize', () => { resize(); create(); });
})();

(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  const path = window.location.pathname.split('/').pop() || '/index';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const page = href.split('/').pop();
    if (page === path || (path === '' && page === '/index')) {
      a.classList.add('active');
    }
  });
})();

function toggleMobileMenu() {
  const menu  = document.getElementById('mobile-menu');
  const burge = document.getElementById('hamburger');
  if (!menu) return;
  menu.classList.toggle('open');
  burge.classList.toggle('open');
}

(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

const translations = {
  fr: {
    nav_home:    'Accueil',
    nav_games:   'Jeux',
    nav_team:    'Équipe',
    nav_contact: 'Contact',
    hero_badge:   'Studio Roblox Indépendant',
    hero_tagline: 'Créateurs de mondes. Bâtisseurs d\'expériences.',
    hero_cta1:   'Découvrir nos jeux',
    hero_cta2:   'Rejoindre Discord',
    scroll:       'SCROLL',
    stat_games:  'Jeux actifs',
    stat_passion:'Passion',
    stat_studio: 'Studio',
    stat_indie:  'Indépendant',
    games_label: 'Nos créations',
    games_title: 'Plonge dans nos univers',
    games_sub:   'Deux expériences uniques sur Roblox, conçues avec passion par l\'équipe Exo VOP.',
    tag_rp:      'Jeu de rôle',
    tag_action:  'Action / Combat',
    silix_desc:  'Un jeu de rôle immersif où chaque décision façonne ton destin. Crée ton personnage, bâtis ta réputation.',
    kam_desc:    'Un jeu d\'action intense où la survie est ta seule priorité. Chasse, combats et prouve ta valeur.',
    btn_play:    'Jouer maintenant',
    btn_details: 'En savoir plus →',
    meta_roblox: 'Disponible sur Roblox',
    team_label:  'Les bâtisseurs',
    team_title:  'Notre équipe',
    team_sub:    'Des passionnés qui mettent leur talent au service de chaque expérience de jeu.',
    role_founder:'Fondateur & Lead Dev',
    role_founder_desc: 'Visionnaire du studio, architecte des univers Exo VOP.',
    role_designer:'Game Designer',
    role_designer_desc: 'Crée les mécaniques et l\'expérience de jeu.',
    role_builder:'Builder / 3D',
    role_builder_desc: 'Donne vie aux environnements et aux maps.',
    team_join:   'Rejoindre l\'équipe',
    contact_label:'Nous contacter',
    contact_title:'Rejoins l\'aventure',
    contact_sub:  'Une question, une collaboration ou envie de rejoindre l\'équipe ? On est là.',
    discord_sub:  'Rejoins notre serveur communautaire',
    roblox_sub:   'Rejoins le groupe officiel Exo VOP',
    form_name:    'Pseudo / Nom',
    form_email:   'Email',
    form_subject: 'Sujet',
    form_subject_opt0:'Sélectionner un sujet',
    form_subject_opt1:'Collaboration',
    form_subject_opt2:'Rejoindre l\'équipe',
    form_subject_opt3:'Signalement / Bug',
    form_subject_opt4:'Autre',
    form_message: 'Message',
    form_send:    'Envoyer →',
    footer_rights:'Tous droits réservés.',
    footer_disc:  'Studio indépendant non affilié à Roblox Corporation.',
    gp_label:    'Nos jeux',
    gp_title:    'Les jeux Exo VOP',
    gp_sub:      'Découvrez nos créations disponibles sur Roblox.',
    gp_tab_all:  'Toutes les annonces',
    gp_tab_silix:'Silix RP',
    gp_tab_kam:  'Kill a Monster',
    gp_no_ann:   'Aucune annonce pour le moment.',
    gp_loading:  'Chargement des annonces...',
    tp_label:    'Notre studio',
    tp_title:    'L\'équipe Exo VOP',
    tp_sub:      'Les personnes derrière chaque ligne de code et chaque monde construit.',
    tp_loading:  'Chargement de l\'équipe...',
    tp_no_team:  'Aucun membre pour le moment.',
    nav_discord: 'Discord',
    gp_loading_games: 'Chargement des jeux...',
    gp_ann_label:     '📢 Annonces',
    gp_ann_title:     'Dernières <span class="c">nouveautés</span>',
    contact_discord_name: 'Discord',
    contact_roblox_name:  'Groupe Roblox',
    gp_no_games:    'Aucun jeu disponible pour le moment.',
    gp_play_now:    'Jouer maintenant',
    gp_roblox_link: 'Voir sur Roblox',
    gp_no_roblox:   'Lien Roblox non configuré',
    gp_players_max: 'joueurs max',
    hero_title:         'Créateurs de <span class="c">mondes</span>.',
    games_title_html:   'Plonge dans nos <span class="c">univers</span>',
    team_title_html:    'Notre <span class="v">équipe</span>',
    gp_title_html:      'Les jeux <span class="c">Exo VOP</span>',
    tp_title_html:      'L\'équipe <span class="v">Exo VOP</span>',
    contact_title_html: 'Rejoins <span class="c">l\'aventure</span>',
  },
  en: {
    nav_home:    'Home',
    nav_games:   'Games',
    nav_team:    'Team',
    nav_contact: 'Contact',
    logo_placeholder: 'Your logo here',
    hero_badge:   'Independent Roblox Studio',
    hero_tagline: 'World creators. Experience builders.',
    hero_cta1:   'Discover our games',
    hero_cta2:   'Join Discord',
    scroll:       'SCROLL',
    stat_games:  'Active games',
    stat_passion:'Passion',
    stat_studio: 'Studio',
    stat_indie:  'Independent',
    games_label: 'Our creations',
    games_title: 'Dive into our worlds',
    games_sub:   'Two unique Roblox experiences, crafted with passion by the Exo VOP team.',
    tag_rp:      'Role Play',
    tag_action:  'Action / Combat',
    silix_desc:  'An immersive role-playing game where every decision shapes your destiny. Create your character, build your reputation.',
    kam_desc:    'An intense action game where survival is your only priority. Hunt, fight and prove your worth.',
    btn_play:    'Play now',
    btn_details: 'Learn more →',
    meta_roblox: 'Available on Roblox',
    team_label:  'The builders',
    team_title:  'Our team',
    team_sub:    'Passionate people who put their talent at the service of every gaming experience.',
    role_founder:'Founder & Lead Dev',
    role_founder_desc: 'Studio visionary, architect of the Exo VOP universes.',
    role_designer:'Game Designer',
    role_designer_desc: 'Creates game mechanics and player experience.',
    role_builder:'Builder / 3D',
    role_builder_desc: 'Brings environments and maps to life.',
    team_join:   'Join the team',
    contact_label:'Get in touch',
    contact_title:'Join the adventure',
    contact_sub:  'A question, a collaboration or want to join the team? We\'re here.',
    discord_sub:  'Join our community server',
    roblox_sub:   'Join the official Exo VOP group',
    form_name:    'Username / Name',
    form_email:   'Email',
    form_subject: 'Subject',
    form_subject_opt0:'Select a subject',
    form_subject_opt1:'Collaboration',
    form_subject_opt2:'Join the team',
    form_subject_opt3:'Report / Bug',
    form_subject_opt4:'Other',
    form_message: 'Message',
    form_send:    'Send →',
    footer_rights:'All rights reserved.',
    footer_disc:  'Independent studio not affiliated with Roblox Corporation.',
    gp_label:    'Our games',
    gp_title:    'Exo VOP Games',
    gp_sub:      'Discover our creations available on Roblox.',
    gp_tab_all:  'All announcements',
    gp_tab_silix:'Silix RP',
    gp_tab_kam:  'Kill a Monster',
    gp_no_ann:   'No announcements yet.',
    gp_loading:  'Loading announcements...',
    tp_label:    'Our studio',
    tp_title:    'The Exo VOP Team',
    tp_sub:      'The people behind every line of code and every world built.',
    tp_loading:  'Loading team...',
    tp_no_team:  'No members yet.',
    nav_discord: 'Discord',
    gp_loading_games: 'Loading games...',
    gp_ann_label:     '📢 Announcements',
    gp_ann_title:     'Latest <span class="c">updates</span>',
    contact_discord_name: 'Discord',
    contact_roblox_name:  'Roblox Group',
    gp_no_games:    'No games available yet.',
    gp_play_now:    'Play now',
    gp_roblox_link: 'View on Roblox',
    gp_no_roblox:   'Roblox link not configured',
    gp_players_max: 'max players',
    hero_title:         'World <span class="c">creators</span>.',
    games_title_html:   'Dive into our <span class="c">worlds</span>',
    team_title_html:    'Our <span class="v">team</span>',
    gp_title_html:      '<span class="c">Exo VOP</span> Games',
    tp_title_html:      'The <span class="v">Exo VOP</span> Team',
    contact_title_html: 'Join the <span class="c">adventure</span>',
  }
};

let currentLang = localStorage.getItem('exoVOP_lang') || 'fr';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('exoVOP_lang', lang);
  document.documentElement.lang = lang;

  const btnFr = document.getElementById('btn-fr');
  const btnEn = document.getElementById('btn-en');
  if (btnFr) btnFr.classList.toggle('active', lang === 'fr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = translations[lang]?.[key];
    if (!val) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (el.tagName === 'OPTION') {
      el.textContent = val;
    } else {
      el.innerHTML = val;
    }
  });

  if (typeof onLangChange === 'function') onLangChange(lang);
}

function t(key) {
  return translations[currentLang]?.[key] || translations['fr']?.[key] || key;
}

document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
});