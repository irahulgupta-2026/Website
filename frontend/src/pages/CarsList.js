import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const CITIES = ["All", "Asansol"];
const CATEGORIES = ["all", "hatchback", "sedan", "suv", "muv", "luxury"];
const TRANS = ["all", "manual", "automatic"];
const FUELS = ["all", "petrol", "diesel", "electric", "hybrid"];

export default function CarsList() {
  const [search] = useSearchParams();
  const initialCity = search.get("city") || "Asansol";
  const [cars, setCars] = useState([]);
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState("all");
  const [trans, setTrans] = useState("all");
  const [fuel, setFuel] = useState("all");
  const [maxPrice, setMaxPrice] = useState([15000]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (city !== "All") params.city = city;
    if (category !== "all") params.category = category;
    if (trans !== "all") params.transmission = trans;
    if (fuel !== "all") params.fuel = fuel;
    if (maxPrice[0] < 15000) params.max_price = maxPrice[0];
    api.get("/cars", { params })
      .then(({ data }) => setCars(data))
      .finally(() => setLoading(false));
  }, [city, category, trans, fuel, maxPrice]);

  const count = useMemo(() => cars.length, [cars]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <p className="overline text-muted-foreground">Browse fleet</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2">
            {count} cars available <span className="text-primary">in {city}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 self-start border border-white/10 p-5 bg-card space-y-5 h-fit" data-testid="filters-panel">
            <div>
              <label className="overline text-muted-foreground block mb-2">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger data-testid="filter-city"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="overline text-muted-foreground block mb-2">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="filter-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="overline text-muted-foreground block mb-2">Transmission</label>
              <Select value={trans} onValueChange={setTrans}>
                <SelectTrigger data-testid="filter-transmission"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRANS.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="overline text-muted-foreground block mb-2">Fuel</label>
              <Select value={fuel} onValueChange={setFuel}>
                <SelectTrigger data-testid="filter-fuel"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FUELS.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="overline text-muted-foreground">Max ₹/day</label>
                <span className="font-mono text-sm">₹{maxPrice[0].toLocaleString("en-IN")}</span>
              </div>
              <Slider
                data-testid="filter-price"
                value={maxPrice}
                onValueChange={setMaxPrice}
                min={1000}
                max={15000}
                step={500}
              />
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 border border-white/10 bg-card animate-pulse" />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="border border-white/10 p-16 text-center">
                <p className="text-muted-foreground">No cars match your filters. Try relaxing them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cars.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
