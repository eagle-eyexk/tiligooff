import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Home, ClipboardList, Store, Truck } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";
import { useCart } from "@/lib/cartStore.jsx";

export default function Navbar() {
  const location = useLocation();
  const { getItemCount } = useCart();
  const count = getItemCount();
  const path = location.pathname;

  const links = [
    { to: "/", icon: Home, label: "Kryefaqja" },
    { to: "/orders", icon: ClipboardList, label: "Porositë" },
    { to: "/business-dashboard", icon: Store, label: "Biznesi" },
    { to: "/courier-dashboard", icon: Truck, label: "Korrieri" },
  ];

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass h-16 items-center px-6 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="TiliGo" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-heading font-bold text-xl gradient-text">TiliGo</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${path === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <l.icon size={18} />
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <ShoppingCart size={22} className="text-foreground" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center pulse-badge">
                {count}
              </span>
            )}
          </Link>
          <Link to="/profile" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <User size={22} className="text-foreground" />
          </Link>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {[
            { to: "/", icon: Home, label: "Kryefaqja" },
            { to: "/orders", icon: ClipboardList, label: "Porositë" },
            { to: "/cart", icon: ShoppingCart, label: "Shporta", badge: count },
            { to: "/business-dashboard", icon: Store, label: "Biznesi" },
            { to: "/profile", icon: User, label: "Profili" },
          ].map(l => (
            <Link key={l.to} to={l.to}
              className={`flex flex-col items-center gap-0.5 relative ${path === l.to ? "text-primary" : "text-muted-foreground"}`}>
              <div className="relative">
                <l.icon size={20} />
                {l.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center pulse-badge">
                    {l.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}