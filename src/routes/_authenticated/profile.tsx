import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — SmartScholar AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    university: "",
    course: "",
    cgpa: "",
    household_income: "",
    interests: "",
  });

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name ?? "",
        university: data.university ?? "",
        course: data.course ?? "",
        cgpa: data.cgpa?.toString() ?? "",
        household_income: data.household_income?.toString() ?? "",
        interests: (data.interests ?? []).join(", "),
      });
      setLoading(false);
    });
  }, [user.id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cgpa = form.cgpa ? parseFloat(form.cgpa) : null;
    if (cgpa != null && (isNaN(cgpa) || cgpa < 0 || cgpa > 4)) {
      setSaving(false); return toast.error("CGPA must be between 0 and 4");
    }
    const income = form.household_income ? parseFloat(form.household_income) : null;
    const interests = form.interests.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name.trim().slice(0, 100),
      university: form.university.trim().slice(0, 150) || null,
      course: form.course.trim().slice(0, 150) || null,
      cgpa, household_income: income, interests,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">This information is used to rank scholarships for you.</p>

      <form onSubmit={onSave} className="mt-6 space-y-5 rounded-xl border bg-card p-6">
        <Field label="Full name"><Input value={form.full_name} maxLength={100} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></Field>
        <Field label="University"><Input value={form.university} maxLength={150} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="e.g. Universiti Malaya" /></Field>
        <Field label="Course / Major"><Input value={form.course} maxLength={150} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. Computer Science" /></Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="CGPA (0–4)"><Input value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} placeholder="3.75" inputMode="decimal" /></Field>
          <Field label="Annual household income (RM)"><Input value={form.household_income} onChange={(e) => setForm({ ...form, household_income: e.target.value })} placeholder="60000" inputMode="numeric" /></Field>
        </div>
        <Field label="Interests (comma separated)">
          <Input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="STEM, Engineering, Leadership" />
        </Field>
        <Button type="submit" disabled={saving} className="bg-brand-gradient text-primary-foreground">{saving ? "Saving…" : "Save profile"}</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
