export const categoryLabels: Record<string, string> = {
  jalan: "Infrastruktur Jalan",
  bersih: "Kebersihan",
  drain: "Drainase",
  lampu: "Penerangan Jalan",
  fasilitas: "Fasilitas Umum",
  ling: "Lingkungan",
};

export function getCategoryLabel(category: string): string {
  return categoryLabels[category] ?? category;
}