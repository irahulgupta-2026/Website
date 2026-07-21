import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://customer-assets-rejwkqb3.emergentagent.net/job_auto-reserve-64/artifacts/k74x985u_project_20260720_1023503-01.png";

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
          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_URL} alt="Arya Travels" className="h-12 w-12 object-contain" />
            <span className="font-display font-black tracking-tighter">Welcome back</span>
          </div>
          <h1 className="font-display font-black text-3xl tracking-tighter">Sign in to continue.</h1>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            One-click sign in with your Google account. Manage bookings, invoices and rentals in one place.
          </p>
          <Button
            onClick={handleLogin}
            data-testid="google-signin-btn"
            className="w-full h-12 mt-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 lift font-semibold"
          >
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            By continuing you agree to Arya Travels' Terms & Privacy.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
