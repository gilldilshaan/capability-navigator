import { createServerFn } from "@tanstack/react-start";

import { runParallaxWorkflow } from "./orchestrator";
import { disruptionSchema } from "./schema";

export const runParallaxWorkflowServer = createServerFn({ method: "POST" })
  .validator(disruptionSchema)
  .handler(({ data }) => runParallaxWorkflow(data));
