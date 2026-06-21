import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Minus, Plus, Trash2, Tag, MapPin, CreditCard, Banknote, Loader2, Navigation, User } from "lucide-react";
import { useCart } from "@/lib/cartStore.jsx";
import Navbar from "@/components/tiligo/Navbar";
import { useToast } from "@/components/ui/use-toast";

export default function Cart() {
  const { cart, addItem, removeItem, clearCart, getTotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [business, setBusiness] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(user => {
      base44.entities.Address.filter({ user_id: user.id }).then(setAddresses);
    });
    if (cart.businessId) {
      base44.entities.Business.filter({ id: cart.businessId }).then(r => setBusiness(r[0]));
    }
  }, [cart.businessId]);

  const subtotal = getTotal();
  const deliveryFee = business?.delivery_fee || 0;
  const total = subtotal + deliveryFee - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const coupons = await base44.entities.Coupon.filter({ code: couponCode.trim().toUpperCase() });
    const c = coupons[0];
    if (c && c.is_active && c.uses_left > 0) {
      const d = c.discount_amount || (subtotal * (c.discount_percent || 0) / 100);
      setDiscount(Math.min(d, subtotal));
      toast({ title: "Kuponi u aplikua! 🎉", description: `Kurseve €${d.toFixed(2)}` });
    } else {
      toast({ title: "Kuponi nuk është valid", variant: "destructive" });
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) { toast({ title: "GPS nuk është i disponueshëm", variant: "destructive" }); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        setDeliveryAddress(data.display_name || `${pos.coords.latitude}, ${pos.coords.longitude}`);
      } catch {
        setDeliveryAddress(`${pos.coords.latitude}, ${pos.coords.longitude}`);
      }
      setGettingLocation(false);
    }, () => { setGettingLocation(false); toast({ title: "Nuk u gjet vendndodhja", variant: "destructive" }); }, { enableHighAccuracy: true });
  };

  const placeOrder = async () => {
    if (!customerName.trim()) {
      toast({ title: "Vendos emrin tënd", variant: "destructive" });
      return;
    }
    if (!customerPhone.trim()) {
      toast({ title: "Vendos numrin e telefonit", variant: "destructive" });
      return;
    }
    if (!deliveryAddress.trim()) {
      toast({ title: "Vendos adresën e dërgesës", variant: "destructive" });
      return;
    }
    setPlacing(true);
    const user = await base44.auth.me();
    const order = await base44.entities.Order.create({
      customer_id: user.id,
      business_id: cart.businessId,
      items: JSON.stringify(cart.items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))),
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      total: Math.max(0, total),
      status: "placed",
      delivery_address: deliveryAddress,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes,
      payment_method: paymentMethod,
    });
    clearCart();
    setPlacing(false);
    toast({ title: "Porosia u vendos! 🎉", description: "Duke pritur konfirmimin..." });
    navigate(`/invoice/${order.id}`);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pt-16">
        <Navbar />
        <div className="text-center">
          <span className="text-6xl mb-4 block">🛒</span>
          <h2 className="font-heading font-bold text-xl text-foreground mb-2">Shporta është bosh</h2>
          <p className="text-muted-foreground text-sm mb-6">Shto produkte nga dyqanet tona</p>
          <Link to="/" className="gradient-btn px-6 py-3 rounded-xl inline-block font-bold text-sm">
            Shfleto Dyqane
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to={cart.businessId ? `/business/${cart.businessId}` : "/"} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">Shporta</h1>
            <p className="text-xs text-muted-foreground">{cart.businessName}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {cart.items.map(item => (
            <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-4">
              {item.image ? (
                <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span>🍽️</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                <p className="font-mono text-primary text-sm font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors">
                  {item.quantity === 1 ? <Trash2 size={14} className="text-destructive" /> : <Minus size={14} />}
                </button>
                <span className="font-mono font-bold text-sm w-5 text-center">{item.quantity}</span>
                <button onClick={() => addItem(item, { id: cart.businessId, name: cart.businessName })}
                  className="gradient-btn w-8 h-8 rounded-lg flex items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-primary shrink-0" />
            <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
              placeholder="Kodi i kuponit" className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            <button onClick={applyCoupon} className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
              Apliko
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="glass rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User size={16} className="text-primary" />
            Informacioni i klientit
          </div>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder="Emri i plotë"
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
            placeholder="Numri i telefonit" type="tel"
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
        </div>

        {/* Delivery Address */}
        <div className="glass rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin size={16} className="text-primary" />
            Adresa e dërgesës
          </div>
          {addresses.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {addresses.map(a => (
                <button key={a.id} onClick={() => setDeliveryAddress(a.address)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deliveryAddress === a.address ? "gradient-btn" : "glass text-muted-foreground"}`}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
            placeholder="Shkruaj adresën e plotë..."
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <button onClick={getLocation} disabled={gettingLocation}
            className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors disabled:opacity-50">
            {gettingLocation ? <><Loader2 size={16} className="animate-spin" /> Duke gjetur...</> : <><Navigation size={16} /> Përdor vendndodhjen time</>}
          </button>
        </div>

        {/* Payment */}
        <div className="glass rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-foreground mb-3">Mënyra e pagesës</p>
          <div className="flex gap-3">
            <button onClick={() => setPaymentMethod("cash")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${paymentMethod === "cash" ? "gradient-btn" : "glass text-muted-foreground"}`}>
              <Banknote size={18} /> Cash
            </button>
            <button onClick={() => setPaymentMethod("card")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${paymentMethod === "card" ? "gradient-btn" : "glass text-muted-foreground"}`}>
              <CreditCard size={18} /> Kartë
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="glass rounded-2xl p-4 mb-4">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Shënime për porosinë (opsionale)..."
            rows={2}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none" />
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nëntotali</span>
            <span className="font-mono font-semibold">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dërgesa</span>
            <span className="font-mono font-semibold">{deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : "Falas"}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-primary">
              <span>Zbritje</span>
              <span className="font-mono font-semibold">-€{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold text-foreground">Totali</span>
            <span className="font-mono font-bold text-lg gradient-text">€{Math.max(0, total).toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order */}
        <button onClick={placeOrder} disabled={placing}
          className="gradient-btn w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50">
          {placing ? <><Loader2 size={20} className="animate-spin" /> Duke porositur...</> : "Vendos Porosinë 🚀"}
        </button>
      </div>
    </div>
  );
}