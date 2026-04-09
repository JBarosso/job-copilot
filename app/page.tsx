import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Job Copilot
      </h1>
      <p className="max-w-md text-center text-lg text-muted-foreground">
        Les bonnes offres, au bon moment, avec un plan d&apos;action clair.
      </p>
      <div className="flex gap-3">
        <Button>Commencer</Button>
        <Button variant="outline">En savoir plus</Button>
      </div>
    </div>
  );
}
