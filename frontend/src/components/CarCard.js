import { Link } from "react-router-dom";
import { Users, Fuel, Cog, ArrowRight } from "lucide-react";
import { INR } from "@/lib/api";

export default function CarCard({ car, index = 0 }) {
  return (
    <Link
      to={`/cars/${car.id}`}
      data-testid={`car-card-${car.id}`}
      className="group block relative overflow-hidden border border-white/10 bg-card hover:border-primary/50 lift"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="aspect-[16/10] overflow-hidden bg-black">
        <img
          src={car.image_url}
          alt={`${car.brand} ${car.name}`}
          className="w-full h-full object-cover"
          style={{ transition: "transform 0.4s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      <div className="p-5 border-t border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="overline text-muted-foreground">{car.category}</p>
            <h3 className="font-display text-xl font-bold mt-1">
              {car.brand} <span className="text-primary">{car.name}</span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">starts at</p>
            <p className="font-display font-black text-xl">{INR(car.price_per_day)}</p>
            <p className="text-xs text-muted-foreground">/day</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {car.seats}</span>
          <span className="flex items-center gap-1.5"><Cog className="w-3.5 h-3.5" /> {car.transmission}</span>
          <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> {car.fuel}</span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-muted-foreground">
            {(car.features || []).slice(0, 2).join(" · ") || "Premium features"}
          </span>
          <span
            className="flex items-center gap-1 text-sm font-medium group-hover:text-primary"
            style={{ transition: "color 0.2s ease" }}
          >
            Book <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
