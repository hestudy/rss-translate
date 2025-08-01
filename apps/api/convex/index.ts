import { Crons } from "@convex-dev/crons";
import { WorkflowManager } from "@convex-dev/workflow";
import { Workpool } from "@convex-dev/workpool";
import { hc } from "hono/client";
import { ApiType } from "../src/index";
import { components } from "./_generated/api";

export const workflow = new WorkflowManager(components.workflow);

export const feedWorkpool = new Workpool(components.feedWorkpool, {
  maxParallelism: 10,
});
export const feedItemWorkpool = new Workpool(components.feedItemWorkpool, {
  maxParallelism: 10,
});
export const translateHtmlWorkpool = new Workpool(
  components.translateHtmlWorkpool,
  {
    maxParallelism: 1,
  }
);
export const translateTextWorkpool = new Workpool(
  components.translateTextWorkpool,
  {
    maxParallelism: 1,
  }
);

export const crons = new Crons(components.crons);

export const client = hc<ApiType>("http://localhost:3001");
