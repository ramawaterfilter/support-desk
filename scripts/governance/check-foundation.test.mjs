import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink, readFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  assertSafeRelative, readWorkspaceFile, findSecretSignals, checkMarkdownLinks,
  validateControls, validateRequirements, validateFailures, checkWorkflow,
  findApplicationFiles, checkFoundation, findUnreferencedDocuments,
  validateVerificationRecord, validateVerificationClaims, validateOwnership,
  validateAuthorizations, validateCatalogueMapping, parseGitAttributes,
  checkAttributeCoverage, validateReviewGatedPaths, validateInstructionIntegrity,
  renderCategoryReview,
} from './check-foundation.mjs';

const root = process.cwd();
const load = async name => JSON.parse(await readFile(path.join(root, `docs/governance/${name}.json`), 'utf8'));

async function scratch(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'support-desk-governance-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}
async function put(directory, relative, text) {
  await mkdir(path.dirname(path.join(directory, relative)), { recursive: true });
  await writeFile(path.join(directory, relative), text);
}

test('workspace paths reject traversal, absolute, Windows and malformed forms', () => {
  assert.equal(assertSafeRelative('docs/governance/README.md'), 'docs/governance/README.md');
  for (const value of ['../outside', '/outside', 'C:/outside', 'docs\\outside', 'docs//a', 'docs/./a', '', 'a\0b']) {
    assert.throws(() => assertSafeRelative(value));
  }
});

test('bounded reads reject oversized content and directories', async t => {
  const directory = await scratch(t);
  await put(directory, 'docs/a.md', 'ordinary');
  assert.equal((await readWorkspaceFile(directory, 'docs/a.md')).toString(), 'ordinary');
  await assert.rejects(readWorkspaceFile(directory, 'docs/a.md', 2), /byte budget/);
  await assert.rejects(readWorkspaceFile(directory, 'docs'), /regular file/);
});

test('symlink/junction components cannot escape bounded reads', async t => {
  const directory = await scratch(t);
  await mkdir(path.join(directory, 'real'));
  await put(directory, 'real/a.md', 'ordinary');
  await symlink(path.join(directory, 'real'), path.join(directory, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(readWorkspaceFile(directory, 'alias/a.md'), /Symlink/);
});

test('Markdown links allow existing relative targets and ignore external/fenced examples', async t => {
  const directory = await scratch(t);
  await put(directory, 'README.md', 'root');
  await put(directory, 'docs/a file.md', 'child');
  const text = '[root](../README.md) [child](<a file.md>) [web](https://example.com)\n```text\n[example](missing.md)\n```\n';
  assert.deepEqual(await checkMarkdownLinks(directory, 'docs/index.md', text), []);
});

test('Markdown missing, encoded-escape and unsafe-protocol targets fail without disclosing data', async t => {
  const directory = await scratch(t);
  const errors = await checkMarkdownLinks(directory, 'docs/index.md', '[a](missing.md) [b](../../outside) [c](%2e%2e/%2e%2e/outside) [d](file:///outside)');
  assert.equal(errors.length, 4);
  assert(errors.every(message => message.includes('invalid/missing local link')));
});

test('secret heuristic reports rule names rather than matched material', () => {
  const privateMarker = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ');
  const tokenLike = 'gh' + 'p_' + 'X'.repeat(36);
  const accessLike = 'AK' + 'IA' + '0'.repeat(16);
  assert.deepEqual(findSecretSignals(privateMarker), ['private-key-material']);
  assert.deepEqual(findSecretSignals(tokenLike), ['github-token-like']);
  assert.deepEqual(findSecretSignals(accessLike), ['aws-access-key-like']);
  assert.deepEqual(findSecretSignals('api key is resolved from an approved secret store'), []);
});

test('all thirty categories are covered with explicit gaps and justified runtime-AI exclusion', async () => {
  const controls = await load('controls');
  assert.deepEqual(validateControls(controls), []);
  assert.equal(controls.controls.filter(row => row.applicability === 'NOT APPLICABLE').length, 1);
  assert.match(controls.controls[23].applicabilityReason, /No runtime AI/);
});

test('missing category, fabricated VERIFIED state and missing N/A explanation fail', async () => {
  const controls = await load('controls');
  const incomplete = structuredClone(controls); incomplete.controls.pop();
  assert(validateControls(incomplete).length > 0);
  controls.controls[0].automation.status = 'VERIFIED';
  controls.controls[23].applicabilityReason = '';
  const errors = validateControls(controls);
  assert(errors.some(message => message.includes('VERIFIED requires')));
  assert(errors.some(message => message.includes('N/A needs')));
});

test('requirements retain acceptance, source/design traceability and no invented application implementation', async () => {
  const data = await load('requirements');
  const failures = await load('failures');
  assert.deepEqual(validateRequirements(data, failures), []);
  const implemented = data.requirements.filter(row => row.implementation.length || row.executedTests.length || row.releaseEvidence.length);
  assert.equal(implemented.length, 0, 'no requirement may claim implementation or evidence yet');
  const designed = data.requirements.filter(row => row.status === 'DESIGNED');
  const pending = data.requirements.filter(row => row.status === 'PENDING DECISION');
  assert(designed.length >= 34 && pending.length === 0, 'expected 34+ designed and 0 pending-decision rows');
  // Every requirement carries five observable Given/When/Then criteria covering positive,
  // negative, prohibited, boundary and failure cases, plus a meaningful priority.
  const kinds = ['positive', 'negative', 'prohibited', 'boundary', 'failure'];
  for (const row of data.requirements) {
    assert(row.acceptanceCriteria.length >= 5, `${row.id}: needs at least five acceptance criteria`);
    for (const kind of kinds) {
      const found = row.acceptanceCriteria.find(text => text.startsWith(`${kind}: Given `) && text.includes(' When ') && text.includes(' Then '));
      assert(found, `${row.id}: missing ${kind} Given/When/Then criterion`);
    }
    assert(['MUST', 'SHOULD', 'COULD'].includes(row.priority), `${row.id}: priority must be meaningful`);
    assert(Array.isArray(row.failureScenarios), `${row.id}: missing failureScenarios`);
  }
  const priorities = new Set(data.requirements.map(row => row.priority));
  assert(priorities.has('MUST') && priorities.has('SHOULD') && priorities.has('COULD'), 'priorities must not collapse to one level');
  // Pending-decision NFRs name their unresolved decision and claim nothing.
  for (const row of pending) {
    assert(/^D-\d{2}$/.test(row.decisionRef), `${row.id}: PENDING DECISION needs a decisionRef`);
    assert(row.description.includes('OPEN') || row.description.includes('unresolved') || row.description.includes('not ratified') || row.description.includes('deliberately'), `${row.id}: description must state what is unresolved`);
  }
  // Every failure scenario is linked from at least one requirement.
  const linked = new Set(data.requirements.flatMap(row => row.failureScenarios));
  for (const scenario of failures.scenarios) assert(linked.has(scenario.id), `${scenario.id}: not linked to any requirement`);
});

test('duplicate/cyclic requirements and unsupported implementation claims fail', async () => {
  const data = await load('requirements');
  data.requirements[0].dependencies = ['REQ-002'];
  data.requirements[1].dependencies = ['REQ-001'];
  data.requirements[2].status = 'RELEASED';
  data.requirements.push(structuredClone(data.requirements[0]));
  const errors = validateRequirements(data);
  assert(errors.some(message => message.includes('duplicate')));
  assert(errors.some(message => message.includes('cyclic')));
  assert(errors.some(message => message.includes('release claim')));
});

test('failure register distinguishes planned cases from verified evidence', async () => {
  const data = await load('failures');
  assert.deepEqual(validateFailures(data), []);
  data.scenarios[0].status = 'VERIFIED';
  assert(validateFailures(data).some(message => message.includes('without execution')));
});

test('malformed register records fail validation without throwing', async () => {
  const controls = await load('controls'); controls.controls[0] = null;
  assert(validateControls(controls).length > 0);
  assert(validateRequirements({ requirements: [null] }).length > 0);
  assert(validateFailures({ scenarios: [null] }).length > 0);
  const requirements = await load('requirements'); requirements.requirements[0].acceptanceCriteria = 42;
  assert(validateRequirements(requirements).length > 0);
});

test('workflow config requires reviewed full-SHA actions, actual commands and read-only token', async () => {
  const config = await load('foundation');
  const text = await readFile(path.join(root, config.ci.workflow), 'utf8');
  assert.deepEqual(checkWorkflow(text, config.ci), []);
  assert(checkWorkflow(text.replace('contents: read', 'contents: write'), config.ci).length > 0);
  assert(checkWorkflow(text.replace(config.ci.checkoutSha, 'main'), config.ci).length > 0);
  assert(checkWorkflow(text.replace('persist-credentials: false', 'persist-credentials: true'), config.ci).length > 0);
  assert(checkWorkflow(text.replace('node scripts/governance/check-foundation.mjs', 'echo success'), config.ci).length > 0);
});

test('managed documents must be referenced by another managed document', () => {
  const texts = new Map([
    ['index.md', '[a](a.md) [self](index.md)'],
    ['a.md', '[home](index.md)'],
    ['orphan.md', 'no inbound reference'],
  ]);
  assert.deepEqual(findUnreferencedDocuments(texts), ['orphan.md']);
});

test('foundation detects future application files without executing them', async t => {
  const directory = await scratch(t);
  assert.deepEqual(await findApplicationFiles(directory, ['apps', 'packages', 'db/migrations']), []);
  await put(directory, 'apps/api/main.ts', 'throw new Error("must never execute")');
  assert.deepEqual(await findApplicationFiles(directory, ['apps']), ['apps/api/main.ts']);
});

test('full checker passes actual bounded workspace and catches changed protected references', async t => {
  const baseline = await checkFoundation(root);
  assert.equal(baseline.ok, true, baseline.errors.join('\n'));
  const directory = await scratch(t);
  const config = await load('foundation');
  const manifest = await load('files');
  for (const entry of manifest.files) {
    const target = path.join(directory, entry.path);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(root, entry.path), target);
  }
  // Use one small synthetic protected file; never copy the user's full reference bundle.
  const original = 'reference before';
  await put(directory, 'reference.txt', original);
  config.protectedFiles = { 'reference.txt': createHash('sha256').update(original).digest('hex') };
  await put(directory, 'docs/governance/foundation.json', JSON.stringify(config));
  const requirements = await load('requirements');
  requirements.requirements.forEach(row => { row.design = ['README.md']; });
  await put(directory, 'docs/governance/requirements.json', JSON.stringify(requirements));
  await put(directory, 'reference.txt', 'reference changed');
  const result = await checkFoundation(directory);
  assert.equal(result.ok, false);
  assert(result.errors.some(message => message.includes('preserved reference hash changed')));
});

const verificationFixture = () => {
  const entry = (id, markers) => ({ id, command: 'node scripts/governance/check-foundation.mjs',
    record: 'docs/governance/verification.json', executedAtUtc: '2026-11-01 00:00:00 UTC', exitCode: 0,
    evidence: ['scripts/governance/check-foundation.mjs', 'scripts/governance/check-foundation.test.mjs'],
    expectedOutputMarkers: markers });
  return {
    status: 'VERIFIED', scope: 'bounded', executedAtUtc: '2026-11-01 00:00:00 UTC', runtime: 'Node.js v24.16.0',
    commands: [
      { command: 'node --test scripts/governance/check-foundation.test.mjs', exitCode: 0, wallTimeSeconds: 1, output: 'pass 30\nfail 0\nskipped 0\n' },
      { command: 'node scripts/governance/check-foundation.mjs', exitCode: 0, wallTimeSeconds: 1,
        output: 'CHECK Managed manifest: 44 paths; 360473 bytes\n'
          + 'CHECK Managed documents are referenced from other managed documents\n'
          + 'CHECK All 30 categories and requirement/failure schema, states, evidence and dependency links checked\n'
          + 'CHECK Verification record and control verification claims checked against the live workspace\n'
          + 'CHECK Generated category assessment compared with the authoritative control register\n'
          + 'PASS bounded governance foundation checks\n' },
    ],
    counts: { validatorTestsPassed: 30, failed: 0, skipped: 0, governanceCategories: 30, seedRequirements: 34, failureScenarios: 23, managedPaths: 44, protectedReferencesUnchanged: 45 },
    verifiedControls: [
      entry('GOV-26', ['Managed documents are referenced from other managed documents', 'Generated category assessment compared with the authoritative control register']),
      entry('GOV-27', ['All 30 categories and requirement/failure schema, states, evidence and dependency links checked', 'Verification record and control verification claims checked against the live workspace']),
    ],
  };
};
const liveFixture = { managedPaths: 44, managedBytes: 360473, protected: 45, controls: 30, requirements: 34, failures: 23 };

test('valid execution record with matching live totals passes validation', () => {
  assert.deepEqual(validateVerificationRecord(verificationFixture(), liveFixture), []);
});

test('stale totals, failed exit and missing commands in an execution record fail', () => {
  const record = verificationFixture();
  record.counts.managedPaths = 38;
  const errors = validateVerificationRecord(record, liveFixture);
  assert(errors.some(message => message.includes('managedPaths')));
  const failing = verificationFixture();
  failing.commands[0].exitCode = 1;
  assert(validateVerificationRecord(failing, liveFixture).some(message => message.includes('failing exit code')));
  const partial = verificationFixture();
  partial.commands = [partial.commands[0]];
  assert(validateVerificationRecord(partial, liveFixture).some(message => message.includes('was not recorded')));
});

test('evidence-path-only and governance-record self-evidence claims fail', async () => {
  const controls = await load('controls');
  const record = verificationFixture();
  const config = await load('foundation');
  // Register-as-evidence: verification evidence pointing at a governance record fails.
  const forged = structuredClone(controls);
  const target = forged.controls.find(row => row.verification);
  target.verification.evidence = ['docs/governance/controls.json'];
  const claims = validateVerificationClaims(forged.controls, record, config);
  assert(claims.some(message => message.includes('must not be a governance record')));
  // Evidence that names only a path with no execution marker also fails.
  const markerless = structuredClone(controls);
  const other = markerless.controls.find(row => row.verification);
  other.verification.evidence = ['docs/governance/testing.md'];
  other.verification.expectedOutputMarkers = [];
  assert(validateVerificationClaims(markerless.controls, record, config).some(message => message.includes('no output markers')));
});

test('verification claims outside the foundation allow-list and without execution fail', async () => {
  const controls = await load('controls');
  const config = await load('foundation');
  const record = verificationFixture();
  // A VERIFIED claim with no matching execution-record entry fails.
  const orphanRecord = verificationFixture();
  orphanRecord.verifiedControls = [];
  const withClaim = structuredClone(controls);
  assert(validateVerificationClaims(withClaim.controls, orphanRecord, config).some(message => message.includes('matching verifiedControls entry')));
  // A control outside the allow-list may not claim foundation-phase VERIFIED.
  const unlisted = structuredClone(controls);
  const claimed = unlisted.controls.find(row => row.verification);
  const config2 = structuredClone(config);
  config2.verification.foundationVerifiableControls = config2.verification.foundationVerifiableControls.filter(id => id !== claimed.id);
  const record2 = verificationFixture();
  record2.verifiedControls = record2.verifiedControls.map(entry => entry.id === claimed.id
    ? { ...entry, command: claimed.verification.command, exitCode: claimed.verification.exitCode,
        evidence: [...claimed.verification.evidence], expectedOutputMarkers: [...claimed.verification.expectedOutputMarkers] }
    : entry);
  assert(validateVerificationClaims(unlisted.controls, record2, config2).some(message => message.includes('not permitted in the foundation phase')));
});

test('a verification record claiming a non-claimed control fails', async () => {
  const controls = await load('controls');
  const record = verificationFixture();
  record.verifiedControls.push({ id: 'GOV-01', command: 'node scripts/governance/check-foundation.mjs',
    record: 'docs/governance/verification.json', executedAtUtc: record.executedAtUtc, exitCode: 0,
    evidence: ['scripts/governance/check-foundation.mjs'], expectedOutputMarkers: ['PASS bounded governance foundation checks'] });
  const config = await load('foundation');
  // GOV-01 does not claim VERIFIED in the register, so the record claim is contradictory.
  const claimedIds = new Set(controls.controls.filter(row => row.policyState === 'VERIFIED' || row.policyState === 'ENFORCED' || row.automation.status === 'VERIFIED' || row.automation.status === 'ENFORCED').map(row => row.id));
  assert(!claimedIds.has('GOV-01'));
  const claimErrors = validateVerificationClaims(controls.controls, record, config);
  assert(claimErrors.some(message => message.includes('claims this control but the register does not')));
});

test('ownership pending assignment consistency is enforced', async () => {
  const controls = await load('controls');
  const ownership = JSON.parse(await readFile(path.join(root, 'docs/governance/ownership.json'), 'utf8'));
  assert.deepEqual(validateOwnership(ownership, controls), []);
  // State-independent: force a pending role rather than relying on the live register
  // being pending, and flip the live status rather than hardcoding one value.
  const broken = structuredClone(ownership);
  broken.roles[0].status = 'PENDING OWNER ASSIGNMENT';
  broken.roles[0].assignedTo = 'invented name';
  assert(validateOwnership(broken, controls).some(message => message.includes('names a assignedTo') || message.includes('pending assignment but names')));
  const wrongStatus = structuredClone(ownership);
  wrongStatus.status = ownership.status === 'ASSIGNED' ? 'BLOCKED' : 'ASSIGNED';
  assert(validateOwnership(wrongStatus, controls).some(message => message.includes('status is')));
  const missingRole = structuredClone(ownership);
  missingRole.roles.pop();
  assert(validateOwnership(missingRole, controls).some(message => message.includes('missing required role')));
});

test('authorization records reject AI approvers, missing fields and bad sources', async () => {
  const register = JSON.parse(await readFile(path.join(root, 'docs/governance/authorizations.json'), 'utf8'));
  assert.deepEqual(validateAuthorizations(register), []);
  const record = operation => ({ operation, requestingIdentity: 'jane@example.com', approvingIdentity: 'john@example.com',
    approverRole: 'technical', approvedScope: 'one migration', environment: 'staging',
    expiry: '2026-12-01T00:00:00Z', evidence: 'ticket-42', executionOutcome: 'EXECUTED',
    authorizationSource: 'APPROVED_TICKET', recordedAtUtc: '2026-11-01T00:00:00Z' });
  const ai = structuredClone(register); ai.records.push(record('deploy'));
  ai.records[0].approvingIdentity = 'the AI assistant';
  assert(validateAuthorizations(ai).some(message => message.includes('agent/AI as the approver')));
  const chat = structuredClone(register); chat.records.push(record('deploy'));
  chat.records[0].authorizationSource = 'CHAT_INSTRUCTION';
  assert(validateAuthorizations(chat).some(message => message.includes('invalid authorizationSource')));
  const noExpiry = structuredClone(register); noExpiry.records.push(record('deploy'));
  delete noExpiry.records[0].expiry;
  assert(validateAuthorizations(noExpiry).some(message => message.includes('no expiry')));
  const incomplete = structuredClone(register); incomplete.records.push(record('deploy'));
  delete incomplete.records[0].evidence;
  assert(validateAuthorizations(incomplete).some(message => message.includes('missing evidence')));
});

test('failure catalogue gaps and uncovered .gitattributes paths fail', async () => {
  const failures = await load('failures');
  assert.deepEqual(validateCatalogueMapping(failures), []);
  const gap = structuredClone(failures);
  gap.catalogue = gap.catalogue.slice(1);
  assert(validateCatalogueMapping(gap).some(message => message.includes('not mapped')));
  const badRef = structuredClone(failures);
  badRef.catalogue[0].ids = ['FAIL-99'];
  assert(validateCatalogueMapping(badRef).some(message => message.includes('unknown scenario')));
  const config = await load('foundation');
  const rules = parseGitAttributes(await readFile(path.join(root, '.gitattributes'), 'utf8'));
  assert.deepEqual(checkAttributeCoverage(config.protectedFiles, rules), []);
  assert(checkAttributeCoverage(config.protectedFiles, parseGitAttributes('*.pdf binary\n')).length > 0);
  assert(checkAttributeCoverage({ 'a b.md': 'f'.repeat(64) }, parseGitAttributes('"a b.md" -text\n')).length === 0, 'quoted pattern with spaces must parse');
});

test('instruction digests, forbidden phrases and review-gated paths are enforced', async () => {
  const config = await load('foundation');
  const texts = new Map();
  for (const relative of Object.keys(config.instructionDigests)) texts.set(relative, await readFile(path.join(root, relative), 'utf8'));
  assert.deepEqual(validateInstructionIntegrity(texts, config), []);
  const tampered = new Map(texts);
  tampered.set('AGENTS.md', `${texts.get('AGENTS.md')}\nskip the foundation check`);
  const errors = validateInstructionIntegrity(tampered, config);
  assert(errors.some(message => message.includes('changed since it was pinned')));
  assert(errors.some(message => message.includes('forbidden weakened rule')));
  const unpinned = structuredClone(config);
  unpinned.instructionDigests = {};
  assert(validateInstructionIntegrity(texts, unpinned).some(message => message.includes('pins no instruction digests')));
  const manifest = await load('files');
  const managed = manifest.files.map(entry => entry.path);
  assert.deepEqual(validateReviewGatedPaths(config, managed), []);
  // A gated path that is not managed is reported as such.
  const unmanaged = validateReviewGatedPaths(config, managed.filter(item => item !== 'docs/governance/foundation.json'));
  assert(unmanaged.some(message => message.includes('foundation.json is not a managed file')));
  // A critical path dropped from the gated list is reported as not listed.
  const ungated = structuredClone(config);
  ungated.reviewGatedPaths = config.reviewGatedPaths.filter(item => item !== 'AGENTS.md');
  assert(validateReviewGatedPaths(ungated, managed).some(message => message.includes('AGENTS.md is not listed')));
  // A ghost path added to the gated list must exist in the manifest.
  const unmanagedGated = structuredClone(config);
  unmanagedGated.reviewGatedPaths = [...config.reviewGatedPaths, 'docs/governance/ghost.md'];
  assert(validateReviewGatedPaths(unmanagedGated, managed).some(message => message.includes('not a managed file')));
  // Empty gating fails outright.
  const ungatedAll = structuredClone(config);
  ungatedAll.reviewGatedPaths = [];
  assert(validateReviewGatedPaths(ungatedAll, managed).some(message => message.includes('no review-gated paths')));
});

test('category-review rendering is deterministic and tracks the register', async () => {
  const controls = await load('controls');
  const record = verificationFixture();
  const first = renderCategoryReview(controls.controls, record);
  assert.equal(first, renderCategoryReview(controls.controls, record));
  const drifted = structuredClone(controls);
  drifted.controls[0].workCompleted = 'tampered claim';
  assert.notEqual(renderCategoryReview(drifted.controls, record), first);
  assert(first.includes('GOV-01 Requirements engineering'));
});
