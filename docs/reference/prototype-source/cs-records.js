import {normalEmail,normalPhone,categoryPath,usableCategory} from './catalog.js?v=20261030';
import {managerMayDecide} from './replacements.js?v=20261030';

export function customerName(value){
 const name=String(value||'').trim();
 if(!name)throw Error('Enter the customer name. Spaces alone are not a name.');
 return name;
}

export function correctionEmail(db,customer,value){
 const email=normalEmail(value);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid complete email address.');
 if(email===normalEmail(customer.email))throw Error('Enter a different corrected email. Email case and spacing are ignored.');
 if(db.customers.some(c=>c.id!==customer.id&&[c.email,...(c.aliases||[])].some(value=>normalEmail(value)===email)))throw Error('This contact already exists on another customer, including retained aliases. Review identity separately before applying it.');
 return email;
}

// Search the actual linked customer, rather than assuming exported rows contain
// contact details. Phone matching is limited to phone fields, not arbitrary IDs.
export function recordMatches(db,record,query){
 const raw=String(query||'').trim();if(!raw)return true;if(!record)return false;
 const ticketId=record.ticketId||record.ticket_id||(db.tickets.some(t=>t.id===record.id)?record.id:null);
 const ticket=db.tickets.find(t=>t.id===ticketId);
 const customerId=record.customerId||record.customer_id||ticket?.customerId||(db.customers.some(c=>c.id===record.id)?record.id:null);
 const customer=db.customers.find(c=>c.id===customerId);
 const returns=ticket?db.returns.filter(r=>r.ticketId===ticket.id):[];
 const text=JSON.stringify({record,ticket,customer,returns}).toLowerCase().replace(/\s/g,'');
 if(text.includes(raw.toLowerCase().replace(/\s/g,'')))return true;
 if(!/^[+\d\s().-]+$/.test(raw))return false;
 const phone=normalPhone(raw);if(phone.length<5)return false;
 return [record.phone,customer?.phone].some(value=>value&&normalPhone(value).includes(phone));
}

export const needsClassification=t=>t?.categoryId==='CAT-15'||t?.category==='Needs classification';
export const classificationTask=t=>t?.step==='classification'||t?.title==='Classify customer issue';
export function classificationCompletionIssue(task,ticket){
 return classificationTask(task)&&needsClassification(ticket)?'Classify the ticket using Edit classification before completing this action. A customer update does not classify the issue.':null;
}

export function classifyTicketRecord(db,t,user,v,at){
 if(!managerMayDecide(user,t)||!['read','work'].every(grant=>user.roles.some(role=>db.roles.find(r=>r.id===role)?.grants.includes(grant))))throw Error('A Country Manager for this market, Head of CS or Super Admin with ticket access must classify this ticket.');
 if(t.version!==v.baseVersion)throw Error('The ticket changed. Reopen classification and review the latest values.');
 const reason=String(v.reason||'').trim();if(!reason)throw Error('Record why the classification is changing.');
 const query=db.masters['Query Types'].find(q=>q.id===v.queryTypeId&&q.active);
 if(!query)throw Error('Select an active query type.');
 const main=db.categoryNodes.find(n=>n.id===v.mainCategoryId);
 if(!main||main.parentId||main.queryTypeId!==query.id||!usableCategory(db,main))throw Error('Select an active main category for this query type.');
 const children=db.categoryNodes.filter(n=>n.parentId===main.id&&usableCategory(db,n));
 const node=children.length?children.find(n=>n.id===v.childCategoryId):main;
 if(!node)throw Error('Select an active child category for this main category.');
 const productId=v.productId||'',product=db.masters.Products.find(p=>p.id===productId),productChanged=productId!==(t.productId||'');
 if(productChanged&&productId&&(!product||product.deleted||!product.active||![t.brand,'Both brands'].includes(product.brand)))throw Error('Select an active product for this brand.');
 if(productChanged&&db.requests.some(r=>r.ticketId===t.id&&r.status==='Approved'))throw Error('Keep the ticket product linked to its approved service scope. Review the service request before changing the affected product.');
 const keys=['type','queryTypeId','category','categoryId','productId','product','sku','capacity'];
 const before=Object.fromEntries(keys.map(key=>[key,t[key]||'']));
 const after={type:query.name,queryTypeId:query.id,category:categoryPath(db,node),categoryId:node.id,productId,product:productChanged?product?.name||'':t.product||'',sku:productChanged?product?.sku||'':t.sku||'',capacity:productChanged?product?.capacity||'':t.capacity||''};
 if(keys.every(key=>before[key]===after[key]))throw Error('Select a changed classification or product before saving.');
 const wasUnknown=needsClassification(t);
 Object.assign(t,after);
 if(wasUnknown)t.subject=node.name+(product?' · '+product.name:'');
 const change={at,actorId:user.id,actor:user.name,reason,before,after};
 (t.classificationHistory??=[]).push(change);
 return change;
}

export function ticketExportRows(db,rows){
 return rows.map(t=>{const c=db.customers.find(c=>c.id===t.customerId)||{};return {
  ticket_id:t.id,customer_id:t.customerId,customer:c.name||'',email:c.email||'',phone:c.phone||'',customer_aliases:c.aliases||[],brand:t.brand,country:t.country,
  order_number:t.order,rma_numbers:db.returns.filter(r=>r.ticketId===t.id).map(r=>r.rma).join(' | '),carrier_tracking:db.returns.filter(r=>r.ticketId===t.id).map(r=>r.tracking).join(' | '),
  type:t.type,query_type_id:t.queryTypeId||'',category:t.category,category_id:t.categoryId||'',product:t.product||'',product_id:t.productId||'',sku:t.sku||'',capacity:t.capacity||'',channel:t.channel||'',priority:t.priority||'',
  status:t.status,owner:t.owner,working_now:t.worker,subject:t.subject,customer_message:t.description||'',created_by:t.creator||'',created_at:t.created,received_at:t.received,recorded_at:t.recorded||'',resolved_at:t.resolvedAt||'',previous_resolutions:t.previousResolutions||[],
  next_action:t.nextAction,task_owner:t.taskOwner,task_due:t.due,resolution_due:t.resolutionDue,last_editor:t.lastEditor,ticket_revision:t.version,evidence:t.evidence||[],classification_history:t.classificationHistory||[],source:t.source||'Manual entry'
 };});
}

export function csvText(rows){
 const headers=[...new Set(rows.flatMap(row=>Object.keys(row)))];
 const quote=value=>{let s=typeof value==='object'&&value!==null?JSON.stringify(value):String(value??'');if(/^[\s\uFEFF]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 return '\ufeff'+[headers.map(quote).join(','),...rows.map(row=>headers.map(key=>quote(row[key])).join(','))].join('\r\n');
}
