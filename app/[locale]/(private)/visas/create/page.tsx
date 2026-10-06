import { getTranslations } from 'next-intl/server';

import { VisaForm } from '@/app/_components/visa-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/_components/ui/breadcrumb';

export default async function VisaCreatePage() {
  const t = await getTranslations();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full max-w-3xl mx-auto">
      <h1 className="sr-only">{t('createVisa')}</h1>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/visas">{t('visas')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('createVisa')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <VisaForm />
    </div>
  );
}
