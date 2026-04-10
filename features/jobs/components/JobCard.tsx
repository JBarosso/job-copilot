"use client"

import { Bookmark, Briefcase, ExternalLink, MapPin, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Job } from "@/features/jobs/types"

interface JobCardProps {
  job: Job
  score: number
  onSave: () => void
  onDismiss: () => void
  onApply: () => void
  onClick: () => void
}

const REMOTE_LABELS: Record<string, string> = {
  remote: "Télétravail",
  hybrid: "Hybride",
  onsite: "Sur site",
}

function getFreshnessProps(publishedAt: string | null): {
  label: string
  className: string
} {
  if (!publishedAt) {
    return { label: "Ancien", className: "bg-muted text-muted-foreground" }
  }
  const ageInDays =
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (ageInDays < 3) {
    return {
      label: "Nouveau",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }
  }
  if (ageInDays < 7) {
    return {
      label: "Récent",
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
  }
  return { label: "Ancien", className: "bg-muted text-muted-foreground" }
}

function getScoreClassName(score: number): string {
  if (score > 70)
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  if (score > 40)
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null
  const fmt = (n: number) => n.toLocaleString("fr-FR")
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)} €`
  if (min !== null) return `À partir de ${fmt(min)} €`
  return `Jusqu'à ${fmt(max!)} €`
}

export function JobCard({
  job,
  score,
  onSave,
  onDismiss,
  onApply,
  onClick,
}: JobCardProps) {
  const freshness = getFreshnessProps(job.published_at)
  const salaryText = formatSalary(job.salary_min, job.salary_max)
  const showRemoteBadge = job.remote_status !== "unknown"

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onClick}>
        <CardTitle>{job.title}</CardTitle>
        <CardAction className="flex flex-col items-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-default">
                <Badge className={getScoreClassName(score)}>{score}</Badge>
              </TooltipTrigger>
              <TooltipContent>Score de pertinence : {score}/100</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge className={freshness.className}>{freshness.label}</Badge>
        </CardAction>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          {job.company}
          {showRemoteBadge && (
            <Badge variant="outline">
              {REMOTE_LABELS[job.remote_status] ?? job.remote_status}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="cursor-pointer" onClick={onClick}>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            {job.location ?? "Non précisé"}
          </span>
          {job.contract_type && (
            <span className="flex items-center gap-1">
              <Briefcase className="size-3.5 shrink-0" />
              {job.contract_type}
            </span>
          )}
        </div>
        {salaryText && (
          <p className="mt-1.5 text-sm font-medium">{salaryText}</p>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onSave}
        >
          <Bookmark className="size-3.5" />
          Sauvegarder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={onDismiss}
        >
          <X className="size-3.5" />
          Ignorer
        </Button>
        <Button size="sm" className="flex-1" onClick={onApply}>
          <ExternalLink className="size-3.5" />
          Postuler
        </Button>
      </CardFooter>
    </Card>
  )
}
