"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, configured, signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") await signInEmail(email, password);
      else await signUpEmail(email, password);
    } catch (err: any) {
      setError(err?.message || "Error de autenticación");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInGoogle();
    } catch (err: any) {
      setError(err?.message || "Error con Google");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-ink-50 p-6 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <Card className="w-full max-w-md">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink-900 dark:text-ink-50">FinanzaPro</h1>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {mode === "signin" ? "Inicia sesión para continuar" : "Crea tu cuenta gratis"}
            </p>
          </div>
        </div>

        {!configured && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-warn/30 bg-warn/10 p-3 text-xs text-warn-dark dark:text-warn">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              Firebase aún no está configurado. Crea un archivo <code className="rounded bg-black/10 px-1">.env.local</code> con las variables{" "}
              <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_FIREBASE_*</code> y reinicia el servidor.
            </div>
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@correo.com"
            leftIcon={<Mail className="h-4 w-4 text-ink-400" />}
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            leftIcon={<Lock className="h-4 w-4 text-ink-400" />}
          />

          {error && (
            <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger-dark dark:text-danger">
              {error}
            </div>
          )}

          <Button type="submit" loading={busy} disabled={!configured} leftIcon={<LogIn className="h-4 w-4" />}>
            {mode === "signin" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          <span className="text-[10px] uppercase tracking-wide text-ink-400">o</span>
          <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
        </div>

        <Button variant="outline" onClick={google} disabled={!configured || busy} className="w-full">
          Continuar con Google
        </Button>

        <div className="mt-4 text-center text-xs text-ink-500 dark:text-ink-400">
          {mode === "signin" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button className="font-semibold text-brand-600 hover:underline" onClick={() => setMode("signup")}>
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button className="font-semibold text-brand-600 hover:underline" onClick={() => setMode("signin")}>
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
