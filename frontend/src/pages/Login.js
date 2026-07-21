import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto px-6 pt-32 pb-16">
        <div className="border border-white/10 p-8 bg-card">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <CarFront className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black tracking-tighter">Welcome back</span>
          </div>
          <h1 className="font-display font-black text-3xl tracking-tighter">Sign in to continue.</h1>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            One-click sign in with your Google account. Manage bookings, invoices and rentals in one place.
          </p>
          <Button
            onClick={handleLogin}
            data-testid="google-signin-btn"
            className="w-full h-12 mt-8 rounded-full bg-white text-black hover:bg-white/90 lift font-semibold"
          >
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            By continuing you agree to RevvCars' Terms & Privacy.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
