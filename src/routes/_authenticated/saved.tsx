import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved scholarships — SmartScholar AI" }] }),
  component: SavedPage,
});

function SavedPage() {
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["saved", user.id],
    queryFn: async () => {
      const [p, sv] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("saved_scholarships").select("scholarship_id, scholarships(*)").eq("user_id", user.id),
      ]);
      const list = (sv.data ?? []).map((r: any) => r.scholarships).filter(Boolean);
      return { profile: p.data, list };
    },
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("saved_scholarships").delete().eq("user_id", user.id).eq("scholarship_id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["saved"] });
    qc.invalidateQueries({ queryKey: ["browse"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved scholarships</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your bookmarked opportunities.</p>
      </div>
      {isLoading || !data ? (
        <div className="py-20 text-center text-muted-foreground">Loading…</div>
      ) : data.list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">You haven't saved any scholarships yet.</p>
          <Link to="/scholarships"><Button className="mt-4">Browse scholarships</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.list.map((s: any) => (
            <ScholarshipCard key={s.id} scholarship={s} profile={data.profile} saved onToggleSave={() => remove(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
