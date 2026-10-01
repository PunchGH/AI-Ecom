export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="rise w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-accent font-display text-lg font-bold text-white">
            S
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <div className="card rounded-2xl border border-line bg-panel p-6">{children}</div>
      </div>
    </main>
  );
}
