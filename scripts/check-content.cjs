const fs=require('fs');const path=require('path');const vm=require('vm');const assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'content.js'),'utf8'),sandbox,{timeout:1000});
const content=sandbox.window.SITE_CONTENT;
assert.equal(content.schemaVersion,1);assert.ok(Array.isArray(content.collection.items));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const get=p=>p.split('.').reduce((o,k)=>o?.[k],content);
const bindings=[...html.matchAll(/\{\{([\w.]+)\}\}|data-content-[\w-]+="([\w.]+)"/g)].map(m=>m[1]||m[2]);
for(const p of bindings)assert.equal(typeof get(p),'string','Missing content: '+p);
const assets=new Set();
function walk(value){if(typeof value==='string'&&/^(images|fonts)\//.test(value))assets.add(value);else if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')Object.values(value).forEach(walk);}
walk(content);
for(const asset of assets){const target=path.resolve(root,asset);assert.ok(target.startsWith(root+path.sep),'Asset escapes workspace');assert.ok(fs.existsSync(target),'Missing asset: '+asset);}
const ids=new Set();for(const item of content.collection.items){assert.ok(!ids.has(item.id),'Duplicate item ID');ids.add(item.id);assert.ok(item.photos.length,'Photos required');assert.ok(item.status in content.collection.statusLabels,'Unknown status');assert.ok(Number.isFinite(item.bedrooms)&&item.bedrooms>=0);assert.ok(item.sortPrice===null||Number.isFinite(item.sortPrice));}
console.log(`Content valid: ${bindings.length} bindings, ${content.collection.items.length} cards, ${assets.size} referenced images.`);
module.exports={content,assets};
