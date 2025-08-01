import { ConvexHttpClient } from "convex/browser";

const convexClient = new ConvexHttpClient(
  process.env.CONVEX_URL ?? "http://127.0.0.1:3210"
);

export default convexClient;
