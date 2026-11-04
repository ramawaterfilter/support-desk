// Shared owner and lifecycle guards for the synthetic review session.
import {managerMayDecide} from './operations.js?v=20261030';

export const hasGrant=(db,u,grant,roles=db.roles)=>!!u?.roles?.some(id=>roles.find(r=>r.id===id)?.grants.includes(grant));
export const userInScope=(u,t)=>!!u&&(u.roles.some(r=>['super','head'].includes(r))||['All markets','All warehouses'].includes(u.scope)||!!t?.country&&u.scope===t.country);
export const eligibleUser=(db,u,grant,t,roles=db.roles)=>u?.status==='Active'&&hasGrant(db,u,'read',roles)&&hasGrant(db,u,grant,roles)&&(!t||userInScope(u,t));

export function taskOwnerEligible(db,u,task,roles=db.roles){
 if(!u||u.status!=='Active'||!hasGrant(db,u,'read',roles))return false;
 const ticket=db.tickets.find(t=>t.id===task.ticketId);
 const parcel=!ticket&&db.unmatched?.find(p=>p.id===task.sourceId);
 const scope=ticket||(parcel?{country:parcel.warehouse}:null);
 if(scope&&!userInScope(u,scope))return false;
 if(['request','waiver','refund'].includes(task.sourceType)&&task.step==='decision')return !!scope&&managerMayDecide(u,scope);
 if(task.step==='classification'||task.title==='Classify customer issue')return !!scope&&managerMayDecide(u,scope)&&hasGrant(db,u,'work',roles);
 if(task.sourceType==='waiver'&&task.step==='information')return hasGrant(db,u,'work',roles)||hasGrant(db,u,'logistics',roles);
 if(['customer-update','rejection','remedy','alternative'].includes(task.step)||task.sourceType==='refund'&&task.step==='information')return hasGrant(db,u,'work',roles);
 if(task.sourceType==='refund')return hasGrant(db,u,'finance',roles);
 if(task.sourceType==='dispute')return hasGrant(db,u,'dispute',roles);
 if(['return','parcel'].includes(task.sourceType)||task.step==='fulfil')return hasGrant(db,u,'logistics',roles);
 return hasGrant(db,u,'work',roles);
}

export const terminalTicket=t=>['Resolved','Closed'].includes(t.status);
export function assertActiveWork(t){
 if(terminalTicket(t))throw Error('Reopen this ticket using Change status before adding a follow-up or requesting a service action.');
}
export function validateTicketStatus(db,u,t,next,note){
 if(!eligibleUser(db,u,'work',t))throw Error('Ticket update permission within this country is required.');
 if(!['Open','In progress','Waiting for customer','Waiting for return','Waiting for finance','Resolved','Closed'].includes(next))throw Error('Choose a supported ticket status.');
 if(!note?.trim())throw Error('Record a reason for the status change.');
 if(terminalTicket(t)&&!['Resolved','Closed'].includes(next)&&!hasGrant(db,u,'assign'))throw Error('Assign and reopen tickets permission is required to reopen this ticket.');
 if(t.status==='Closed'&&next==='Resolved')throw Error('Reopen the ticket before recording a new resolution.');
 if(['Resolved','Closed'].includes(next)&&(t.categoryId==='CAT-15'||t.category==='Needs classification'))throw Error('Ask an authorised manager to classify the customer issue before resolving or closing.');
}
export function reopenTicket(t){
 if(!terminalTicket(t))return false;
 if(t.resolvedAt)t.previousResolutions=[...(t.previousResolutions||[]),t.resolvedAt];
 t.resolvedAt=null;
 return true;
}
