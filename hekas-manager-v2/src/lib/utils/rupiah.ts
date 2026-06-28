// Format rupiah sesuai PRD: "Rp 18.000,00"
// Default: lowercase "rp" anti-AI. Pakai formatRupiahPRD() untuk PRD-literal.
export function formatRupiah(n: number, variant: 'lower' | 'upper' = 'lower'): string {
  const formatted = n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  if (variant === 'upper') return `Rp ${formatted}`;
  return `Rp ${formatted}`;
}

// Wrap raw "Rp X" / "Rp X" string dari mock jadi PRD-format
export function toRupiah(raw: string, variant: 'lower' | 'upper' = 'upper'): string {
  const num = Number(raw.replace(/[^0-9]/g, ''));
  return formatRupiah(num, variant);
}