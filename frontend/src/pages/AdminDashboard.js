import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { adminApi, getAdminToken, setAdminToken, INR } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, ShieldCheck, Car, Users, MessageSquare, Wallet } from "lucide-react";

const emptyCar = {
  name: "", brand: "", category: "sedan", transmission: "automatic", fuel: "petrol",
  seats: 5, price_per_day: 1999, price_per_hour: 199, image_url: "", features: [],
  cities: ["Asansol"], description: "", active: true,
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-white/10 p-5 bg-card">
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 text-primary" />
        <span className="overline text-muted-foreground">{label}</span>
      </div>
      <p className="font-display font-black text-3xl mt-3">{value}</p>
    </div>
  );
}

function CarForm({ initial, onSave, onClose }) {
  const [c, setC] = useState({ ...emptyCar, ...(initial || {}), features: (initial?.features || []).join(", "), cities: (initial?.cities || ["Asansol"]).join(", ") });
  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...c,
      seats: Number(c.seats),
      price_per_day: Number(c.price_per_day),
      price_per_hour: Number(c.price_per_hour),
      features: String(c.features).split(",").map((x) => x.trim()).filter(Boolean),
      cities: String(c.cities).split(",").map((x) => x.trim()).filter(Boolean),
      active: !!c.active,
    };
    await onSave(payload);
    onClose();
  };

  return (
    <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div><label className="text-xs text-muted-foreground">Brand</label><Input value={c.brand} onChange={(e) => set("brand", e.target.value)} required /></div>
      <div><label className="text-xs text-muted-foreground">Name</label><Input value={c.name} onChange={(e) => set("name", e.target.value)} required /></div>
      <div>
        <label className="text-xs text-muted-foreground">Category</label>
        <Select value={c.category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["hatchback","sedan","suv","muv","luxury"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Transmission</label>
        <Select value={c.transmission} onValueChange={(v) => set("transmission", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["manual","automatic"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Fuel</label>
        <Select value={c.fuel} onValueChange={(v) => set("fuel", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["petrol","diesel","electric","hybrid"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><label className="text-xs text-muted-foreground">Seats</label><Input type="number" value={c.seats} onChange={(e) => set("seats", e.target.value)} /></div>
      <div><label className="text-xs text-muted-foreground">Price/day (INR)</label><Input type="number" value={c.price_per_day} onChange={(e) => set("price_per_day", e.target.value)} /></div>
      <div><label className="text-xs text-muted-foreground">Price/hour (INR)</label><Input type="number" value={c.price_per_hour} onChange={(e) => set("price_per_hour", e.target.value)} /></div>
      <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Image URL</label><Input value={c.image_url} onChange={(e) => set("image_url", e.target.value)} required /></div>
      <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Features (comma separated)</label><Input value={c.features} onChange={(e) => set("features", e.target.value)} /></div>
      <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Cities (comma separated)</label><Input value={c.cities} onChange={(e) => set("cities", e.target.value)} /></div>
      <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Description</label><Textarea value={c.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" data-testid="save-car" className="bg-primary">Save</Button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dlg, setDlg] = useState({ open: false, car: null });

  const load = async () => {
    try {
      const [s, c, b, l] = await Promise.all([
        adminApi.get("/admin/stats"),
        adminApi.get("/admin/cars"),
        adminApi.get("/admin/bookings"),
        adminApi.get("/admin/leads"),
      ]);
      setStats(s.data); setCars(c.data); setBookings(b.data); setLeads(l.data);
    } catch (e) {
      if (e.response?.status === 401) {
        setAdminToken(null);
        navigate("/admin/login");
      }
    }
  };

  useEffect(() => {
    if (!getAdminToken()) { navigate("/admin/login"); return; }
    load();
  }, []); // eslint-disable-line

  const logout = () => {
    setAdminToken(null);
    navigate("/admin/login");
  };

  const saveCar = async (payload) => {
    try {
      if (dlg.car?.id) {
        await adminApi.put(`/admin/cars/${dlg.car.id}`, payload);
        toast.success("Car updated");
      } else {
        await adminApi.post("/admin/cars", payload);
        toast.success("Car added");
      }
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const delCar = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    await adminApi.delete(`/admin/cars/${id}`);
    toast.success("Deleted");
    load();
  };

  const updBooking = async (id, patch) => {
    await adminApi.put(`/admin/bookings/${id}`, patch);
    load();
  };

  const updLead = async (id, patch) => {
    await adminApi.put(`/admin/leads/${id}`, patch);
    load();
  };

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="overline text-muted-foreground">Admin</span>
            </div>
            <h1 className="font-display font-black text-4xl tracking-tighter">Control panel</h1>
          </div>
          <Button variant="outline" onClick={logout} data-testid="admin-logout" className="border-white/15">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Car} label="Cars" value={stats.cars} />
            <StatCard icon={Wallet} label="Bookings" value={stats.bookings} />
            <StatCard icon={MessageSquare} label="Leads" value={stats.leads} />
            <StatCard icon={Users} label="Users" value={stats.users} />
          </div>
        )}

        <Tabs defaultValue="cars">
          <TabsList className="bg-card border border-white/10">
            <TabsTrigger value="cars" data-testid="tab-cars">Cars ({cars.length})</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="leads" data-testid="tab-leads">Leads ({leads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={dlg.open} onOpenChange={(o) => setDlg({ open: o, car: o ? dlg.car : null })}>
                <DialogTrigger asChild>
                  <Button onClick={() => setDlg({ open: true, car: null })} data-testid="add-car-btn" className="bg-primary">
                    <Plus className="w-4 h-4 mr-1" /> Add car
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{dlg.car ? "Edit car" : "Add car"}</DialogTitle>
                  </DialogHeader>
                  <CarForm initial={dlg.car} onSave={saveCar} onClose={() => setDlg({ open: false, car: null })} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="border border-white/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/50 text-muted-foreground overline">
                  <tr>
                    <th className="text-left p-3">Car</th><th className="text-left p-3">Category</th>
                    <th className="text-left p-3">₹/day</th><th className="text-left p-3">Active</th><th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10" data-testid="admin-cars-table">
                  {cars.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5">
                      <td className="p-3"><span className="font-medium">{c.brand} {c.name}</span></td>
                      <td className="p-3 capitalize">{c.category}</td>
                      <td className="p-3 font-mono">{INR(c.price_per_day)}</td>
                      <td className="p-3">{c.active ? <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Live</Badge> : <Badge variant="outline">Hidden</Badge>}</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setDlg({ open: true, car: c })} data-testid={`edit-car-${c.id}`}><Pencil className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => delCar(c.id)} data-testid={`delete-car-${c.id}`}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <div className="border border-white/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/50 text-muted-foreground overline">
                  <tr>
                    <th className="text-left p-3">Customer</th><th className="text-left p-3">Car</th>
                    <th className="text-left p-3">Dates</th><th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Status</th><th className="text-left p-3">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5">
                      <td className="p-3"><div>{b.customer_name}</div><div className="text-xs text-muted-foreground">{b.customer_email}</div></td>
                      <td className="p-3">{b.car_name}</td>
                      <td className="p-3 font-mono text-xs">{b.pickup_datetime.slice(0,10)} → {b.drop_datetime.slice(0,10)}</td>
                      <td className="p-3">{INR(b.total_amount)}</td>
                      <td className="p-3">
                        <Select value={b.status} onValueChange={(v) => updBooking(b.id, { status: v })}>
                          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending","confirmed","cancelled","completed"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3"><Badge variant="outline" className="capitalize border-white/15">{b.payment_status}</Badge></td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No bookings yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <div className="border border-white/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/50 text-muted-foreground overline">
                  <tr>
                    <th className="text-left p-3">Name</th><th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">City</th><th className="text-left p-3">Requirement</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-white/5">
                      <td className="p-3 font-medium">{l.name}</td>
                      <td className="p-3"><div>{l.email}</div><div className="text-xs text-muted-foreground">{l.phone}</div></td>
                      <td className="p-3">{l.city}</td>
                      <td className="p-3 max-w-xs truncate">{l.requirement}</td>
                      <td className="p-3">
                        <Select value={l.status} onValueChange={(v) => updLead(l.id, { status: v })}>
                          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["new","contacted","converted","closed"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No leads yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
