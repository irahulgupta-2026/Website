import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  const [params] = useSearchParams();
  const bookingId = params.get("booking_id");
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
        <div className="border border-white/10 p-10 bg-card">
          <XCircle className="w-12 h-12 text-destructive mb-4" />
          <h1 className="font-display font-black text-4xl tracking-tighter">Payment cancelled.</h1>
          <p className="text-muted-foreground mt-3">
            No charges were made. Your booking is still saved — you can complete payment anytime.
          </p>
          <div className="mt-8 flex gap-3">
            {bookingId && (
              <Link to={`/checkout/${bookingId}`}>
                <Button className="rounded-full bg-primary">Retry checkout</Button>
              </Link>
            )}
            <Link to="/cars">
              <Button variant="outline" className="rounded-full border-white/15">Browse other cars</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
