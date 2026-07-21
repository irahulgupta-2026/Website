import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, INR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Car as CarIcon } from "lucide-react";

const statusColor = {
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/bookings/me/list")
      .then(({ data }) => setBookings(data))
      .finally(() => setBusy(false));
  }, [user]);

  if (!user) return <div className="min-h-screen"><Navbar /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center gap-4 mb-10">
          {user.picture && <img src={user.picture} alt="" className="w-14 h-14 rounded-full border border-white/10" />}
          <div>
            <p className="overline text-muted-foreground">Welcome back</p>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tighter">
              {user.name?.split(" ")[0]}
            </h1>
          </div>
        </div>

        <div className="border border-white/10 p-1 bg-card">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <p className="overline text-muted-foreground">Your bookings</p>
            <Link to="/cars" className="text-xs text-primary hover:underline">+ New booking</Link>
          </div>

          {busy ? (
            <div className="p-10 text-muted-foreground">Loading…</div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center">
              <CarIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet.</p>
              <Link to="/cars">
                <Button className="mt-4 rounded-full bg-primary">Browse cars</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10" data-testid="bookings-list">
              {bookings.map((b) => (
                <div key={b.id} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="overline text-muted-foreground">Car</p>
                    <p className="font-display font-bold">{b.car_name}</p>
                  </div>
                  <div>
                    <p className="overline text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />City</p>
                    <p>{b.pickup_city}</p>
                  </div>
                  <div>
                    <p className="overline text-muted-foreground flex items-center gap-1"><CalendarClock className="w-3 h-3" />Dates</p>
                    <p className="text-sm font-mono">{b.pickup_datetime.slice(0, 10)} → {b.drop_datetime.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-black text-lg">{INR(b.total_amount)}</p>
                    <div className="flex gap-2 justify-end mt-1">
                      <Badge className={`${statusColor[b.status] || "bg-white/10"} border`}>{b.status}</Badge>
                      <Badge variant="outline" className="border-white/15 capitalize">{b.payment_status}</Badge>
                    </div>
                    {b.payment_status !== "paid" && (
                      <Link to={`/checkout/${b.id}`}>
                        <Button size="sm" className="mt-2 rounded-full bg-primary text-xs h-7">Pay now</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
