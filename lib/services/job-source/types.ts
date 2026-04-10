export type RemotePreference = "remote" | "hybrid" | "onsite" | "any";

export interface SearchCriteria {
  titles: string[];
  locations: string[];
  remotePreference: RemotePreference;
  contractTypes: string[];
  salaryMin?: number;
}

export interface RawJob {
  title: string;
  company: string;
  location?: string;
  remoteStatus?: string;
  salaryMin?: number;
  salaryMax?: number;
  contractType?: string;
  description?: string;
  sourceUrl: string;
  sourceId?: string;
  publishedAt?: string;
}

export interface JobSource {
  fetchJobs(criteria: SearchCriteria): Promise<RawJob[]>;
  isAvailable(): Promise<boolean>;
}

export type JobSourceErrorCode =
  | "MCP_DOWN"
  | "TIMEOUT"
  | "NO_RESULTS"
  | "RATE_LIMITED"
  | "UNKNOWN";

export class JobSourceError extends Error {
  constructor(
    message: string,
    public readonly code: JobSourceErrorCode,
  ) {
    super(message);
    this.name = "JobSourceError";
  }
}
