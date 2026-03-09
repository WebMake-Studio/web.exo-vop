async function checkAuth() {
  if (!db) {
    showAdminError('Supabase non configuré. Éditez js/config.js');
    return false;
  }
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = '/index';
    return false;
  }
  const emailEl = document.getElementById('admin-email');
  if (emailEl) emailEl.textContent = session.user.email;
  return true;
}

async function adminLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('admin-login-email').value.trim();
  const password = document.getElementById('admin-login-password').value;
  const btn      = document.getElementById('btn-do-login');
  const errEl    = document.getElementById('login-error');

  btn.disabled = true;
  btn.textContent = '...';
  errEl.classList.remove('show');

  if (!db) {
    errEl.textContent = 'Supabase non configuré. Éditez js/config.js';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Connexion';
    return;
  }

  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    errEl.textContent = error.message === 'Invalid login credentials'
      ? 'Email ou mot de passe incorrect.'
      : error.message;
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Connexion';
    return;
  }
  window.location.href = 'dashboard.html';
}

async function adminLogout() {
  if (db) await db.auth.signOut();
  window.location.href = 'index.html';
}

function showTab(tabName) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(l => l.classList.remove('active'));
  const tab  = document.getElementById(`tab-${tabName}`);
  const link = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
  if (tab)  tab.classList.add('active');
  if (link) link.classList.add('active');

  const titleEl = document.getElementById('admin-topbar-title');
  if (titleEl) {
    const titles = {
      announcements: '📢 Annonces',
      team:          '👥 Équipe',
      messages:      '📬 Messages de contact',
      games:         '🎮 Jeux',
      settings:      '⚙️ Paramètres',
      overview:      '🏠 Vue d\'ensemble'
    };
    titleEl.textContent = titles[tabName] || 'Admin';
  }

  if (tabName === 'announcements') loadAdminAnnouncements();
  if (tabName === 'team')          loadAdminTeam();
  if (tabName === 'messages')      loadAdminMessages();
  if (tabName === 'games')         loadAdminGames();
  if (tabName === 'overview')      loadOverview();
}

async function loadOverview() {
  if (!db) {
    games = getDemoGames();
    updateGamesOverview();
    return;
  }

  try {
    const [
      { count: annCount },
      { count: teamCount },
      { count: msgCount },
      { data: gamesData }
    ] = await Promise.all([
      db.from('announcements').select('*', { count: 'exact', head: true }),
      db.from('team_members').select('*', { count: 'exact', head: true }),
      db.from('contact_messages').select('*', { count: 'exact', head: true }),
      db.from('games').select('*').order('sort_order', { ascending: true })
    ]);

    const el1 = document.getElementById('stat-ann-count');
    const el2 = document.getElementById('stat-team-count');
    const el3 = document.getElementById('stat-msg-count');
    if (el1) el1.textContent = annCount  || 0;
    if (el2) el2.textContent = teamCount || 0;
    if (el3) el3.textContent = msgCount  || 0;

    const localGames = gamesData || [];
    games = localGames;
    updateGamesOverview();
  } catch (e) { console.error('loadOverview:', e); }
}

async function populateGameSelect(selectId, current = 'general') {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  sel.innerHTML = '<option value="general">🌐 Général</option>';

  let gList = games.length ? games : [];
  if (!gList.length && db) {
    const { data } = await db
      .from('games')
      .select('id, name, slug, active')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    gList = data || [];
  }

  const EMOJIS = ['🏙️','⚔️','🎯','🌍','🚀','🏆','⚡','🎮'];
  gList.forEach((g, i) => {
    const opt = document.createElement('option');
    opt.value = g.slug || g.id;
    opt.textContent = `${EMOJIS[i % EMOJIS.length]} ${g.name}`;
    sel.appendChild(opt);
  });

  sel.value = current;
  if (!sel.value) sel.value = 'general';
}


function getGameBadgeClass(slug) {
  if (slug === 'general') return 'general';
  const idx = games.findIndex(g => g.slug === slug || g.id === slug);
  return idx >= 0 ? `game-${idx % 6}` : 'general';
}

function getGameDisplayName(slug) {
  if (slug === 'general') return 'Général';
  const g = games.find(g => g.slug === slug || g.id === slug);
  return g ? g.name : slug;
}

let announcements = [];
let editingAnnId  = null;

async function loadAdminAnnouncements() {
  const tbody = document.getElementById('ann-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-dim)">Chargement...</td></tr>`;

  if (!db) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-dim)">Supabase non configuré</td></tr>`;
    return;
  }

  const fetches = [db.from('announcements').select('*').order('created_at', { ascending: false })];
  if (!games.length) {
    fetches.push(db.from('games').select('*').eq('active', true).order('sort_order', { ascending: true }));
  }

  const results = await Promise.all(fetches);
  const { data, error } = results[0];
  if (results[1]?.data) games = results[1].data;

  if (error) { showToast('Erreur chargement annonces : ' + error.message, 'error'); return; }
  announcements = data || [];
  renderAnnouncementsTable();

  const el = document.getElementById('stat-ann-count');
  if (el) el.textContent = announcements.length;
}

function renderAnnouncementsTable() {
  const tbody = document.getElementById('ann-tbody');
  if (!tbody) return;

  if (announcements.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-dim)">Aucune annonce</td></tr>`;
    return;
  }

  tbody.innerHTML = announcements.map(ann => `
    <tr>
      <td><strong style="color:var(--white)">${escHtml(ann.title)}</strong></td>
      <td><span class="table-badge ${getGameBadgeClass(ann.game)}">
        ${escHtml(getGameDisplayName(ann.game))}
      </span></td>
      <td>${formatDate(ann.created_at)}</td>
      <td><span class="table-badge ${ann.published ? 'published' : 'unpublished'}">${ann.published ? '● Publié' : '○ Brouillon'}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-edit"   onclick="openAnnModal('edit','${ann.id}')">Modifier</button>
          <button class="btn-table-delete" onclick="deleteAnnouncement('${ann.id}')">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

function openAnnModal(mode, id = null) {
  editingAnnId = mode === 'edit' ? id : null;
  const modal = document.getElementById('modal-ann');
  const title = document.getElementById('modal-ann-title');
  const form  = document.getElementById('form-ann');

  title.textContent = mode === 'edit' ? '✏️ Modifier l\'annonce' : '➕ Nouvelle annonce';
  form.reset();

  let currentGame = 'general';
  if (mode === 'edit') {
    const ann = announcements.find(a => a.id === id);
    if (ann) {
      form.querySelector('[name="title"]').value             = ann.title     || '';
      form.querySelector('[name="content"]').value           = ann.content   || '';
      form.querySelector('[name="image_url"]').value         = ann.image_url || '';
      form.querySelector('[name="published"]').checked       = ann.published;
      currentGame = ann.game || 'general';
    }
  }

  populateGameSelect('ann-game-select', currentGame);

  modal.classList.add('open');
}
function closeAnnModal() { document.getElementById('modal-ann').classList.remove('open'); }

async function saveAnnouncement() {
  const form  = document.getElementById('form-ann');
  const btn   = document.getElementById('btn-save-ann');
  const payload = {
    title:     form.querySelector('[name="title"]').value.trim(),
    content:   form.querySelector('[name="content"]').value.trim(),
    game:      form.querySelector('[name="game"]').value,
    image_url: form.querySelector('[name="image_url"]').value.trim() || null,
    published: form.querySelector('[name="published"]').checked
  };

  if (!payload.title || !payload.content) { showToast('Titre et contenu requis.', 'error'); return; }

  btn.disabled = true; btn.textContent = '...';

  const { error } = editingAnnId
    ? await db.from('announcements').update(payload).eq('id', editingAnnId)
    : await db.from('announcements').insert([payload]);

  btn.disabled = false; btn.textContent = 'Enregistrer';

  if (error) { showToast('Erreur : ' + error.message, 'error'); return; }
  showToast(editingAnnId ? 'Annonce mise à jour !' : 'Annonce créée !');
  closeAnnModal();
  loadAdminAnnouncements();
}

async function deleteAnnouncement(id) {
  if (!confirm('Supprimer cette annonce définitivement ?')) return;
  const { error } = await db.from('announcements').delete().eq('id', id);
  if (error) { showToast('Erreur : ' + error.message, 'error'); return; }
  showToast('Annonce supprimée.');
  loadAdminAnnouncements();
}

/* ══════════════════════════════════════════════
   TEAM MEMBERS
══════════════════════════════════════════════ */
let teamMembers  = [];
let editingMembId = null;

async function loadAdminTeam() {
  const tbody = document.getElementById('team-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-dim)">Chargement...</td></tr>`;

  if (!db) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-dim)">Supabase non configuré</td></tr>`; return; }

  const { data, error } = await db.from('team_members').select('*').order('sort_order', { ascending: true });
  if (error) { console.error(error); return; }
  teamMembers = data || [];
  renderTeamTable();

  const el = document.getElementById('stat-team-count');
  if (el) el.textContent = teamMembers.length;
}

function renderTeamTable() {
  const tbody = document.getElementById('team-tbody');
  if (!tbody) return;

  if (teamMembers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-dim)">Aucun membre</td></tr>`;
    return;
  }

  tbody.innerHTML = teamMembers.map(m => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(123,47,255,.1);border:1px solid rgba(123,47,255,.3);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:.85rem;color:var(--violet);flex-shrink:0;">
            ${m.avatar_url ? `<img src="${escHtml(m.avatar_url)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : escHtml(m.avatar_initial || m.name.charAt(0).toUpperCase())}
          </div>
          <strong style="color:var(--white)">${escHtml(m.name)}</strong>
        </div>
      </td>
      <td style="color:var(--violet)">${escHtml(m.role)}</td>
      <td style="color:var(--text-dim);font-size:.83rem">${m.description ? escHtml(m.description.substring(0, 60)) + (m.description.length > 60 ? '…' : '') : '—'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-edit"   onclick="openMembModal('edit','${m.id}')">Modifier</button>
          <button class="btn-table-delete" onclick="deleteMember('${m.id}')">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

function openMembModal(mode, id = null) {
  editingMembId = mode === 'edit' ? id : null;
  const modal = document.getElementById('modal-memb');
  const title = document.getElementById('modal-memb-title');
  const form  = document.getElementById('form-memb');

  title.textContent = mode === 'edit' ? '✏️ Modifier le membre' : '➕ Nouveau membre';
  form.reset();

  if (mode === 'edit') {
    const m = teamMembers.find(x => x.id === id);
    if (m) {
      form.querySelector('[name="name"]').value          = m.name || '';
      form.querySelector('[name="role"]').value          = m.role || '';
      form.querySelector('[name="description"]').value   = m.description || '';
      form.querySelector('[name="avatar_initial"]').value= m.avatar_initial || '';
      form.querySelector('[name="avatar_url"]').value    = m.avatar_url || '';
      form.querySelector('[name="sort_order"]').value    = m.sort_order ?? 0;
    }
  }
  modal.classList.add('open');
}
function closeMembModal() { document.getElementById('modal-memb').classList.remove('open'); }

async function saveMember() {
  const form = document.getElementById('form-memb');
  const btn  = document.getElementById('btn-save-memb');
  const payload = {
    name:           form.querySelector('[name="name"]').value.trim(),
    role:           form.querySelector('[name="role"]').value.trim(),
    description:    form.querySelector('[name="description"]').value.trim() || null,
    avatar_initial: form.querySelector('[name="avatar_initial"]').value.trim().charAt(0).toUpperCase() || null,
    avatar_url:     form.querySelector('[name="avatar_url"]').value.trim() || null,
    sort_order:     parseInt(form.querySelector('[name="sort_order"]').value) || 0
  };

  if (!payload.name || !payload.role) { showToast('Nom et rôle requis.', 'error'); return; }

  btn.disabled = true; btn.textContent = '...';

  const { error } = editingMembId
    ? await db.from('team_members').update(payload).eq('id', editingMembId)
    : await db.from('team_members').insert([payload]);

  btn.disabled = false; btn.textContent = 'Enregistrer';

  if (error) { showToast('Erreur : ' + error.message, 'error'); return; }
  showToast(editingMembId ? 'Membre mis à jour !' : 'Membre ajouté !');
  closeMembModal();
  loadAdminTeam();
}

async function deleteMember(id) {
  if (!confirm('Supprimer ce membre définitivement ?')) return;
  const { error } = await db.from('team_members').delete().eq('id', id);
  if (error) { showToast('Erreur : ' + error.message, 'error'); return; }
  showToast('Membre supprimé.');
  loadAdminTeam();
}

/* ── Helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
}
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function showAdminError(msg) {
  const main = document.querySelector('.admin-main');
  if (main) main.innerHTML = `<div style="padding:40px;color:var(--red);font-family:var(--font-head);">${msg}</div>`;
}

/* ── Close modal on overlay click ── */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closeAnnModal();
    closeMembModal();
    closeMsgModal();
  }
});

/* ══════════════════════════════════════════════
   CONTACT MESSAGES
══════════════════════════════════════════════ */
let contactMessages  = [];
let currentMsgId     = null;
let currentMsgEmail  = null;
let currentMsgName   = null;

async function loadAdminMessages() {
  const tbody = document.getElementById('msg-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-dim)">Chargement...</td></tr>`;

  if (!db) {
    contactMessages = getDemoMessages();
    renderMessagesTable();
    return;
  }

  /* Vérifier la session avant la requête */
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--red)">
      ⚠️ Session expirée. <a href="index.html" style="color:var(--cyan)">Reconnectez-vous.</a>
    </td></tr>`;
    return;
  }

  const { data, error } = await db
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--red)">
      ⚠️ Erreur Supabase : ${escHtml(error.message)}<br>
      <span style="font-size:.78rem;color:var(--text-dim);margin-top:8px;display:block">
        Exécutez ce SQL dans Supabase → SQL Editor :<br>
        <code style="color:var(--cyan)">CREATE POLICY "admin_select_msg" ON contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);</code>
      </span>
    </td></tr>`;
    showToast('Erreur lecture messages : ' + error.message, 'error');
    return;
  }

  contactMessages = data || [];
  renderMessagesTable();

  const badge  = document.getElementById('badge-msg');
  const statEl = document.getElementById('stat-msg-count');
  if (badge)  { badge.textContent = contactMessages.length; badge.style.display = contactMessages.length ? 'inline' : 'none'; }
  if (statEl) statEl.textContent = contactMessages.length;
}

function renderMessagesTable() {
  const tbody = document.getElementById('msg-tbody');
  if (!tbody) return;

  if (!contactMessages.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-dim)">Aucun message reçu.</td></tr>`;
    return;
  }

  tbody.innerHTML = contactMessages.map(m => `
    <tr>
      <td><strong style="color:var(--white)">${escHtml(m.name || '—')}</strong></td>
      <td style="color:var(--cyan);font-size:.83rem">${escHtml(m.email || '—')}</td>
      <td>
        <span class="table-badge general" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;display:inline-block">
          ${escHtml(m.subject || 'Autre')}
        </span>
      </td>
      <td style="color:var(--text-dim);font-size:.83rem;max-width:200px;">
        ${escHtml((m.message || '').substring(0, 70))}${m.message && m.message.length > 70 ? '…' : ''}
      </td>
      <td style="white-space:nowrap">${formatDate(m.created_at)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-edit" onclick="openMsgModal('${m.id}')">Voir / Répondre</button>
          <button class="btn-table-delete" onclick="deleteMessage('${m.id}')">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

function openMsgModal(id) {
  const m = contactMessages.find(x => x.id === id);
  if (!m) return;

  currentMsgId    = m.id;
  currentMsgEmail = m.email;
  currentMsgName  = m.name;

  document.getElementById('msg-detail-name').textContent    = m.name    || '—';
  document.getElementById('msg-detail-email').textContent   = m.email   || '—';
  document.getElementById('msg-detail-subject').textContent = m.subject || 'Autre';
  document.getElementById('msg-detail-content').textContent = m.message || '—';
  document.getElementById('msg-reply-text').value = '';

  document.getElementById('modal-msg').classList.add('open');
}

function closeMsgModal() {
  document.getElementById('modal-msg').classList.remove('open');
  currentMsgId = null; currentMsgEmail = null; currentMsgName = null;
}

function replyToMessage() {
  const replyText = document.getElementById('msg-reply-text').value.trim();
  if (!replyText) { showToast('Écrivez un message avant d\'envoyer.', 'error'); return; }
  if (!currentMsgEmail) { showToast('Email de destination introuvable.', 'error'); return; }

  const subject = encodeURIComponent(`[Exo VOP] Réponse à votre message`);
  const body    = encodeURIComponent(`Bonjour ${currentMsgName || ''},\n\n${replyText}\n\n---\nL'équipe Exo VOP`);
  window.open(`mailto:${currentMsgEmail}?subject=${subject}&body=${body}`, '_blank');

  showToast(`Client email ouvert pour répondre à ${currentMsgEmail}`);
}

async function deleteMessage(id) {
  if (!confirm('Supprimer ce message définitivement ?')) return;

  if (db) {
    const { error } = await db.from('contact_messages').delete().eq('id', id);
    if (error) { showToast('Erreur : ' + error.message, 'error'); return; }
  } else {
    contactMessages = contactMessages.filter(m => m.id !== id);
  }

  showToast('Message supprimé.');
  loadAdminMessages();
}

/* ── Demo messages ── */
function getDemoMessages() {
  return [
    { id:'m1', name:'LunaPlays', email:'luna@example.com', subject:'Collaboration', message:'Bonjour, je suis streameuse et j\'aimerais collaborer avec votre studio pour faire la promotion de Silix RP sur ma chaîne. Intéressés ?', created_at: new Date(Date.now()-86400000*1).toISOString() },
    { id:'m2', name:'DevRoblox99', email:'dev99@example.com', subject:'Rejoindre l\'équipe', message:'Salut l\'équipe ! Je suis scripter Lua depuis 3 ans avec plusieurs jeux publiés. Je cherche un studio pour collaborer. Mon portfolio : roblox.com/users/...', created_at: new Date(Date.now()-86400000*3).toISOString() },
    { id:'m3', name:'GamerXtrem', email:'gamer@example.com', subject:'Signalement / Bug', message:'Bonjour, dans Kill a Monster il y a un bug avec le boss Dragon où il peut traverser les murs. C\'est reproductible à chaque fois dans la zone 3.', created_at: new Date(Date.now()-86400000*6).toISOString() },
  ];
}


/* ══════════════════════════════════════════════
   JEUX
══════════════════════════════════════════════ */
let games        = [];
let editingGameId = null;

/* couleurs auto selon l'index */
const GAME_COLORS = ['var(--cyan)','var(--red)','var(--violet)','var(--green)','#ff9f00','#a855f7'];
const GAME_BG     = ['rgba(0,229,255,.08)','rgba(255,61,90,.08)','rgba(123,47,255,.08)','rgba(0,255,136,.08)','rgba(255,159,0,.08)','rgba(168,85,247,.08)'];
const GAME_BORDER = ['rgba(0,229,255,.2)','rgba(255,61,90,.2)','rgba(123,47,255,.2)','rgba(0,255,136,.2)','rgba(255,159,0,.2)','rgba(168,85,247,.2)'];

async function loadAdminGames() {
  const tbody = document.getElementById('games-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--text-dim)">Chargement...</td></tr>`;

  if (!db) { games = getDemoGames(); renderGamesTable(); updateGamesOverview(); return; }

  const { data, error } = await db
    .from('games')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--red)">
      ⚠️ Erreur : ${escHtml(error.message)}<br>
      <span style="font-size:.76rem;color:var(--text-dim);margin-top:8px;display:block">
        Créez la table dans Supabase → SQL Editor (voir onglet Paramètres)
      </span>
    </td></tr>`;
    showToast('Erreur chargement jeux : ' + error.message, 'error');
    return;
  }

  games = data || [];
  renderGamesTable();
  updateGamesOverview();
}

function renderGamesTable() {
  const tbody = document.getElementById('games-tbody');
  if (!tbody) return;

  if (!games.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-dim)">Aucun jeu. Cliquez sur "Nouveau jeu" pour commencer.</td></tr>`;
    updateStatCount('stat-games-count', 0);
    return;
  }

  updateStatCount('stat-games-count', games.length);

  tbody.innerHTML = games.map((g, i) => {
    const ci  = i % GAME_COLORS.length;
    const ini = (g.name || '?').charAt(0).toUpperCase();
    const robloxBtn = g.roblox_url
      ? `<a href="${escHtml(g.roblox_url)}" target="_blank" rel="noopener"
           style="color:var(--cyan);font-size:.78rem;text-decoration:underline;white-space:nowrap">
           Voir ↗
         </a>`
      : `<span style="color:var(--text-dim);font-size:.78rem">—</span>`;
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:${GAME_BG[ci]};border:1px solid ${GAME_BORDER[ci]};display:flex;align-items:center;justify-content:center;color:${GAME_COLORS[ci]};font-family:var(--font-head);font-weight:700;font-size:.88rem;flex-shrink:0">${escHtml(ini)}</div>
          <div>
            <div style="color:var(--white);font-weight:600;font-size:.9rem">${escHtml(g.name)}</div>
            <div style="font-size:.72rem;color:var(--text-dim);font-family:var(--font-head);letter-spacing:.5px">${escHtml(g.slug || '')}</div>
          </div>
        </div>
      </td>
      <td><span style="color:${GAME_COLORS[ci]};font-size:.82rem">${escHtml(g.genre || '—')}</span></td>
      <td>${robloxBtn}</td>
      <td style="color:var(--text);font-size:.84rem">${g.max_players || '—'}</td>
      <td><span class="table-badge ${g.active ? 'published' : 'draft'}">${g.active ? '✅ Actif' : '⏸ Inactif'}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-edit"   onclick="openGameModal('edit','${escHtml(g.id)}')">Modifier</button>
          <button class="btn-table-delete" onclick="deleteGame('${escHtml(g.id)}')">Supprimer</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function updateGamesOverview() {
  updateStatCount('stat-games-count', games.length);

  /* Mettre à jour la mini-liste dans l'onglet Vue d'ensemble */
  const list = document.getElementById('overview-games-list');
  if (!list) return;

  if (!games.length) {
    list.innerHTML = `<div style="color:var(--text-dim);font-size:.82rem">Aucun jeu configuré.</div>`;
    return;
  }

  list.innerHTML = games.map((g, i) => {
    const ci  = i % GAME_COLORS.length;
    const ini = (g.name || '?').charAt(0).toUpperCase();
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <div style="width:32px;height:32px;border-radius:7px;background:${GAME_BG[ci]};border:1px solid ${GAME_BORDER[ci]};display:flex;align-items:center;justify-content:center;color:${GAME_COLORS[ci]};font-family:var(--font-head);font-weight:700;font-size:.8rem;flex-shrink:0">${escHtml(ini)}</div>
      <div>
        <div style="color:var(--white);font-size:.86rem;font-family:var(--font-head)">${escHtml(g.name)}</div>
        <div style="font-size:.72rem;color:${GAME_COLORS[ci]}">${escHtml(g.genre || 'Roblox')}</div>
      </div>
      <span style="margin-left:auto;font-size:.65rem;color:${g.active ? 'var(--green)' : 'var(--text-dim)'}">${g.active ? '● Actif' : '○ Inactif'}</span>
    </div>`;
  }).join('');
}

function updateStatCount(id, n) {
  const el = document.getElementById(id);
  if (el) el.textContent = n;
}

/* ── Modal ── */
function openGameModal(mode, id) {
  const form = document.getElementById('form-game');
  form.reset();
  editingGameId = null;

  if (mode === 'edit' && id) {
    const g = games.find(x => x.id === id);
    if (!g) return;
    editingGameId = g.id;
    document.getElementById('modal-game-title').textContent = 'Modifier le jeu';
    form.elements['name'].value        = g.name        || '';
    form.elements['slug'].value        = g.slug        || '';
    form.elements['genre'].value       = g.genre       || '';
    form.elements['description'].value = g.description || '';
    form.elements['cover_url'].value   = g.cover_url   || '';
    form.elements['roblox_url'].value  = g.roblox_url  || '';
    form.elements['max_players'].value = g.max_players || 10;
    form.elements['sort_order'].value  = g.sort_order  ?? 0;
    form.elements['active'].checked    = !!g.active;
  } else {
    document.getElementById('modal-game-title').textContent = 'Nouveau jeu';
  }

  document.getElementById('modal-game').classList.add('open');
}

function closeGameModal() {
  document.getElementById('modal-game').classList.remove('open');
  editingGameId = null;
}

async function saveGame() {
  const form = document.getElementById('form-game');
  const name        = form.elements['name'].value.trim();
  const slug        = form.elements['slug'].value.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const genre       = form.elements['genre'].value.trim()       || null;
  const description = form.elements['description'].value.trim() || null;
  const cover_url   = form.elements['cover_url'].value.trim()   || null;
  const roblox_url  = form.elements['roblox_url'].value.trim()  || null;
  const max_players = parseInt(form.elements['max_players'].value) || 10;
  const sort_order  = parseInt(form.elements['sort_order'].value)  || 0;
  const active      = form.elements['active'].checked;

  if (!name) { showToast('Le nom du jeu est obligatoire.', 'error'); return; }
  if (!slug) { showToast('Le slug est obligatoire.', 'error'); return; }

  /* mode démo */
  if (!db) {
    if (editingGameId) {
      const idx = games.findIndex(x => x.id === editingGameId);
      if (idx >= 0) games[idx] = { ...games[idx], name, slug, genre, description, cover_url, roblox_url, max_players, sort_order, active };
    } else {
      games.push({ id: 'demo_' + Date.now(), name, slug, genre, description, cover_url, roblox_url, max_players, sort_order, active, created_at: new Date().toISOString() });
      games.sort((a, b) => a.sort_order - b.sort_order);
    }
    renderGamesTable(); updateGamesOverview(); closeGameModal();
    showToast(editingGameId ? 'Jeu modifié (démo).' : 'Jeu ajouté (démo).');
    return;
  }

  const btn = document.getElementById('btn-save-game');
  btn.disabled = true; btn.textContent = 'Enregistrement...';

  try {
    const payload = { name, slug, genre, description, cover_url, roblox_url, max_players, sort_order, active };
    const { error } = editingGameId
      ? await db.from('games').update(payload).eq('id', editingGameId)
      : await db.from('games').insert(payload);
    if (error) throw error;
    showToast(editingGameId ? 'Jeu modifié avec succès.' : 'Jeu ajouté avec succès.');
    closeGameModal();
    loadAdminGames();
  } catch (err) {
    showToast('Erreur : ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Enregistrer';
  }
}

async function deleteGame(id) {
  const g = games.find(x => x.id === id);
  if (!confirm(`Supprimer le jeu "${g ? g.name : id}" définitivement ?`)) return;

  if (!db) {
    games = games.filter(x => x.id !== id);
    renderGamesTable(); updateGamesOverview();
    showToast('Jeu supprimé (démo).');
    return;
  }

  const { error } = await db.from('games').delete().eq('id', id);
  if (error) { showToast('Erreur : ' + error.message, 'error'); return; }
  showToast('Jeu supprimé.');
  loadAdminGames();
}

/* auto-slug depuis le nom */
document.addEventListener('DOMContentLoaded', () => {
  const formGame = document.getElementById('form-game');
  if (!formGame) return;
  const nameInput = formGame.elements['name'];
  const slugInput = formGame.elements['slug'];
  nameInput.addEventListener('input', () => {
    if (editingGameId) return; /* ne pas écraser en mode édition */
    slugInput.value = nameInput.value.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  });
});

/* ── Demo games ── */
function getDemoGames() {
  return [
    { id:'dg1', name:'Silix RP',        slug:'silix_rp',        genre:'Jeu de rôle',   description:'Un RP futuriste.', roblox_url:'https://www.roblox.com/games/', max_players:20, active:true, sort_order:0, created_at:new Date().toISOString() },
    { id:'dg2', name:'Kill a Monster',  slug:'kill_a_monster',  genre:'Action / Combat',description:'Battez des boss.',  roblox_url:'https://www.roblox.com/games/', max_players:6,  active:true, sort_order:1, created_at:new Date().toISOString() },
  ];
}

/* ── Init dashboard ── */
document.addEventListener('DOMContentLoaded', async () => {
  const isDashboard = document.getElementById('tab-overview');
  if (isDashboard) {
    const authed = await checkAuth();
    if (authed) {
      showTab('overview');
    }
  }
});