import { WorkflowManager } from "@convex-dev/workflow";
import { Workpool } from "@convex-dev/workpool";
import { components } from "./_generated/api";
import { Crons } from "@convex-dev/crons";

export const workflow = new WorkflowManager(components.workflow);

export const feedWorkpool = new Workpool(components.feedWorkpool, {
  maxParallelism: 10,
});

export const crons = new Crons(components.crons);
