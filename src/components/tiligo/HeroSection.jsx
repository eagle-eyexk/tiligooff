import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";

export default function HeroSection({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 mt-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 70% 30%, rgba(57,255,107,0.3) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(0,191,255,0.2) 0%, transparent 50%)" }} />
      
      <div className="relative px-6 py-10 md:py-16 text-center space-y-5">
        <div className="flex justify-center">
          <img src={LOGO_URL} alt="TiliGo" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-lg shadow-primary/20" />
        </div>
        <div>
          <h1 className="font-heading font-black text-2xl md:text-4xl text-foreground">
            TiliGo — <span className="gradient-text">Shpejt</span>, me Dashuri
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            Dërgesa më e shpejtë në Kosovë 🇽🇰
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex items-center glass rounded-2xl px-4 py-3">
            <MapPin size={18} className="text-primary shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ku dërgojmë sot? 🏃"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm px-3 outline-none"
            />
            <button type="submit" className="gradient-btn px-5 py-2 rounded-xl text-sm font-bold">
              Kërko
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}