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
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, DollarSign, Users, Download } from "lucide-react";
import * as XLSX from "xlsx";

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

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (records.length === 0) return;

    const displayName = selectedPeriod?.description || records[0]?.period_name || `Periodo`;
    const fechaGeneracion = new Date().toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Calcular totales
    const totalSalary = records.reduce((sum, r) => sum + parseFloat(r.salary_to_pay), 0);
    const totalNetHours = records.reduce((sum, r) => sum + Number(r.net_hours ?? r.total_hours), 0);
    const totalExtraHours = records.reduce((sum, r) => sum + Number(r.extra_hours || 0), 0);
    const totalNightHours = records.reduce((sum, r) => sum + Number(r.night_hours || 0), 0);

    // Crear datos con encabezado profesional
    const worksheetData: (string | number)[][] = [
      // Encabezado
      ["RESUMEN DE PAGOS"],
      [`Período: ${displayName}`],
      [`Fecha de generación: ${fechaGeneracion}`],
      [`Total empleados: ${records.length}`],
      [], // Fila vacía
      // Encabezados de columnas
      ["Empleado", "Horas Netas", "Horas Extra", "Horas Noct.", "Ded. Almuerzo", "Salario Bruto", "Otras Ded.", "Salario a Pagar"],
    ];

    // Agregar datos de empleados
    records.forEach((record) => {
      worksheetData.push([
        record.employee_name,
        Number(record.net_hours ?? record.total_hours).toFixed(2),
        Number(record.extra_hours || 0).toFixed(2),
        Number(record.night_hours || 0).toFixed(2),
        Number(record.lunch_deduction_hours || 0).toFixed(2),
        record.gross_salary ? `₡${parseFloat(record.gross_salary).toLocaleString()}` : "N/A",
        record.other_deductions ? `₡${parseFloat(record.other_deductions).toLocaleString()}` : "₡0",
        `₡${parseFloat(record.salary_to_pay).toLocaleString()}`,
      ]);
    });

    // Fila vacía antes de totales
    worksheetData.push([]);

    // Fila de totales
    worksheetData.push([
      "TOTALES",
      totalNetHours.toFixed(2),
      totalExtraHours.toFixed(2),
      totalNightHours.toFixed(2),
      "",
      "",
      "",
      `₡${totalSalary.toLocaleString()}`,
    ]);

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge cells para el título
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Título
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Período
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Fecha
      { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }, // Total empleados
    ];

    // Ajustar ancho de columnas
    worksheet["!cols"] = [
      { wch: 28 }, // Empleado
      { wch: 12 }, // Horas Netas
      { wch: 12 }, // Horas Extra
      { wch: 12 }, // Horas Noct.
      { wch: 13 }, // Ded. Almuerzo
      { wch: 15 }, // Salario Bruto
      { wch: 12 }, // Otras Ded.
      { wch: 17 }, // Salario a Pagar
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen Pagos");

    // Generar nombre del archivo
    const fileName = `Resumen_Pagos_${displayName.replace(/\s+/g, "_")}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
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
                  </div>
                  {records.length > 0 && (
                    <Button
                      onClick={exportToExcel}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar Excel
                    </Button>
                  )}
                </div>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
