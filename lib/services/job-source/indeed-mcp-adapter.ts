import {
  JobSource,
  JobSourceError,
  RawJob,
  RemotePreference,
  SearchCriteria,
} from "@/lib/services/job-source/types";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_CALLS_PER_MINUTE = 10;

interface IndeedMCPAdapterConfig {
  baseUrl: string;
  maxCallsPerMinute?: number;
  timeoutMs?: number;
}

/**
 * Tracks call timestamps in a 60-second sliding window.
 * Thread-safety is not required here since Node.js is single-threaded.
 */
class RateLimiter {
  private readonly callTimestamps: number[] = [];

  constructor(private readonly maxCallsPerMinute: number) {}

  isAllowed(): boolean {
    const now = Date.now();
    const windowStart = now - 60_000;

    while (
      this.callTimestamps.length > 0 &&
      this.callTimestamps[0] < windowStart
    ) {
      this.callTimestamps.shift();
    }

    return this.callTimestamps.length < this.maxCallsPerMinute;
  }

  record(): void {
    this.callTimestamps.push(Date.now());
  }
}

/** Raw shape returned by the Indeed MCP tool. */
interface IndeedMCPJob {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  description?: string;
  url?: string;
  published_at?: string;
}

interface IndeedMCPResponse {
  jobs?: IndeedMCPJob[];
}

function mapRemotePreference(preference: RemotePreference): string {
  const mapping: Record<RemotePreference, string> = {
    remote: "remote",
    hybrid: "hybrid",
    onsite: "onsite",
    any: "",
  };
  return mapping[preference];
}

function mapRemoteStatus(remote?: boolean): string | undefined {
  if (remote === true) return "remote";
  if (remote === false) return "onsite";
  return undefined;
}

function mapIndeedJobToRawJob(job: IndeedMCPJob): RawJob | null {
  if (!job.title || !job.company || !job.url) return null;

  return {
    title: job.title,
    company: job.company,
    location: job.location,
    remoteStatus: mapRemoteStatus(job.remote),
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    contractType: job.contract_type,
    description: job.description,
    sourceUrl: job.url,
    sourceId: job.id,
    publishedAt: job.published_at,
  };
}

/**
 * Implements `JobSource` by calling the Indeed MCP endpoint.
 *
 * The MCP endpoint follows the JSON-RPC 2.0 format with a `tools/call`
 * method targeting the `search_jobs` tool.
 *
 * Configure via environment variable INDEED_MCP_URL.
 */
export class IndeedMCPAdapter implements JobSource {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly rateLimiter: RateLimiter;

  constructor(config: IndeedMCPAdapterConfig) {
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.rateLimiter = new RateLimiter(
      config.maxCallsPerMinute ?? DEFAULT_MAX_CALLS_PER_MINUTE,
    );
  }

  async fetchJobs(criteria: SearchCriteria): Promise<RawJob[]> {
    if (!this.rateLimiter.isAllowed()) {
      throw new JobSourceError(
        "Rate limit reached for Indeed MCP. Try again in a minute.",
        "RATE_LIMITED",
      );
    }

    this.rateLimiter.record();

    const query = criteria.titles.join(" OR ");
    const location = criteria.locations.join(", ");
    const remoteFilter = mapRemotePreference(criteria.remotePreference);

    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "search_jobs",
        arguments: {
          query,
          location,
          ...(remoteFilter && { remote: remoteFilter }),
          ...(criteria.contractTypes.length > 0 && {
            contract_type: criteria.contractTypes.join(","),
          }),
          ...(criteria.salaryMin !== undefined && {
            salary_min: criteria.salaryMin,
          }),
        },
      },
    };

    let response: Response;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.timeoutMs,
      );

      response = await fetch(`${this.baseUrl}/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new JobSourceError(
          "Indeed MCP request timed out.",
          "TIMEOUT",
        );
      }
      throw new JobSourceError(
        "Indeed MCP is unavailable.",
        "MCP_DOWN",
      );
    }

    if (!response.ok) {
      throw new JobSourceError(
        `Indeed MCP returned HTTP ${response.status}.`,
        "MCP_DOWN",
      );
    }

    let data: IndeedMCPResponse;

    try {
      data = (await response.json()) as IndeedMCPResponse;
    } catch {
      throw new JobSourceError(
        "Failed to parse Indeed MCP response.",
        "UNKNOWN",
      );
    }

    const jobs = data.jobs ?? [];

    if (jobs.length === 0) {
      throw new JobSourceError(
        "Indeed MCP returned 0 results for the given criteria.",
        "NO_RESULTS",
      );
    }

    return jobs.map(mapIndeedJobToRawJob).filter((job): job is RawJob => job !== null);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3_000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}
