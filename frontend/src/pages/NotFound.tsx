import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  Home,
  LayoutDashboard,
  Code2,
  Share2,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.title = "404 - Page Not Found | InterviewAI";
    try {
      const storedName = sessionStorage.getItem("name");
      setIsAuthenticated(Boolean(storedName));
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  };

  const primaryTarget = isAuthenticated ? "/dashboard" : "/";
  const primaryLabel = isAuthenticated ? "Go to Dashboard" : "Return to Home";

  const quickLinks = [
    {
      to: "/dashboard",
      title: "Dashboard",
      description: "Review your performance metrics and interview history",
      icon: LayoutDashboard,
    },
    {
      to: "/interview",
      title: "Practice Interview",
      description: "Start a realistic AI technical or behavioral interview session",
      icon: Code2,
    },
    {
      to: "/shared-interviews",
      title: "Shared Interviews",
      description: "Create and manage custom shareable interview links",
      icon: Share2,
    },
    {
      to: "/profile",
      title: "Profile & Resume",
      description: "Update your target role, resume, and experience settings",
      icon: User,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to={primaryTarget}
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="InterviewAI Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Interview<span className="text-color-accent-secondary">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={primaryTarget}
              className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-foreground sm:inline-block"
            >
              {isAuthenticated ? "Dashboard" : "Home"}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-2xl text-center">
          {/* Visual Indicator */}
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div
              className="absolute inset-0 rounded-3xl bg-brand/10 blur-xl dark:bg-brand/20"
              aria-hidden="true"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <Compass className="h-10 w-10 text-brand animate-[spin_12s_linear_infinite]" aria-hidden="true" />
            </div>
          </div>

          {/* 404 Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-color-accent-secondary" />
            Error 404 • Page Not Found
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Lost your way?
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary sm:text-base">
            We couldn’t find the page you were looking for. It might have been removed,
            renamed, or the address might be mistyped.
          </p>

          {/* Path Display */}
          {location.pathname && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">Requested URL:</span>
              <code className="font-mono text-foreground break-all">{location.pathname}</code>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Button
              asChild
              size="lg"
              className="gap-2 bg-brand text-primary-foreground hover:bg-brand-hover cursor-pointer"
            >
              <Link to={primaryTarget}>
                {isAuthenticated ? (
                  <LayoutDashboard className="h-4 w-4" />
                ) : (
                  <Home className="h-4 w-4" />
                )}
                {primaryLabel}
              </Link>
            </Button>
          </div>

          {/* Quick Links Section */}
          <div className="mt-12 rounded-2xl border border-border bg-card/60 p-6 text-left shadow-sm backdrop-blur-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Suggested Destinations
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-color-brand hover:bg-surface-hover hover:shadow-xs"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-brand transition-colors group-hover:bg-brand group-hover:text-primary-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground group-hover:text-brand">
                        {link.title}
                      </div>
                      <div className="mt-0.5 text-xs text-text-secondary line-clamp-1">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-muted">
        InterviewAI • AI-powered interview practice &amp; assessment platform
      </footer>
    </div>
  );
}
