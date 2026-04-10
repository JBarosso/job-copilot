import { Tables } from "@/lib/supabase/database.types";

type Job = Tables<"jobs">;
type Profile = Tables<"profiles">;

const WEIGHTS = {
  title: 35,
  location: 15,
  remote: 10,
  contract: 15,
  salary: 15,
  freshness: 10,
} as const;

function scoreTitleSignal(job: Job, profile: Profile): number {
  if (!profile.target_titles.length) return 0;
  const jobTitle = job.title.toLowerCase();
  const matchCount = profile.target_titles.filter((t) =>
    jobTitle.includes(t.toLowerCase())
  ).length;
  return Math.round((matchCount / profile.target_titles.length) * WEIGHTS.title);
}

function scoreLocationSignal(job: Job, profile: Profile): number {
  if (!job.location || !profile.locations.length) return 0;
  const jobLocation = job.location.toLowerCase();
  const hasMatch = profile.locations.some(
    (loc) =>
      jobLocation.includes(loc.toLowerCase()) ||
      loc.toLowerCase().includes(jobLocation)
  );
  return hasMatch ? WEIGHTS.location : 0;
}

function scoreRemoteSignal(job: Job, profile: Profile): number {
  if (profile.remote_preference === "any") return WEIGHTS.remote;
  if (job.remote_status === "unknown") return 0;
  return profile.remote_preference === job.remote_status ? WEIGHTS.remote : 0;
}

function scoreContractSignal(job: Job, profile: Profile): number {
  if (!job.contract_type || !profile.contract_types.length) return 0;
  const jobContract = job.contract_type.toLowerCase();
  const hasMatch = profile.contract_types.some(
    (c) => c.toLowerCase() === jobContract
  );
  return hasMatch ? WEIGHTS.contract : 0;
}

function scoreSalarySignal(job: Job, profile: Profile): number {
  if (job.salary_min === null || profile.min_salary === null) return 0;
  return job.salary_min >= profile.min_salary ? WEIGHTS.salary : 0;
}

function scoreFreshnessSignal(job: Job): number {
  if (!job.published_at) return 0;
  const ageInDays =
    (Date.now() - new Date(job.published_at).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 3) return 10;
  if (ageInDays < 7) return 5;
  return 0;
}

export function scoreJob(job: Job, profile: Profile): number {
  const score =
    scoreTitleSignal(job, profile) +
    scoreLocationSignal(job, profile) +
    scoreRemoteSignal(job, profile) +
    scoreContractSignal(job, profile) +
    scoreSalarySignal(job, profile) +
    scoreFreshnessSignal(job);
  return Math.min(100, Math.max(0, score));
}
