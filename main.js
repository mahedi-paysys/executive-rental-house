'use strict';
(function () {
if(!window.CONTENT_READY)return;
const content=window.SITE_CONTENT.collection;
const {escapeHtml:esc,safeUrl,format}=window.templateContent;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const data=content.items;
const grid=document.getElementById('rental-grid');
const revealObserver=!reduced&&'IntersectionObserver' in window?new IntersectionObserver(entries=>{
 entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});
},{threshold:0,rootMargin:'0px 0px -40px 0px'}):null;
function observe(){document.querySelectorAll('.reveal:not(.is-visible)').forEach(el=>{
 if(!revealObserver){el.classList.add('is-visible');return;}
 if(el.dataset.revealObserved)return;
 el.dataset.revealObserved='true';
 const siblings=[...el.parentElement.children].filter(child=>child.classList.contains('reveal'));
 el.style.setProperty('--reveal-delay',`${Math.min(siblings.indexOf(el),3)*140}ms`);
 revealObserver.observe(el);
});}
document.querySelectorAll('.footer-top,.footer-columns,.footer-wordmark,.cta-bottom,.collection-note,.rental-filters,.collection-tabs,.listing-date').forEach(el=>el.classList.add('reveal'));
document.querySelectorAll('.management-photo,.relocation-visual,.about-photo').forEach(el=>el.classList.add('reveal-image'));
document.documentElement.classList.add('js-loaded');
function render(){
 const term=document.getElementById('location-input').value.trim().toLocaleLowerCase();
 const status=document.getElementById('status-select').value;
 const beds=content.bedroomFilterEnabled?Number(document.getElementById('beds-filter').value):0;
 const sort=content.priceSortEnabled?document.getElementById('sort-select').value:'original';
 const result=data.filter(p=>(!term||p.name.toLocaleLowerCase().includes(term))&&(status==='all'||p.status===status)&&(!beds||p.bedrooms>=beds));
 if(sort!=='original')result.sort((a,b)=>{const av=a.sortPrice??Infinity,bv=b.sortPrice??Infinity;if(!Number.isFinite(av))return Number.isFinite(bv)?1:0;if(!Number.isFinite(bv))return -1;return sort==='price-low'?av-bv:bv-av;});
 document.querySelectorAll('[data-status]').forEach(b=>{b.classList.toggle('active',b.dataset.status===status);b.setAttribute('aria-pressed',String(b.dataset.status===status));});
 grid.innerHTML=result.map(p=>`<article class="rental-card reveal"><button class="rental-media" data-open="${esc(p.id)}" aria-label="${esc(format(content.card.detailsAriaLabel,{name:p.name}))}"><img src="${esc(safeUrl(p.photos[0].src,true))}" alt="${esc(p.photos[0].alt)}" loading="lazy" width="800" height="500"><span class="listing-badge ${p.status==='Rented'?'rented':''}">${esc(content.statusLabels[p.status])}</span><span class="illustration-label">${esc(content.card.imageLabel)}</span><span class="photo-label">${esc(content.card.photoLabel)}</span></button><div class="rental-body"><h3>${esc(p.name)}</h3><p class="rental-price">${esc(p.priceLabel)} <small>${esc(p.priceSuffix)}</small></p><p class="rent-note">${esc(p.cardNote)}</p><div class="rental-specs">${p.specs.map(spec=>`<span>${esc(spec)}</span>`).join('')}</div><button class="card-open" data-open="${esc(p.id)}">${esc(content.card.detailsLabel)} <span aria-hidden="true">↗</span></button></div></article>`).join('');
 document.getElementById('result-count').textContent=format(content.results.format,{count:result.length,noun:result.length===1?content.results.singular:content.results.plural});
 document.getElementById('no-results').hidden=result.length!==0;
 observe();
}
render();observe();
document.querySelectorAll('[data-status]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('status-select').value=b.dataset.status;render();}));
['beds-filter','sort-select','status-select'].forEach(id=>document.getElementById(id).addEventListener('change',render));
document.querySelector('.rental-filters').addEventListener('submit',e=>{e.preventDefault();render();});
document.getElementById('location-input').addEventListener('input',render);
document.getElementById('reset-filters').addEventListener('click',()=>{document.querySelector('.rental-filters').reset();render();});
const dialog=document.getElementById('property-dialog');let selected=null,photo=0,opener=null;
function showPhoto(){const img=dialog.querySelector('.detail-image');img.src=safeUrl(selected.photos[photo].src,true);img.alt=selected.photos[photo].alt;dialog.querySelector('#photo-count').textContent=`${photo+1} / ${selected.photos.length}`;}
grid.addEventListener('click',e=>{
 const button=e.target.closest('[data-open]');if(!button)return;
 selected=data.find(p=>String(p.id)===button.dataset.open);opener=button;photo=0;
 const controls=selected.photos.length>1?`<div class="gallery-controls"><button data-gallery="-1" aria-label="${esc(content.gallery.previousLabel)}">←</button><span id="photo-count">1 / ${selected.photos.length}</span><button data-gallery="1" aria-label="${esc(content.gallery.nextLabel)}">→</button></div>`:'<span id="photo-count" hidden></span>';
 document.getElementById('property-detail').innerHTML=`<img class="detail-image" src="${esc(safeUrl(selected.photos[0].src,true))}" alt="${esc(selected.photos[0].alt)}">${controls}${content.gallery.imageNotice?`<p class="gallery-note">${esc(content.gallery.imageNotice)}</p>`:''}<div class="detail-copy"><span class="eyebrow">${esc(format(content.gallery.eyebrow,{status:content.statusLabels[selected.status]}))}</span><h2 id="detail-title" class="section-headline">${esc(selected.name)}</h2><ul>${selected.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><p>${esc(selected.description)}</p><a class="btn btn--bronze" href="${esc(safeUrl(selected.enquiry.href))}">${esc(selected.enquiry.label)}</a></div>`;
 dialog.showModal();document.body.classList.add('dialog-open');dialog.querySelector('.dialog-close').focus();
});
dialog.addEventListener('click',e=>{const b=e.target.closest('[data-gallery]');if(b){photo=(photo+Number(b.dataset.gallery)+selected.photos.length)%selected.photos.length;showPhoto();}if(e.target===dialog||e.target.closest('.dialog-close'))dialog.close();});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){photo=(photo+(e.key==='ArrowRight'?1:-1)+selected.photos.length)%selected.photos.length;showPhoto();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus();});
const menu=document.getElementById('mobile-menu'),hamburger=document.getElementById('hamburger-btn');
function toggleMenu(open){menu.classList.toggle('open',open);menu.inert=!open;menu.setAttribute('aria-hidden',String(!open));hamburger.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':'';if(open)document.getElementById('mobile-close-btn').focus();else hamburger.focus();}
hamburger.addEventListener('click',()=>toggleMenu(true));document.getElementById('mobile-close-btn').addEventListener('click',()=>toggleMenu(false));document.querySelectorAll('.mobile-link').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
document.addEventListener('keydown',e=>{if(!menu.classList.contains('open'))return;if(e.key==='Escape')toggleMenu(false);if(e.key==='Tab'){const items=[...menu.querySelectorAll('a,button')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
const navbar=document.getElementById('navbar');
function updateNav(){navbar.classList.toggle('is-scrolled',window.scrollY>60);}
window.addEventListener('scroll',updateNav,{passive:true});updateNav();
if(!reduced){document.querySelectorAll('.hero__content>.eyebrow,.hero__headline,.hero__sub,.hero__cta').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:900,delay:100+i*100,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));}
})();
