import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Store, Package, Plus, Edit, Trash2, ToggleLeft, ToggleRight, DollarSign, ShoppingCart, Star, Clock, Loader2, ChevronRight, Check, X, Image } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { LOGO_URL } from "@/lib/constants";

export default function BusinessDashboard() {
  const [business, setBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders");
  const [showRegister, setShowRegister] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  const [regForm, setRegForm] = useState({ name: "", description: "", category: "Restorante", address: "", phone: "", delivery_time: 30, delivery_fee: 1, min_order: 5 });
  const [prodForm, setProdForm] = useState({ name: "", description: "", price: 0, category: "", image: "" });

  useEffect(() => {
    loadData();
    const unsubOrders = base44.entities.Order.subscribe(() => loadOrders());
    return unsubOrders;
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const myBiz = await base44.entities.Business.filter({ owner_id: user.id });
    if (myBiz.length > 0) {
      setBusiness(myBiz[0]);
      setBusinesses(myBiz);
      await loadProducts(myBiz[0].id);
      await loadOrdersForBiz(myBiz[0].id);
    }
    setLoading(false);
  };

  const loadProducts = async (bizId) => {
    const p = await base44.entities.Product.filter({ business_id: bizId });
    setProducts(p);
  };

  const loadOrders = async () => {
    if (business) await loadOrdersForBiz(business.id);
  };

  const loadOrdersForBiz = async (bizId) => {
    const o = await base44.entities.Order.filter({ business_id: bizId }, "-created_date", 50);
    setOrders(o);
  };

  const registerBusiness = async () => {
    const user = await base44.auth.me();
    const biz = await base44.entities.Business.create({ ...regForm, owner_id: user.id, status: "active", is_open: true, rating: 5 });
    setBusiness(biz);
    setBusinesses([biz]);
    setShowRegister(false);
    toast({ title: "Biznesi u regjistrua! 🎉" });
  };

  const toggleOpen = async () => {
    const updated = await base44.entities.Business.update(business.id, { is_open: !business.is_open });
    setBusiness(updated);
    toast({ title: business.is_open ? "Dyqani u mbyll" : "Dyqani u hap! ✅" });
  };

  const addProduct = async () => {
    await base44.entities.Product.create({ ...prodForm, business_id: business.id, is_available: true });
    setProdForm({ name: "", description: "", price: 0, category: "", image: "" });
    setShowAddProduct(false);
    await loadProducts(business.id);
    toast({ title: "Produkti u shtua! ✅" });
  };

  const updateProduct = async () => {
    await base44.entities.Product.update(editingProduct.id, prodForm);
    setEditingProduct(null);
    setProdForm({ name: "", description: "", price: 0, category: "", image: "" });
    await loadProducts(business.id);
    toast({ title: "Produkti u përditësua ✅" });
  };

  const deleteProduct = async (id) => {
    await base44.entities.Product.delete(id);
    await loadProducts(business.id);
    toast({ title: "Produkti u fshi" });
  };

  const toggleAvailability = async (p) => {
    await base44.entities.Product.update(p.id, { is_available: !p.is_available });
    await loadProducts(business.id);
  };

  const updateOrderStatus = async (orderId, status) => {
    const data = { status };
    if (status === "accepted") data.accepted_at = new Date().toISOString();
    if (status === "preparing") data.prepared_at = new Date().toISOString();
    await base44.entities.Order.update(orderId, data);
    await loadOrdersForBiz(business.id);
    toast({ title: `Statusi u ndryshua: ${ORDER_STATUSES[status]?.label}` });
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar /><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!business && !showRegister) return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4 text-center py-20">
        <img src={LOGO_URL} alt="" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover" />
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">Regjistro Biznesin Tënd</h2>
        <p className="text-sm text-muted-foreground mb-6">Fillo të shesësh me TiliGo dhe arrij mijëra klientë</p>
        <button onClick={() => setShowRegister(true)} className="gradient-btn px-8 py-3 rounded-2xl font-bold">
          Regjistrohu Tani 🚀
        </button>
      </div>
    </div>
  );

  if (showRegister) return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-4">
        <h2 className="font-heading font-bold text-xl text-foreground mb-6">Regjistro Biznesin</h2>
        <div className="space-y-4">
          {[
            { key: "name", label: "Emri i biznesit", type: "text" },
            { key: "description", label: "Përshkrimi", type: "text" },
            { key: "address", label: "Adresa", type: "text" },
            { key: "phone", label: "Telefoni", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
              <input value={regForm[f.key]} onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
            </div>
          ))}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Kategoria</label>
            <select value={regForm.category} onChange={e => setRegForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none">
              {["Restorante", "Pica", "Burgera", "Sushi", "Supermarket", "Farmaci", "Kafe", "Ushqim"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "delivery_time", label: "Koha (min)" },
              { key: "delivery_fee", label: "Tarifa (€)" },
              { key: "min_order", label: "Min porosi (€)" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                <input type="number" value={regForm[f.key]} onChange={e => setRegForm(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none" />
              </div>
            ))}
          </div>
          <button onClick={registerBusiness} className="gradient-btn w-full py-3 rounded-2xl font-bold">Regjistro ✅</button>
        </div>
      </div>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status === "placed");
  const activeOrders = orders.filter(o => ["accepted", "preparing", "ready"].includes(o.status));
  const todayOrders = orders.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter(o => o.status === "delivered").reduce((a, o) => a + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Store size={24} className="text-primary" />
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">{business.name}</h1>
              <p className="text-xs text-muted-foreground">{business.category}</p>
            </div>
          </div>
          <button onClick={toggleOpen}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${business.is_open ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
            {business.is_open ? <><ToggleRight size={18} /> Hapur</> : <><ToggleLeft size={18} /> Mbyllur</>}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Të ardhurat sot", value: `€${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
            { label: "Porosi sot", value: todayOrders.length, icon: ShoppingCart, color: "text-accent" },
            { label: "Në pritje", value: pendingOrders.length, icon: Clock, color: "text-yellow-400" },
            { label: "Vlerësimi", value: business.rating?.toFixed(1) || "5.0", icon: Star, color: "text-yellow-400" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4">
              <s.icon size={18} className={`${s.color} mb-2`} />
              <p className="font-mono font-bold text-xl text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "orders", label: "Porositë", badge: pendingOrders.length },
            { id: "menu", label: "Menuja" },
            { id: "history", label: "Historia" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === t.id ? "gradient-btn" : "glass text-muted-foreground"}`}>
              {t.label}
              {t.badge > 0 && <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center pulse-badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {pendingOrders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">⏳ Në Pritje ({pendingOrders.length})</h3>
                {pendingOrders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateOrderStatus} />)}
              </div>
            )}
            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">🔄 Aktive ({activeOrders.length})</h3>
                {activeOrders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateOrderStatus} />)}
              </div>
            )}
            {pendingOrders.length === 0 && activeOrders.length === 0 && (
              <div className="text-center py-16">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-muted-foreground">Nuk ka porosi të reja</p>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {tab === "menu" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Produktet ({products.length})</h3>
              <button onClick={() => { setShowAddProduct(true); setEditingProduct(null); setProdForm({ name: "", description: "", price: 0, category: "", image: "" }); }}
                className="gradient-btn px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> Shto
              </button>
            </div>

            {(showAddProduct || editingProduct) && (
              <div className="glass rounded-2xl p-5 mb-4 space-y-3">
                <h4 className="font-semibold text-sm text-foreground">{editingProduct ? "Ndrysho Produktin" : "Shto Produkt të Ri"}</h4>
                <input value={prodForm.name} onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Emri" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <input value={prodForm.description} onChange={e => setProdForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Përshkrimi" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.01" value={prodForm.price} onChange={e => setProdForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="Çmimi (€)" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  <input value={prodForm.category} onChange={e => setProdForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Kategoria" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
                <input value={prodForm.image} onChange={e => setProdForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="URL e fotos (opsionale)" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <div className="flex gap-2">
                  <button onClick={editingProduct ? updateProduct : addProduct}
                    className="gradient-btn flex-1 py-2.5 rounded-xl text-sm font-bold">
                    {editingProduct ? "Ruaj Ndryshimet" : "Shto Produktin"} ✅
                  </button>
                  <button onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
                    className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">Anulo</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {products.map(p => (
                <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  {p.image ? <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">🍽️</div>}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">{p.category} • <span className="font-mono text-primary font-bold">€{p.price?.toFixed(2)}</span></p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleAvailability(p)}
                      className={`p-2 rounded-lg transition-colors ${p.is_available !== false ? "text-primary" : "text-muted-foreground"}`}>
                      {p.is_available !== false ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => { setEditingProduct(p); setProdForm({ name: p.name, description: p.description || "", price: p.price, category: p.category || "", image: p.image || "" }); setShowAddProduct(false); }}
                      className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)}
                      className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl mb-3 block">📦</span>
                  <p className="text-muted-foreground text-sm">Nuk keni produkte. Shtoni produktin e parë!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div className="space-y-2">
            {orders.filter(o => ["delivered", "cancelled"].includes(o.status)).map(o => {
              const items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
              const info = ORDER_STATUSES[o.status];
              return (
                <div key={o.id} className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{o.id?.slice(-6)}</p>
                      <p className="text-sm text-foreground">{items.length} artikuj • <span className="font-mono font-bold text-primary">€{o.total?.toFixed(2)}</span></p>
                    </div>
                    <span className={`text-xs font-semibold ${info?.color}`}>{info?.icon} {info?.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(o.created_date).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
  const info = ORDER_STATUSES[order.status];
  const nextStatus = order.status === "placed" ? "accepted" : order.status === "accepted" ? "preparing" : order.status === "preparing" ? "ready" : null;

  return (
    <div className="glass rounded-2xl p-4 mb-2">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">#{order.id?.slice(-6)}</p>
          <p className="text-sm font-semibold text-foreground">{items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
        </div>
        <span className={`text-xs font-semibold ${info?.color}`}>{info?.label}</span>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
        <span>📍 {order.delivery_address}</span>
        <span className="font-mono font-bold text-primary text-sm">€{order.total?.toFixed(2)}</span>
      </div>
      <div className="flex gap-2">
        {order.status === "placed" && (
          <>
            <button onClick={() => onUpdateStatus(order.id, "accepted")}
              className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
              <Check size={14} /> Prano
            </button>
            <button onClick={() => onUpdateStatus(order.id, "cancelled")}
              className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center gap-1">
              <X size={14} /> Refuzo
            </button>
          </>
        )}
        {nextStatus && order.status !== "placed" && (
          <button onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold">
            {ORDER_STATUSES[nextStatus]?.icon} {ORDER_STATUSES[nextStatus]?.label}
          </button>
        )}
      </div>
    </div>
  );
}