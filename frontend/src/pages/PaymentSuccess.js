import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("polling"); // polling | paid | failed | expired
  const [bookingId, setBookingId] = useState(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }
    let timer;
    const poll = async () => {
      attemptsRef.current += 1;
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        setBookingId(data.booking_id);
        if (data.payment_status === "paid") {
          setStatus("paid");
          return;
        }
        if (data.payment_status === "failed" || data.payment_status === "expired") {
          setStatus(data.payment_status);
          return;
        }
        if (attemptsRef.current >= 20) {
          setStatus("timeout");
          return;
        }
        timer = setTimeout(poll, 2000);
      } catch {
        timer = setTimeout(poll, 2500);
      }
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
        <div className="border border-white/10 p-10 bg-card text-left">
          {status === "polling" && (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <h1 className="font-display font-black text-3xl tracking-tighter">Confirming payment…</h1>
              <p className="text-muted-foreground mt-2">Hang tight, we're finalizing your booking.</p>
            </>
          )}
          {status === "paid" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-primary mb-4" data-testid="payment-success-icon" />
              <p className="overline text-primary">Confirmed</p>
              <h1 className="font-display font-black text-4xl tracking-tighter mt-2">Your ride is booked. 🎉</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                A confirmation has been sent to your email. Our team will call you 24 hours
                before pickup with delivery details.
              </p>
              <div className="mt-8 flex gap-3">
                <Link to="/dashboard">
                  <Button data-testid="view-bookings" className="rounded-full bg-primary hover:bg-primary/90">View my bookings</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="rounded-full border-white/15">Back home</Button>
                </Link>
              </div>
            </>
          )}
          {(status === "failed" || status === "expired" || status === "timeout") && (
            <>
              <XCircle className="w-12 h-12 text-destructive mb-4" />
              <h1 className="font-display font-black text-3xl tracking-tighter">Payment {status}</h1>
              <p className="text-muted-foreground mt-2">
                {status === "timeout"
                  ? "Payment is taking longer than expected. Check your dashboard."
                  : "Something went wrong. You can retry from your booking."}
              </p>
              {bookingId && (
                <Link to={`/checkout/${bookingId}`}>
                  <Button className="mt-6 rounded-full bg-primary">Retry payment</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
