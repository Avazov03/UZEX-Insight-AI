import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { ProductsCatalogView } from '@/features/products/components/products-catalog-view';

export const metadata = { title: 'Products' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Products'
      pageDescription='Mahsulotlar katalogi va nomlar normalizatsiyasi.'
    >
      <ProductsCatalogView />
    </PageContainer>
  );
}
