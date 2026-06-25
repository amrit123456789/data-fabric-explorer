import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { RecordsBrowser } from "@/components/RecordsBrowser";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Data Fabric Records Browser" },
      { name: "description", content: "Browse UiPath Data Fabric entities and records." },
      { property: "og:title", content: "Data Fabric Records Browser" },
      { property: "og:description", content: "Browse UiPath Data Fabric entities and records." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { isAuthenticated, isLoading, login, error } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Data Fabric Records</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with UiPath to browse entities and records in your tenant.
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button className="mt-6 w-full" onClick={login}>Sign in with UiPath</Button>
        </div>
      </div>
    );
  }
  return <RecordsBrowser />;
}

// kept for ref: blank-placeholder removed
function _Removed() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
  );
}
