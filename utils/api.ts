const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const fetchPublicItems = async () => {
  const response = await fetch(`${API_URL}/items?status=PUBLISHED&limit=20`);
  if (!response.ok) throw new Error('Gagal mengambil data produk');
  return response.json();
};

export const fetchItemDetail = async (slug: string) => {
  const response = await fetch(`${API_URL}/items/slug/${slug}`);
  if (!response.ok) throw new Error('Produk tidak ditemukan');
  return response.json();
};