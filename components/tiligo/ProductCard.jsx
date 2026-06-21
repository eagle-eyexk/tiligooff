import React from 'react';

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#39FF6B]/30 transition-all">
      {product.image && (
        <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
      )}
      <h3 className="text-white font-semibold text-sm">{product.name}</h3>
      {product.description && (
        <p className="text-gray-400 text-xs mt-1">{product.description}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[#39FF6B] font-bold">€{product.price?.toFixed(2)}</span>
        <button
          onClick={() => onAdd?.(product)}
          className="bg-[#39FF6B]/20 text-[#39FF6B] px-3 py-1 rounded-lg text-sm font-medium hover:bg-[#39FF6B]/30 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
