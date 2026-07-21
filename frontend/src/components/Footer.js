import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";

const LOGO_URL = "https://customer-assets-rejwkqb3.emergentagent.net/job_auto-reserve-64/artifacts/k74x985u_project_20260720_1023503-01.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={LOGO_URL} alt="Arya Travels" className="h-12 w-12 object-contain" />
            <span className="font-display font-black text-lg tracking-tighter">
              ARYA <span className="text-primary">TRAVELS</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            Modern self-drive & chauffeur car rentals by Arya Travels. Zero paperwork,
            transparent pricing, doorstep delivery in Delhi, Mumbai, and Bangalore.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <a href="#" data-testid="social-ig" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 lift"><Instagram className="w-4 h-4" /></a>
            <a href="#" data-testid="social-tw" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 lift"><Twitter className="w-4 h-4" /></a>
            <a href="#" data-testid="social-fb" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 lift"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <p className="overline text-muted-foreground mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/cars" className="hover:text-primary transition-colors">Browse Cars</Link></li>
            <li><a href="/#how" className="hover:text-primary transition-colors">How it Works</a></li>
            <li><a href="/#why" className="hover:text-primary transition-colors">Why Us</a></li>
            <li><a href="/#faq" className="hover:text-primary transition-colors">FAQ</a></li>
          </ul>
        </div>

        <div>
          <p className="overline text-muted-foreground mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5" /> +91 98765 43210</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5" /> hello@aryatravels.in</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> Delhi · Mumbai · Bangalore</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© 2026 RevvCars. All rights reserved.</span>
        <span className="font-mono">v1.0 · Made with ⚡ in India</span>
      </div>
    </footer>
  );
}
