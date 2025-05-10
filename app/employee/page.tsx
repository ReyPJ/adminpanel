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
import { ToggleTheme } from "../components/toggleTheme";
import { EmployeeList } from "../components/employeeList";
import { ActiveEmployees } from "../components/activeEmployees";
import { GetQRComponent } from "../components/getQrComponent";

// Diccionario de traducción para los segmentos de la ruta
const breadcrumbTranslations: Record<string, string> = {
  employee: "Empleados",
};

export default function EmployeePage() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  let pathSoFar = "";

  // Función para traducir el segmento
  const translateSegment = (segment: string) => {
    return (
      breadcrumbTranslations[segment.toLowerCase()] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  return (
    <div>
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

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <ActiveEmployees />
          <GetQRComponent />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <EmployeeList />
        </div>
      </div>
    </div>
  );
}
