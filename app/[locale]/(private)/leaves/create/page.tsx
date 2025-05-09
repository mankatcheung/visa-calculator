import { LeaveForm } from '@/app/_components/leave-form';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/app/_components/ui/breadcrumb';
import { getTranslations } from 'next-intl/server';

export default async function LeaveCreatePage() {
  const t = await getTranslations();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
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
