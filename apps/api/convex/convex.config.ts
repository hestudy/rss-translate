import crons from "@convex-dev/crons/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(workflow);
app.use(workpool, {
  name: "feedWorkpool",
});
app.use(workpool, {
  name: "feedItemWorkpool",
});
app.use(workpool, {
  name: "translateHtmlWorkpool",
});
app.use(workpool, {
  name: "translateTextWorkpool",
});

app.use(crons);
export default app;
