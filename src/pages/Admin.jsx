import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Store, Package, Truck, ClipboardList, Users, Trash2, LogOut, Loader2, DollarSign, TrendingUp, Star } from "lucide-react";
import { verifyAdmin, setAdminSession, checkAdminSession, clearAdminSession } from "@/lib/adminAuth";
import { LOGO_URL } from "@/lib/constants";
import { ORDER_STATUSES } from "@/lib/constants";

export default function Admin() {
  const [authed, setAuthed] = useState(checkAdminSession());
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyAdmin(loginForm.user, loginForm.pass)) {
      setAdminSession();
      setAuthed(true);
      setError("");
    } else {
      setError("Kredenciale të gabuara");
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setAuthed(false);
    setLoginForm({ user: "", pass: "" });
  };

  const loadAll = async () => {
    setLoading(true);
    const [businesses, orders, couriers, products, users] = await Promise.all([
      base44.entities.Business.list("-created_date", 200),
      base44.entities.Order.list("-created_date", 200),
      base44.entities.CourierProfile.list("-created_date", 200),
      base44.entities.Product.list("-created_date", 200),
      base44.entities.User.list("-created_date", 200),
    ]);
    setData({ businesses, orders, couriers, products, users });
    setLoading(false);
  };

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  if (!authed) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="TiliGo" className="w-14 h-14 rounded-2xl mx-auto mb-3 object-cover" />
          <h1 className="font-heading font-bold text-xl text-foreground">Paneli i Administratorit</h1>
          <p className="text-xs text-muted-foreground mt-1">Qasje e kufizuar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <input value={loginForm.user} onChange={e => setLoginForm(p => ({ ...p, user: e.target.value }))}
            placeholder="Përdoruesi" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <input type="password" value={loginForm.pass} onChange={e => setLoginForm(p => ({ ...p, pass: e.target.value }))}
            placeholder="Fjalëkalimi" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button type="submit" className="gradient-btn w-full py-3 rounded-xl font-bold text-sm">Hyr</button>
        </form>
      </div>
    </div>
  );

  const stats = {
    revenue: (data.orders || []).filter(o => o.status === "delivered").reduce((a, o) => a + (o.total || 0), 0),
    orders: (data.orders || []).length,
    businesses: (data.businesses || []).length,
    couriers: (data.couriers || []).length,
    products: (data.products || []).length,
    users: (data.users || []).length,
    activeOrders: (data.orders || []).filter(o => !["delivered", "cancelled"].includes(o.status)).length,
  };

  const tabs = [
    { id: "overview", label: "Përmbledhje", icon: TrendingUp },
    { id: "businesses", label: "Bizneset", icon: Store },
    { id: "orders", label: "Porositë", icon: ClipboardList },
    { id: "couriers", label: "Korrierët", icon: Truck },
    { id: "products", label: "Produktet", icon: Package },
    { id: "users", label: "Përdoruesit", icon: Users },
  ];

  const deleteEntity = async (entity, id) => {
    if (!window.confirm("Konfirmo fshirjen?")) return;
    await base44.entities[entity].delete(id);
    loadAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-primary" />
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">Paneli Admin</h1>
              <p className="text-xs text-muted-foreground">TiliGo Control Center</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold">
            <LogOut size={16} /> Dil
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Të ardhura", value: `€${stats.revenue.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
                { label: "Porosi", value: stats.orders, icon: ClipboardList, color: "text-accent" },
                { label: "Bizneset", value: stats.businesses, icon: Store, color: "text-yellow-400" },
                { label: "Përdoruesit", value: stats.users, icon: Users, color: "text-blue-400" },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-4">
                  <s.icon size={18} className={`${s.color} mb-2`} />
                  <p className="font-mono font-bold text-xl text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === t.id ? "gradient-btn" : "glass text-muted-foreground"}`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Statistika e Platformës</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Porosi aktive</p><p className="font-mono font-bold text-primary text-lg">{stats.activeOrders}</p></div>
                  <div><p className="text-muted-foreground">Korrierë</p><p className="font-mono font-bold text-foreground text-lg">{stats.couriers}</p></div>
                  <div><p className="text-muted-foreground">Produkte</p><p className="font-mono font-bold text-foreground text-lg">{stats.products}</p></div>
                  <div><p className="text-muted-foreground">Bizneset aktive</p><p className="font-mono font-bold text-foreground text-lg">{(data.businesses || []).filter(b => b.status === "active").length}</p></div>
                </div>
              </div>
            )}

            {tab === "businesses" && (
              <div className="space-y-2">
                {(data.businesses || []).map(b => (
                  <div key={b.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    {b.logo ? <img src={b.logo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">🏪</div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.category} • {b.status} • {b.is_open ? "Hapur" : "Mbyllur"}</p>
                    </div>
                    <button onClick={() => deleteEntity("Business", b.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {tab === "orders" && (
              <div className="space-y-2">
                {(data.orders || []).map(o => {
                  const info = ORDER_STATUSES[o.status] || ORDER_STATUSES.placed;
                  const items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
                  return (
                    <div key={o.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">#{o.id?.slice(-6)}</p>
                        <p className="text-sm text-foreground">{items.length} artikuj • €{o.total?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{info.icon} {info.label}</p>
                      </div>
                      <button onClick={() => deleteEntity("Order", o.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "couriers" && (
              <div className="space-y-2">
                {(data.couriers || []).map(c => (
                  <div key={c.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">🛵</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{c.vehicle_type} • {c.is_online ? "Online" : "Offline"} • ⭐{c.rating?.toFixed(1)}</p>
                    </div>
                    <button onClick={() => deleteEntity("CourierProfile", c.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {tab === "products" && (
              <div className="space-y-2">
                {(data.products || []).map(p => (
                  <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    {p.image ? <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">🍽️</div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">€{p.price?.toFixed(2)} • {p.is_available !== false ? "Disponueshëm" : "Jashtë stoku"}</p>
                    </div>
                    <button onClick={() => deleteEntity("Product", p.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {tab === "users" && (
              <div className="space-y-2">
                {(data.users || []).map(u => (
                  <div key={u.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users size={18} className="text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{u.full_name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email} • {u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}