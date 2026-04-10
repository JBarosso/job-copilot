const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  signup_failed: "Impossible de créer le compte. Cet e-mail est peut-être déjà utilisé.",
  oauth_error: "La connexion Google a échoué. Veuillez réessayer.",
  auth_error: "Une erreur s'est produite lors de l'authentification.",
};

interface AuthErrorMessageProps {
  error: string;
}

export function AuthErrorMessage({ error }: AuthErrorMessageProps) {
  const message = ERROR_MESSAGES[error] ?? "Une erreur inattendue s'est produite.";

  return (
    <div
      role="alert"
      className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
