import { getTranslations } from 'next-intl/server';

import { LeaveForm } from '@/app/_components/leave-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/_components/ui/breadcrumb';

export default async function LeaveCreatePage() {
  const t = await getTranslations();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full max-w-3xl mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t('visaCalculator')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('createLeave')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <LeaveForm />
    </div>
  );
}
