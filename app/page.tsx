"use client";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { ActivePeriod } from "@/app/components/activePeriod";
import { EmployeeRanking } from "@/app/components/employeeRanking";
import { ToggleTheme } from "./components/toggleTheme";
import { PeriodMetrics } from "@/app/components/periodMetrics";
import { LiveSummary } from "@/app/components/salary/LiveSummary";

export default function Home() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  let pathSoFar = "";

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <ToggleTheme />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, idx) => {
              pathSoFar += `/${segment}`;
              const isLast = idx === segments.length - 1;
              return (
                <React.Fragment key={segment}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {segment.charAt(0).toUpperCase() + segment.slice(1)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={pathSoFar}>
                        {segment.charAt(0).toUpperCase() + segment.slice(1)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
        <div className="grid auto-rows-min gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
          <ActivePeriod />
          <EmployeeRanking />
        </div>
        {/* Resumen de Horas en Tiempo Real */}
        <div className="w-full">
          <LiveSummary autoRefresh={true} refreshInterval={60} />
        </div>
        <div className="bg-muted/50 min-h-[50vh] sm:min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <PeriodMetrics />
        </div>
      </div>
    </>
  );
}
