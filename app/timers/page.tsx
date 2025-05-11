"use client";
import * as React from "react";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbList } from "@/components/ui/breadcrumb";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { ToggleTheme } from "../components/toggleTheme";
import AllTimers from "../components/allTimers";
import TimersByDay from "../components/timersByDay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const breadcrumbTranslations: Record<string, string> = {
  timers: "Horarios",
};

export default function TimersPage() {
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
        <h3 className="text-xl text-center font-bold">
          Los horarios se utilizan como referencia para el envio de
          notificaciones, estadisticas y reportes
        </h3>
        <Tabs defaultValue="by-employee" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-4">
            <TabsTrigger value="by-employee">Por Empleado</TabsTrigger>
            <TabsTrigger value="by-day">Por Día</TabsTrigger>
          </TabsList>

          <TabsContent value="by-employee" className="space-y-4">
            <AllTimers />
          </TabsContent>

          <TabsContent value="by-day" className="space-y-4">
            <TimersByDay />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
