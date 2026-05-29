import React from 'react';
import { Skeleton } from "../ui/Skeleton";

export function StatCardSkeleton() {
  return (
    <div className="dashboard-stat-card animate-pulse">
      <div className="dashboard-stat-card__icon bg-gray-200 rounded-full w-12 h-12" />
      <div className="dashboard-stat-card__content w-full">
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-8 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function PanelSkeleton({ className = "", hasHeader = true, rows = 3 }) {
  return (
    <div className={`dashboard-panel animate-pulse ${className}`}>
      {hasHeader && (
        <div className="dashboard-panel__header mb-4">
          <div className="w-full">
            <Skeleton className="h-3 w-1/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="w-2/3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickActionSkeleton() {
  return (
    <div className="dashboard-quick-card animate-pulse">
      <div className="dashboard-quick-card__content w-full">
        <Skeleton className="h-3 w-1/2 mb-2" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="dashboard-quick-card__icon bg-gray-200 rounded-full w-10 h-10" />
    </div>
  );
}

export function FarmerDashboardSkeleton() {
  return (
    <div className="farmer-dashboard role-dashboard role-dashboard--farmer opacity-50">
      <section className="role-dashboard__top">
        <div className="role-dashboard__hero-stack">
          <div className="dashboard-panel role-panel role-panel--hero animate-pulse">
            <div className="hero-copy w-full">
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-10 w-64 mb-6" />
              <div className="flex gap-2 mb-8">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-full" />
              </div>
            </div>
          </div>

          <div className="dashboard-panel role-panel role-panel--compact">
            <header className="dashboard-panel__header mb-4">
               <Skeleton className="h-3 w-20 mb-2" />
               <Skeleton className="h-6 w-40" />
            </header>
            <div className="dashboard-quick-grid dashboard-quick-grid--compact">
              <QuickActionSkeleton />
              <QuickActionSkeleton />
              <QuickActionSkeleton />
              <QuickActionSkeleton />
            </div>
          </div>
        </div>

        <div className="role-dashboard__analytics">
          <PanelSkeleton className="role-panel role-panel--compact" rows={3} />
        </div>
      </section>

      <section className="role-dashboard__middle">
        <div className="dashboard-stat-grid dashboard-stat-grid--fixed">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </section>

      <section className="role-dashboard__bottom">
        <div className="dashboard-panel dashboard-panel--chart animate-pulse">
          <header className="dashboard-panel__header mb-4">
             <Skeleton className="h-3 w-20 mb-2" />
             <Skeleton className="h-6 w-48" />
          </header>
          <div className="h-[280px] bg-gray-100 rounded-lg mb-6" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>

        <div className="dashboard-side-column">
           <PanelSkeleton title="Farm Details" rows={4} />
           <div className="mt-4 h-48 bg-gray-100 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

export function DeliveryAgentDashboardSkeleton() {
  return (
    <div className="agent-dashboard opacity-50">
      <header className="agent-dashboard__header animate-pulse">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </header>

      <section className="agent-dashboard-grid agent-dashboard-grid--top">
        <div className="agent-card animate-pulse">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="agent-map-header mb-4">
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="agent-map-frame h-[300px] bg-gray-100 rounded-lg" />
        </div>

        <div className="agent-analytics-stack">
          <div className="agent-card agent-card--compact animate-pulse">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="agent-card agent-card--compact animate-pulse">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="agent-dashboard-grid agent-dashboard-grid--middle">
        <div className="agent-stat-card animate-pulse">
           <Skeleton className="h-12 w-full" />
        </div>
        <div className="agent-stat-card animate-pulse">
           <Skeleton className="h-12 w-full" />
        </div>
        <div className="agent-stat-card animate-pulse">
           <Skeleton className="h-12 w-full" />
        </div>
        <div className="agent-stat-card animate-pulse">
           <Skeleton className="h-12 w-full" />
        </div>
      </section>

      <section className="agent-card animate-pulse mt-8">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    </div>
  );
}

export function SupplierDashboardSkeleton() {
  return (
    <div className="supplier-dashboard role-dashboard role-dashboard--supplier opacity-50">
      <section className="role-dashboard__top">
        <div className="role-dashboard__hero-stack">
          <div className="dashboard-panel role-panel role-panel--hero animate-pulse">
            <div className="hero-copy w-full">
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-10 w-64 mb-6" />
              <div className="flex gap-2 mb-8">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-full" />
              </div>
            </div>
          </div>

          <div className="dashboard-panel role-panel role-panel--compact">
            <header className="dashboard-panel__header mb-4">
               <Skeleton className="h-3 w-20 mb-2" />
               <Skeleton className="h-6 w-40" />
            </header>
            <div className="dashboard-quick-grid dashboard-quick-grid--compact">
              <QuickActionSkeleton />
              <QuickActionSkeleton />
              <QuickActionSkeleton />
              <QuickActionSkeleton />
            </div>
          </div>
        </div>

        <div className="role-dashboard__analytics">
          <PanelSkeleton className="role-panel role-panel--compact" rows={4} />
        </div>
      </section>

      <section className="role-dashboard__middle">
        <div className="dashboard-stat-grid dashboard-stat-grid--fixed">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </section>

      <section className="role-dashboard__bottom">
        <div className="dashboard-panel dashboard-panel--chart animate-pulse">
          <header className="dashboard-panel__header mb-4">
             <Skeleton className="h-3 w-20 mb-2" />
             <Skeleton className="h-6 w-48" />
          </header>
          <div className="h-[280px] bg-gray-100 rounded-lg mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        <div className="dashboard-side-column">
           <PanelSkeleton title="Inventory" rows={3} />
           <PanelSkeleton title="Business" rows={4} className="mt-4" />
        </div>
      </section>
    </div>
  );
}
