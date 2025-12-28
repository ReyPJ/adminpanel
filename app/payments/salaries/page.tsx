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
import { PeriodSelector } from "@/app/components/salary/PeriodSelector";
import { EmployeeNightHoursList } from "@/app/components/salary/EmployeeNightHoursList";
import { SalaryRecordsList } from "@/app/components/salary/SalaryRecordsList";
import { SalaryCalculationForm } from "@/app/components/salary/SalaryCalculationForm";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import { nightHoursCountInterface } from "@/app/interfaces/salaryInterfaces";

const SalariesPage: React.FC = () => {
  const segments = usePathname().split("/").filter(Boolean);
  let pathSoFar = "";
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<getPeriodResponse | null>(null);
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<nightHoursCountInterface | null>(null);
  const [showCalculationForm, setShowCalculationForm] = React.useState(false);
  const [calculationComplete, setCalculationComplete] = React.useState(false);

  const handlePeriodSelected = (period: getPeriodResponse) => {
    setSelectedPeriod(period);
    setSelectedEmployee(null);
    setShowCalculationForm(false);
    setCalculationComplete(false);
  };

  const handleEmployeeSelected = (
    employee:
      | nightHoursCountInterface
      | {
          id: number;
          full_name: string;
          username: string;
          night_hours: number;
          night_shift_factor: number;
          has_night_hours: boolean;
        }
  ) => {
    if ("period" in employee) {
      setSelectedEmployee(employee);
    } else {
      setSelectedEmployee({
        ...employee,
        period: [], // Aquí podrías poner la info real si la tenés
      });
    }
    setShowCalculationForm(true);
    setCalculationComplete(false);
  };

  const handleCalculationComplete = () => {
    setCalculationComplete(true);
    setShowCalculationForm(false);
  };

  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      payments: "Pagos",
      periods: "Periodos",
      salaries: "Salarios",
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

      <main className="flex-1 p-6 md:p-8 space-y-8">
        <h1 className="text-3xl font-bold">Cálculo de Salarios</h1>

        {/* Selector de período */}
        <PeriodSelector onPeriodSelected={handlePeriodSelected} />

        {/* Contenido condicional basado en el periodo seleccionado */}
        {selectedPeriod ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Lista de empleados con horas nocturnas */}
              <EmployeeNightHoursList
                periodId={selectedPeriod.id}
                onEmployeeSelected={handleEmployeeSelected}
              />
            </div>

            <div>
              {/* Formulario de cálculo o listado de registros */}
              {showCalculationForm && selectedEmployee ? (
                <SalaryCalculationForm
                  employee={selectedEmployee}
                  periodId={selectedPeriod.id}
                  onCalculationComplete={handleCalculationComplete}
                />
              ) : (
                <SalaryRecordsList
                  periodId={selectedPeriod.id}
                  periodName={selectedPeriod.description}
                  refresh={calculationComplete}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-lg text-muted-foreground">
            Selecciona un período para comenzar el cálculo de salarios
          </div>
        )}
      </main>
    </div>
  );
};

export default SalariesPage;
