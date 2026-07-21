import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CarFront, LogOut, User as UserIcon, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" data-testid="brand-logo" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <CarFront className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-black text-lg tracking-tighter">
            ARYA <span className="text-primary">TRAVELS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/cars" data-testid="nav-cars" className="hover:text-white transition-colors">Browse Cars</Link>
          <a href="/#how" className="hover:text-white transition-colors" data-testid="nav-how">How it Works</a>
          <a href="/#why" className="hover:text-white transition-colors" data-testid="nav-why">Why Us</a>
          <a href="/#faq" className="hover:text-white transition-colors" data-testid="nav-faq">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="user-menu-trigger"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 lift"
                >
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm hidden sm:inline">{user.name?.split(" ")[0] || "Account"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="menu-dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> My Bookings
                </DropdownMenuItem>
                {user.is_admin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              data-testid="login-btn"
              className="rounded-full bg-white text-black hover:bg-white/90 lift"
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
