export type PRStatus =
  | "ANALYZING"
  | "VALIDATING"
  | "FIXING"
  | "WAITING_FOR_EVIDENCE"
  | "REQUIRES_HUMAN"
  | "READY_TO_MERGE"
  | "MERGING"
  | "MERGED"
  | "REJECTED"
  | "FAILED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AgentDecision =
  | "AUTO_MERGE"
  | "BLOCK"
  | "REQUIRES_HUMAN"
  | "REQUEST_CHANGES"
  | "PENDING";

export type EscalationReason =
  | "INSUFFICIENT_EVIDENCE"
  | "CONFLICT"
  | "POLICY_VIOLATION"
  | "FIX_LIMIT_REACHED"
  | "CI_FAILURE"
  | "SECURITY_RISK"
  | "AMBIGUOUS_CHANGE"
  | "PROTECTED_BRANCH";

export type ValidationStatus = "PASS" | "FAIL" | "RUNNING" | "SKIPPED" | "PENDING";

export type EvidenceResult = "PASS" | "FAIL" | "WARNING" | "NOT_AVAILABLE";

export type PolicyResult = "ALLOW" | "BLOCK" | "WARN" | "NOT_APPLICABLE";

export type AgentRunStatus = "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "QUEUED";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type AuditAction =
  | "POLICY_EVALUATION"
  | "EVIDENCE_COLLECTION"
  | "FIX_ATTEMPT"
  | "CI_VALIDATION"
  | "CONFLICT_DETECTED"
  | "HUMAN_OVERRIDE"
  | "APPROVE_MERGE"
  | "REJECT_PR"
  | "REQUEST_CHANGES"
  | "MERGE"
  | "AGENT_RUN_CANCELLED"
  | "ESCALATED";

export type HealthState = "HEALTHY" | "DEGRADED" | "DOWN";

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  repository: string;
  author: string;
  branch: string;
  target: string;
  status: PRStatus;
  risk: RiskLevel;
  decision: AgentDecision;
  ci: ValidationStatus;
  fixAttempts: number;
  maxFixAttempts: number;
  createdAt: string;
  updatedAt: string;
  escalationReason?: EscalationReason;
  priority?: Priority;
  assignedTo?: string;
  confidence: number;
  decisionSummary: string;
  conflictFiles: string[];
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  issueKey?: string;
  commitSha: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  result: EvidenceResult;
  source: string;
  detail: string;
}

export interface PolicyEvaluation {
  id: string;
  policy: string;
  result: PolicyResult;
  allowed?: string;
  observed?: string;
  description: string;
}

export interface DiffLine {
  type: "add" | "del" | "ctx" | "hunk";
  old?: number;
  new?: number;
  text: string;
}

export interface DiffFile {
  path: string;
  changeType: "M" | "A" | "D" | "R";
  additions: number;
  deletions: number;
  tags: Array<"security" | "config" | "large" | "deleted-code" | "tests">;
  lines: DiffLine[];
}

export interface ValidationCheck {
  id: string;
  name: string;
  status: ValidationStatus;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  logs: string[];
}

export interface ConflictFile {
  path: string;
  base: string;
  ours: string;
  theirs: string;
  merged: string;
  recommendation: string;
  evidence: string[];
}

export interface FixAttempt {
  attempt: number;
  failure: string;
  change: string;
  result: "PASSED" | "FAILED";
  startedAt: string;
  durationMs: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  component: string;
  action: string;
  input: string;
  output: string;
  status: "OK" | "WARN" | "FAIL" | "RUNNING";
  durationMs: number;
}

export interface AgentRun {
  id: string;
  prNumber: number;
  repository: string;
  status: AgentRunStatus;
  startedAt: string;
  durationMs: number;
  steps: number;
  trigger: string;
  tokensUsed: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "Agent" | "Admin";
  action: AuditAction;
  prNumber: number;
  repository: string;
  component: string;
  previousState: string;
  newState: string;
  result: "SUCCESS" | "FAILURE" | "BLOCKED";
  overrideReason?: string;
  agentDecision?: string;
  adminDecision?: string;
}

export interface Repository {
  id: string;
  name: string;
  activePRs: number;
  escalations: number;
  autoMergeRate: number;
  failureRate: number;
  lastActivity: string;
  health: HealthState;
  branches: string[];
  defaultBranch: string;
}

export interface IssueTicket {
  id: string;
  key: string;
  title: string;
  repository: string;
  status: "OPEN" | "IN_PROGRESS" | "BLOCKED" | "CLOSED";
  priority: Priority;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyDefinition {
  id: string;
  name: string;
  category: string;
  values: string[];
  enforcement: "BLOCK" | "WARN" | "AUDIT";
  editable: boolean;
  description: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  state: HealthState;
  latencyMs: number;
  uptime: number;
  lastCheck: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  repository: string;
  prNumber: number;
  component: string;
  action: string;
  status: "OK" | "WARN" | "FAIL" | "RUNNING";
}

export interface RiskAssessment {
  overall: RiskLevel;
  areas: Array<{ area: string; level: RiskLevel }>;
  impacted: string[];
}

export interface PRDetail extends PullRequest {
  evidence: EvidenceItem[];
  policies: PolicyEvaluation[];
  diff: DiffFile[];
  checks: ValidationCheck[];
  conflicts: ConflictFile[];
  fixLoop: FixAttempt[];
  timeline: TimelineEvent[];
  audit: AuditEntry[];
  risk_assessment: RiskAssessment;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info" | "success";
  href: string;
  timestamp: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  trend: number;
  trendDirection: "up" | "down";
  goodDirection: "up" | "down";
  hint: string;
}
