import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, INR } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data))
      .catch(() => navigate("/cars"));
  }, [bookingId, navigate]);

  const pay = async () => {
    setRedirecting(true);
    try {
      const origin_url = window.location.origin;
      const { data } = await api.post("/payments/checkout", { booking_id: bookingId, origin_url });
      window.location.href = data.checkout_url;
    } catch (err) {
      toast.error("Payment initialization failed.");
      setRedirecting(false);
    }
  };

  if (!booking) return <div className="min-h-screen"><Navbar /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <p className="overline text-primary">Step 2 of 2</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2 mb-10">
          Secure <span className="text-primary">checkout</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div className="border border-white/10 p-6 md:p-8 bg-card">
            <p className="overline text-muted-foreground mb-4">Booking Summary</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-muted-foreground">Car</span>
                <span className="font-medium">{booking.car_name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium">{booking.pickup_city}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-muted-foreground">Pickup</span>
                <span className="font-mono text-xs">{booking.pickup_datetime.replace("T", " ").slice(0, 16)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-muted-foreground">Drop</span>
                <span className="font-mono text-xs">{booking.drop_datetime.replace("T", " ").slice(0, 16)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-muted-foreground">Days</span>
                <span>{booking.days}</span>
              </div>
              <div className="flex items-baseline justify-between pt-3">
                <span className="overline text-muted-foreground">Total</span>
                <span className="font-display font-black text-3xl text-primary" data-testid="checkout-total">{INR(booking.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="border border-white/10 p-6 md:p-8 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-primary" />
              <span className="overline text-muted-foreground">Secured by Stripe</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              You'll be redirected to Stripe's secure checkout to complete payment.
              Test card: <span className="font-mono text-white/80">4242 4242 4242 4242</span>, any future date, any CVC.
            </p>

            <div className="space-y-2 text-xs text-muted-foreground mb-6">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary" /> 256-bit SSL encryption</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary" /> Instant booking confirmation</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary" /> Free cancellation up to 24h prior</div>
            </div>

            <Button
              onClick={pay}
              disabled={redirecting}
              data-testid="pay-now-btn"
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold lift"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {redirecting ? "Redirecting to Stripe..." : `Pay ${INR(booking.total_amount)}`}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
