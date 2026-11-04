// Manual authorisations and external-result records. This module never sends a payment.
import {managerMayDecide} from './operations.js?v=20261030';
import {eligibleUser} from './workflow-access.js?v=20261030';

export const REFUND_RESULTS=['Outcome unknown','Pending','Succeeded','Failed'];
const text=(v,message)=>{const s=String(v??'').trim();if(!s)throw Error(message);return s;};
export function cents(value){const s=String(value??'').trim();if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error('Use a non-negative amount with no more than two decimal places.');const n=Math.round(Number(s)*100);if(!Number.isSafeInteger(n)||n>10000000000)throw Error('Enter a valid amount.');return n;}
const granted=(db,u,g,t)=>eligibleUser(db,u,g,t);
const ticketFor=(db,r)=>db.tickets.find(t=>t.id===r.ticketId);
const writable=(db,r)=>{const t=ticketFor(db,r);if(!t||['Closed','Resolved'].includes(t.status))throw Error('Reopen the ticket before recording a new finance action.');return t;};
const audit=(r,u,at,action,detail={})=>r.history.push({at,actorId:u.id,actor:u.name,action,...detail});
export const refundScope=r=>JSON.stringify({ticketId:r.ticketId,customerId:r.customerId,brand:r.brand,order:r.order,requestId:r.requestId||'',requestRevision:r.requestRevision||null,currency:r.currency,goods:cents(r.goods),shipping:cents(r.shipping)});
export function initialiseFinance(db){for(const r of db.refunds){if(r.attempts)continue;const t=ticketFor(db,r);r.order=t?.order||'';r.customerId=t?.customerId;r.brand=t?.brand;r.requestId='';r.status='Approved';r.final=true;r.revision=1;r.requesterId='U2';r.history ||= [];r.attempts=[];if(r.paid)r.attempts.push({id:r.id+'-IMPORTED-PAID',amount:r.paid,result:'Succeeded',proof:'Imported verified paid balance from the synthetic source; earlier attempt details unavailable.',reference:'',imported:true});if(r.attempt)r.attempts.push(r.attempt);r.authorization={scope:refundScope(r),actor:'Imported approved authorisation',actorId:null,at:null,note:'Imported sample authorisation; earlier decision history unavailable.'};r.sourceHistoryIncomplete=true;}}
export function refundBalance(r){const total=cents(r.goods)+cents(r.shipping),paid=(r.attempts||[]).filter(a=>a.result==='Succeeded').reduce((s,a)=>s+cents(a.amount),0),reserved=(r.attempts||[]).filter(a=>['Pending','Outcome unknown'].includes(a.result)).reduce((s,a)=>s+cents(a.amount),0);return {total:total/100,paid:paid/100,reserved:reserved/100,available:Math.max(0,total-paid-reserved)/100};}
export function refundScopeIssue(db,r){const t=ticketFor(db,r);if(!t||t.order!==r.order||t.brand!==r.brand||t.customerId!==r.customerId)return 'The ticket customer, brand or order changed. Review the refund scope before proceeding.';if(r.requestId){const q=db.requests.find(x=>x.id===r.requestId);if(!q||q.ticketId!==t.id||q.revision!==r.requestRevision||q.supersededBy||q.status!=='Approved'||!q.final)return 'The linked service approval is no longer current. Review its scope before proceeding.';}return '';}
export function requestRefund(db,u,{ticketId,requestId='',currency,goods,shipping,reason,evidence,approverId,at}){
 if(!granted(db,u,'work')&&!granted(db,u,'finance'))throw Error('CS or Finance permission is required to request a refund.');
 const t=writable(db,{ticketId}),order=text(t.order,'Link and verify the customer order before requesting a refund.');
 if(!granted(db,u,'work',t)&&!granted(db,u,'finance',t))throw Error('CS or Finance permission within this ticket market is required.');
 const cur=text(currency,'Enter the order currency.').toUpperCase();if(!/^[A-Z]{3}$/.test(cur))throw Error('Use the three-letter order currency, for example GBP.');
 const g=cents(goods),s=cents(shipping);if(g+s<=0)throw Error('The requested refund must be greater than zero.');
 if(db.refunds.some(x=>x.order.toLowerCase()===order.toLowerCase()&&x.brand===t.brand&&x.customerId===t.customerId&&x.status!=='Rejected'))throw Error('A refund authorisation already exists for this customer, brand and order. Open it to request an amount revision or record another attempt.');
 const q=requestId?db.requests.find(x=>x.id===requestId):null;if(requestId&&(!q||q.ticketId!==ticketId||q.supersededBy||!q.final||q.status!=='Approved'))throw Error('Select a current approved service request for this ticket.');
 const approver=db.users.find(x=>x.id===approverId);if(!managerMayDecide(approver,t))throw Error('Select an eligible manager for this ticket market.');
 const note=text(reason,'Explain the refund request.'),proof=text(evidence,'Record evidence of the order amount and refund eligibility.');
 const r={id:'RF-'+(++db.next),ticketId,order,customerId:t.customerId,brand:t.brand,revision:1,requestId:q?.id||'',requestRevision:q?.revision||null,currency:cur,goods:g/100,shipping:s/100,paid:0,status:'Pending decision',final:false,reason:note,evidence:proof,requesterId:u.id,approverId,requestedAt:at,attempts:[],history:[]};
 r.requestedScope=refundScope(r);audit(r,u,at,'Refund requested',{scope:r.requestedScope,reason:note,evidence:proof});db.refunds.push(r);return r;
}
export function decideRefund(db,r,u,{decision,note,at}){
 const t=writable(db,r);if(!managerMayDecide(u,t))throw Error('An eligible Country Manager, Head of CS or Super Admin must decide this refund.');
 if(r.final||r.status!=='Pending decision')throw Error('Open the current undecided refund request.');
 if(!['Approve','Reject','Need information'].includes(decision))throw Error('Choose a valid decision.');
 const why=text(note,'Record a decision note or question.');if(refundScope(r)!==r.requestedScope)throw Error('The amount or linked scope changed after submission.');
 const issue=refundScopeIssue(db,r);if(issue)throw Error(issue);
 r.status={Approve:'Approved',Reject:'Rejected','Need information':'Need information'}[decision];r.final=decision!=='Need information';r.decisionNote=why;
 if(decision==='Reject'&&r.amendment){const proposed=refundScope(r);Object.assign(r,r.amendment.before);r.status='Approved';r.final=true;audit(r,u,at,'Amount revision rejected; prior authorisation retained',{note:why,proposed});delete r.amendment;return r;}
 if(decision==='Approve')r.authorization={scope:refundScope(r),actorId:u.id,actor:u.name,roles:[...u.roles],at,note:why};
 audit(r,u,at,'Refund decision',{decision:r.status,note:why,scope:refundScope(r)});if(decision==='Approve')delete r.amendment;return r;
}
export function reviseRefund(db,r,u,{goods,shipping,reason,evidence,approverId,at}){
 const t=writable(db,r);if(!granted(db,u,'work',t)&&!granted(db,u,'finance',t))throw Error('CS or Finance permission is required.');if(r.status!=='Approved'||!r.final)throw Error('Finish the current decision before requesting an amount revision.');const b=refundBalance(r);if(b.reserved)throw Error('Reconcile pending or unknown attempts before revising the authorisation.');if(refundScopeIssue(db,r))throw Error(refundScopeIssue(db,r));const g=cents(goods),s=cents(shipping);if(g+s<cents(b.paid)||g+s<=0)throw Error('The revised total cannot be below the amount already paid.');if(g===cents(r.goods)&&s===cents(r.shipping))throw Error('Change the requested amount before submitting a revision.');const manager=db.users.find(x=>x.id===approverId);if(!managerMayDecide(manager,t))throw Error('Select an eligible manager.');const note=text(reason,'Explain the amount revision.'),proof=text(evidence,'Record order and refund eligibility evidence.');r.amendment={before:{goods:r.goods,shipping:r.shipping,authorization:r.authorization,requestedScope:r.requestedScope},at};Object.assign(r,{goods:g/100,shipping:s/100,reason:note,evidence:proof,approverId,revision:(r.revision||1)+1,status:'Pending decision',final:false});r.requestedScope=refundScope(r);audit(r,u,at,'Amount revision requested',{before:r.amendment.before,scope:r.requestedScope,note,evidence:proof});return r;
}
export function answerRefund(db,r,u,{note,at}){const t=writable(db,r);if(!granted(db,u,'work',t)&&!granted(db,u,'finance',t))throw Error('CS or Finance permission within this ticket market is required.');if(r.final||r.status!=='Need information')throw Error('This refund is not awaiting information.');const answer=text(note,'Provide the requested information.');r.status='Pending decision';audit(r,u,at,'Information supplied',{note:answer});}
function checkedAttempt(db,r,u,values,existing){
 const t=writable(db,r);if(!granted(db,u,'finance',t))throw Error('Finance permission for this ticket market is required to record an external result.');
 if(r.status!=='Approved'||!r.final||r.authorization?.scope!==refundScope(r))throw Error('A manager must approve this exact amount and scope before an external attempt can be recorded.');
 const issue=refundScopeIssue(db,r);if(issue)throw Error(issue);
 const proof=text(values.proof,'Record meaningful verification evidence; spaces alone are not evidence.');
 if(!REFUND_RESULTS.includes(values.result))throw Error('Select a verified provider outcome.');
 const reference=String(values.reference||existing?.reference||'').trim();if(!existing&&!reference)throw Error('Record the external attempt reference so retries have distinct identities.');
 if(reference&&db.refunds.some(x=>x.attempts.some(a=>a!==existing&&a.reference?.toLowerCase()===reference.toLowerCase())))throw Error('This external attempt reference is already recorded. Update its existing attempt.');
 if(existing?.reference&&reference!==existing.reference)throw Error('The external attempt identity cannot change. Record another attempt only after this one is confirmed failed.');
 if(existing&&['Succeeded','Failed'].includes(existing.result))throw Error('This attempt has a final verified result and cannot be overwritten. Its history is retained.');
 const amount=existing?cents(existing.amount):cents(values.amount);if(amount<=0)throw Error('The external attempt amount must be greater than zero.');
 const other=r.attempts.filter(a=>a!==existing),pending=other.some(a=>['Pending','Outcome unknown'].includes(a.result));if(!existing&&pending)throw Error('Resolve the pending or unknown attempt before recording another attempt.');
 const used=other.filter(a=>['Succeeded','Pending','Outcome unknown'].includes(a.result)).reduce((s,a)=>s+cents(a.amount),0),total=cents(r.goods)+cents(r.shipping);
 if(used+amount>total)throw Error('This attempt exceeds the remaining authorised amount. No additional refund may be recorded.');
 return {amount:amount/100,result:values.result,reference,proof};
}
export function recordRefundAttempt(db,r,u,values){const v=checkedAttempt(db,r,u,values),a={id:'ATT-'+(++db.next),...v,recordedBy:u.name,actorId:u.id,at:values.at,history:[]};a.history.push({at:values.at,actorId:u.id,actor:u.name,...v});r.attempts.push(a);r.attempt=a;r.paid=refundBalance(r).paid;audit(r,u,values.at,'External attempt recorded',{attemptId:a.id,...v});return a;}
export function updateRefundAttempt(db,r,a,u,values){if(!r.attempts.includes(a))throw Error('Open an attempt belonging to this refund.');const v=checkedAttempt(db,r,u,values,a),before={result:a.result,reference:a.reference,proof:a.proof};a.history ||= [];a.history.push({at:values.at,actorId:u.id,actor:u.name,before,...v});Object.assign(a,v);r.attempt=a;r.paid=refundBalance(r).paid;audit(r,u,values.at,'External result verified',{attemptId:a.id,before,...v});return a;}
export function refundRequirementIssue(db,r,treatment=r.refundTreatment){
 if(!['No refund due','Refund required'].includes(treatment))return 'Review refund eligibility and select No refund due or Refund required.';
 if(treatment==='Refund required'){const t=ticketFor(db,r),alternative=r.kind==='Cancellation'?db.requests.find(q=>q.id===r.execution?.alternativeRequestId&&!q.supersededBy):null;if(!db.refunds.some(f=>f.ticketId===r.ticketId&&f.order===t?.order&&f.brand===t?.brand&&f.customerId===t?.customerId&&f.status!=='Rejected'&&(!f.requestId||f.requestId===r.id&&f.requestRevision===r.revision||alternative&&f.requestId===alternative.id&&f.requestRevision===alternative.revision)))return 'Create a linked refund authorisation for the promised refund before confirming this remedy.';}
 return '';
}
export function refundResolutionIssue(db,id){for(const q of db.requests.filter(x=>x.ticketId===id&&!x.supersededBy&&x.status==='Approved'&&x.refundTreatment)){const issue=refundRequirementIssue(db,q);if(issue)return issue;}for(const r of db.refunds.filter(x=>x.ticketId===id)){if(r.status==='Rejected')continue;if(!r.attempts){if(r.paid<r.goods+r.shipping)return 'The promised refund is not confirmed in full. Keep the finance task open.';continue;}if(!r.final||r.status!=='Approved')return 'A refund authorisation is still awaiting a decision or information.';const issue=refundScopeIssue(db,r);if(issue)return issue;if(r.authorization?.scope!==refundScope(r))return 'The refund scope no longer matches its authorisation.';const b=refundBalance(r);if(b.paid!==b.total||b.reserved)return 'The promised refund is not confirmed in full. Keep the finance task open.';}return '';}
