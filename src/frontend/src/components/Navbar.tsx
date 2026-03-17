import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  LayoutDashboard,
  MapPin,
  Menu,
  Search,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navbar() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuth = !!identity;

  const navLinks = [
    { to: "/", label: "Home", ocid: "nav.home_link" },
    { to: "/tracking", label: "Track", ocid: "nav.tracking_link" },
    { to: "/report", label: "Report", ocid: "nav.report_link" },
    { to: "/search", label: "Search", ocid: "nav.search_link" },
    { to: "/dashboard", label: "Dashboard", ocid: "nav.dashboard_link" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            SafeTrack
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
              activeProps={{ className: "text-primary bg-primary/10" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isAuth ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 cursor-pointer" onClick={clear}>
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {identity.getPrincipal().toString().slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="hidden md:flex"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          )}
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                activeProps={{ className: "text-primary bg-primary/10" }}
              >
                {link.label === "Home" && <MapPin className="w-4 h-4" />}
                {link.label === "Track" && <Users className="w-4 h-4" />}
                {link.label === "Report" && (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {link.label === "Search" && <Search className="w-4 h-4" />}
                {link.label === "Dashboard" && (
                  <LayoutDashboard className="w-4 h-4" />
                )}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
