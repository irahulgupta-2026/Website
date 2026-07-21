import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const CITIES = ["Delhi", "Mumbai", "Bangalore"];

function nowRounded(offsetHours = 2) {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function SearchWidget({ inline = false }) {
  const navigate = useNavigate();
  const [city, setCity] = useState("Delhi");
  const [pickup, setPickup] = useState(nowRounded(2));
  const [drop, setDrop] = useState(nowRounded(26));

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ city, pickup, drop });
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      data-testid="search-widget"
      className={`glass p-5 md:p-6 border border-white/15 ${
        inline ? "" : "shadow-2xl"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="overline text-muted-foreground flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3" /> Pickup City
          </label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger data-testid="search-city" className="bg-black/40 border-white/10 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c} data-testid={`city-${c.toLowerCase()}`}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="overline text-muted-foreground flex items-center gap-1.5 mb-2">
            <CalendarDays className="w-3 h-3" /> Pickup
          </label>
          <Input
            type="datetime-local"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            data-testid="search-pickup"
            className="bg-black/40 border-white/10 h-11"
          />
        </div>

        <div>
          <label className="overline text-muted-foreground flex items-center gap-1.5 mb-2">
            <CalendarDays className="w-3 h-3" /> Drop
          </label>
          <Input
            type="datetime-local"
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            data-testid="search-drop"
            className="bg-black/40 border-white/10 h-11"
          />
        </div>

        <div className="flex items-end">
          <Button
            type="submit"
            data-testid="search-submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground lift font-semibold"
          >
            <Search className="w-4 h-4 mr-2" /> Search Cars
          </Button>
        </div>
      </div>
    </form>
  );
}
