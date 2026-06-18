import { useState } from "react";
import { Bookmark, BookmarkCheck, Calendar, Banknote, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useServerFn } from "@tanstack/react-start";
import { getAiInsight } from "@/lib/ai-insight.functions";
import { toast } from "sonner";
import { computeMatch, type MatchProfile, type MatchScholarship } from "@/lib/matcher";

interface Scholarship extends MatchScholarship {
  provider: string;
  amount: number;
  deadline: string;
  description: string;
  eligibility: string;
}

interface Props {
  scholarship: Scholarship;
  profile: MatchProfile | null;
  saved: boolean;
  onToggleSave: () => void;
}

export function ScholarshipCard({ scholarship, profile, saved, onToggleSave }: Props) {
  const { score, reasons } = computeMatch(profile, scholarship);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const aiInsight = useServerFn(getAiInsight);

  const handleInsight = async () => {
    setLoading(true);
    try {
      const r = await aiInsight({ data: { scholarshipId: scholarship.id } });
      setInsight(r.insight);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to get AI insight");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : "text-muted-foreground";
  const deadline = new Date(scholarship.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);

  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{scholarship.provider}</div>
          <h3 className="mt-1 truncate text-lg font-semibold">{scholarship.name}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleSave} aria-label={saved ? "Remove saved" : "Save"}>
          {saved ? <BookmarkCheck className="h-5 w-5 text-accent" /> : <Bookmark className="h-5 w-5" />}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(scholarship.tags ?? []).slice(0, 4).map((t) => (
          <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
        ))}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{scholarship.description}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-accent" />RM {Number(scholarship.amount).toLocaleString()}</div>
        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />{daysLeft > 0 ? `${daysLeft} days left` : "Closed"}</div>
      </div>

      <div className="mt-4 rounded-lg border bg-secondary/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Match score</span>
          <span className={`text-lg font-bold ${scoreColor}`}>{score}%</span>
        </div>
        <Progress value={score} className="mt-2 h-1.5" />
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {reasons.slice(0, 2).map((r, i) => <li key={i}>• {r}</li>)}
        </ul>
      </div>

      {insight ? (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent-foreground"><Sparkles className="h-3.5 w-3.5" /> AI insight</div>
          {insight}
        </div>
      ) : (
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handleInsight} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
          {loading ? "Thinking…" : "Why this scholarship?"}
        </Button>
      )}
    </div>
  );
}
