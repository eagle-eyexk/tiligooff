import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Phone, MessageCircle, Check, Clock } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { ORDER_STATUSES, STATUS_FLOW } from "@/lib/constants";
import LiveMap from "@/components/tiligo/LiveMap";
import { useNotifications } from "@/hooks/useNotifications";

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [business, setBusiness] = useState(null);
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    const unsub = base44.entities.Order.subscribe(event => {
      if (event.data?.id === id) setOrder(event.data);
    });
    return unsub;
  }, [id]);

  const loadOrder = async () => {
    const orders = await base44.entities.Order.filter({ id });
    const o = orders[0];
    if (o) {
      setOrder(o);
      const b = await base44.entities.Business.filter({ id: o.business_id });
      setBusiness(b[0]);
      if (o.courier_id) {
        const c = await base44.entities.CourierProfile.filter({ user_id: o.courier_id });
        setCourier(c[0]);
      }
    }
    setLoading(false);
  };

  const { notify } = useNotifications();
  const prevStatus = useRef(null);
  useEffect(() => {
    if (order && prevStatus.current !== null && prevStatus.current !== order.status) {
      const info = ORDER_STATUSES[order.status];
      notify(`Porosia #${order.id?.slice(-6)}`, `${info?.icon} ${info?.label}`);
    }
    if (order) prevStatus.current = order.status;
  }, [order?.status]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <p className="text-muted-foreground">Porosia nuk u gjet</p>
        <Link to="/orders" className="gradient-btn px-6 py-2 rounded-xl mt-4 inline-block text-sm">Porositë e Mia</Link>
      </div>
    </div>
  );

  const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">Gjurmimi i Porosisë</h1>
            <p className="text-xs text-muted-foreground font-mono">#{order.id?.slice(-8)}</p>
          </div>
        </div>

        {/* Status timeline */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-0">
            {STATUS_FLOW.map((status, idx) => {
              const info = ORDER_STATUSES[status];
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const isLast = idx === STATUS_FLOW.length - 1;
              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-500 ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${isCurrent ? "pulse-badge" : ""}`}>
                      {isCompleted ? <Check size={16} /> : <Clock size={14} />}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-8 transition-all duration-500 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {info.icon} {info.label}
                    </p>
                    {isCurrent && order.status !== "delivered" && order.status !== "cancelled" && (
                      <p className="text-xs text-primary mt-0.5 animate-pulse">Duke u procesuar...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier info */}
        {courier && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Korrieri yt</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                {courier.photo ? <img src={courier.photo} alt="" className="w-12 h-12 rounded-full object-cover" /> : <span className="text-xl">🛵</span>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{courier.full_name}</p>
                <p className="text-xs text-muted-foreground">{courier.vehicle_type} • ⭐ {courier.rating?.toFixed(1)}</p>
              </div>
              {courier.phone && (
                <a href={`tel:${courier.phone}`} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={18} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Live Map */}
        {(business?.lat || courier?.current_lat) && (
          <div className="mb-6">
            <LiveMap business={business} courier={courier} />
          </div>
        )}

        {/* Business info */}
        {business && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Biznesi</h3>
            <div className="flex items-center gap-3">
              {business.logo ? <img src={business.logo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">🏪</div>}
              <div>
                <p className="font-semibold text-sm text-foreground">{business.name}</p>
                <p className="text-xs text-muted-foreground">{business.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Artikujt</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                <span className="font-mono font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nëntotali</span><span className="font-mono">€{order.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dërgesa</span><span className="font-mono">€{order.delivery_fee?.toFixed(2)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-sm text-primary"><span>Zbritje</span><span className="font-mono">-€{order.discount?.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold pt-1"><span>Totali</span><span className="font-mono gradient-text">€{order.total?.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">📍 Adresa e dërgesës</h3>
          <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
          {order.notes && <p className="text-xs text-muted-foreground mt-2 italic">Shënim: {order.notes}</p>}
        </div>
      </div>
    </div>
  );
}