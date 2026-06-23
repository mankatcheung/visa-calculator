import { Skeleton } from '@/app/_components/ui/skeleton';

export default function PrivateLoading() {
  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-1 flex-col gap-4 p-4"
      data-cy="private-loading"
    >
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
