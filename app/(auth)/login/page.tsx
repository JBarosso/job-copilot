import Link from "next/link";

import { signInWithEmail, signInWithGoogle } from "@/features/auth/actions";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthErrorMessage } from "@/features/auth/components/AuthErrorMessage";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { SubmitButton } from "@/features/auth/components/SubmitButton";

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard
      title="Se connecter"
      subtitle="Bon retour sur Job Copilot"
    >
      <form action={signInWithGoogle} className="w-full">
        <GoogleButton label="Continuer avec Google" />
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      {error && <AuthErrorMessage error={error} />}

      <form action={signInWithEmail} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>

        <SubmitButton label="Se connecter" />
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </AuthCard>
  );
}
