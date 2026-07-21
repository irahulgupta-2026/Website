import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, INR } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Cog, Fuel, Check, ArrowLeft } from "lucide-react";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cars/${id}`)
      .then(({ data }) => setCar(data))
      .catch(() => navigate("/cars"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-28">
          <div className="h-[480px] bg-card border border-white/10 animate-pulse" />
        </div>
      </div>
    );
  }
  if (!car) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <Link to="/cars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6" data-testid="back-to-list">
          <ArrowLeft className="w-4 h-4" /> Back to cars
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10">
          <div>
            <div className="aspect-[16/10] border border-white/10 overflow-hidden">
              <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
            </div>

            <div className="mt-10">
              <p className="overline text-primary">{car.category} · {car.brand}</p>
              <h1 className="font-display font-black text-5xl tracking-tighter mt-3">
                {car.brand} <span className="text-primary">{car.name}</span>
              </h1>
              <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">{car.description}</p>

              <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
                <div className="border border-white/10 p-4">
                  <Users className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Seats</p>
                  <p className="font-display font-bold">{car.seats}</p>
                </div>
                <div className="border border-white/10 p-4">
                  <Cog className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Transmission</p>
                  <p className="font-display font-bold capitalize">{car.transmission}</p>
                </div>
                <div className="border border-white/10 p-4">
                  <Fuel className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Fuel</p>
                  <p className="font-display font-bold capitalize">{car.fuel}</p>
                </div>
              </div>

              <div className="mt-10">
                <p className="overline text-muted-foreground mb-4">Features</p>
                <div className="flex flex-wrap gap-2">
                  {(car.features || []).map((f) => (
                    <Badge key={f} variant="outline" className="border-white/15 text-white/80 font-normal">
                      <Check className="w-3 h-3 mr-1 text-primary" /> {f}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky pricing card */}
          <aside className="lg:sticky lg:top-24 self-start border border-white/10 p-6 bg-card">
            <p className="overline text-muted-foreground">Starting at</p>
            <p className="font-display font-black text-5xl tracking-tighter mt-2">{INR(car.price_per_day)}
              <span className="text-sm text-muted-foreground font-normal ml-1">/day</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">or {INR(car.price_per_hour)} / hour</p>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-primary" /> Fully insured</div>
              <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-primary" /> Unlimited kilometres</div>
              <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-primary" /> Free doorstep delivery</div>
              <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-primary" /> 24×7 roadside assist</div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                onClick={() => navigate(`/book/${car.id}`)}
                data-testid="book-now-btn"
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground lift font-semibold"
              >
                Book this car
              </Button>
              <a href="/#lead" className="text-center text-sm text-muted-foreground hover:text-white transition-colors">
                Or request a callback →
              </a>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky mobile bar */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-40 glass border-t border-white/10 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Starts at</p>
          <p className="font-display font-black text-2xl">{INR(car.price_per_day)}<span className="text-xs text-muted-foreground font-normal ml-1">/day</span></p>
        </div>
        <Button
          onClick={() => navigate(`/book/${car.id}`)}
          data-testid="sticky-book-btn"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 font-semibold"
        >
          Book now
        </Button>
      </div>

      <Footer />
    </div>
  );
}
