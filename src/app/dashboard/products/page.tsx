import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { ProductsCatalogView } from '@/features/products/components/products-catalog-view';

export const metadata = { title: 'Products' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer
      titleKey='pages.products.title'
      descriptionKey='pages.products.description'
    >
      <ProductsCatalogView />
    </LocalizedPageContainer>
  );
}
