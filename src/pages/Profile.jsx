import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, MapPin, Plus, Trash2, LogOut, Loader2 } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { LOGO_URL, COMPANY_INFO } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "", address: "" });
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Address.filter({ user_id: u.id }).then(setAddresses);
    });
  }, []);

  const addAddress = async () => {
    if (!newAddr.label || !newAddr.address) return;
    setSaving(true);
    const addr = await base44.entities.Address.create({ ...newAddr, user_id: user.id });
    setAddresses(prev => [...prev, addr]);
    setNewAddr({ label: "", address: "" });
    setShowAddForm(false);
    setSaving(false);
    toast({ title: "Adresa u shtua! 📍" });
  };

  const deleteAddress = async (id) => {
    await base44.entities.Address.delete(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast({ title: "Adresa u fshi" });
  };

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* User Card */}
        <div className="glass rounded-2xl p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-primary" />
          </div>
          <h2 className="font-heading font-bold text-xl text-foreground">{user.full_name || "Përdoruesi"}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Roli: {user.role}</p>
        </div>

        {/* Addresses */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Adresat e Ruajtura</h3>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
              <Plus size={16} />
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-3 mb-4 p-4 bg-muted/30 rounded-xl">
              <input value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))}
                placeholder="Emri (p.sh. Shtëpia)" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <input value={newAddr.address} onChange={e => setNewAddr(p => ({ ...p, address: e.target.value }))}
                placeholder="Adresa e plotë" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <button onClick={addAddress} disabled={saving}
                className="gradient-btn w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Ruaj Adresën
              </button>
            </div>
          )}

          {addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.address}</p>
                  </div>
                  <button onClick={() => deleteAddress(a.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nuk keni adresa të ruajtura</p>
          )}
        </div>

        {/* TiliGo Brand & Company Info */}
        <div className="glass rounded-2xl p-6 mb-6 text-center">
          <img src={LOGO_URL} alt="TiliGo" className="w-12 h-12 rounded-xl mx-auto mb-2 object-cover" />
          <p className="text-sm font-bold text-foreground">{COMPANY_INFO.legalName}</p>
          <p className="text-xs text-muted-foreground">Dërgesa më e shpejtë në Kosovë 🇽🇰</p>
          <div className="mt-4 pt-4 border-t border-border text-left space-y-1">
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Emri tregtar:</span> {COMPANY_INFO.tradeName}</p>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Lloji:</span> {COMPANY_INFO.type}</p>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">NUI:</span> {COMPANY_INFO.uniqueId}</p>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Regjistri:</span> {COMPANY_INFO.registry}</p>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Komuna:</span> {COMPANY_INFO.municipality}</p>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Adresa:</span> {COMPANY_INFO.address}</p>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Regjistruar:</span> {COMPANY_INFO.registrationDate}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors">
          <LogOut size={18} />
          Dil nga llogaria
        </button>
      </div>
    </div>
  );
}