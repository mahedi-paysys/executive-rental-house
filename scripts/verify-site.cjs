const fs=require('fs');const path=require('path');const os=require('os');const assert=require('assert/strict');
const {chromium}=require('C:/Users/MahediRaza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');const {content}=require('./check-content.cjs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='file:///'+root.replace(/\\/g,'/')+'/index.html';await page.goto(url);await page.waitForTimeout(1500);
 assert.equal(await page.title(),content.meta.title);assert.equal(await page.locator('.rental-card').count(),13);
 assert.ok(!await page.evaluate(()=>document.body.textContent.includes('{{sections.')));
 await page.locator('#status-select').selectOption('Rented');assert.equal(await page.locator('.rental-card').count(),5);
 await page.locator('#reset-filters').click();await page.locator('#location-input').fill('Cambridge');assert.equal(await page.locator('.rental-card').count(),6);
 await page.locator('.rental-media').first().click();await page.locator('[data-gallery="1"]').click();assert.equal(await page.locator('#photo-count').textContent(),'2 / 6');await page.keyboard.press('Escape');
 await page.locator('#reset-filters').click();await page.locator('#beds-filter').selectOption('5');assert.equal(await page.locator('.rental-card').count(),4);await page.locator('#reset-filters').click();await page.locator('#sort-select').selectOption('price-low');assert.match(await page.locator('.rental-price').first().textContent(),/230/);
 await page.locator('#reset-filters').click();await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode()));});
 assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)),[]);
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await page.locator('#hamburger-btn').click();assert.equal(await page.locator('#hamburger-btn').getAttribute('aria-expanded'),'true');await page.locator('.mobile-link').first().click();assert.equal(await page.locator('#hamburger-btn').getAttribute('aria-expanded'),'false');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.region-track').evaluate(el=>getComputedStyle(el).animationName),'none');assert.deepEqual(errors,[]);
 console.log('Current site: desktop/mobile, filters, gallery, menu, all image files and reduced motion passed.');
 // Replace ONLY the served content file to prove that the template has no business-content dependency.
 const alternate=JSON.parse(JSON.stringify(content));alternate.meta.title='Northstar — Content swap test';alternate.sections.header.nav_logo='Northstar';alternate.sections.home.hero_headline='A completely different business';alternate.sections.home.background_image='images/unsplash/11.jpg';alternate.sections.home.hero_bg_aria_label='Replacement architecture';alternate.sections.about.img_src='images/unsplash/10.jpg';alternate.sections.contact.btn_href='mailto:hello@northstar.example';alternate.sections.cities.items=['London','Paris'];alternate.collection.bedroomFilterEnabled=false;alternate.collection.priceSortEnabled=false;alternate.sections.management.enabled=false;
 alternate.collection.items=[{...alternate.collection.items[0],id:'new-product',name:'Studio Experience',priceLabel:'£75',priceSuffix:'/ visit',sortPrice:75,bedrooms:0,specs:['Private consultation','London'],description:'Entirely replaced description <script> must remain text.',facts:['Appointment by arrangement'],photos:[{src:'images/unsplash/11.jpg',alt:'New content image'}],enquiry:{label:'Book now',href:'mailto:hello@northstar.example'}}];
 await page.route('**/content.js',route=>route.fulfill({contentType:'application/javascript',body:'window.SITE_CONTENT = '+JSON.stringify(alternate)+';'}));await page.reload();
 assert.equal(await page.title(),alternate.meta.title);assert.match(await page.locator('.nav-logo').textContent(),/Northstar/);assert.match(await page.locator('h1').textContent(),/completely different/);assert.equal(await page.locator('.rental-card').count(),1);
 assert.ok(await page.locator('#beds-filter').isHidden());assert.ok(await page.locator('#sort-select').isHidden());assert.ok(await page.locator('#management').isHidden());assert.equal(await page.locator('.region-track>div').first().locator('span').count(),2);
 assert.match(await page.locator('#hero-bg').evaluate(el=>el.style.getPropertyValue('--content-image')),/11.jpg/);assert.equal(await page.locator('#contact .btn').getAttribute('href'),'mailto:hello@northstar.example');
 await page.locator('.rental-media').first().click();assert.equal(await page.locator('#detail-title').textContent(),'Studio Experience');assert.equal(await page.locator('.detail-copy script').count(),0);assert.equal(await page.locator('.detail-copy .btn').getAttribute('href'),'mailto:hello@northstar.example');await page.keyboard.press('Escape');
 alternate.collection.items=[];await page.reload();assert.equal(await page.locator('.rental-card').count(),0);assert.ok(await page.locator('#no-results').isVisible());
 delete alternate.sections.about.eyebrow;await page.reload();assert.match(await page.locator('body').textContent(),/sections.about.eyebrow: expected text/);
 console.log('Content-only replacement: brand, copy, links, images, arbitrary card ID, one-photo gallery, cities, hidden sections/filters, empty collection, escaped text and invalid-content diagnostics passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
