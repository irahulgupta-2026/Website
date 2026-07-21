import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, INR } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { CarFront, Calendar, MapPin, Clock, User } from "lucide-react";

const CITIES = ["Delhi", "Mumbai", "Bangalore"];

function isoLocal(d) {
  return d.toISOString().slice(0, 16);
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    pickup_city: "Delhi",
    pickup_location: "",
    pickup_datetime: isoLocal(new Date(Date.now() + 2 * 3600 * 1000)),
    drop_datetime: isoLocal(new Date(Date.now() + 26 * 3600 * 1000)),
  });
  const [quote, setQuote] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/cars/${id}`).then(({ data }) => setCar(data)).catch(() => navigate("/cars"));
  }, [id, navigate]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customer_email: f.customer_email || user.email,
        customer_name: f.customer_name || user.name,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!car) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await api.post("/bookings/quote", { ...form, car_id: id, customer_email: form.customer_email || "guest@example.com", customer_name: form.customer_name || "Guest", customer_phone: form.customer_phone || "0000000000" });
        setQuote(data);
      } catch {
        setQuote(null);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [form.pickup_datetime, form.drop_datetime, car, id]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: booking } = await api.post("/bookings", { ...form, car_id: id });
      toast.success("Booking created — proceed to checkout.");
      navigate(`/checkout/${booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Couldn't create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!car) return <div className="min-h-screen bg-background"><Navbar /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <p className="overline text-primary">Step 1 of 2</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2 mb-10">
          Confirm your <span className="text-primary">booking</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10">
          <form onSubmit={submit} className="border border-white/10 p-6 md:p-8 bg-card space-y-6" data-testid="booking-form">
            <div>
              <p className="overline text-muted-foreground mb-4 flex items-center gap-1.5"><User className="w-3 h-3" />Personal Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Full Name *</label>
                  <Input data-testid="booking-name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Rahul Verma" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Phone *</label>
                  <Input data-testid="booking-phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="+91 ..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground block mb-1.5">Email *</label>
                  <Input data-testid="booking-email" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} placeholder="you@example.com" />
                </div>
              </div>
            </div>

            <div>
              <p className="overline text-muted-foreground mb-4 flex items-center gap-1.5"><MapPin className="w-3 h-3" />Pickup</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">City</label>
                  <Select value={form.pickup_city} onValueChange={(v) => setForm({ ...form, pickup_city: v })}>
                    <SelectTrigger data-testid="booking-city"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Location / Address</label>
                  <Input data-testid="booking-location" value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} placeholder="Doorstep delivery available" />
                </div>
              </div>
            </div>

            <div>
              <p className="overline text-muted-foreground mb-4 flex items-center gap-1.5"><Calendar className="w-3 h-3" />Dates</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Pickup date & time</label>
                  <Input type="datetime-local" data-testid="booking-pickup-dt" value={form.pickup_datetime} onChange={(e) => setForm({ ...form, pickup_datetime: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Drop date & time</label>
                  <Input type="datetime-local" data-testid="booking-drop-dt" value={form.drop_datetime} onChange={(e) => setForm({ ...form, drop_datetime: e.target.value })} />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              data-testid="proceed-checkout"
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold lift"
            >
              {submitting ? "Creating booking..." : "Proceed to Checkout →"}
            </Button>
          </form>

          {/* Summary card */}
          <aside className="lg:sticky lg:top-24 self-start border border-white/10 p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <CarFront className="w-5 h-5 text-primary" />
              <p className="overline text-muted-foreground">Your ride</p>
            </div>
            <div className="aspect-[16/10] overflow-hidden mb-4 border border-white/10">
              <img src={car.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="font-display font-bold text-2xl">{car.brand} {car.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{car.category} · {car.transmission} · {car.fuel}</p>

            <div className="mt-6 space-y-2 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>{INR(car.price_per_day)} / day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</span>
                <span>{quote?.days || 1} day(s)</span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4 flex items-baseline justify-between">
              <span className="overline text-muted-foreground">Total</span>
              <span className="font-display font-black text-3xl text-primary" data-testid="quote-total">
                {INR(quote?.total_amount || car.price_per_day)}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
              All-inclusive: insurance, unlimited km, doorstep delivery. Refundable deposit collected at handover.
            </p>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
