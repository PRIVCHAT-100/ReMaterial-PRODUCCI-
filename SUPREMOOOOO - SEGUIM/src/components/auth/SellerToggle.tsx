import React from "react";

type Props = { checked: boolean; onChange: (v: boolean) => void; label?: string; };

export const SellerToggle: React.FC<Props> = ({ checked, onChange, label = "Quiero vender (cuenta empresa)" }) => {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
};
