import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, Search, Bookmark, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scholarships", label: "Scholarships", icon: Search },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold">SmartScholar <span className="text-brand-gradient">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                pathname === l.to ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")}>
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
      </div>
      <nav className="flex justify-around border-t md:hidden">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={cn("flex flex-1 flex-col items-center gap-1 py-2 text-xs",
            pathname === l.to ? "text-primary" : "text-muted-foreground")}>
            <l.icon className="h-4 w-4" />{l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
