async function loadTeamMembers() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="loader-wrap" style="grid-column:1/-1">
      <div class="loader"></div>
      <p class="loader-text">${t('tp_loading')}</p>
    </div>`;

  let members = [];

  if (!db) {
    members = getDemoTeam();
  } else {
    try {
      const { data, error } = await db
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      members = data || [];
    } catch (err) {
      console.error('Supabase error:', err);
      members = getDemoTeam();
    }
  }

  if (members.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">👤</div>
        <p class="empty-state-title">${t('tp_no_team')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = members.map((m, i) => `
    <div class="team-card" style="animation-delay:${i * 0.08}s">
      <div class="team-avatar">
        ${m.avatar_url
          ? `<img src="${escHtml(m.avatar_url)}" alt="${escHtml(m.name)}" />`
          : escHtml(m.avatar_initial || m.name.charAt(0).toUpperCase())
        }
        <div class="team-avatar-ring"></div>
      </div>
      <div class="team-name">${escHtml(m.name)}</div>
      <div class="team-role">${escHtml(m.role)}</div>
      ${m.description ? `<p class="team-desc">${escHtml(m.description)}</p>` : ''}
    </div>`).join('') + `
    <a class="team-join-card" href="contact">
      <div class="team-join-icon">+</div>
      <p class="team-join-text" data-i18n="team_join">${t('team_join')}</p>
    </a>`;
}

function getDemoTeam() {
  return [
    { id:'1', name:'Fondateur', role:'Fondateur & Lead Dev',    avatar_initial:'F', description:'Visionnaire du studio, architecte des univers Exo VOP.', sort_order:0 },
    { id:'2', name:'Designer',  role:'Game Designer',           avatar_initial:'D', description:'Crée les mécaniques et l\'expérience de jeu.', sort_order:1 },
    { id:'3', name:'Builder',   role:'Builder / 3D',            avatar_initial:'B', description:'Donne vie aux environnements et aux maps.', sort_order:2 },
    { id:'4', name:'Scripter',  role:'Développeur Lua',         avatar_initial:'S', description:'Développe les systèmes et la logique des jeux.', sort_order:3 },
  ];
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', loadTeamMembers);


/* ================================================================
   EXO VOP — asset/asset/jscontact.js
   Gestion du formulaire de contact
   ================================================================ */

(function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = '...';

    const data = {
      name:    form.querySelector('[name="name"]')?.value?.trim(),
      email:   form.querySelector('[name="email"]')?.value?.trim(),
      subject: form.querySelector('[name="subject"]')?.value,
      message: form.querySelector('[name="message"]')?.value?.trim(),
      created_at: new Date().toISOString()
    };

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      showToast('Tous les champs sont requis.', 'error');
      btn.disabled = false;
      btn.setAttribute('data-i18n', 'form_send');
      btn.textContent = t('form_send');
      return;
    }

    // Try to save to Supabase (table 'contact_messages')
    if (db) {
      try {
        const { error } = await db.from('contact_messages').insert([data]);
        if (error) throw error;
      } catch (err) {
        console.error('Contact error:', err);
        // Continue — show success anyway (or could show error)
      }
    }

    // Success feedback
    showToast(currentLang === 'fr'
      ? '✓ Message envoyé ! Nous vous répondrons rapidement.'
      : '✓ Message sent! We\'ll get back to you soon.', 'success');
    form.reset();
    btn.disabled = false;
    btn.textContent = t('form_send');
  });
})();