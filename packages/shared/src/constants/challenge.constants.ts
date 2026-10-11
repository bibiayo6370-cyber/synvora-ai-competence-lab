export const CHALLENGE_ID = "001";
export const CHALLENGE_VERSION = "0.1";
export const EXPRESSION_LIMITS = { length: 200, nodes: 50, depth: 12 } as const;
export const stages = ["predict", "run", "investigate", "modify", "validate", "reflect", "completed"] as const;
export const evidenceTypes = ["investigation", "modification_draft", "reflection", "ai_use_declaration"] as const;
