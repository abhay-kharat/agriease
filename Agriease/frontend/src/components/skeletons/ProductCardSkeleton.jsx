import { Skeleton } from "../ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <article className="market-v2-card">
      <div className="market-v2-card-image">
        <Skeleton className="w-full h-[180px]" />
      </div>
      <div className="market-v2-card-body">
        <div className="market-v2-card-top">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <div className="market-v2-card-meta mt-4">
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="supplier-manage-v2__actions mt-4 flex gap-2">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    </article>
  );
}
