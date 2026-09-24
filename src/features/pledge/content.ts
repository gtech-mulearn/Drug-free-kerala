export const PLEDGE_STATEMENT_IDS = ["aware", "commit", "discourage", "report", "support"] as const;

export type PledgeStatementId = (typeof PLEDGE_STATEMENT_IDS)[number];

export const PLEDGE_STATEMENTS: Record<PledgeStatementId, string> = {
  aware: "I am aware of the harmful effects that drugs have on our society.",
  commit: "I commit to not using drugs or any harmful substances.",
  discourage: "I will not encourage anyone to use drugs and will discourage drug use in my community.",
  report:
    "I will report any instances of drug use or trafficking to the authorities to help fight drug abuse.",
  support: "I will support and help those affected by drugs to recover and lead a healthy, normal life.",
};
