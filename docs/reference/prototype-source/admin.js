import {hasGrant,eligibleUser,taskOwnerEligible} from './workflow-access.js?v=20261030';
// Administration checks operate on proposed values before any account or role mutation.

export function assertUserAccessChange(db, current, proposed, roles = db.roles) {
 if (!current) return;
 const tasks = (db.tasks || []).filter(task => task.status === 'open' && task.ownerId === current.id);
 const tickets = db.tickets.filter(ticket => !['Resolved','Closed'].includes(ticket.status) && [ticket.owner,ticket.worker].includes(current.name));
 const losesWorkspace = current.status === 'Active' && proposed.status !== 'Active' || hasGrant(db,current,'read') && !hasGrant(db,proposed,'read',roles);
 const blockedTasks = tasks.filter(task => losesWorkspace || taskOwnerEligible(db,current,task) && !taskOwnerEligible(db,proposed,task,roles));
 const canWork = (user,ticket,definitions) => eligibleUser(db,user,'work',ticket,definitions);
 const blockedTickets = tickets.filter(ticket => losesWorkspace || canWork(current,ticket,db.roles) && !canWork(proposed,ticket,roles));
 if (blockedTasks.length || blockedTickets.length) {
  const references = [...blockedTasks.map(task => task.id),...blockedTickets.map(ticket => ticket.id)].slice(0,4).join(', ');
  throw Error('Hand over '+current.name+'’s open work before removing access ('+references+'). Keep the existing deadlines and history.');
 }
}

export function assertRoleAccessChange(db, current, proposed) {
 if (!current) return;
 const roles = db.roles.map(role => role.id === current.id ? proposed : role);
 for (const user of db.users.filter(user => user.roles.includes(current.id))) assertUserAccessChange(db,user,user,roles);
}

export function resetIdentity(db, request) {
 const email = String(request?.email || '').trim().toLowerCase();
 const matches = db.users.filter(user => String(user.email || '').trim().toLowerCase() === email);
 if (matches.length !== 1) return {eligible:false,state:matches.length ? 'Reviewed — ambiguous account' : 'Reviewed — no account',accountId:null,message:matches.length ? 'More than one staff account matches. Resolve the account identity before recording a verified reset.' : 'No matching staff account. Verify the requester before creating or changing an account.'};
 const account = matches[0];
 if (account.status !== 'Active') return {eligible:false,state:'Reviewed — account not active',accountId:account.id,message:'This staff account is '+account.status+'. Review its account state before recording a verified reset.'};
 return {eligible:true,state:'Verified — link not sent (demo)',accountId:account.id,message:'Matched active staff account: '+account.name+'. Record a verified reset only after checking the requester’s identity. No link is sent by this prototype.'};
}

export function recordResetReview(db, request, reviewer, at) {
 if (reviewer?.status !== 'Active' || !hasGrant(db,reviewer,'accounts')) throw Error('Account reset permission is required.');
 if (!request || !db.resets.includes(request)) throw Error('Reset request not found.');
 const identity = resetIdentity(db,request);
 if (request.status !== identity.state || (request.accountId || null) !== identity.accountId) {
  request.reviewHistory = [...(request.reviewHistory || []),{at,actorId:reviewer.id,previousStatus:request.status,status:identity.state,accountId:identity.accountId}];
 }
 request.status = identity.state;
 request.accountId = identity.accountId;
 return identity;
}

export const masterEditable = master => master !== 'Query Statuses';
export function assertMasterEditable(master) {
 if (!masterEditable(master)) throw Error('Ticket lifecycle states are fixed. They cannot be added, renamed or archived.');
}
