// A failed pre-dispatch cancellation is an execution outcome, not a rewritten approval.
import {scopeConfirmed} from './operations.js?v=20261030';
import {returnOutstanding,inspectionSatisfied,returnWaiverIssue} from './rma-waivers.js?v=20261030';
import {refundRequirementIssue} from './finance.js?v=20261030';
import {eligibleUser} from './workflow-access.js?v=20261030';
const key=r=>JSON.stringify({id:r.id,revision:r.revision,items:r.itemLines});
const current=r=>r?.kind==='Cancellation'&&r.status==='Approved'&&r.final&&!r.supersededBy;
export function alternativeIssue(db,r,id){const q=db.requests.find(x=>x.id===id);if(!q||q.id===r.id||q.ticketId!==r.ticketId||q.kind!=='Return'||q.supersededBy)return 'Select a current return request on this same ticket.';if(!(r.itemLines||[]).every(i=>q.itemLines.some(j=>j.productId===i.productId&&j.expected>=i.expected)))return 'The alternative return must cover every cancellation item and quantity.';return '';}
export function cancellationResolutionIssue(db,r){
 const refundIssue=refundRequirementIssue(db,r);if(refundIssue)return refundIssue;
 if(r.stop==='Stopped before dispatch'&&r.cancel==='Confirmed cancelled')return '';
 const e=r.execution;if(!e||e.outcome!=='Not possible after dispatch'||e.scope!==key(r)||!e.proof?.trim())return 'Confirm warehouse stop and external order cancellation before resolving, or record cancellation not possible and its alternative return.';
 const issue=alternativeIssue(db,r,e.alternativeRequestId);if(issue)return issue;
 const q=db.requests.find(x=>x.id===e.alternativeRequestId);if(q.status!=='Approved'||!q.final)return 'The alternative return still requires manager approval.';
 const ret=db.returns.find(x=>x.requestId===q.id);if(!ret||returnOutstanding(ret)||!inspectionSatisfied(ret)||returnWaiverIssue(db,r.ticketId)||!scopeConfirmed(q))return 'Complete the linked alternative return, inspection or waiver, and confirmed remedy before retiring the cancellation obligation.';
 return '';
}
export function recordCancellation(db,r,u,{stop,cancel,proof,alternativeRequestId='',refundTreatment,at}){
 const t=db.tickets.find(x=>x.id===r.ticketId);if(!t||['Closed','Resolved'].includes(t.status))throw Error('Reopen the ticket before recording cancellation checks.');
 if(!eligibleUser(db,u,'logistics',t))throw Error('Logistics permission for this ticket market is required to record cancellation outcomes.');
 if(!current(r))throw Error('A current approved cancellation is required.');
 if(!['Unconfirmed','Stopped before dispatch','Already dispatched'].includes(stop)||!['Unconfirmed','Confirmed cancelled'].includes(cancel))throw Error('Select valid external outcomes.');
 const evidence=String(proof||'').trim();if(!evidence)throw Error('Record meaningful external evidence for these checks.');
 if(stop==='Already dispatched'&&cancel==='Confirmed cancelled')throw Error('Already dispatched: record cancellation not possible and link a separate return approval.');
 if(alternativeRequestId&&stop!=='Already dispatched')throw Error('An alternative return applies only when cancellation was not possible after dispatch.');
 if(alternativeRequestId){const issue=alternativeIssue(db,r,alternativeRequestId);if(issue)throw Error(issue);}
 if(refundTreatment&&!['No refund due','Refund required'].includes(refundTreatment))throw Error('Review refund eligibility and select a refund treatment.');
 r.executionHistory ||= [];r.executionHistory.push({at,actorId:u.id,actor:u.name,before:{stop:r.stop,cancel:r.cancel,execution:r.execution?{...r.execution}:null},stop,cancel,proof:evidence,alternativeRequestId});
 Object.assign(r,{stop,cancel,proof:evidence});if(refundTreatment)r.refundTreatment=refundTreatment;r.execution=stop==='Already dispatched'?{outcome:'Not possible after dispatch',scope:key(r),alternativeRequestId,proof:evidence,actorId:u.id,actor:u.name,at}:null;
 return !cancellationResolutionIssue(db,r);
}
