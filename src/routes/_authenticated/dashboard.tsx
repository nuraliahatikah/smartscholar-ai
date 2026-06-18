import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { computeMatch } from "@/lib/matcher";
import { Calendar, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SmartScholar AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext() as { user: { id: string } };

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user.id],
    queryFn: async () => {
      const [profileRes, scholarshipsRes, savedRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("scholarships").select("*").order("deadline", { ascending: true }),
        supabase.from("saved_scholarships").select("scholarship_id").eq("user_id", user.id),
      ]);
      return {
        profile: profileRes.data,
        scholarships: scholarshipsRes.data ?? [],
        savedIds: new Set((savedRes.data ?? []).map((r) => r.scholarship_id)),
      };
    },
  });

  if (isLoading || !data) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  const { profile, scholarships, savedIds } = data;
  const ranked = scholarships
    .map((s) => ({ s, m: computeMatch(profile, s) }))
    .sort((a, b) => b.m.score - a.m.score);
  const recommended = ranked.slice(0, 3);
  const upcoming = [...scholarships]
    .filter((s) => new Date(s.deadline).getTime() > Date.now())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const profileComplete = profile?.cgpa != null && profile?.course && profile?.university;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-brand-gradient p-6 text-primary-foreground md:p-8">
        <div className="text-sm/relaxed opacity-90">Welcome back</div>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">{profile?.full_name || "Student"}</h1>
        <p className="mt-2 max-w-xl text-white/85">
          {profileComplete
            ? "Your top scholarship matches are ranked below."
            : "Complete your profile to unlock personalized scholarship matches."}
        </p>
        {!profileComplete && (
          <Link to="/profile"><Button variant="secondary" className="mt-4">Complete profile <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5 text-accent" /> Recommended for you</h2>
            <Link to="/scholarships" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recommended.map(({ s, m }) => (
              <Link key={s.id} to="/scholarships" className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition hover:shadow-md">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.provider}</div>
                  <div className="truncate font-semibold">{s.name}</div>
                  <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">{m.reasons[0]}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${m.score >= 80 ? "text-success" : "text-primary"}`}>{m.score}%</div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><GraduationCap className="h-5 w-5 text-primary" /> Your profile</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="University" value={profile?.university} />
              <Row label="Course" value={profile?.course} />
              <Row label="CGPA" value={profile?.cgpa?.toString()} />
              <Row label="Saved" value={`${savedIds.size} scholarships`} />
            </dl>
            <Link to="/profile"><Button variant="outline" size="sm" className="mt-4 w-full">Edit profile</Button></Link>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Calendar className="h-5 w-5 text-accent" /> Upcoming deadlines</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {upcoming.map((s) => {
                const days = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / 86400000);
                return (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{s.name}</span>
                    <span className={`shrink-0 text-xs font-medium ${days <= 14 ? "text-destructive" : "text-muted-foreground"}`}>{days}d</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "—"}</dd>
    </div>
  );
}
