import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import CarCard from "@/components/CarCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  Wallet,
  Clock3,
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1758223725140-3855ec687a16?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBzdXYlMjBkcml2aW5nJTIwY2l0eXxlbnwwfHx8fDE3ODQ2NDcyODh8MA&ixlib=rb-4.1.0&q=85";

const HOW_STEPS = [
  { icon: MapPin, title: "Pick location & dates", body: "Choose from 3 cities, set your pickup and drop times." },
  { icon: KeyRound, title: "Select your ride", body: "From nimble hatchbacks to luxury sedans — pick what fits." },
  { icon: Wallet, title: "Confirm & pay", body: "Secure checkout via Stripe. Instant confirmation." },
  { icon: Sparkles, title: "Drive away", body: "Doorstep delivery. Zero paperwork. Total freedom." },
];

const WHY = [
  { icon: ShieldCheck, title: "Fully Insured", body: "Comprehensive insurance on every kilometer, every trip." },
  { icon: Clock3, title: "24×7 Roadside", body: "Round-the-clock support and roadside assistance across India." },
  { icon: Wallet, title: "Transparent Pricing", body: "No hidden fees. What you see at checkout is what you pay." },
  { icon: Sparkles, title: "Sanitised Fleet", body: "Every car deep-cleaned & sanitised between rentals." },
];

const TESTIMONIALS = [
  { name: "Aarav S.", city: "Delhi", stars: 5, body: "Booked a Creta for a Rajasthan road trip. Pickup was on time and the car was spotless. Will book again." },
  { name: "Priya M.", city: "Mumbai", stars: 5, body: "The self-drive Fortuner made our Lonavala weekend perfect. Insurance clarity was a big plus." },
  { name: "Rohit K.", city: "Bangalore", stars: 5, body: "As a startup founder, I use Arya Travels weekly. Instant checkout, doorstep delivery, no fuss." },
];

const FAQS = [
  { q: "Do I need to submit any documents?", a: "Yes — a driving licence and one government ID. Upload happens once, then you're set for future bookings." },
  { q: "Is fuel included?", a: "No. You start and return the car with the same fuel level. All wear-and-tear is on us." },
  { q: "Can I extend my booking?", a: "Absolutely — extend from the app up to 2 hours before drop. Subject to availability." },
  { q: "Is there a security deposit?", a: "A refundable deposit of ₹3,000–₹10,000 depending on the car, refunded within 48 hours of return." },
  { q: "Which cities are you available in?", a: "Delhi, Mumbai and Bangalore — with more cities launching soon." },
];

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "", city: "Delhi", requirement: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/cars").then(({ data }) => setFeatured(data.slice(0, 6))).catch(() => {});
  }, []);

  const submitLead = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !leadForm.phone) {
      toast.error("Please fill in name, email and phone.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/leads", { ...leadForm, source: "landing" });
      toast.success("Thanks! Our team will reach out shortly.");
      setLeadForm({ name: "", email: "", phone: "", city: "Delhi", requirement: "" });
    } catch {
      toast.error("Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-[92vh] max-h-[820px] w-full">
          <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 noise" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center pt-10">
            <div className="max-w-3xl">
              <p className="overline text-primary mb-5" data-testid="hero-eyebrow">
                Self-drive · Chauffeur · Monthly subscriptions
              </p>
              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter">
                Drive on
                <br />
                <span className="text-primary">your terms.</span>
              </h1>
              <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
                Premium self-drive rentals across Delhi, Mumbai & Bangalore. Book in
                60 seconds. Doorstep delivery. Zero paperwork.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/cars">
                  <Button data-testid="hero-cta-browse" className="rounded-full bg-white text-black hover:bg-white/90 lift h-12 px-6 font-semibold">
                    Browse cars <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#lead" className="text-sm text-white/70 hover:text-white transition-colors" data-testid="hero-cta-lead">
                  Or talk to sales →
                </a>
              </div>
            </div>

            <div className="mt-12 max-w-5xl">
              <SearchWidget />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CARS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="overline text-muted-foreground">The fleet</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2">
              Pick your <span className="text-primary">weapon of choice.</span>
            </h2>
          </div>
          <Link to="/cars" className="hidden md:flex items-center gap-1 text-sm text-primary hover:underline" data-testid="see-all-cars">
            See all cars <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="overline text-muted-foreground">Process</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2 mb-14">
            Four steps. That's it.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="border border-white/10 p-6 bg-card lift">
                <div className="flex items-start justify-between mb-6">
                  <s.icon className="w-8 h-8 text-primary" />
                  <span className="font-mono text-muted-foreground text-sm">0{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="py-24 border-t border-white/10 bg-gradient-to-b from-transparent to-black/60">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="overline text-muted-foreground">Why Arya Travels</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2">
              Built for people who <span className="text-primary">actually drive.</span>
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              We built Arya Travels because renting a car in India shouldn't feel like a bank loan.
              Transparent, tech-first, human-supported.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY.map((w, i) => (
              <div key={i} className="border border-white/10 p-5 bg-card">
                <w.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-display font-bold text-lg mb-1">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="overline text-muted-foreground">Word on the street</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2 mb-14">
            5-star trips, all-star customers.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-white/10 p-6 bg-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-white/90 leading-relaxed mb-6">"{t.body}"</p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-display font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE */}
      <section id="lead" className="py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <p className="overline text-muted-foreground">Talk to us</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2">
              Corporate, wedding or long-term needs?
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              Bulk bookings, monthly subscriptions or fleet-for-events — drop us your
              requirement and we'll craft a plan for you in 24 hours.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="border border-white/10 p-4">
                <p className="font-display font-black text-3xl text-primary">18k+</p>
                <p className="text-xs text-muted-foreground mt-1">Bookings</p>
              </div>
              <div className="border border-white/10 p-4">
                <p className="font-display font-black text-3xl text-primary">4.8★</p>
                <p className="text-xs text-muted-foreground mt-1">Avg rating</p>
              </div>
              <div className="border border-white/10 p-4">
                <p className="font-display font-black text-3xl text-primary">24×7</p>
                <p className="text-xs text-muted-foreground mt-1">Support</p>
              </div>
            </div>
          </div>

          <form onSubmit={submitLead} className="border border-white/10 p-8 bg-card" data-testid="lead-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="overline text-muted-foreground block mb-2">Name</label>
                <Input data-testid="lead-name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <label className="overline text-muted-foreground block mb-2">Phone</label>
                <Input data-testid="lead-phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="+91 ..." />
              </div>
              <div className="sm:col-span-2">
                <label className="overline text-muted-foreground block mb-2">Email</label>
                <Input data-testid="lead-email" type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="you@company.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="overline text-muted-foreground block mb-2">City</label>
                <Input data-testid="lead-city" value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })} placeholder="Delhi / Mumbai / Bangalore" />
              </div>
              <div className="sm:col-span-2">
                <label className="overline text-muted-foreground block mb-2">Requirement</label>
                <Textarea data-testid="lead-req" rows={4} value={leadForm.requirement} onChange={(e) => setLeadForm({ ...leadForm, requirement: e.target.value })} placeholder="Tell us what you're planning..." />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              data-testid="lead-submit"
              className="w-full mt-6 h-12 rounded-full bg-primary hover:bg-primary/90 text-white lift font-semibold"
            >
              {submitting ? "Sending..." : "Get a callback"}
            </Button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="overline text-muted-foreground">Questions</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mt-2 mb-10">
            Everything you were wondering.
          </h2>
          <Accordion type="single" collapsible data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} data-testid={`faq-${i}`}>
                <AccordionTrigger className="text-left font-display text-lg">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
