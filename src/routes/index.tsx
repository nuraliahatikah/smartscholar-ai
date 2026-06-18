import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles, Target, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartScholar AI — Find scholarships that match you" },
      { name: "description", content: "AI-powered scholarship recommendations based on your academic profile. Discover, match, and save scholarships in one place." },
      { property: "og:title", content: "SmartScholar AI" },
      { property: "og:description", content: "AI-powered scholarship recommendations for students." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">SmartScholar <span className="text-brand-gradient">AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/auth"><Button>Get started</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> AI-powered scholarship matching
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
          Find scholarships <br /> built <span className="text-brand-gradient">around your profile</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Tell us about your studies — we'll rank scholarships you actually qualify for and explain why.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth"><Button size="lg" className="bg-brand-gradient text-primary-foreground">Create free account</Button></Link>
          <Link to="/scholarships"><Button size="lg" variant="outline">Browse scholarships</Button></Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Smart match scores", desc: "Every scholarship is ranked by how well it fits your CGPA, course and background." },
            { icon: Sparkles, title: "AI explanations", desc: "Understand exactly why a scholarship was recommended in plain language." },
            { icon: BookmarkCheck, title: "Save & track", desc: "Bookmark the ones that matter and never miss a deadline." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © 2026 SmartScholar AI
      </footer>
    </div>
  );
}
