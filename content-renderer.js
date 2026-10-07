'use strict';
/* Bind the design to content.js without interpreting content strings as HTML. */
(function () {
  const content = window.SITE_CONTENT;
  const problems = [];
  const lookup = path => path.split('.').reduce((value,key) => value?.[key],content);
  const text = path => {
    const value = lookup(path);
    if(typeof value !== 'string'){problems.push(`${path}: expected text`);return '';}
    return value;
  };
  function safeUrl(value, image = false) {
    if(typeof value !== 'string')throw new Error('URL must be text');
    if(!value)return '';
    if(/[\u0000-\u001f]/.test(value))throw new Error('URL contains control characters');
    const url = new URL(value,document.baseURI);
    const allowed=image?['http:','https:','file:']:['http:','https:','file:','mailto:','tel:'];
    if(!allowed.includes(url.protocol))throw new Error(`Unsupported URL protocol: ${url.protocol}`);
    return value;
  }
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function format(value,variables){return value.replace(/\{(\w+)\}/g,(token,key)=>variables[key]??token);}
  window.templateContent={lookup,safeUrl,escapeHtml,format};
  try {
    if(!content || content.schemaVersion!==1)throw new Error('content.js must define SITE_CONTENT with schemaVersion: 1');
    if(!Array.isArray(content.collection?.items))throw new Error('collection.items must be an array');
    const ids=new Set();
    content.collection.items.forEach((item,i)=>{
      const prefix=`collection.items[${i}]`;
      if(ids.has(item.id))problems.push(`${prefix}: duplicate id`);ids.add(item.id);
      for(const key of ['name','status','priceLabel','priceSuffix','cardNote','description'])if(typeof item[key]!=='string')problems.push(`${prefix}.${key}: expected text`);
      if(!(item.status in content.collection.statusLabels))problems.push(`${prefix}.status: unknown status`);
      if(!Number.isFinite(item.bedrooms)||item.bedrooms<0)problems.push(`${prefix}.bedrooms: expected a non-negative number`);
      if(item.sortPrice!==null&&(!Number.isFinite(item.sortPrice)||item.sortPrice<0))problems.push(`${prefix}.sortPrice: expected a non-negative number or null`);
      for(const key of ['specs','facts'])if(!Array.isArray(item[key])||item[key].some(v=>typeof v!=='string'))problems.push(`${prefix}.${key}: expected an array of text`);
      if(!Array.isArray(item.photos)||!item.photos.length)problems.push(`${prefix}.photos: at least one image required`);
      else item.photos.forEach(photo=>{safeUrl(photo.src,true);if(typeof photo.alt!=='string')problems.push(`${prefix}.photos: alt text required`);});
      safeUrl(item.enquiry?.href);if(typeof item.enquiry?.label!=='string')problems.push(`${prefix}.enquiry.label: expected text`);
    });
    document.documentElement.lang=content.meta.language;
    const track=document.querySelector('.region-track');
    const cities=content.sections.cities.items;
    if(!Array.isArray(cities)||cities.some(city=>typeof city!=='string'))throw new Error('sections.cities.items must be an array of text');
    const cityMarkup=cities.map(city=>`<span>${escapeHtml(city)}</span><i aria-hidden="true">✳</i>`).join('');
    track.innerHTML=`<div>${cityMarkup}</div><div aria-hidden="true">${cityMarkup}</div>`;
    const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{if(!node.parentElement?.closest('script,style'))node.textContent=node.textContent.replace(/\{\{([\w.]+)\}\}/g,(_,path)=>text(path));});
    document.querySelectorAll('*').forEach(el=>{
      for(const attribute of [...el.attributes]){
        if(!attribute.name.startsWith('data-content-'))continue;
        const type=attribute.name.slice(13);const value=text(attribute.value);
        if(type==='background')el.style.setProperty('--content-image',value?`url(${JSON.stringify(safeUrl(value,true))})`:'none');
        else el.setAttribute(type,['href','src'].includes(type)?safeUrl(value,type==='src'):value);
      }
    });
    for(const [id,section]of Object.entries(content.sections)){
      const element=id==='testimonial'?document.querySelector('.client-story'):document.getElementById(id);
      if(element&&section.enabled===false)element.hidden=true;
    }
    document.querySelector('#beds-filter').parentElement.hidden=!content.collection.bedroomFilterEnabled;
    document.querySelector('#sort-select').parentElement.hidden=!content.collection.priceSortEnabled;
    if(problems.length)throw new Error(problems.join('\n'));
    window.CONTENT_READY=true;
  } catch(error){
    console.error('Content configuration error:',error);
    document.body.replaceChildren();
    const panel=document.createElement('main');panel.style.cssText='max-width:850px;margin:60px auto;padding:24px;font-family:system-ui;white-space:pre-wrap';
    panel.textContent='Please check content.js\n\n'+error.message;
    document.body.append(panel);
  }
})();
