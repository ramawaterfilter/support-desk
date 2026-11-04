export const normalEmail=value=>String(value||'').trim().toLowerCase().replace(/^mailto:/,'');
export const normalPhone=value=>String(value||'').replace(/\D/g,'').replace(/^00/,'');
export function initialiseCatalog(db){
 db.categoryNodes=[];let rootNumber=0;
 for(const item of db.masters.Categories){
  const parts=item.name.split(' > ');if(parts.length<2)continue;
  const query=db.masters['Query Types'].find(q=>q.name===parts[0]);if(!query)continue;
  let root=db.categoryNodes.find(n=>!n.parentId&&n.queryTypeId===query.id&&n.name===parts[1]);
  if(!root){root={id:parts.length===2?item.id:'MAIN-'+(++rootNumber),name:parts[1],queryTypeId:query.id,parentId:null,active:true,deleted:false};db.categoryNodes.push(root);}
  if(parts.length===3)db.categoryNodes.push({id:item.id,name:parts[2],queryTypeId:query.id,parentId:root.id,active:true,deleted:false});
 }
 db.masters.Products.forEach((p,i)=>Object.assign(p,{sku:p.id,brand:'Both brands',capacity:i===0?'8 litres':i===2?'6 litres':'',deleted:false}));
 db.tickets.forEach(t=>{t.categoryId=db.categoryNodes.find(n=>categoryPath(db,n)===t.category)?.id||'CAT-15';t.queryTypeId=db.masters['Query Types'].find(q=>q.name===t.type)?.id||'';});
 const sampleProducts={'DEMO-104':'SKU-1','DEMO-208':'SKU-2','DEMO-611':'SKU-1'};for(const t of db.tickets){const p=db.masters.Products.find(p=>p.id===sampleProducts[t.id]);if(p)Object.assign(t,{productId:p.id,product:p.name,sku:p.sku,capacity:p.capacity});}
 syncCategories(db);
}
export function categoryPath(db,node){let n=typeof node==='string'?db.categoryNodes.find(x=>x.id===node):node;if(!n)return '';let parts=[n.name];while(n.parentId){n=db.categoryNodes.find(x=>x.id===n.parentId);if(!n)break;parts.unshift(n.name);}return [db.masters['Query Types'].find(q=>q.id===n.queryTypeId)?.name||'Archived type',...parts].join(' > ');}
export function descendants(db,id){let result=[id];for(const n of db.categoryNodes.filter(n=>n.parentId===id))result.push(...descendants(db,n.id));return result;}
export function usableCategory(db,n){if(!n||!n.active||n.deleted)return false;return !n.parentId||usableCategory(db,db.categoryNodes.find(x=>x.id===n.parentId));}
export function syncCategories(db){db.masters.Categories=[...db.categoryNodes.filter(n=>!n.deleted).map(n=>({id:n.id,name:categoryPath(db,n),active:usableCategory(db,n)})),{id:'CAT-15',name:'Needs classification',active:true}];}
export function categoryUsage(db,id){const ids=descendants(db,id);return db.tickets.filter(t=>ids.includes(t.categoryId)||db.categoryNodes.some(n=>ids.includes(n.id)&&categoryPath(db,n)===t.category)).length;}
export function contactMatches(db,value,code='auto'){
 const raw=String(value||'').trim();if(!raw)return {valid:false,matches:[],message:'Paste the customer’s email ID or mobile number to check their history.'};
 if(raw.includes('@')){const email=normalEmail(raw);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {valid:false,matches:[],message:'Paste the complete email address.'};return {valid:true,matches:db.customers.filter(c=>normalEmail(c.email)===email||(c.aliases||[]).some(a=>normalEmail(a)===email)),email};}
 if(!/^[+\d\s().-]+$/.test(raw))return {valid:false,matches:[],message:'Use an email address or a phone number with its country code.'};
 let digits=normalPhone(raw);if(code==='auto'&&!raw.startsWith('+')&&!raw.startsWith('00')){const exact=db.customers.filter(c=>normalPhone(c.phone)===digits);if(exact.length)return {valid:true,matches:exact,phone:'+'+digits};return {valid:false,matches:[],message:'Select the country code for this local mobile number, or paste the number beginning with + and its country code.'};}if(code!=='auto'&&!raw.startsWith('+')&&!raw.startsWith('00'))digits=code+digits.replace(/^0/,'');
 if(digits.startsWith('0')||digits.length<8||digits.length>15)return {valid:false,matches:[],message:'Paste the complete mobile number, including the country code.'};
 return {valid:true,matches:db.customers.filter(c=>normalPhone(c.phone)===digits),phone:'+'+digits};
}
