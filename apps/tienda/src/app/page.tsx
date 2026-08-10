import ClientPage from './ClientPage';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function TiendaPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  return <ClientPage initialProducts={products} categories={categories} />;
}
