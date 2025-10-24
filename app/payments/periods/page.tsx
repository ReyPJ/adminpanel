"use client";
import {
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Breadcrumb,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ToggleTheme } from "@/app/components/toggleTheme";
import { PeriodoActivo } from "@/app/components/PeriodoActivo";
import { ListaPeriodos } from "@/app/components/ListaPeriodos";
import { GestionPeriodos } from "@/app/components/GestionPeriodos";

const PeriodsPage: React.FC = () => {
  const segments = usePathname().split("/").filter(Boolean);
  let pathSoFar = "";

  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      payments: "Pagos",
      periods: "Periodos",
    };
    return (
      translations[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                        {translateSegment(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={pathSoFar}>
                        {translateSegment(segment)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Periodos de Pago</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Periodo Activo */}
          <PeriodoActivo />

          {/* Gestion de Periodos */}
          <GestionPeriodos />

          {/* Historial de Periodos */}
          <ListaPeriodos />
        </div>
      </main>
    </div>
  );
};

export default PeriodsPage;
