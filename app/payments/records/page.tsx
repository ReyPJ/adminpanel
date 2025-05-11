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
import { getSalaryRecordsFromPeriod } from "@/app/utils/api";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import { salaryRecordInterface } from "@/app/interfaces/salaryRecord";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, DollarSign, Users } from "lucide-react";

const PaymentRecordsPage: React.FC = () => {
  const segments = usePathname().split("/").filter(Boolean);
  let pathSoFar = "";
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<getPeriodResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [records, setRecords] = React.useState<salaryRecordInterface[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = React.useState<number | null>(
    null
  );

  const handlePeriodSelected = async (period: getPeriodResponse) => {
    setSelectedPeriod(period);
    setSelectedEmployee(null);

    try {
      setLoading(true);
      setError(null);
      const data = await getSalaryRecordsFromPeriod(period.id);
      setRecords(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar los registros de salario:", error);
      setError("No se pudieron cargar los registros de salario");
      setLoading(false);
    }
  };

  const handleEmployeeClick = (employeeId: number) => {
    setSelectedEmployee(employeeId === selectedEmployee ? null : employeeId);
  };

  const formatCurrency = (value: string) => {
    return `₡${parseFloat(value).toLocaleString()}`;
  };

  const getTotalPayment = () => {
    return records.reduce((total, record) => {
      return total + parseFloat(record.salary_to_pay);
    }, 0);
  };

  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      payments: "Pagos",
      periods: "Periodos",
      salaries: "Salarios",
      records: "Registros",
    };
    return (
      translations[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  const getEmployeeRecords = (employeeId: number) => {
    return records.filter((record) => record.employee === employeeId);
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
        <h1 className="text-3xl font-bold">Registros de Pagos</h1>

        {/* Selector de período */}
        <PeriodSelector onPeriodSelected={handlePeriodSelected} />

        {/* Contenido condicional basado en el periodo seleccionado */}
        {selectedPeriod ? (
          <div className="space-y-8">
            {/* Resumen de pagos del período */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumen de Pagos del Período
                </CardTitle>
                <CardDescription>
                  {selectedPeriod.description} | Total a pagar:
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-lg">
                    {formatCurrency(getTotalPayment().toString())}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <div className="text-sm text-muted-foreground">
                      Cargando registros de pagos...
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-red-500">
                    <AlertTriangle className="h-8 w-8" />
                    <div className="text-sm">{error}</div>
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-amber-500">
                    <AlertTriangle className="h-8 w-8" />
                    <div className="text-sm text-center">
                      No hay registros de pagos para este período
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empleado</TableHead>
                          <TableHead>Salario a Pagar</TableHead>
                          <TableHead>Horas Totales</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Agrupamos por empleado para evitar duplicados */}
                        {Array.from(
                          new Set(records.map((r) => r.employee))
                        ).map((employeeId) => {
                          const employeeRecords =
                            getEmployeeRecords(employeeId);
                          const totalSalary = employeeRecords.reduce(
                            (sum, r) => sum + parseFloat(r.salary_to_pay),
                            0
                          );
                          const totalHours = employeeRecords.reduce(
                            (sum, r) => sum + Number(r.total_hours),
                            0
                          );
                          const employeeName =
                            employeeRecords[0]?.employee_name || "Empleado";

                          return (
                            <React.Fragment key={employeeId}>
                              <TableRow
                                className={
                                  selectedEmployee === employeeId
                                    ? "bg-muted/50"
                                    : ""
                                }
                                onClick={() => handleEmployeeClick(employeeId)}
                                style={{ cursor: "pointer" }}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {employeeName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    {formatCurrency(totalSalary.toString())}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {totalHours.toFixed(2)} hrs
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer"
                                  >
                                    {selectedEmployee === employeeId
                                      ? "Ocultar Detalles"
                                      : "Ver Detalles"}
                                  </Badge>
                                </TableCell>
                              </TableRow>

                              {/* Fila de detalle expandible */}
                              {selectedEmployee === employeeId &&
                                employeeRecords.map((record) => (
                                  <TableRow
                                    key={record.id}
                                    className="bg-muted/20"
                                  >
                                    <TableCell colSpan={4} className="p-0">
                                      <div className="p-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Horas Regulares
                                            </div>
                                            <div>
                                              {Number.isFinite(
                                                Number(record.regular_hours)
                                              )
                                                ? Number(
                                                    record.regular_hours
                                                  ).toFixed(2)
                                                : "0.00"}{" "}
                                              hrs
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Horas Nocturnas
                                            </div>
                                            <div>
                                              {Number.isFinite(
                                                Number(record.night_hours)
                                              )
                                                ? Number(
                                                    record.night_hours
                                                  ).toFixed(2)
                                                : "0.00"}{" "}
                                              hrs
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Horas Extra
                                            </div>
                                            <div>
                                              {Number.isFinite(
                                                Number(record.extra_hours)
                                              )
                                                ? Number(
                                                    record.extra_hours
                                                  ).toFixed(2)
                                                : "0.00"}{" "}
                                              hrs
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Salario Bruto
                                            </div>
                                            <div>
                                              {record.gross_salary
                                                ? formatCurrency(
                                                    record.gross_salary
                                                  )
                                                : "N/A"}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Deducciones
                                            </div>
                                            <div>
                                              {record.other_deductions
                                                ? formatCurrency(
                                                    record.other_deductions
                                                  )
                                                : "₡0"}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Descripción
                                            </div>
                                            <div>
                                              {record.other_deductions_description ||
                                                "Sin deducciones"}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Fecha de Pago
                                            </div>
                                            <div>
                                              {new Date(
                                                record.paid_at
                                              ).toLocaleDateString()}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Pago Final
                                            </div>
                                            <div className="font-medium text-green-700 dark:text-green-500">
                                              {formatCurrency(
                                                record.salary_to_pay
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center p-8 text-lg text-muted-foreground">
            Selecciona un período para ver los registros de pagos
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentRecordsPage;
