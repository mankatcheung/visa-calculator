import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { VisaForm } from '@/app/_components/visa-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/_components/ui/breadcrumb';
import { getVisa } from '@/app/actions/visas';

export default async function VisaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations();
  const { id } = await params;
  const visaId = parseInt(id, 10);
  if (isNaN(visaId)) notFound();

  const visaRes = await getVisa(visaId);
  const visa = visaRes.result;
  if (!visa) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full max-w-3xl mx-auto">
      <h1 className="sr-only">{t('editVisa')}</h1>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/visas">{t('visas')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('editVisa')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <VisaForm visa={visa} />
    </div>
  );
}
