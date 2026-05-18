(async () => {
  const TOKEN = '__GITHUB_TOKEN__';
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  const featuredGrid = document.querySelector('.featured-grid');
  const projectsGrid = document.querySelector('.projects-grid');
  if (!featuredGrid || !projectsGrid) return;

  const FEATURED = {
    'a-comprar-apk': { label: 'A-Comprar', badge: '&#x1F451;', tags: ['Kotlin', 'Jetpack Compose', 'SQLite'] },
    'blockgames-apk': { label: 'BlockGames', badge: '&#x1F3AE;', tags: ['Kotlin', 'Jetpack Compose', 'Room'] },
    'my-docker-gui': { label: 'My Docker GUI', badge: '&#x1F433;', tags: ['Electron', 'HTML', 'CSS', 'JavaScript'] },
  };

  console.log('[GitHub Repos] Iniciando petición a la API...');

  try {
    const res = await fetch('https://api.github.com/users/deduc/repos?per_page=100&sort=updated', { headers });
    console.log('[GitHub Repos] Respuesta recibida:', res.status, res.statusText);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const repos = await res.json();
    console.log('[GitHub Repos] Repositorios obtenidos:', repos.length);

    console.log('[GitHub Repos] Obteniendo lenguajes de cada repo...');
    const langResults = await Promise.allSettled(
      repos.map(r => fetch(r.languages_url, { headers }).then(r => r.ok ? r.json() : {}))
    );
    console.log('[GitHub Repos] Lenguajes obtenidos para', langResults.length, 'repos');

    const featuredHtml = repos
      .filter(r => FEATURED[r.name])
      .sort((a, b) => {
        const order = ['a-comprar-apk', 'blockgames-apk', 'my-docker-gui'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      })
      .map((repo, i) => {
        const f = FEATURED[repo.name];
        const tags = f.tags
          ? `<div class="tags">${f.tags.map(t => `<span class="fc-lang">${t}</span>`).join('')}</div>`
          : '';
        return `<a href="${repo.html_url}" target="_blank" class="featured-card card-${i + 1}" style="--i:${i}"><div class="fc-badge">${f.badge}</div><h3>${f.label}</h3><p>${repo.description || ''}</p>${tags}</a>`;
      }).join('');

    console.log('[GitHub Repos] Renderizando proyectos destacados...');
    if (featuredHtml) featuredGrid.innerHTML = featuredHtml;

    const projectsHtml = repos
      .filter(r => r.name !== 'deduc.github.io' && r.name !== 'aseprite-bin' && !FEATURED[r.name])
      .sort((a, b) => {
        if (a.name === '42madrid_c_piscine') return 1;
        if (b.name === '42madrid_c_piscine') return -1;
        return a.name.localeCompare(b.name);
      })
      .map((repo, i) => {
        const idx = repos.indexOf(repo);
        const desc = repo.description ? `<p>${repo.description}</p>` : '';
        const langs = langResults[idx]?.value ? Object.keys(langResults[idx].value) : [];
        const tags = langs.length
          ? `<div class="tags">${langs.map(l => `<span class="lang-tag">${l}</span>`).join('')}</div>`
          : '';
        return `<a href="${repo.html_url}" target="_blank" class="project-card" style="--i:${i}"><h3>${repo.name}</h3>${desc}${tags}</a>`;
      }).join('');

    console.log('[GitHub Repos] Renderizando grid de proyectos...');
    if (projectsHtml) projectsGrid.innerHTML = projectsHtml;
    console.log('[GitHub Repos] Carga completada.');
  } catch (e) {
    console.warn('[GitHub Repos] Error - Mostrando contenido estático.', e);
  }
})();
