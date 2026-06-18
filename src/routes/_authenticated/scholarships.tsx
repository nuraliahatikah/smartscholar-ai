import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { computeMatch } from "@/lib/matcher";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/scholarships")({
  head: () => ({ meta: [{ title: "Scholarships — SmartScholar AI" }] }),
  component: ScholarshipsPage,
});

function ScholarshipsPage() {
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["browse", user.id],
    queryFn: async () => {
      const [p, s, sv] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("scholarships").select("*"),
        supabase.from("saved_scholarships").select("scholarship_id").eq("user_id", user.id),
      ]);
      return { profile: p.data, list: s.data ?? [], saved: new Set((sv.data ?? []).map((r) => r.scholarship_id)) };
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.toLowerCase().trim();
    const items = term
      ? data.list.filter((s) =>
          [s.name, s.provider, s.description, s.eligibility, ...(s.tags ?? [])].join(" ").toLowerCase().includes(term))
      : data.list;
    return items
      .map((s) => ({ s, m: computeMatch(data.profile, s) }))
      .sort((a, b) => b.m.score - a.m.score)
      .map((x) => x.s);
  }, [data, q]);

  const toggleSave = async (id: string, currentlySaved: boolean) => {
    if (currentlySaved) {
      const { error } = await supabase.from("saved_scholarships").delete().eq("user_id", user.id).eq("scholarship_id", id);
      if (error) return toast.error(error.message);
      toast.success("Removed");
    } else {
      const { error } = await supabase.from("saved_scholarships").insert({ user_id: user.id, scholarship_id: id });
      if (error) return toast.error(error.message);
      toast.success("Saved");
    }
    qc.invalidateQueries({ queryKey: ["browse"] });
    qc.invalidateQueries({ queryKey: ["saved"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scholarships</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ranked by match against your profile.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, provider, or tag…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {isLoading || !data ? (
        <div className="py-20 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No scholarships match your search.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              profile={data.profile}
              saved={data.saved.has(s.id)}
              onToggleSave={() => toggleSave(s.id, data.saved.has(s.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
