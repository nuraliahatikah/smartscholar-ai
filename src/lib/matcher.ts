export interface MatchProfile {
  cgpa: number | null;
  course: string | null;
  household_income: number | null;
  interests: string[] | null;
}

export interface MatchScholarship {
  id: string;
  name: string;
  min_cgpa: number | null;
  max_household_income: number | null;
  tags: string[] | null;
}

export interface MatchResult {
  score: number; // 0..100
  reasons: string[];
}

export function computeMatch(profile: MatchProfile | null, s: MatchScholarship): MatchResult {
  if (!profile) return { score: 50, reasons: ["Complete your profile to see a personalized match score."] };

  let score = 60; // baseline
  const reasons: string[] = [];

  // CGPA
  if (s.min_cgpa != null && profile.cgpa != null) {
    if (profile.cgpa >= s.min_cgpa) {
      const bonus = Math.min(20, Math.round((profile.cgpa - s.min_cgpa) * 25) + 10);
      score += bonus;
      reasons.push(`Your CGPA of ${profile.cgpa.toFixed(2)} meets the ${s.min_cgpa.toFixed(2)} minimum.`);
    } else {
      score -= 25;
      reasons.push(`CGPA ${profile.cgpa.toFixed(2)} is below the ${s.min_cgpa.toFixed(2)} requirement.`);
    }
  }

  // Income
  if (s.max_household_income != null && profile.household_income != null) {
    if (profile.household_income <= s.max_household_income) {
      score += 10;
      reasons.push(`Your household income qualifies under the cap.`);
    } else {
      score -= 15;
      reasons.push(`Household income exceeds the eligibility cap.`);
    }
  }

  // Interest / tag overlap
  const tags = (s.tags || []).map((t) => t.toLowerCase());
  const interests = (profile.interests || []).map((i) => i.toLowerCase());
  const course = (profile.course || "").toLowerCase();
  const overlap = tags.filter((t) => interests.some((i) => i.includes(t) || t.includes(i)) || course.includes(t) || t.includes(course));
  if (overlap.length) {
    score += Math.min(15, overlap.length * 5);
    reasons.push(`Matches your interests in ${overlap.slice(0, 3).join(", ")}.`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (!reasons.length) reasons.push("General eligibility based on your profile.");
  return { score, reasons };
}
