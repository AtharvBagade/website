// Atharv Bagade: personal site behaviour.
// One scrolling page: the top nav links jump to each section, and the link for the section in view is marked current.
// Work and Music lists come from data/*.json.

const ICONS = {
  code: 'M8 6l-6 6 6 6M16 6l6 6-6 6',
  work: 'M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM8 7V5h8v2',
  music: 'M9 18V5l11-2v13M6 15a3 3 0 1 0 0 6a3 3 0 1 0 0-6M17 13a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
  arrow: 'M7 17L17 7M9 7h8v8',
};

const MUSIC_NOTES = {
  recommendations: 'songs I think you should hear',
  current: 'on repeat lately',
  allTime: 'from my Spotify · all time',
};

const app = document.querySelector('.app');
const sections = [...document.querySelectorAll('.page-section')];
const navLinks = [...document.querySelectorAll('.top-nav a')];

// ---------- Small DOM helpers ----------

// Creates an element with an optional class, text content and attributes, then appends the children.
function el(tag, { className, text, attrs } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
  for (const child of children) if (child) node.append(child);
  return node;
}

function icon(name, size) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', ICONS[name]);
  svg.append(path);
  return svg;
}

const pad = (n) => String(n).padStart(2, '0');
const initials = (name) => name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

// ---------- Sections ----------

// The current section is the last one whose top has passed 40% of the way down the screen,
// or the last section once the page is scrolled to the bottom (Contact is too short to get there).
function currentSection() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) return sections[sections.length - 1];
  const line = window.innerHeight * 0.4;
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= line) current = section;
  return current;
}

function updateOnScroll() {
  // The top bar is see-through only at the very top; once anything scrolls under it, it turns solid.
  app.classList.toggle('at-top', window.scrollY < 8);

  const current = currentSection().id;
  app.dataset.section = current;
  for (const link of navLinks) {
    if (link.getAttribute('href') === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

// ---------- Theme ----------

function setupThemeToggle() {
  const button = document.querySelector('.theme-toggle');
  const label = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  label();
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable: theme still switches */ }
    label();
  });
}

// ---------- Tabs (Work and Music) ----------

// Wires a [data-tabs] group: marks the chosen button selected and calls onSelect(key).
function setupTabs(name, initialKey, onSelect) {
  const buttons = [...document.querySelectorAll(`[data-tabs="${name}"] [role="tab"]`)];
  const select = (key) => {
    for (const button of buttons) button.setAttribute('aria-selected', String(button.dataset.key === key));
    onSelect(key);
  };
  for (const button of buttons) button.addEventListener('click', () => select(button.dataset.key));
  select(initialKey);
  return buttons;
}

// ---------- Work ----------

function projectCard(project) {
  const card = el('article', { className: 'card' }, [
    el('div', { className: 'card-tag' }, [icon(project.icon, 13), document.createTextNode(project.tag)]),
    el('h3', { text: project.title }),
    el('p', { text: project.body }),
  ]);
  if (project.stack.length) {
    card.append(el('ul', { className: 'chips' }, project.stack.map((item) => el('li', { text: item }))));
  }
  if (project.url) {
    card.append(el('a', { className: 'card-link', attrs: { href: project.url } },
      [icon('arrow', 14), document.createTextNode(project.url.replace('https://', ''))]));
  }
  return card;
}

function setupWork(projects) {
  const list = document.getElementById('work-list');
  const buttons = setupTabs('work', 'built', (status) => {
    list.replaceChildren(...projects.filter((p) => p.status === status).map(projectCard));
  });
  for (const button of buttons) {
    button.querySelector('.count').textContent = projects.filter((p) => p.status === button.dataset.key).length;
  }
}

// ---------- Music ----------

function artistRow(artist, index) {
  return el('a', { className: 'row', attrs: { href: `https://open.spotify.com/artist/${artist.spotifyArtistId}` } }, [
    el('span', { className: 'row-no', text: pad(index + 1) }),
    el('span', { className: 'avatar', text: initials(artist.name), attrs: { style: `background: var(--c${(index % 6) + 1})`, 'aria-hidden': 'true' } }),
    el('span', { className: 'row-name', text: artist.name }),
    icon('arrow', 14),
  ]);
}

function recommendationCard(rec, index) {
  const href = rec.spotifyTrackId ? `https://open.spotify.com/track/${rec.spotifyTrackId}` : null;
  return el(href ? 'a' : 'div', { className: 'rec', attrs: href ? { href } : {} }, [
    el('span', { className: 'eyebrow', text: pad(index + 1) }),
    el('span', { className: 'rec-title', text: rec.title }),
    el('span', { className: 'rec-artist', text: rec.artist }),
    el('p', { className: 'rec-why', text: rec.why }),
    rec.note ? el('p', { className: 'rec-note', text: rec.note }) : null,
  ]);
}

function setupMusic(music) {
  const list = document.getElementById('music-list');
  const note = document.getElementById('music-note');
  setupTabs('music', 'recommendations', (key) => {
    note.textContent = MUSIC_NOTES[key];
    if (key === 'recommendations') {
      list.replaceChildren(el('div', { className: 'recs' }, music.recommendations.map(recommendationCard)));
    } else {
      const rows = el('div', { className: key === 'current' ? 'rows single' : 'rows' }, music[key].map(artistRow));
      list.replaceChildren(rows);
    }
  });
}

// ---------- Data ----------

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

function showLoadError(containerId) {
  document.getElementById(containerId).replaceChildren(
    el('p', { className: 'muted', text: 'This list could not be loaded. Refresh the page to try again.' }));
}

// ---------- Start ----------

updateOnScroll();
window.addEventListener('scroll', updateOnScroll, { passive: true });
window.addEventListener('resize', updateOnScroll);
setupThemeToggle();

loadJson('data/projects.json').then(setupWork).catch(() => showLoadError('work-list'));
loadJson('data/music.json').then(setupMusic).catch(() => showLoadError('music-list'));
