import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { VisaSummary } from '@/app/_components/visa-summary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/_components/ui/breadcrumb';
import { getLeavesForUser } from '@/app/actions/leaves';
import { getVisa } from '@/app/actions/visas';

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations();
  const { id } = await params;
  const visaId = parseInt(id, 10);
  if (isNaN(visaId)) notFound();

  const [visaRes, leavesRes] = await Promise.all([
    getVisa(visaId),
    getLeavesForUser(),
  ]);

  const visa = visaRes.result;
  if (!visa) notFound();

  const leaves = leavesRes.result ?? [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full max-w-3xl mx-auto">
      <h1 className="sr-only">{visa.country} — {visa.name}</h1>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/visas">{t('visas')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{visa.country} — {visa.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <VisaSummary visa={visa} leaves={leaves} />
    </div>
  );
}
