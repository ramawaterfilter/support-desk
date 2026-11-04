// Shared workflow rules for the synthetic review session. No external writes.
export const stamp = value => /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value+'+05:30';
export const istDate = value => new Date(new Date(value).getTime()+19800000).toISOString().slice(0,10);
export const future = (hours=24, base=new Date()) => new Date(new Date(base).getTime()+hours*3600000).toISOString();
export const labelLines = lines => lines.map(i=>`${i.expected} × ${i.name} (${i.sku})`).join(' + ');
export const currentRequests = (db,id) => db.requests.filter(r=>r.ticketId===id&&!r.supersededBy);
export const scopeConfirmed = r => r.confirmation?.requestId===r.id && r.confirmation?.revision===r.revision;
export const managerMayDecide=(u,t)=>u?.status==='Active'&&(u.roles.some(x=>['super','head'].includes(x))||u.roles.includes('cm')&&['All markets',t.country].includes(u.scope));
export const productInUse = (db,id) => db.tickets.some(t=>t.productId===id)||db.requests.some(r=>[...(r.itemLines||[]),...(r.replacementLines||[])].some(i=>i.productId===id))||db.returns.some(r=>r.items.some(i=>i.productId===id));

export function checkedLines(db,lines,brand,previous=[]){
 if(!lines.length)throw Error('Select at least one product and quantity.');
 const used=new Set();
 return lines.map(line=>{
  const product=db.masters.Products.find(p=>p.id===line.productId),old=previous.find(i=>i.lineId===line.lineId&&i.productId===line.productId);
  if(!product||(!old&&(!product.active||product.deleted||![brand,'Both brands'].includes(product.brand))))throw Error('Choose an active product for this brand.');
  if(used.has(product.id))throw Error('Use one row per product; combine repeated quantities.');used.add(product.id);
  const expected=Number(line.expected);if(!Number.isSafeInteger(expected)||expected<1||expected>999)throw Error('Quantity must be a whole number from 1 to 999.');
  return {...line,productId:product.id,name:old?.name||product.name,sku:old?.sku||product.sku,expected};
 });
}
export function linkedReturns(db,request){
 const ids=new Set();let r=request;
 while(r&&!ids.has(r.id)){ids.add(r.id);r=db.requests.find(x=>x.id===r.previousId);}
 return db.returns.filter(x=>ids.has(x.requestId));
}
export function validateRevision(db,previous,lines){
 if(previous.shipment)throw Error('A shipment is already recorded. Create a separate service request for further work.');
 for(const ret of linkedReturns(db,previous)){
  if((ret.waivers||[]).some(w=>['Pending decision','Need information','Approved'].includes(w.status)))throw Error('This RMA has a pending or approved collection waiver. Withdraw an undecided waiver first, or create a separate service request. Receipt and waiver history must stay linked.');
  if(ret.dispatch)throw Error('A shipment is already recorded. Create a separate service request for further work.');
  for(const item of ret.items.filter(i=>i.received>0)){
   const next=lines.find(i=>i.lineId===item.lineId&&i.productId===item.productId);
   if(!next||next.expected<item.received)throw Error('Keep each received product line and at least its received quantity.');
  }
 }
}

export function initialiseOperations(db,anchor=new Date().toISOString()){
 const offset=new Date(anchor)-new Date('2026-09-22T15:30:00+05:30');
 const shift=value=>{if(Array.isArray(value)){value.forEach((v,i)=>value[i]=shift(v));return value;}if(value&&typeof value==='object'){for(const k of Object.keys(value))value[k]=shift(value[k]);return value;}return typeof value==='string'&&/^2026-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)?new Date(new Date(stamp(value)).getTime()+offset).toISOString():value;};
 shift(db);db.seedAnchor=anchor;db.tasks=[];db.taskNext=0;
 db.disputes.forEach(d=>d.providerDeadline=d.due);
 // Explicit mappings for the known synthetic examples, not inferred live order data.
 const maps={'AR-104':[['SKU-1',1],['SKU-4',1]],'AR-208':[['SKU-2',1]],'AR-520':[['SKU-1',1]],'AR-309':[['SKU-1',1]],'AR-611':[['SKU-1',1],['SKU-4',1]]};
 for(const r of db.requests){
  r.itemLines=(maps[r.id]||[]).map(([id,expected],n)=>{let p=db.masters.Products.find(x=>x.id===id);return {lineId:r.id+'-L'+n,productId:id,name:p.name,sku:p.sku,expected};});
  r.items=labelLines(r.itemLines);r.replacementLines=r.kind==='Replacement'?r.itemLines.map(i=>({...i,lineId:i.lineId+'-OUT'})):[];
  r.requesterId=db.users.find(u=>u.name===db.tickets.find(t=>t.id===r.ticketId).owner)?.id||'U2';r.approverId='U4';r.reason ||= 'Customer request';
 }
 for(const ret of db.returns){const r=db.requests.find(r=>r.id===ret.requestId);ret.items=r.itemLines.map((i,n)=>({...i,received:ret.items[n]?.received||0}));}
 return anchor;
}

export class TaskBook{
 constructor(db,{clock=()=>new Date().toISOString(),actor=()=>({id:'system',name:'Workflow'})}={}){this.db=db;this.clock=clock;this.actor=actor;}
 owner(id){return this.db.users.find(u=>u.id===id)?.name||'Needs reassignment';}
 ownerId(name){return this.db.users.find(u=>u.name===name)?.id||'';}
 get(id){return this.db.tasks.find(t=>t.id===id);}
 open(ticketId){this.check();return this.db.tasks.filter(t=>t.status==='open'&&(!ticketId||t.ticketId===ticketId)).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));}
 event(t,action,detail={}){t.history.push({at:this.clock(),actorId:this.actor().id,actor:this.actor().name,action,...detail});}
 check(){const now=this.clock();for(const t of this.db.tasks){if(t.status==='open'&&!t.firstMissedAt&&new Date(t.dueAt)<new Date(now)){t.firstMissedAt=t.dueAt;t.ownerAtFirstMiss=t.ownerId;this.event(t,'Deadline missed',{deadline:t.dueAt,ownerId:t.ownerId});}}}
 create({ticketId=null,sourceType='ticket',sourceId=ticketId,step='followup',title,ownerId,dueAt,coverage='complete',createdAt=this.clock()}){
  const existing=this.db.tasks.find(t=>t.status==='open'&&t.sourceType===sourceType&&t.sourceId===sourceId&&t.step===step);if(existing)return existing;
  if(!title||!Number.isFinite(new Date(stamp(dueAt)).getTime()))throw Error('A task needs an action and a valid deadline.');
  const at=stamp(dueAt),t={id:'TASK-'+(++this.db.taskNext),ticketId,sourceType,sourceId,step,title,ownerId,status:'open',createdAt,dueAt:at,originalDueAt:at,completedAt:null,firstMissedAt:null,ownerAtFirstMiss:null,coverage,remindAt:future(-1,at),history:[]};
  this.db.tasks.push(t);this.event(t,'Created',{ownerId,dueAt:at});this.check();this.sync();return t;
 }
 finish(t,reason,status='completed',occurredAt=this.clock()){
  if(!t||t.status!=='open')return;
  const actual=stamp(occurredAt),recordedAt=this.clock();
  if(!Number.isFinite(new Date(actual).getTime())||new Date(actual)>new Date(recordedAt))throw Error('Completion time must be a valid time, not in the future.');
  // The UI uses minute precision; retain the actual creation second in that minute.
  if(t.coverage==='complete'&&new Date(actual)<new Date(t.createdAt)-60000)throw Error('Completion cannot be earlier than this follow-up was created.');
  const completedAt=t.coverage==='complete'&&new Date(actual)<new Date(t.createdAt)?t.createdAt:actual;
  this.check();
  if(status==='completed'&&t.firstMissedAt&&new Date(completedAt)<=new Date(t.firstMissedAt)){
   this.event(t,'Provisional missed deadline corrected',{deadline:t.firstMissedAt,actualCompletion:completedAt,reason});t.firstMissedAt=null;t.ownerAtFirstMiss=null;
  }
  t.status=status;t.completedAt=status==='completed'?completedAt:null;t.cancelledAt=status==='cancelled'?recordedAt:null;t.completionRecordedAt=recordedAt;t.outcome=reason;this.event(t,status,{reason,occurredAt:completedAt});this.sync();
 }
 finishSource(type,id,reason,status='completed'){for(const t of this.open().filter(t=>t.sourceType===type&&t.sourceId===id))this.finish(t,reason,status);}
 revise(t,{ownerId,dueAt,reason}){
  if(t.status!=='open')throw Error('This task is already completed.');if(!reason?.trim())throw Error('Record why ownership or the deadline changed.');
  let at=stamp(dueAt);const sameMinute=Math.floor(new Date(at)/60000)===Math.floor(new Date(t.dueAt)/60000);
  if(!Number.isFinite(new Date(at).getTime())||!sameMinute&&new Date(at)<=new Date(this.clock()))throw Error('A changed deadline must be in the future. Keep the existing time for an owner-only handover.');
  if(sameMinute)at=t.dueAt;this.check();this.event(t,'Reassigned / rescheduled',{before:{ownerId:t.ownerId,dueAt:t.dueAt},after:{ownerId,dueAt:at},reason});t.ownerId=ownerId;t.dueAt=at;t.remindAt=future(-1,at);this.sync();
 }
 snooze(t,minutes){if(t.status!=='open')throw Error('This task is no longer open.');this.check();t.remindAt=future(minutes/60,this.clock());this.event(t,'Reminder snoozed',{remindAt:t.remindAt,dueAt:t.dueAt});}
 reminders(ownerId){return this.open().filter(t=>t.ownerId===ownerId&&new Date(t.remindAt)<=new Date(this.clock()));}
 missed(from,to){this.check();return this.db.tasks.filter(t=>t.coverage==='complete'&&t.firstMissedAt&&istDate(t.firstMissedAt)>=from&&istDate(t.firstMissedAt)<=to);}
 sync(){
  for(const ticket of this.db.tickets){const tasks=this.db.tasks.filter(t=>t.ticketId===ticket.id&&t.status==='open').sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));let next=tasks[0];ticket.nextAction=next?next.title+(tasks.length>1?` (+${tasks.length-1} more)`:''):'No open follow-up — review resolution';ticket.taskOwner=next?this.owner(next.ownerId):'—';ticket.due=next?.dueAt||null;}
  for(const [type,records] of [['request',this.db.requests],['return',this.db.returns],['waiver',this.db.returns.flatMap(r=>r.waivers||[])],['dispute',this.db.disputes]])for(const r of records){const next=this.db.tasks.find(t=>t.sourceType===type&&t.sourceId===r.id&&t.status==='open');if(next){r.owner=this.owner(next.ownerId);r.due=next.dueAt;}}
  for(const r of this.db.refunds){const task=this.db.tasks.find(t=>t.sourceType==='refund'&&t.sourceId===r.id&&t.step==='reconcile'&&t.status==='open');if(task&&r.attempt){r.attempt.owner=this.owner(task.ownerId);r.attempt.due=task.dueAt;}}
 }
 seed(){
  const db=this.db,oldTasks=new Map(db.tickets.map(t=>[t.id,{title:t.nextAction,owner:t.taskOwner,due:t.due}]));
  for(const r of db.requests){if(r.final&&db.returns.some(ret=>ret.requestId===r.id))continue;
   const info=r.status==='Need information';this.create({ticketId:r.ticketId,sourceType:'request',sourceId:r.id,step:r.final?'fulfil':info?'information':'decision',title:r.final?'Register RMA and confirm release conditions':info?'Provide requested information':'Decide '+r.kind.toLowerCase()+' request',ownerId:this.ownerId(r.owner),dueAt:r.due,coverage:'current-state-only'});
  }
  for(const r of db.returns)this.create({ticketId:r.ticketId,sourceType:'return',sourceId:r.id,step:'receipt',title:r.stage==='Partial receipt'?'Follow up missing return items':'Confirm matched warehouse receipt',ownerId:this.ownerId(r.owner),dueAt:r.due,coverage:'current-state-only'});
  for(const r of db.refunds)this.create({ticketId:r.ticketId,sourceType:'refund',sourceId:r.id,step:'reconcile',title:'Verify refund provider outcome',ownerId:this.ownerId(r.attempt.owner),dueAt:r.attempt.due,coverage:'current-state-only'});
  for(const r of db.disputes)this.create({ticketId:r.ticketId,sourceType:'dispute',sourceId:r.id,step:'evidence',title:'Submit dispute evidence before provider deadline',ownerId:this.ownerId(r.owner),dueAt:r.due,coverage:'current-state-only'});
  for(const t of db.tickets.filter(t=>!t.test&&!['Resolved','Closed'].includes(t.status)&&!this.open(t.id).length)){const old=oldTasks.get(t.id);this.create({ticketId:t.id,title:old.title,ownerId:this.ownerId(old.owner),dueAt:old.due,coverage:'current-state-only'});}
  // Clearly synthetic examples with known commitment history for report review.
  const late=this.create({ticketId:'DEMO-086',step:'sample-late',title:'Sample: send cartridge compatibility guide',ownerId:'U2',createdAt:future(-72,this.clock()),dueAt:future(-48,this.clock())});late.completedAt=future(-47,this.clock());late.status='completed';late.outcome='Guide sent (synthetic example)';late.history=[{at:late.createdAt,actor:'Rithika',action:'Created',dueAt:late.dueAt},{at:late.completedAt,actor:'Rithika',action:'completed',reason:late.outcome}];
  this.create({ticketId:'DEMO-800',sourceId:'SAMPLE-DUE-SOON',step:'sample-followup',title:'Sample: customer follow-up due shortly',ownerId:'U2',dueAt:future(.5,this.clock())});
  this.create({ticketId:'DEMO-803',sourceId:'SAMPLE-OVERDUE',step:'followup',title:'Sample: promised refund progress update',ownerId:'U2',createdAt:future(-26,this.clock()),dueAt:future(-2,this.clock())});
  this.sync();
 }
}
