import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const categories = [
  'Requirements engineering', 'Architecture', 'Modularity', 'Scalability',
  'AI agent governance', 'Application security', 'Data privacy', 'Database integrity',
  'Testing', 'Code quality', 'Dependencies', 'Supply-chain security', 'CI/CD',
  'Infrastructure', 'Containers', 'Observability', 'Reliability', 'Performance',
  'Backup and recovery', 'Change management', 'API governance', 'External integrations',
  'Frontend security', 'AI application security', 'Compliance applicability',
  'Documentation', 'Quality gates', 'Failure handling', 'Cost management',
  'Operational readiness',
];
const states = new Set(['DOCUMENTED', 'CONFIGURED', 'ENFORCED', 'VERIFIED', 'NOT APPLICABLE', 'NOT IMPLEMENTED', 'BLOCKED']);
const ownerStates = new Set(['ASSIGNED', 'PENDING OWNER ASSIGNMENT']);
const gateStates = new Set(['NONE', 'BLOCKED']);
const requirementStates = new Set(['DESIGNED', 'IMPLEMENTED', 'VERIFIED', 'RELEASED', 'PENDING DECISION']);
const priorities = new Set(['MUST', 'SHOULD', 'COULD']);
// Governance records may not stand as evidence that a control is enforced: they are the thing being asserted.
const governanceRecords = new Set([
  'docs/governance/controls.json', 'docs/governance/requirements.json', 'docs/governance/failures.json',
  'docs/governance/files.json', 'docs/governance/foundation.json', 'docs/governance/verification.json',
  'docs/governance/category-review.md', 'docs/governance/ownership.json', 'docs/governance/authorizations.json',
]);
export const foundationCommands = ['node --test scripts/governance/check-foundation.test.mjs', 'node scripts/governance/check-foundation.mjs'];
// Approved failure catalogue from the governance master prompt, section 29.
export const failureCatalogue = [
  'Invalid requests', 'Missing data', 'Duplicate events', 'Concurrent writes', 'Partial transactions',
  'Database outages', 'External API outages', 'Authentication provider failures', 'Queue backlogs',
  'Rate-limit exhaustion', 'Expired credentials', 'Disk exhaustion', 'Memory pressure', 'Configuration errors',
  'Deployment failures', 'Incompatible schema changes', 'Corrupted data', 'Interrupted background jobs',
  'Clock skew', 'Time-zone errors', 'Partial restores', 'Permission misconfiguration',
];
export const requiredOwnerRoles = ['product', 'technical', 'domain', 'security-data', 'operations'];
const authorizationSources = new Set(['SIGNED_CHANGE', 'APPROVED_TICKET', 'EMAIL_CONFIRMATION', 'OTHER_DOCUMENTED']);
const executionOutcomes = new Set(['NOT_EXECUTED', 'EXECUTED', 'PARTIALLY_EXECUTED', 'FAILED', 'ROLLED_BACK']);
const agentIdentity = /(?:\bai\b|agent|assistant|chatgpt|claude|codex|copilot|bot\b|\bllm\b|self-review|self approved)/i;
const secretRules = [
  ['private-key-material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['github-token-like', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['aws-access-key-like', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
];

function meaningful(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertSafeRelative(relative) {
  if (!meaningful(relative) || relative.includes('\\') || relative.includes('\0') ||
      relative.startsWith('/') || /^[A-Za-z]:/.test(relative) ||
      relative.split('/').some(segment => ['', '.', '..'].includes(segment))) {
    throw new Error('Unsafe workspace-relative path');
  }
  return relative;
}

export async function readWorkspaceFile(root, relative, maxBytes = 250_000) {
  assertSafeRelative(relative);
  let current = path.resolve(root);
  for (const [index, segment] of relative.split('/').entries()) {
    current = path.join(current, segment);
    const entry = await lstat(current);
    if (entry.isSymbolicLink()) throw new Error('Symlink traversal rejected');
    if (index < relative.split('/').length - 1 && !entry.isDirectory()) {
      throw new Error('Non-directory path component');
    }
    if (index === relative.split('/').length - 1 && !entry.isFile()) {
      throw new Error('Expected regular file');
    }
  }
  const metadata = await lstat(current);
  if (metadata.size > maxBytes) throw new Error('File exceeds validation byte budget');
  const bytes = await readFile(current);
  if (bytes.length > maxBytes) throw new Error('File exceeds validation byte budget');
  return bytes;
}

function workspaceRelative(root, absolute) {
  const relative = path.relative(path.resolve(root), absolute).split(path.sep).join('/');
  return assertSafeRelative(relative);
}

export function findSecretSignals(text) {
  return secretRules.filter(([, expression]) => expression.test(text)).map(([name]) => name);
}

export async function checkMarkdownLinks(root, relative, text) {
  const errors = [];
  const withoutFences = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  for (const match of withoutFences.matchAll(/\]\((<[^>]+>|[^)\n]+)\)/g)) {
    let target = match[1].replace(/^<|>$/g, '').trim();
    if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
    target = target.split('#')[0];
    try {
      const decoded = decodeURIComponent(target);
      if (!decoded || decoded.includes('\\') || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(decoded)) {
        throw new Error('Unsupported link target');
      }
      const linked = workspaceRelative(root, path.resolve(root, path.dirname(relative), decoded));
      let cursor = path.resolve(root);
      for (const component of linked.split('/')) {
        cursor = path.join(cursor, component);
        const metadata = await lstat(cursor);
        if (metadata.isSymbolicLink()) throw new Error('Symlink link target rejected');
      }
    } catch {
      errors.push(`${relative}: invalid/missing local link target`);
    }
  }
  return errors;
}

export function findUnreferencedDocuments(texts) {
  const documents = [...texts.keys()].filter(item => item.endsWith('.md'));
  const referenced = new Set();
  for (const [source, text] of texts) {
    if (!source.endsWith('.md')) continue;
    const withoutFences = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
    for (const match of withoutFences.matchAll(/\]\((<[^>]+>|[^)\n]+)\)/g)) {
      let target = match[1].replace(/^<|>$/g, '').trim();
      if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
      target = target.split('#')[0];
      if (!target) continue;
      let resolved;
      try { resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), decodeURIComponent(target))); }
      catch { continue; }
      if (resolved !== source) referenced.add(resolved);
    }
  }
  return documents.filter(item => !referenced.has(item));
}

export function renderCategoryReview(controls, record) {
  const lines = [
    '# Thirty-category governance assessment',
    '',
    'Generated from [controls.json](controls.json) by `scripts/governance/render-category-review.mjs`; edit the register and regenerate rather than maintaining competing policies. All runtime mechanisms remain pending unless exact local evidence is stated.',
    '',
  ];
  for (const control of controls) {
    const policy = control.policy.replace('docs/governance/', '');
    lines.push(`## ${control.id} ${control.category}`, '');
    lines.push(`- Applicability: ${control.applicability}. ${control.applicabilityReason}`);
    lines.push(`- Required policy/artifact: [${policy}](${policy}). ${control.artifact}`);
    lines.push(`- Existing state: ${control.existingState}`);
    lines.push(`- Work completed: ${control.workCompleted}`);
    lines.push(`- Policy state: ${control.policyState}; automated control state: ${control.automation.status}. ${control.automation.mechanism}`);
    lines.push(`- Verification: ${verificationSentence(control, record)}`);
    lines.push(`- Remaining gaps: ${control.remainingGaps}`);
    lines.push(`- Risks/approval: ${control.riskOrApproval}`);
    lines.push(`- Accountable owner: ${control.accountableOwner} (${control.ownerAssignment})`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function verificationSentence(control, record) {
  const method = control.automation.verificationMethod;
  const claim = (record?.verifiedControls ?? []).find(item => item?.id === control.id);
  if (claim) return `${claim.command} executed ${claim.executedAtUtc}, exit ${claim.exitCode}; record: ${claim.record}.`;
  if (control.automation.status === 'CONFIGURED' && record?.executedAtUtc) {
    return `${method} — configuration-shape checks executed ${record.executedAtUtc}, exit 0; record: docs/governance/verification.json. Category-specific runtime enforcement remains NOT IMPLEMENTED.`;
  }
  return `${method} Evidence list: no category-specific runtime verification recorded; see bounded local verification record`;
}

export function validateVerificationRecord(record, live) {
  const errors = [];
  if (!record || typeof record !== 'object') return ['Verification record missing or malformed'];
  for (const key of ['status', 'scope', 'executedAtUtc', 'runtime']) {
    if (!meaningful(record[key])) errors.push(`Verification record: missing ${key}`);
  }
  if (!Array.isArray(record.commands) || !record.commands.length) errors.push('Verification record: no commands recorded');
  else {
    for (const entry of record.commands) {
      if (!entry || typeof entry !== 'object' || !meaningful(entry.command)) { errors.push('Verification record: malformed command entry'); continue; }
      if (!Number.isInteger(entry.exitCode)) errors.push(`Verification record: ${entry.command} has no integer exit code`);
      if (!Number.isFinite(entry.wallTimeSeconds)) errors.push(`Verification record: ${entry.command} has no wall time`);
      if (!meaningful(entry.output)) errors.push(`Verification record: ${entry.command} has no captured output`);
    }
    for (const command of foundationCommands) {
      const entry = record.commands.find(item => item?.command === command);
      if (!entry) errors.push(`Verification record: ${command} was not recorded`);
      else if (entry.exitCode !== 0) errors.push(`Verification record: ${command} recorded a failing exit code`);
    }
    const checker = record.commands.find(item => item?.command === 'node scripts/governance/check-foundation.mjs');
    if (checker?.output) {
      if (!checker.output.includes('PASS bounded governance foundation checks')) errors.push('Verification record: checker output does not show a passing result');
      const totals = /CHECK Managed manifest: (\d+) paths; (\d+) bytes/.exec(checker.output);
      if (!totals) errors.push('Verification record: checker output has no manifest totals');
      else if (live && (totals[1] !== String(live.managedPaths) || totals[2] !== String(live.managedBytes))) {
        errors.push(`Verification record: recorded manifest totals ${totals[1]} paths/${totals[2]} bytes differ from the workspace ${live.managedPaths}/${live.managedBytes}`);
      }
    }
    const tests = record.commands.find(item => item?.command === 'node --test scripts/governance/check-foundation.test.mjs');
    if (tests?.output) {
      const passed = /^.*pass (\d+)$/m.exec(tests.output)?.[1];
      const failed = /^.*fail (\d+)$/m.exec(tests.output)?.[1];
      const skipped = /^.*skipped (\d+)$/m.exec(tests.output)?.[1];
      if (!passed) errors.push('Verification record: test output has no pass count');
      else if (record.counts?.validatorTestsPassed !== Number(passed)) errors.push('Verification record: validatorTestsPassed disagrees with the recorded test output');
      if (record.counts?.failed !== Number(failed ?? 0)) errors.push('Verification record: failed count disagrees with the recorded test output');
      if (record.counts?.skipped !== Number(skipped ?? 0)) errors.push('Verification record: skipped count disagrees with the recorded test output');
    }
  }
  const counts = record.counts;
  if (!counts || typeof counts !== 'object') errors.push('Verification record: missing counts');
  else if (live) {
    const expected = {
      governanceCategories: live.controls, seedRequirements: live.requirements, failureScenarios: live.failures,
      managedPaths: live.managedPaths, protectedReferencesUnchanged: live.protected,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (counts[key] !== value) errors.push(`Verification record: ${key} is ${counts[key]} but the live workspace has ${value}`);
    }
  }
  if (!Array.isArray(record.verifiedControls)) errors.push('Verification record: verifiedControls must be a list');
  else {
    for (const entry of record.verifiedControls) {
      if (!entry || typeof entry !== 'object') { errors.push('Verification record: malformed verifiedControls entry'); continue; }
      for (const key of ['id', 'command', 'record', 'executedAtUtc', 'exitCode']) {
        if (entry[key] === undefined || entry[key] === null || entry[key] === '') errors.push(`Verification record: verified control missing ${key}`);
      }
      if (entry.command && !record.commands.some(item => item?.command === entry.command)) errors.push(`Verification record: ${entry.id} cites an unrecorded command`);
      if (entry.command && entry.exitCode !== 0) errors.push(`Verification record: ${entry.id} cites a non-zero exit code`);
      if (entry.executedAtUtc !== record.executedAtUtc) errors.push(`Verification record: ${entry.id} timestamp disagrees with the recorded run`);
      if (!Array.isArray(entry.evidence) || !entry.evidence.length) errors.push(`Verification record: ${entry.id} has no evidence`);
      else for (const item of entry.evidence) if (governanceRecords.has(item)) errors.push(`Verification record: ${entry.id} cites a governance record as evidence`);
      if (!Array.isArray(entry.expectedOutputMarkers) || !entry.expectedOutputMarkers.length) errors.push(`Verification record: ${entry.id} has no output markers`);
      else {
        const output = record.commands.find(item => item?.command === entry.command)?.output ?? '';
        for (const marker of entry.expectedOutputMarkers) if (!output.includes(marker)) errors.push(`Verification record: ${entry.id} marker is absent from the recorded output`);
      }
    }
  }
  return errors;
}

export function validateVerificationClaims(controls, record, config) {
  const errors = [];
  const claims = new Map((record?.verifiedControls ?? []).map(entry => [entry?.id, entry]));
  const allowlist = config?.verification?.foundationVerifiableControls ?? [];
  for (const control of controls) {
    const claimed = control.policyState === 'VERIFIED' || control.policyState === 'ENFORCED' ||
      control.automation.status === 'VERIFIED' || control.automation.status === 'ENFORCED';
    const entry = claims.get(control.id);
    if (!claimed) {
      if (entry) errors.push(`${control.id}: verification record claims this control but the register does not`);
      continue;
    }
    if (!control.verification) { errors.push(`${control.id}: VERIFIED requires a structured verification block`); continue; }
    for (const key of ['command', 'record']) {
      if (!meaningful(control.verification[key])) errors.push(`${control.id}: verification block missing ${key}`);
    }
    if (!Number.isInteger(control.verification.exitCode)) errors.push(`${control.id}: verification block missing exit code`);
    if (!Array.isArray(control.verification.evidence) || !control.verification.evidence.length) errors.push(`${control.id}: verification block has no evidence`);
    else for (const item of control.verification.evidence) if (governanceRecords.has(item)) errors.push(`${control.id}: verification evidence must not be a governance record`);
    if (!Array.isArray(control.verification.expectedOutputMarkers) || !control.verification.expectedOutputMarkers.length) errors.push(`${control.id}: verification block has no output markers`);
    if (!entry) { errors.push(`${control.id}: VERIFIED requires a matching verifiedControls entry in the execution record`); continue; }
    if (entry.command !== control.verification.command) errors.push(`${control.id}: verification command disagrees with the execution record`);
    if (entry.record !== control.verification.record) errors.push(`${control.id}: verification record path disagrees with the execution record`);
    if (entry.exitCode !== control.verification.exitCode) errors.push(`${control.id}: verification exit code disagrees with the execution record`);
    if (JSON.stringify(entry.evidence) !== JSON.stringify(control.verification.evidence)) errors.push(`${control.id}: verification evidence disagrees with the execution record`);
    if (JSON.stringify(entry.expectedOutputMarkers) !== JSON.stringify(control.verification.expectedOutputMarkers)) errors.push(`${control.id}: verification markers disagree with the execution record`);
    if (config?.projectPhase === 'foundation' && !allowlist.includes(control.id)) {
      errors.push(`${control.id}: VERIFIED is not permitted in the foundation phase; add it to foundation.json verification.foundationVerifiableControls only when its check actually executes`);
    }
    const command = record?.commands?.find(item => item?.command === control.verification.command);
    if (!command) errors.push(`${control.id}: verification command was not executed in the recorded run`);
    else for (const marker of control.verification.expectedOutputMarkers ?? []) {
      if (!command.output.includes(marker)) errors.push(`${control.id}: recorded output does not contain the claimed evidence marker`);
    }
  }
  return errors;
}

export function validateOwnership(ownership, controls) {
  const errors = [];
  if (!ownership || typeof ownership !== 'object') return ['Ownership register missing or malformed'];
  if (!Array.isArray(ownership.roles) || !ownership.roles.length) return ['Ownership register has no roles'];
  const ids = new Set();
  for (const role of ownership.roles) {
    if (!role || typeof role !== 'object') { errors.push('Ownership register: malformed role'); continue; }
    if (!role.id || ids.has(role.id)) errors.push(`Ownership register: duplicate or missing role id ${role.id ?? ''}`);
    ids.add(role.id);
    for (const key of ['role', 'responsibilities']) if (!meaningful(role[key])) errors.push(`Ownership register: ${role.id ?? 'role'} missing ${key}`);
    if (!ownerStates.has(role.status)) errors.push(`Ownership register: ${role.id} has invalid status`);
    if (role.status === 'PENDING OWNER ASSIGNMENT') {
      for (const key of ['assignedTo', 'backup', 'timezone', 'contact']) {
        if (meaningful(role[key])) errors.push(`Ownership register: ${role.id} is pending assignment but names a ${key}`);
      }
    }
    if (!Array.isArray(role.blocks)) errors.push(`Ownership register: ${role.id} has no blocks list`);
  }
  for (const required of requiredOwnerRoles) if (!ids.has(required)) errors.push(`Ownership register: missing required role ${required}`);
  const pending = ownership.roles.filter(role => role?.status === 'PENDING OWNER ASSIGNMENT').length;
  const expectedStatus = pending ? 'BLOCKED' : 'ASSIGNED';
  if (ownership.status !== expectedStatus) errors.push(`Ownership register: status is ${ownership.status} but ${pending} role(s) are pending assignment`);
  const controlStatesSeen = new Set((controls?.controls ?? []).map(control => control.ownerAssignment));
  for (const state of controlStatesSeen) {
    if (!ownerStates.has(state)) errors.push(`Ownership register: control ownerAssignment "${state}" is invalid`);
    else if (state === 'ASSIGNED' && pending) errors.push('Ownership register: controls claim an assigned owner while roles are pending assignment');
    else if (state === 'PENDING OWNER ASSIGNMENT' && !pending) errors.push('Ownership register: controls claim a pending owner while all roles are assigned');
  }
  if (controls?.ownershipStatus !== expectedStatus) errors.push(`Ownership register: control register ownershipStatus is ${controls?.ownershipStatus} but ${pending} role(s) are pending assignment`);
  return errors;
}

export function validateAuthorizations(register) {
  const errors = [];
  if (!register || typeof register !== 'object') return ['Authorization register missing or malformed'];
  if (!Array.isArray(register.records)) return ['Authorization register has no records list'];
  for (const record of register.records) {
    if (!record || typeof record !== 'object') { errors.push('Authorization register: malformed record'); continue; }
    for (const key of ['operation', 'requestingIdentity', 'approvingIdentity', 'approverRole', 'approvedScope', 'environment', 'evidence', 'executionOutcome', 'authorizationSource', 'recordedAtUtc']) {
      if (!meaningful(record[key])) errors.push(`Authorization register: record missing ${key}`);
    }
    if (!authorizationSources.has(record.authorizationSource)) errors.push(`Authorization register: ${record.operation} has invalid authorizationSource; chat or agent instruction is not independent human authorization`);
    if (meaningful(record.approvingIdentity) && agentIdentity.test(record.approvingIdentity)) errors.push(`Authorization register: ${record.operation} names an agent/AI as the approver`);
    if (meaningful(record.requestingIdentity) && agentIdentity.test(record.requestingIdentity)) errors.push(`Authorization register: ${record.operation} names an agent/AI as the requester`);
    if (!executionOutcomes.has(record.executionOutcome)) errors.push(`Authorization register: ${record.operation} has invalid executionOutcome`);
    if (!meaningful(record.expiry) && record.permanent !== true) errors.push(`Authorization register: ${record.operation} has no expiry and is not marked permanent`);
    if (record.expiry && !Number.isFinite(Date.parse(record.expiry))) errors.push(`Authorization register: ${record.operation} expiry is not a valid date`);
  }
  return errors;
}

export function validateCatalogueMapping(failures) {
  const errors = [];
  const ids = new Set((failures?.scenarios ?? []).map(row => row?.id));
  if (!Array.isArray(failures?.catalogue)) return ['Failure register has no catalogue mapping'];
  const mapped = new Map();
  for (const entry of failures.catalogue) {
    if (!entry || typeof entry !== 'object' || !meaningful(entry.scenario)) { errors.push('Failure catalogue: malformed entry'); continue; }
    if (!Array.isArray(entry.ids) || !entry.ids.length) errors.push(`Failure catalogue: ${entry.scenario} maps to no register entry`);
    else for (const id of entry.ids) {
      if (!ids.has(id)) { errors.push(`Failure catalogue: ${entry.scenario} maps to unknown scenario ${id}`); continue; }
      if (!mapped.has(entry.scenario)) mapped.set(entry.scenario, []);
      mapped.get(entry.scenario).push(id);
    }
  }
  for (const scenario of failureCatalogue) if (!mapped.has(scenario)) errors.push(`Failure catalogue: approved scenario "${scenario}" is not mapped to any register entry`);
  return errors;
}

export function parseGitAttributes(text) {
  const rules = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    // A pattern may be quoted when it contains spaces (e.g. the master prompt).
    let pattern;
    let rest;
    if (line.startsWith('"')) {
      const end = line.indexOf('"', 1);
      if (end === -1) continue;
      pattern = line.slice(1, end);
      rest = line.slice(end + 1);
    } else {
      const space = line.search(/\s/);
      pattern = space === -1 ? line : line.slice(0, space);
      rest = space === -1 ? '' : line.slice(space);
    }
    rules.push({ pattern, attributes: rest.trim().split(/\s+/).filter(Boolean) });
  }
  return rules;
}

export function attributeCovers(relative, rules) {
  for (const rule of rules) {
    if (rule.pattern === relative) return rule.attributes;
    if (rule.pattern.endsWith('/**') && relative.startsWith(rule.pattern.slice(0, -2))) return rule.attributes;
    if (rule.pattern.startsWith('*.') && relative.endsWith(rule.pattern.slice(1))) return rule.attributes;
  }
  return null;
}

export function checkAttributeCoverage(protectedFiles, rules) {
  const errors = [];
  for (const relative of Object.keys(protectedFiles ?? {})) {
    const attributes = attributeCovers(relative, rules);
    if (!attributes) { errors.push(`Byte preservation: ${relative} has no .gitattributes rule`); continue; }
    if (!attributes.includes('-text') && !attributes.includes('binary')) errors.push(`Byte preservation: ${relative} is not marked -text/binary`);
  }
  return errors;
}

export function validateReviewGatedPaths(config, managed) {
  const errors = [];
  const gated = config?.reviewGatedPaths;
  if (!Array.isArray(gated) || !gated.length) return ['Foundation configuration lists no review-gated paths'];
  const critical = [
    'scripts/governance/check-foundation.mjs', 'scripts/governance/check-foundation.test.mjs',
    'docs/governance/foundation.json', 'docs/governance/files.json', 'docs/governance/controls.json',
    'docs/governance/requirements.json', 'docs/governance/failures.json', 'docs/governance/verification.json',
    'docs/governance/ownership.json', 'docs/governance/authorizations.json', 'AGENTS.md',
  ];
  for (const relative of critical) if (!gated.includes(relative)) errors.push(`Review-gated paths: ${relative} is not listed`);
  for (const relative of gated) if (!managed.includes(relative)) errors.push(`Review-gated paths: ${relative} is not a managed file`);
  return errors;
}

export function validateInstructionIntegrity(texts, config) {
  const errors = [];
  const digests = config?.instructionDigests;
  if (!digests || typeof digests !== 'object' || !Object.keys(digests).length) return ['Foundation configuration pins no instruction digests'];
  for (const [relative, expected] of Object.entries(digests)) {
    const text = texts.get(relative);
    if (text === undefined) { errors.push(`Instruction integrity: ${relative} is not a managed file`); continue; }
    const actual = createHash('sha256').update(text, 'utf8').digest('hex');
    if (actual !== expected) errors.push(`Instruction integrity: ${relative} changed since it was pinned; re-pin deliberately after review`);
  }
  for (const [relative, phrases] of Object.entries(config?.forbiddenInstructionPhrases ?? {})) {
    const text = texts.get(relative) ?? '';
    for (const phrase of phrases) if (text.includes(phrase)) errors.push(`Instruction integrity: ${relative} contains a forbidden weakened rule`);
  }
  return errors;
}

export function validateControls(data) {
  const errors = [];
  const rows = data?.controls;
  if (!Array.isArray(rows) || rows.length !== 30) return ['Control register must contain all 30 categories'];
  const seen = new Set();
  rows.forEach((row, index) => {
    const id = `GOV-${String(index + 1).padStart(2, '0')}`;
    if (!row || typeof row !== 'object') { errors.push(`${id}: invalid control record`); return; }
    if (row.id !== id || row.category !== categories[index] || seen.has(row.id)) errors.push(`Invalid control identity/order at ${id}`);
    seen.add(row.id);
    for (const key of ['applicabilityReason', 'policy', 'artifact', 'existingState', 'workCompleted', 'remainingGaps', 'riskOrApproval', 'accountableOwner']) {
      if (!meaningful(row[key])) errors.push(`${id}: missing ${key}`);
    }
    if (!ownerStates.has(row.ownerAssignment)) errors.push(`${id}: ownerAssignment must be ASSIGNED or PENDING OWNER ASSIGNMENT`);
    if (!gateStates.has(row.gateStatus)) errors.push(`${id}: gateStatus must be NONE or BLOCKED`);
    if (row.gateStatus === 'BLOCKED' && !meaningful(row.gateReason)) errors.push(`${id}: blocked gate needs a reason`);
    if (!['APPLICABLE', 'NOT APPLICABLE'].includes(row.applicability) || !states.has(row.policyState)) errors.push(`${id}: invalid applicability/state`);
    if (row.applicability === 'NOT APPLICABLE' && row.applicabilityReason.length < 30) errors.push(`${id}: N/A needs a concrete reason`);
    const automation = row.automation;
    if (!automation || !states.has(automation.status)) errors.push(`${id}: invalid automation state`);
    for (const key of ['mechanism', 'trigger', 'failureCondition', 'response', 'limitations', 'verificationMethod']) {
      if (!meaningful(automation?.[key])) errors.push(`${id}: automation missing ${key}`);
    }
    if (!Array.isArray(automation?.configuration) || !Array.isArray(row.verificationEvidence)) errors.push(`${id}: invalid evidence/config list`);
    if ((row.policyState === 'VERIFIED' || automation?.status === 'VERIFIED') && !row.verificationEvidence?.length) errors.push(`${id}: VERIFIED requires explicit execution evidence`);
    if (row.policyState === 'VERIFIED' || row.policyState === 'ENFORCED' || automation?.status === 'VERIFIED' || automation?.status === 'ENFORCED') {
      if (!row.verification || typeof row.verification !== 'object') errors.push(`${id}: VERIFIED requires a structured verification block`);
    }
  });
  return errors;
}

export function validateRequirements(data, failures) {
  const errors = [];
  if (!Array.isArray(data?.requirements) || !data.requirements.length) return ['Requirement register is empty'];
  const ids = new Set();
  for (const row of data.requirements) {
    if (!row || typeof row !== 'object') { errors.push('Invalid requirement record'); continue; }
    if (!/^REQ-\d{3}$/.test(row.id) || ids.has(row.id)) errors.push('Invalid/duplicate requirement ID');
    ids.add(row.id);
    for (const key of ['title', 'description', 'businessJustification', 'priority', 'source', 'designSection', 'securityPrivacy', 'verificationMethod']) {
      if (!meaningful(row[key])) errors.push(`${row.id}: missing ${key}`);
    }
    if (!priorities.has(row.priority)) errors.push(`${row.id}: priority must be MUST, SHOULD or COULD`);
    for (const key of ['dependencies', 'modules', 'design', 'acceptanceCriteria', 'implementation', 'executedTests', 'releaseEvidence']) {
      if (!Array.isArray(row[key])) errors.push(`${row.id}: invalid ${key} list`);
    }
    if (!Array.isArray(row.failureScenarios)) errors.push(`${row.id}: invalid failureScenarios list`);
    if (!Array.isArray(row.acceptanceCriteria) || !row.acceptanceCriteria.length || row.acceptanceCriteria.some(item => !meaningful(item))) errors.push(`${row.id}: missing acceptance`);
    else if (row.acceptanceCriteria.length < 2) errors.push(`${row.id}: needs at least two observable acceptance criteria`);
    if (!row.design?.length || !row.modules?.length) errors.push(`${row.id}: missing design/modules`);
    if (!requirementStates.has(row.status)) errors.push(`${row.id}: invalid status`);
    if (['IMPLEMENTED', 'VERIFIED', 'RELEASED'].includes(row.status) && !row.implementation?.length) errors.push(`${row.id}: implementation claim lacks evidence`);
    if (['VERIFIED', 'RELEASED'].includes(row.status) && !row.executedTests?.length) errors.push(`${row.id}: verification claim lacks execution`);
    if (row.status === 'RELEASED' && !row.releaseEvidence?.length) errors.push(`${row.id}: release claim lacks evidence`);
    if (row.status === 'PENDING DECISION') {
      if (!meaningful(row.decisionRef)) errors.push(`${row.id}: PENDING DECISION requires a decision reference`);
      if (row.implementation?.length || row.executedTests?.length || row.releaseEvidence?.length) errors.push(`${row.id}: PENDING DECISION must not claim implementation or evidence`);
    }
  }
  const byId = new Map(data.requirements.filter(row => row && typeof row === 'object').map(row => [row.id, row]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`${id}: cyclic requirement dependency`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of Array.isArray(byId.get(id)?.dependencies) ? byId.get(id).dependencies : []) {
      if (!ids.has(dependency)) errors.push(`${id}: unknown dependency`);
      else visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);
  if (failures) {
    const failureIds = new Set((failures.scenarios ?? []).map(row => row?.id));
    const referenced = new Set();
    for (const row of data.requirements) {
      for (const id of row?.failureScenarios ?? []) {
        if (!failureIds.has(id)) errors.push(`${row.id}: unknown failure scenario ${id}`);
        else referenced.add(id);
      }
    }
    for (const id of failureIds) if (!referenced.has(id)) errors.push(`${id}: failure scenario is not linked to any requirement`);
  }
  return errors;
}

export function validateFailures(data) {
  const errors = [];
  if (!Array.isArray(data?.scenarios) || !data.scenarios.length) return ['Failure register is empty'];
  const ids = new Set();
  for (const row of data.scenarios) {
    if (!row || typeof row !== 'object') { errors.push('Invalid failure record'); continue; }
    if (!/^FAIL-\d{2}$/.test(row.id) || ids.has(row.id)) errors.push('Invalid/duplicate failure ID');
    ids.add(row.id);
    for (const key of ['failureCondition', 'impact', 'detection', 'prevention', 'recovery', 'plannedTestCoverage', 'residualRisk', 'owner', 'status']) {
      if (!meaningful(row[key])) errors.push(`${row.id}: missing ${key}`);
    }
    if (!Array.isArray(row.verificationEvidence)) errors.push(`${row.id}: invalid evidence list`);
    if (row.status === 'VERIFIED' && !row.verificationEvidence?.length) errors.push(`${row.id}: VERIFIED without execution evidence`);
  }
  return errors;
}

export function checkWorkflow(text, config) {
  const errors = [];
  if (!/permissions:\s*\n\s+contents: read/.test(text) || /(?:contents|id-token|actions|pull-requests):\s*write/.test(text)) errors.push('CI permissions must be read-only');
  if (!/persist-credentials: false/.test(text) || !/timeout-minutes: 5/.test(text)) errors.push('CI checkout/timeout guard missing');
  if (/pull_request_target|secrets\.|npm\s+(?:install|ci)|continue-on-error:\s*true/.test(text)) errors.push('Unsafe/unapproved foundation CI behavior');
  const actions = [...text.matchAll(/uses:\s*([^\s#]+)/g)].map(match => match[1]);
  if (actions.length !== 2 || !actions.every(action => /@[a-f0-9]{40}$/.test(action))) errors.push('CI actions must be two reviewed full-SHA references');
  if (!text.includes(`actions/checkout@${config.checkoutSha}`) || !text.includes(`actions/setup-node@${config.setupNodeSha}`)) errors.push('CI action refs differ from reviewed configuration');
  for (const command of ['node --test scripts/governance/check-foundation.test.mjs', 'node scripts/governance/check-foundation.mjs']) {
    if (!text.includes(`run: ${command}`)) errors.push('CI must execute the real foundation commands');
  }
  return errors;
}

export async function findApplicationFiles(root, roots) {
  const found = [];
  async function walk(relative) {
    assertSafeRelative(relative);
    let metadata;
    try { metadata = await lstat(path.join(root, relative)); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (metadata.isSymbolicLink()) throw new Error('Symlink application root rejected');
    if (metadata.isFile()) { found.push(relative); return; }
    for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
      await walk(`${relative}/${entry.name}`);
    }
  }
  for (const relative of roots) await walk(relative);
  return found;
}

export async function checkFoundation(root, options = {}) {
  const errors = [];
  const checks = [];
  const add = values => errors.push(...values);
  let config;
  const texts = new Map();
  try {
    config = JSON.parse((await readWorkspaceFile(root, 'docs/governance/foundation.json')).toString('utf8'));
    if (config.schemaVersion !== 1 || config.projectPhase !== 'foundation') throw new Error('Unsupported phase; reviewed application-gate activation required');
    if (!Number.isSafeInteger(config.maxManagedFileBytes) || config.maxManagedFileBytes < 1 || config.maxManagedFileBytes > 1_000_000) throw new Error('Invalid managed file budget');
    if (!Number.isSafeInteger(config.maxManagedTotalBytes) || config.maxManagedTotalBytes < 1 || config.maxManagedTotalBytes > 10_000_000) throw new Error('Invalid total budget');
    const manifest = JSON.parse((await readWorkspaceFile(root, config.manifest)).toString('utf8'));
    if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Empty foundation manifest');
    const seen = new Set();
    let total = 0;
    for (const item of manifest.files) {
      try {
        if (seen.has(item.path) || !meaningful(item.purpose) || !['CREATED', 'UPDATED'].includes(item.change)) throw new Error('Invalid manifest entry');
        seen.add(item.path);
        const bytes = await readWorkspaceFile(root, item.path, config.maxManagedFileBytes);
        // The execution record and its generated review embed the manifest byte total,
        // so including them would make the total self-referential and unstable.
        if (item.path !== config.verification.record && item.path !== 'docs/governance/category-review.md') total += bytes.length;
        if (total > config.maxManagedTotalBytes) throw new Error('Total managed byte budget exceeded');
        const text = bytes.toString('utf8');
        texts.set(item.path, text);
        for (const rule of findSecretSignals(text)) errors.push(`${item.path}: ${rule}; content withheld`);
        if (item.path.endsWith('.md')) add(await checkMarkdownLinks(root, item.path, text));
      } catch (error) { errors.push(`${item.path ?? 'manifest'}: ${error.code === 'ENOENT' ? 'required file missing' : error.message}`); }
    }
    for (const required of ['AGENTS.md', 'README.md', '.editorconfig', '.gitignore', '.gitattributes', config.manifest, 'docs/governance/handoff.md', 'docs/governance/verification.json', 'scripts/governance/check-foundation.mjs', 'scripts/governance/check-foundation.test.mjs', config.ci.workflow, ...config.registers]) {
      if (!seen.has(required)) errors.push(`Required artifact absent from manifest: ${required}`);
    }
    checks.push(`Managed manifest: ${seen.size} paths; ${total} bytes`);
    for (const orphan of findUnreferencedDocuments(texts)) errors.push(`${orphan}: managed document is not referenced by another managed document`);
    checks.push('Managed documents are referenced from other managed documents');
    const controls = JSON.parse(texts.get('docs/governance/controls.json'));
    const requirements = JSON.parse(texts.get('docs/governance/requirements.json'));
    const failures = JSON.parse(texts.get('docs/governance/failures.json'));
    const ownership = JSON.parse(texts.get('docs/governance/ownership.json'));
    const authorizations = JSON.parse(texts.get('docs/governance/authorizations.json'));
    const verification = JSON.parse(texts.get('docs/governance/verification.json'));
    add(validateControls(controls)); add(validateRequirements(requirements, failures)); add(validateFailures(failures));
    add(validateCatalogueMapping(failures)); add(validateOwnership(ownership, controls)); add(validateAuthorizations(authorizations));
    add(validateReviewGatedPaths(config, [...seen]));
    add(validateInstructionIntegrity(texts, config));
    for (const row of controls.controls ?? []) {
      for (const relative of [row.policy, row.artifact, ...(row.automation?.configuration ?? []), ...(row.verificationEvidence ?? []), ...(row.verification?.evidence ?? [])]) {
        await readWorkspaceFile(root, workspaceRelative(root, path.resolve(root, relative)));
      }
    }
    for (const row of requirements.requirements ?? []) {
      for (const relative of [...row.design, ...row.implementation, ...row.executedTests, ...row.releaseEvidence]) await readWorkspaceFile(root, relative);
    }
    for (const row of failures.scenarios ?? []) {
      for (const relative of row.verificationEvidence ?? []) await readWorkspaceFile(root, relative);
    }
    checks.push('All 30 categories and requirement/failure schema, states, evidence and dependency links checked');
    const protectedEntries = Object.entries(config.protectedFiles ?? {});
    if (!protectedEntries.length) errors.push('Protected reference manifest cannot be empty');
    for (const [relative, expected] of protectedEntries) {
      try {
        if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error('Invalid hash');
        const bytes = await readWorkspaceFile(root, relative, 15_000_000);
        if (createHash('sha256').update(bytes).digest('hex') !== expected) errors.push(`${relative}: preserved reference hash changed`);
      } catch (error) { errors.push(`${relative}: protected reference unavailable (${error.code ?? error.message})`); }
    }
    checks.push(`Preserved reference integrity: ${protectedEntries.length} SHA-256 entries`);
    const ignored = texts.get('.gitignore') ?? '';
    for (const rule of ['.tmp/', '.env', '.env.*', '*.key', '*.pem', 'node_modules/', '*.tfstate']) {
      if (!ignored.split(/\r?\n/).includes(rule)) errors.push(`Missing ignore rule: ${rule}`);
    }
    const instructions = texts.get('AGENTS.md') ?? '';
    for (const term of ['docs/Decisions.md', 'self-approval is allowed', 'Do not run or refactor it', 'DOCUMENTED / CONFIGURED / ENFORCED / VERIFIED']) {
      if (!instructions.includes(term)) errors.push('Root instruction safeguard missing');
    }
    add(checkWorkflow(texts.get(config.ci.workflow) ?? '', config.ci));
    const gitAttributes = texts.get('.gitattributes') ?? '';
    const attributeRules = parseGitAttributes(gitAttributes);
    if (!gitAttributes.includes('*.pdf binary')) errors.push('Reference byte-preservation attributes missing');
    add(checkAttributeCoverage(config.protectedFiles, attributeRules));
    checks.push('Instruction/ignore/byte-preservation and limited CI configuration checks');
    const live = {
      managedPaths: seen.size, managedBytes: total, protected: protectedEntries.length,
      controls: (controls.controls ?? []).length, requirements: (requirements.requirements ?? []).length,
      failures: (failures.scenarios ?? []).length,
    };
    add(validateVerificationRecord(verification, live));
    add(validateVerificationClaims(controls.controls ?? [], verification, config));
    checks.push('Verification record and control verification claims checked against the live workspace');
    const review = renderCategoryReview(controls.controls ?? [], verification);
    const published = (texts.get('docs/governance/category-review.md') ?? '').replace(/\r\n/g, '\n');
    if (published !== review) errors.push('docs/governance/category-review.md does not match the control register; regenerate it with scripts/governance/render-category-review.mjs');
    checks.push('Generated category assessment compared with the authoritative control register');
    if (!options.skipApplicationScan) {
      const applicationFiles = await findApplicationFiles(root, config.applicationRoots);
      if (applicationFiles.length) errors.push('Application files found during foundation phase; activate reviewed real application gates first');
      const allowed = new Set(config.foundationPhaseAllowedTopLevel ?? []);
      if (allowed.size) {
        for (const entry of await readdir(root, { withFileTypes: true })) {
          if (entry.isSymbolicLink()) continue;
          const relative = entry.name;
          if (!allowed.has(relative)) errors.push(`Unexpected top-level path during foundation phase: ${relative}`);
        }
        checks.push(`Foundation-only phase: application roots ${config.applicationRoots.join(', ')} and the top-level allowlist inspected without executing code`);
      } else {
        checks.push('Foundation-only phase: future application roots inspected without executing code');
      }
    }
  } catch (error) {
    errors.push(`Foundation configuration/register check failed: ${error.code ?? error.message}`);
  }
  return { ok: errors.length === 0, checks, errors, limits: [
    'No external-link/heading-anchor checks, full YAML parser, comprehensive secret detection, SAST or runtime security audit',
    'Filesystem checks are for a trusted local workspace; not a race-safe sandbox for concurrently hostile filesystem changes',
    'Hosted CI, application build/tests, dependency scanning, infrastructure and recovery are not verified by this checker',
    'Instruction digests and review-gated path lists detect in-repository changes only; they cannot resist an editor who re-pins them, so hosted branch protection, required checks and CODEOWNERS remain required and are not configured',
    'Verification records live in this repository; provenance beyond the recorded command output and exit codes requires hosted run logs or an external attestation',
  ] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkFoundation(process.cwd());
  for (const check of result.checks) console.log(`CHECK ${check}`);
  for (const error of result.errors) console.error(`FAIL ${error}`);
  console.log(result.ok ? 'PASS bounded governance foundation checks' : 'FAIL governance foundation checks');
  for (const limit of result.limits) console.log(`LIMIT ${limit}`);
  process.exitCode = result.ok ? 0 : 1;
}
