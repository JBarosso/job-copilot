export type {
  JobSource,
  JobSourceErrorCode,
  RawJob,
  RemotePreference,
  SearchCriteria,
} from "@/lib/services/job-source/types";

export { JobSourceError } from "@/lib/services/job-source/types";
export { IndeedMCPAdapter } from "@/lib/services/job-source/indeed-mcp-adapter";

import type { JobSource } from "@/lib/services/job-source/types";
import { IndeedMCPAdapter } from "@/lib/services/job-source/indeed-mcp-adapter";

/**
 * Returns a configured `IndeedMCPAdapter` instance.
 *
 * Reads configuration from environment variables:
 * - INDEED_MCP_URL (required in production)
 * - INDEED_MAX_CALLS_PER_MINUTE (default: 10)
 * - INDEED_TIMEOUT_MS (default: 10000)
 */
export function createJobSourceService(): JobSource {
  const baseUrl = process.env.INDEED_MCP_URL ?? "";
  const maxCallsPerMinute = parseInt(
    process.env.INDEED_MAX_CALLS_PER_MINUTE ?? "10",
    10,
  );
  const timeoutMs = parseInt(process.env.INDEED_TIMEOUT_MS ?? "10000", 10);

  return new IndeedMCPAdapter({ baseUrl, maxCallsPerMinute, timeoutMs });
}
