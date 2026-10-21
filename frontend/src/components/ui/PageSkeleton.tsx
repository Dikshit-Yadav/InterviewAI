type PageSkeletonProps = {
  page: "dashboard" | "session" | "report" | "auth";
};

function Block({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-surface-hover ${className}`}
    />
  );
}

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <Block
          key={index}
          className={`h-4 ${index === count - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8 sm:px-8">
      <div className="space-y-3">
        <Block className="h-8 w-64 max-w-full" />
        <Block className="h-4 w-80 max-w-full" />
      </div>
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <Block className="h-6 w-56 max-w-full" />
        <Block className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-5 flex flex-wrap gap-3">
          <Block className="h-10 w-44" />
          <Block className="h-10 w-36" />
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <section
            key={index}
            className="space-y-4 rounded-xl border border-border bg-surface p-5"
          >
            <Block className="h-4 w-28" />
            <Block className="h-8 w-20" />
            <Block className="h-3 w-36 max-w-full" />
          </section>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-5 rounded-xl border border-border bg-surface p-5 md:col-span-2">
          <Block className="h-6 w-48" />
          <Block className="h-64 w-full" />
        </section>
        <section className="space-y-5 rounded-xl border border-border bg-surface p-5">
          <Block className="h-6 w-40" />
          <SkeletonLines />
        </section>
      </div>
    </main>
  );
}

function SessionSkeleton() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <div className="flex justify-end">
        <Block className="h-9 w-24" />
      </div>
      <Block className="h-4 w-72 max-w-full" />
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex justify-between gap-4">
          <Block className="h-5 w-32" />
          <Block className="h-5 w-20" />
        </div>
        <Block className="h-2 w-full" />
      </section>
      <section className="space-y-5 rounded-xl border border-border bg-surface p-6">
        <Block className="h-4 w-36" />
        <Block className="h-7 w-full max-w-2xl" />
        <Block className="h-5 w-4/5" />
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <Block className="h-48 w-full" />
        <div className="flex justify-between gap-4">
          <Block className="h-10 w-28" />
          <Block className="h-10 w-32" />
        </div>
      </section>
    </main>
  );
}

function ReportSkeleton() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <section className="grid gap-6 rounded-xl border border-border bg-surface p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <Block className="size-32 rounded-full" />
        <div className="space-y-4">
          <Block className="h-7 w-56 max-w-full" />
          <Block className="h-4 w-full max-w-2xl" />
          <Block className="h-4 w-3/4" />
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((index) => (
          <section
            key={index}
            className="space-y-5 rounded-xl border border-border bg-surface p-6"
          >
            <Block className="h-6 w-44" />
            <SkeletonLines />
          </section>
        ))}
      </div>
      <section className="space-y-5 rounded-xl border border-border bg-surface p-6">
        <Block className="h-6 w-56" />
        <SkeletonLines count={4} />
      </section>
    </main>
  );
}

function AuthSkeleton() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-10">
      <section className="w-full max-w-md space-y-5 rounded-xl border border-border bg-surface p-6">
        <Block className="h-7 w-48" />
        <Block className="h-4 w-full" />
        <Block className="h-11 w-full" />
        <Block className="h-11 w-full" />
        <Block className="h-11 w-full" />
      </section>
    </main>
  );
}

const skeletonByPage = {
  dashboard: DashboardSkeleton,
  session: SessionSkeleton,
  report: ReportSkeleton,
  auth: AuthSkeleton,
};

export default function PageSkeleton({ page }: PageSkeletonProps) {
  const Content = skeletonByPage[page];

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      <span className="sr-only">Loading content...</span>
      <Content />
    </div>
  );
}
