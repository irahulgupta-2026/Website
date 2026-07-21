import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, setAdminToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@aryatravels.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/admin/login", { email, password });
      setAdminToken(data.token);
      toast.success("Welcome, admin");
      navigate("/admin");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto px-6 pt-32 pb-16">
        <form onSubmit={submit} className="border border-white/10 p-8 bg-card">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="overline text-muted-foreground">Admin</span>
          </div>
          <h1 className="font-display font-black text-3xl tracking-tighter">Sign in.</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin control panel access.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password" />
            </div>
          </div>

          <Button type="submit" disabled={busy} data-testid="admin-login-btn" className="w-full h-11 mt-6 rounded-full bg-primary">
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
