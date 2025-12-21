/*
  Simple site JS: edit siteConfig below to change site title and socials
  Edit projects in assets/data/projects.json and blog posts in assets/data/blog.json
*/

const siteConfig = {
  name: "Your Name",
  socials: [
    {name:"GitHub", url:"https://github.com/yourname", icon:"🐱"},
    {name:"X", url:"https://x.com/yourname", icon:"🐦"},
    {name:"LinkedIn", url:"https://www.linkedin.com/in/yourname", icon:"🔗"}
  ]
};

async function fetchJSON(path){ try{ const r = await fetch(path); if(!r.ok) return []; return await r.json(); }catch(e){console.error(e); return []} }

function renderSocials(){
  document.getElementById('site-name') && (document.getElementById('site-name').innerText = siteConfig.name);
  document.getElementById('year') && (document.getElementById('year').innerText = new Date().getFullYear());
  ['social-links','footer-links','contact-icons'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = siteConfig.socials.map(s => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${s.icon}</a>`).join(' ');
  });
}

/* Projects & posts helpers */
function stripHtml(html){ const d = document.createElement('div'); d.innerHTML = html; return d.innerText; }

function createTile(item){
  const div = document.createElement('div');
  div.className='tile';
  div.innerHTML = `<img src="${item.previewImage}" alt="${item.title}"><div class="meta"><div class="tags">${item.tags?.join(', ')||''}</div><h3>${item.title}</h3><div class="date">${item.date||''}</div><p class="preview">${stripHtml(item.descriptionHtml||'').slice(0,140)}…</p></div>`;
  div.onclick = ()=> openOverlay(item);
  return div;
}

function openOverlay(item){
  const overlay = document.getElementById('overlay');
  const content = document.getElementById('overlay-content');
  content.innerHTML = `<img src="${item.headerImage||item.previewImage}" alt="${item.title}" style="width:100%;border-radius:8px;margin-bottom:12px"><h2>${item.title}</h2><div class="tags">${item.tags?.join(', ')||''}</div><div class="date">${item.date||''}</div><div class="desc">${item.descriptionHtml||''}</div>`;
  overlay.classList.remove('hidden');
}
function closeOverlay(){ document.getElementById('overlay')?.classList.add('hidden'); }

function setupTagFilter(projects, containerId='tags', gridId='projects-grid'){
  const tagContainer = document.getElementById(containerId);
  if(!tagContainer) return;
  const tags = Array.from(new Set((projects||[]).flatMap(p=>p.tags||[]))).sort();
  tagContainer.innerHTML = tags.map(t => `<button class="tag-item" data-tag="${t}">${t}</button>`).join(' ');
  tagContainer.querySelectorAll('.tag-item').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const tag = btn.dataset.tag;
      const grid = document.getElementById(gridId);
      grid.innerHTML = '';
      const filtered = projects.filter(p=>p.tags?.includes(tag));
      filtered.forEach(p => grid.appendChild(createTile(p)));
    });
  });
}

function setupSearch(projects, inputId='search', gridId='projects-grid'){
  const s = document.getElementById(inputId);
  if(!s) return;
  s.addEventListener('input', ()=>{
    const q = s.value.toLowerCase();
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    projects.filter(p => p.title.toLowerCase().includes(q)).forEach(p => grid.appendChild(createTile(p)));
  });
}

async function renderFeatured(count=3){
  const fs = document.getElementById('featured-grid');
  if(!fs) return;
  const projects = await fetchJSON('assets/data/projects.json');
  const featured = (projects||[]).slice(0,count);
  fs.innerHTML = '';
  featured.forEach(p=> fs.appendChild(createTile(p)) );
}

async function renderProjectsPage(){
  const grid = document.getElementById('projects-grid');
  if(!grid) return;
  const projects = await fetchJSON('assets/data/projects.json');
  grid.innerHTML = '';
  projects.forEach(p => grid.appendChild(createTile(p)));
  setupTagFilter(projects, 'tags', 'projects-grid');
  setupSearch(projects, 'search', 'projects-grid');
}

async function renderBlogPage(){
  const grid = document.getElementById('posts-grid');
  if(!grid) return;
  const posts = await fetchJSON('assets/data/blog.json');
  grid.innerHTML = '';
  posts.forEach(p => grid.appendChild(createTile(p)));
  setupTagFilter(posts, 'tags', 'posts-grid');
  setupSearch(posts, 'search', 'posts-grid');
}

/* Init */
document.addEventListener('DOMContentLoaded', async ()=>{
  renderSocials();
  renderFeatured();

  if(document.getElementById('projects-grid')){
    await renderProjectsPage();
    document.getElementById('close-overlay').addEventListener('click', closeOverlay);
  }

  if(document.getElementById('posts-grid')){
    await renderBlogPage();
    document.getElementById('close-overlay').addEventListener('click', closeOverlay);
  }

  // Overlay close if clicking background
  document.getElementById('overlay')?.addEventListener('click', (e)=>{ if(e.target.id==='overlay') closeOverlay() });
});