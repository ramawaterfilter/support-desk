// Rules shared by the review UI and lifecycle tests. Records stay in this demo tab.
import {currentRequests,scopeConfirmed,managerMayDecide} from './operations.js?v=20261030';
import {returnOutstanding,inspectionSatisfied,returnWaiverIssue} from './rma-waivers.js?v=20261030';
import {refundResolutionIssue,refundRequirementIssue} from './finance.js?v=20261030';
import {cancellationResolutionIssue} from './cancellations.js?v=20261030';
export {managerMayDecide,returnOutstanding};

export const REPLACEMENT_PATHS=['Return first, then replace','Replace now, return later','Replace without a return'];
export const replacementPath=r=>r.condition==='Approved advance replacement'?REPLACEMENT_PATHS[1]:r.condition==='Warehouse receipt required'?REPLACEMENT_PATHS[0]:r.condition;
export const noReturn=r=>r.kind==='Replacement'&&replacementPath(r)===REPLACEMENT_PATHS[2];
export const scopeKey=r=>JSON.stringify({id:r.id,revision:r.revision,kind:r.kind,path:replacementPath(r),inbound:r.itemLines,outbound:r.replacementLines,exception:r.exceptionReason||''});
export const waiverApproved=r=>noReturn(r)&&r.status==='Approved'&&r.final&&!r.supersededBy&&r.waiver?.requestId===r.id&&r.waiver?.revision===r.revision&&r.waiver?.scope===scopeKey(r)&&!!r.waiver?.actorId&&!!r.waiver?.at&&!!r.waiver?.reason;

export function validateReplacementScope(db,r,previous){
 if(r.kind!=='Replacement')return;
 if(!REPLACEMENT_PATHS.includes(replacementPath(r)))throw Error('Choose a replacement arrangement.');
 if(!r.replacementLines?.length)throw Error('Select the replacement products and quantities to send.');
 if(noReturn(r)){
  if(!r.exceptionReason?.trim())throw Error('Explain why the customer does not need to return the faulty item.');
  if(r.itemLines.length)throw Error('A no-return request must not include items expected back.');
  // Existing physical return obligations are not silently removed by a new request.
  let prior=previous;
  while(prior){if(db.returns.some(x=>x.requestId===prior.id))throw Error('An RMA already exists for this request. Open that return and choose Request remaining return waiver to preserve its receipt and approval history.');prior=db.requests.find(x=>x.id===prior.previousId);}
 }else if(!r.itemLines?.length)throw Error('Select the products and quantities expected back.');
}

export function approveScope(db,r,u,{waiverConfirmed=false,reason,at}){
 const t=db.tickets.find(t=>t.id===r.ticketId);
 if(!managerMayDecide(u,t))throw Error('An eligible Country Manager, Head of CS or Super Admin must approve this request.');
 if(r.final||r.supersededBy)throw Error('Open the current undecided request.');
 if(!reason?.trim())throw Error('Record a decision note.');
 validateReplacementScope(db,r,db.requests.find(x=>x.id===r.previousId));
 if(noReturn(r)&&!waiverConfirmed)throw Error('Explicitly approve the no-return exception for this request and revision.');
 r.approvedScope=scopeKey(r);
 if(noReturn(r))r.waiver={requestId:r.id,revision:r.revision,scope:r.approvedScope,actorId:u.id,actor:u.name,roles:[...u.roles],at,reason:r.exceptionReason,decisionNote:reason};
}

export function dispatchIssue(db,r){
 if(!r||r.kind!=='Replacement'||r.status!=='Approved'||!r.final||r.supersededBy)return 'A current approved replacement request is required.';
 if(r.approvedScope!==scopeKey(r))return 'The scope changed after approval. Submit a new revision for approval.';
 if(r.shipment)return 'This approved replacement has already been dispatched.';
 if(noReturn(r))return waiverApproved(r)?'':'An explicit manager-approved no-return exception is required.';
 const ret=db.returns.find(x=>x.requestId===r.id);
 if(!ret)return 'Register the RMA first so the return has an owner and a follow-up.';
 if(ret.dispatch)return 'This approved replacement has already been dispatched.';
 if(ret.hold)return 'This return scope is on hold.';
 if(replacementPath(r)===REPLACEMENT_PATHS[0]&&(returnOutstanding(ret)||!inspectionSatisfied(ret)))return 'Receive or obtain a manager waiver for every outstanding item, and record an acceptable inspection of actual receipts before dispatch.';
 return '';
}

export function recordShipment(db,r,u,{reference,proof,destination,at}){
 const allowed=u?.status==='Active'&&u.roles.some(id=>db.roles.find(x=>x.id===id)?.grants.includes('logistics'));
 if(!allowed)throw Error('Logistics permission is required to record dispatch.');
 const issue=dispatchIssue(db,r);if(issue)throw Error(issue);
 const ref=reference?.trim();if(!ref||!proof?.trim()||!destination)throw Error('Record the shipment reference, dispatch evidence and destination check.');
 const key=ref.toLowerCase();
 if(db.requests.some(x=>x.shipment?.reference.toLowerCase()===key)||db.returns.some(x=>x.dispatch?.trim().toLowerCase()===key))throw Error('This shipment reference is already recorded.');
 r.shipment={requestId:r.id,revision:r.revision,scope:scopeKey(r),reference:ref,proof:proof.trim(),lines:r.replacementLines.map(i=>({...i})),actorId:u.id,actor:u.name,at};
 const ret=db.returns.find(x=>x.requestId===r.id);
 if(ret)Object.assign(ret,{dispatch:ref,dispatchLines:r.shipment.lines.map(i=>({...i})),dispatchEvidence:proof,dispatchedAt:at});
 return r.shipment;
}

export function remedyIssue(db,r){
 if(!r||r.supersededBy||r.status!=='Approved'||!r.final)return 'Select the current approved request and revision.';
 const ret=db.returns.find(x=>x.requestId===r.id);
 if(r.kind==='Replacement'){
  if(r.approvedScope!==scopeKey(r))return 'The replacement scope changed after approval.';
  if(noReturn(r)&&!waiverApproved(r))return 'The no-return exception must be approved for this exact scope.';
  if(!noReturn(r)&&(!ret||ret.hold))return 'Register the required RMA and clear any scope hold first.';
  const s=r.shipment;
  if(!s||s.requestId!==r.id||s.revision!==r.revision||s.scope!==scopeKey(r))return 'Record the approved replacement dispatch before confirming delivery.';
 }else if(!ret||returnOutstanding(ret)||!inspectionSatisfied(ret))return 'Settle the return balance by receipt or manager waiver, and inspect actual receipts before confirming this remedy.';
 return '';
}

export function resolutionIssue(db,id,openTasks=[]){
 const financeIssue=refundResolutionIssue(db,id);if(financeIssue)return financeIssue;
 if(db.returns.some(x=>x.ticketId===id&&returnOutstanding(x)))return 'The return has outstanding quantities or a scope hold. Record the actual outcome first.';
 const waiverIssue=returnWaiverIssue(db,id);if(waiverIssue)return waiverIssue;
 const requests=currentRequests(db,id);
 for(const r of requests.filter(r=>r.kind==='Return'&&r.status==='Approved'&&scopeConfirmed(r))){const issue=refundRequirementIssue(db,r);if(issue)return issue;}
 for(const r of requests.filter(r=>r.kind==='Cancellation'&&r.status==='Approved')){const issue=cancellationResolutionIssue(db,r);if(issue)return issue;}
 if(requests.some(r=>!r.final))return 'A service request is still awaiting a decision or information.';
 if(requests.some(r=>['Replacement','Return'].includes(r.kind)&&r.status==='Approved'&&(!scopeConfirmed(r)||remedyIssue(db,r))))return 'Verify the remedy for each current approved request and revision.';
 if(openTasks.length)return 'Complete the outstanding follow-ups before resolving. Open Follow-ups to see the remaining actions.';
 return '';
}
