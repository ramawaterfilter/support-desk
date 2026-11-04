// Separate collection exceptions. A waiver never changes physical receipt quantities.
import {managerMayDecide,stamp} from './operations.js?v=20261030';

export const allReturnWaivers=db=>db.returns.flatMap(r=>(r.waivers||[]));
export const returnScope=r=>JSON.stringify({id:r.id,requestId:r.requestId,items:r.items.map(i=>({lineId:i.lineId,productId:i.productId,expected:i.expected}))});
const applicable=(r,w)=>w.status==='Approved'&&w.scope===returnScope(r)&&!!w.actorId&&!!w.decidedAt;
export const returnBalance=r=>r.items.map(i=>{const approved=(r.waivers||[]).filter(w=>applicable(r,w)).reduce((n,w)=>n+(w.lines.find(l=>l.lineId===i.lineId)?.quantity||0),0),waived=Math.min(approved,Math.max(0,i.expected-i.received));return {...i,approvedWaived:approved,waived,remaining:Math.max(0,i.expected-i.received-waived)};});
export const returnOutstanding=r=>!!r.hold||returnBalance(r).some(i=>i.remaining>0);
const receiptScope=r=>JSON.stringify(r.items.map(i=>({lineId:i.lineId,received:i.received})));
export const inspectionSatisfied=r=>!r.items.some(i=>i.received>0)||(r.condition==='Inspected — acceptable'&&(!r.inspectionScope||r.inspectionScope===receiptScope(r)));
export const waiverSnapshot=r=>JSON.stringify({scope:returnScope(r),received:r.items.map(i=>i.received),receiptVersion:r.receiptVersion||0,condition:r.condition||'',hold:r.hold||'',approved:(r.waivers||[]).filter(w=>applicable(r,w)).map(w=>({id:w.id,lines:w.lines}))});
export const waiverPending=w=>['Pending decision','Need information'].includes(w.status);
const hasGrant=(db,u,g)=>u?.status==='Active'&&u.roles.some(id=>db.roles.find(r=>r.id===id)?.grants.includes(g));
function currentReturn(db,r){
 const t=db.tickets.find(t=>t.id===r.ticketId),req=db.requests.find(x=>x.id===r.requestId);
 if(!t||['Resolved','Closed'].includes(t.status))throw Error('Reopen the ticket in the CS workspace before recording new return activity.');
 if(r.hold||!req||req.supersededBy||req.status!=='Approved'||!req.final)throw Error('A current approved RMA without a scope hold is required.');
 return {t,req};
}
export function initialiseReturnHistory(r){
 if(!r.receiptHistory)r.receiptHistory=[{type:'Imported snapshot',at:null,actor:null,note:'Earlier receipt event history is unavailable.',items:r.items.map(i=>({...i})),proof:r.proof||'',condition:r.condition||'Not recorded',receivedAt:r.receivedAt||null}];
 r.waivers ||= [];r.receiptVersion ||= 0;
}
export function requestReturnWaiver(db,r,u,{id,lines,reason,evidence,ownerId,dueAt,at}){
 const {t,req}=currentReturn(db,r);
 if(!hasGrant(db,u,'work')&&!hasGrant(db,u,'logistics'))throw Error('CS or Logistics permission is required to request a waiver.');
 if((r.waivers||[]).some(waiverPending))throw Error('An undecided waiver already exists. Review or withdraw it first.');
 if(!id||allReturnWaivers(db).some(w=>w.id===id))throw Error('Use a unique waiver reference.');
 if(!reason?.trim()||!evidence?.trim())throw Error('Record the collection waiver reason and supporting evidence.');
 if(!managerMayDecide(db.users.find(x=>x.id===ownerId),t))throw Error('Select an eligible manager to decide this waiver.');
 if(!Number.isFinite(new Date(stamp(dueAt)).getTime())||new Date(stamp(dueAt))<=new Date(at))throw Error('Choose a future decision deadline.');
 const balances=returnBalance(r),seen=new Set(),selected=[];
 for(const l of lines){const item=balances.find(i=>i.lineId===l.lineId),q=Number(l.quantity);if(!item||seen.has(l.lineId)||!Number.isSafeInteger(q)||q<0||q>item.remaining)throw Error('Waive only whole quantities still due back on each existing line.');seen.add(l.lineId);if(q)selected.push({lineId:item.lineId,productId:item.productId,name:item.name,sku:item.sku,quantity:q,expected:item.expected,received:item.received,remainingAtRequest:item.remaining});}
 if(!selected.length)throw Error('Select at least one outstanding item to waive.');
 initialiseReturnHistory(r);
 const w={id,returnId:r.id,rma:r.rma,ticketId:r.ticketId,requestId:req.id,revision:req.revision,scope:returnScope(r),snapshot:waiverSnapshot(r),lines:selected,reason:reason.trim(),evidence:evidence.trim(),requesterId:u.id,requestedBy:u.name,requestedAt:at,ownerId,dueAt:stamp(dueAt),status:'Pending decision',history:[{action:'Requested',actorId:u.id,actor:u.name,at,reason:reason.trim(),evidence:evidence.trim()}]};r.waivers.push(w);return w;
}
export function decideReturnWaiver(db,r,w,u,{result,note,confirmed=false,at}){
 const {t,req}=currentReturn(db,r);
 if(!managerMayDecide(u,t))throw Error('An eligible Country Manager, Head of CS or Super Admin must decide this waiver.');
 if(!(r.waivers||[]).includes(w)||w.status!=='Pending decision')throw Error('Open the current pending waiver.');
 if(!['Approve','Reject','Need information'].includes(result)||!note?.trim())throw Error('Choose a decision and record a decision note.');
 if(w.scope!==returnScope(r)||w.snapshot!==waiverSnapshot(r)||w.requestId!==req.id||w.revision!==req.revision)throw Error('The return changed since this waiver was requested. Withdraw it and submit a fresh request using the current quantities.');
 if(result==='Approve'&&!confirmed)throw Error('Explicitly approve waiving collection of the quantities shown.');
 w.status={Approve:'Approved',Reject:'Rejected','Need information':'Need information'}[result];
 w.history.push({action:w.status,actorId:u.id,actor:u.name,roles:[...u.roles],at,note});
 if(result!=='Need information')Object.assign(w,{actorId:u.id,actor:u.name,roles:[...u.roles],decidedAt:at,decisionNote:note});
 return w;
}
export function answerReturnWaiver(db,r,w,u,{note,ownerId,dueAt,at}){
 const {t,req}=currentReturn(db,r);
 if(!hasGrant(db,u,'work')&&!hasGrant(db,u,'logistics'))throw Error('CS or Logistics permission is required.');
 if(w.status!=='Need information'||!(r.waivers||[]).includes(w))throw Error('This waiver is not awaiting information.');
 if(w.snapshot!==waiverSnapshot(r)||w.revision!==req.revision)throw Error('The return changed. Withdraw this request and submit a fresh waiver.');
 if(!note?.trim()||!managerMayDecide(db.users.find(x=>x.id===ownerId),t)||new Date(stamp(dueAt))<=new Date(at)||!Number.isFinite(new Date(stamp(dueAt)).getTime()))throw Error('Record the information, an eligible decision owner and a future deadline.');
 Object.assign(w,{status:'Pending decision',ownerId,dueAt:stamp(dueAt)});w.history.push({action:'Information supplied',actorId:u.id,actor:u.name,at,note});return w;
}
export function withdrawReturnWaiver(db,r,w,u,{note,at}){
 currentReturn(db,r);if(!hasGrant(db,u,'work')&&!hasGrant(db,u,'logistics')&&!managerMayDecide(u,db.tickets.find(t=>t.id===r.ticketId)))throw Error('CS, Logistics or manager authority is required.');
 if(!(r.waivers||[]).includes(w)||!waiverPending(w)||!note?.trim())throw Error('Only an undecided waiver can be withdrawn, with a reason.');
 w.status='Withdrawn';w.history.push({action:'Withdrawn',actorId:u.id,actor:u.name,at,note});
}
export function recordReturnReceipt(db,r,u,{quantities,condition,proof,receivedAt,at}){
 currentReturn(db,r);if(!hasGrant(db,u,'logistics'))throw Error('Logistics permission is required to record warehouse receipt.');
 if(quantities.length!==r.items.length||quantities.some((q,n)=>!Number.isSafeInteger(q)||q<r.items[n].received||q>r.items[n].expected)||!quantities.some(q=>q>0))throw Error('Record valid cumulative physical quantities, with at least one item received.');
 const occurred=stamp(receivedAt);if(!Number.isFinite(new Date(occurred).getTime())||new Date(occurred)>new Date(at))throw Error('Receipt time must be valid and cannot be in the future.');
 if(r.receivedAt&&new Date(occurred)<new Date(r.receivedAt))throw Error('This cumulative receipt cannot predate the previous receipt.');
 if(!proof?.trim()||!['Inspected — acceptable','Damaged — review required'].includes(condition))throw Error('Record receipt evidence and the inspection outcome for all received items.');
 initialiseReturnHistory(r);const before=r.items.map(i=>({...i}));
 r.items.forEach((i,n)=>i.received=quantities[n]);Object.assign(r,{condition,proof:proof.trim(),receivedAt:occurred,receiptVersion:r.receiptVersion+1});r.inspectionScope=receiptScope(r);
 r.receiptHistory.push({type:'Warehouse receipt / inspection',at,receivedAt:occurred,actorId:u.id,actor:u.name,before,items:r.items.map(i=>({...i})),proof:r.proof,condition});
 const superseded=r.waivers.filter(waiverPending);for(const w of superseded){w.status='Superseded by receipt';w.history.push({action:'Superseded by receipt',actorId:u.id,actor:u.name,at,note:'Receipt or inspection changed. Request a new waiver against the current balance.'});}
 return superseded;
}
export function returnWaiverIssue(db,ticketId){
 const returns=db.returns.filter(r=>r.ticketId===ticketId);
 if(returns.some(r=>(r.waivers||[]).some(waiverPending)))return 'A return waiver is still awaiting a decision or information.';
 if(returns.some(r=>(r.waivers||[]).some(w=>w.status==='Approved'&&(w.scope!==returnScope(r)||!w.customerNotice))))return 'Review the approved return waiver and record the customer update before resolving.';
 if(returns.some(r=>!inspectionSatisfied(r)))return 'Complete an acceptable inspection of the items actually received before resolving.';
 return '';
}
