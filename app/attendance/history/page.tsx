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
import { getAttendanceDetails, getAllEmployees } from "@/app/utils/api";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
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
import {
  Loader2,
  AlertTriangle,
  Clock,
  Users,
  Calendar,
  Moon,
  Timer,
  Download,
} from "lucide-react";
import { attendanceInterface } from "@/app/interfaces/attendanceDetailsInterface";
import { EmployeeInterface } from "@/app/interfaces/employeInterfa";
import * as XLSX from "xlsx";

// Interfaz para estadísticas agregadas por empleado
interface EmployeeStats {
  id: number;
  name: string;
  totalDays: number;
  totalRegularHours: number;
  totalNightHours: number;
  totalExtraHours: number;
  totalLunchDeduction: number;
  totalWorkHours: number;
  details: attendanceInterface[];
}

const AttendanceHistoryPage: React.FC = () => {
  const segments = usePathname().split("/").filter(Boolean);
  let pathSoFar = "";
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<getPeriodResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [attendanceData, setAttendanceData] = React.useState<
    attendanceInterface[]
  >([]);
  const [employees, setEmployees] = React.useState<EmployeeInterface[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = React.useState<number | null>(
    null,
  );

  // Cargar la lista de empleados desde la API al inicio
  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getAllEmployees();
        // Excluir usuario con id 1 (admin)
        const filteredEmployees = response.filter(
          (employee: EmployeeInterface) => employee.id !== 1,
        );
        setEmployees(filteredEmployees);
        // Actualizar localStorage para otros componentes
        localStorage.setItem("employees_list", JSON.stringify(response));
      } catch (error) {
        console.error("Error al cargar empleados desde la API:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handlePeriodSelected = async (period: getPeriodResponse) => {
    setSelectedPeriod(period);
    setSelectedEmployee(null);
    // Limpiamos los datos de asistencia al cambiar de periodo
    setAttendanceData([]);
  };

  const handleEmployeeClick = async (employeeId: number) => {
    // Si ya está seleccionado, lo deseleccionamos
    if (employeeId === selectedEmployee) {
      setSelectedEmployee(null);
      return;
    }

    // Si no está seleccionado, lo seleccionamos y cargamos sus datos
    setSelectedEmployee(employeeId);

    if (!selectedPeriod) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAttendanceDetails(employeeId, selectedPeriod.id);
      setAttendanceData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar los datos de asistencia:", error);
      setError("No se pudieron cargar los datos de asistencia");
      setLoading(false);
    }
  };

  // Agrupar datos por empleado y calcular estadísticas
  const getEmployeeStats = (): EmployeeStats[] => {
    // Obtenemos primero la lista básica de empleados
    const baseEmployees = employees
      .filter((emp) => emp.id !== undefined) // Solo incluimos empleados con id definido
      .map((emp) => ({
        id: emp.id as number, // Aseguramos que id es number después del filtro
        name: `${emp.first_name || ""} ${emp.last_name || ""}`,
        totalDays: 0,
        totalRegularHours: 0,
        totalNightHours: 0,
        totalExtraHours: 0,
        totalLunchDeduction: 0,
        totalWorkHours: 0,
        details: [],
      }));

    // Si no hay datos de asistencia o no hay empleado seleccionado, retornamos la lista básica
    if (!selectedEmployee || attendanceData.length === 0) {
      return baseEmployees;
    }

    const employeeMap = new Map<number, EmployeeStats>();

    attendanceData.forEach((record) => {
      if (!employeeMap.has(record.employee)) {
        employeeMap.set(record.employee, {
          id: record.employee,
          name: record.employee_name,
          totalDays: 0,
          totalRegularHours: 0,
          totalNightHours: 0,
          totalExtraHours: 0,
          totalLunchDeduction: 0,
          totalWorkHours: 0,
          details: [],
        });
      }

      const stats = employeeMap.get(record.employee)!;
      stats.totalDays += 1;
      stats.totalRegularHours += parseFloat(record.regular_hours);
      stats.totalNightHours += parseFloat(record.night_hours);
      stats.totalExtraHours += parseFloat(record.extra_hours);
      stats.totalLunchDeduction += parseFloat(record.lunch_deduction);
      // Horas trabajadas = regulares + nocturnas (sin incluir horas extra)
      stats.totalWorkHours +=
        parseFloat(record.regular_hours) +
        parseFloat(record.night_hours);
      stats.details.push(record);
    });

    // Obtenemos los datos de asistencia del empleado seleccionado
    const attendanceStats = Array.from(employeeMap.values());

    // Si el empleado seleccionado tiene datos, mostramos solo esos datos
    // Si no, mostramos todos los empleados base
    if (attendanceStats.length > 0) {
      return attendanceStats;
    } else {
      return baseEmployees;
    }
  };

  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      attendance: "Asistencia",
      history: "Historial",
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

  const employeeStats = getEmployeeStats();

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (attendanceData.length === 0 || !selectedEmployee) return;

    const employeeName = attendanceData[0]?.employee_name || "Empleado";
    const displayName = selectedPeriod?.description || "Periodo";
    const fechaGeneracion = new Date().toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Calcular totales
    const stats = employeeStats.find(s => s.id === selectedEmployee);
    const totalDays = stats?.totalDays || 0;
    const totalNightHours = stats?.totalNightHours || 0;
    const totalExtraHours = stats?.totalExtraHours || 0;
    const totalWorkHours = stats?.totalWorkHours || 0;

    // Crear datos con encabezado profesional
    const worksheetData: (string | number)[][] = [
      ["HISTORIAL DE ASISTENCIA"],
      [`Empleado: ${employeeName}`],
      [`Período: ${displayName}`],
      [`Fecha de generación: ${fechaGeneracion}`],
      [],
      // Resumen
      ["RESUMEN"],
      ["Días trabajados", totalDays.toString()],
      ["Horas trabajadas", totalWorkHours.toFixed(2)],
      ["Horas nocturnas", totalNightHours.toFixed(2)],
      ["Horas extra", totalExtraHours.toFixed(2)],
      [],
      // Detalle diario
      ["DETALLE DIARIO"],
      ["Fecha", "Entrada", "Salida", "Horas Reg.", "Horas Noct.", "Ded. Almuerzo"],
    ];

    // Agregar datos de cada día
    attendanceData.forEach((record) => {
      worksheetData.push([
        record.formatted_date,
        record.time_in?.slice(0, 5) || "-",
        record.time_out?.slice(0, 5) || "-",
        parseFloat(record.regular_hours).toFixed(2),
        parseFloat(record.night_hours).toFixed(2),
        parseFloat(record.lunch_deduction).toFixed(2),
      ]);
    });

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge cells para encabezados
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } },
      { s: { r: 11, c: 0 }, e: { r: 11, c: 5 } },
    ];

    // Ajustar ancho de columnas
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

    const fileName = `Asistencia_${employeeName.replace(/\s+/g, "_")}_${displayName.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Estado para controlar la carga del resumen
  const [loadingSummary, setLoadingSummary] = React.useState(false);

  // Función para exportar resumen completo a Excel con hojas por empleado
  const exportSummaryToExcel = async () => {
    if (employees.length === 0 || !selectedPeriod) return;

    setLoadingSummary(true);

    try {
      // Cargar datos de asistencia de TODOS los empleados
      const employeeDataMap = new Map<number, attendanceInterface[]>();

      for (const emp of employees) {
        if (emp.id) {
          try {
            const data = await getAttendanceDetails(emp.id, selectedPeriod.id);
            if (data.length > 0) {
              employeeDataMap.set(emp.id, data);
            }
          } catch {
            console.warn(`No se pudieron cargar datos para empleado ${emp.id}`);
          }
        }
      }

      if (employeeDataMap.size === 0) {
        setLoadingSummary(false);
        setError("No hay datos de asistencia para exportar en este período");
        return;
      }

      // Calcular estadísticas por empleado
      const allStats: EmployeeStats[] = [];

      employeeDataMap.forEach((records, employeeId) => {
        const stat: EmployeeStats = {
          id: employeeId,
          name: records[0]?.employee_name || "Empleado",
          totalDays: records.length,
          totalRegularHours: 0,
          totalNightHours: 0,
          totalExtraHours: 0,
          totalLunchDeduction: 0,
          totalWorkHours: 0,
          details: records,
        };

        records.forEach((record) => {
          stat.totalRegularHours += parseFloat(record.regular_hours);
          stat.totalNightHours += parseFloat(record.night_hours);
          stat.totalExtraHours += parseFloat(record.extra_hours);
          stat.totalLunchDeduction += parseFloat(record.lunch_deduction);
          stat.totalWorkHours += parseFloat(record.regular_hours) + parseFloat(record.night_hours);
        });

        allStats.push(stat);
      });

      const displayName = selectedPeriod.description || "Periodo";
      const fechaGeneracion = new Date().toLocaleDateString("es-CR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Calcular totales generales
      const totalDays = allStats.reduce((sum, s) => sum + s.totalDays, 0);
      const totalWorkHours = allStats.reduce((sum, s) => sum + s.totalWorkHours, 0);
      const totalNightHours = allStats.reduce((sum, s) => sum + s.totalNightHours, 0);
      const totalExtraHours = allStats.reduce((sum, s) => sum + s.totalExtraHours, 0);
      const totalLunchDeduction = allStats.reduce((sum, s) => sum + s.totalLunchDeduction, 0);

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // ========== HOJA 1: RESUMEN GENERAL ==========
      const summaryData: (string | number)[][] = [
        ["RESUMEN DE ASISTENCIA"],
        [`Período: ${displayName}`],
        [`Fecha de generación: ${fechaGeneracion}`],
        [`Total empleados: ${allStats.length}`],
        [],
        ["Empleado", "Días Trab.", "Horas Trab.", "Horas Noct.", "Horas Extra", "Ded. Almuerzo"],
      ];

      allStats.forEach((stat) => {
        summaryData.push([
          stat.name,
          stat.totalDays,
          stat.totalWorkHours.toFixed(2),
          stat.totalNightHours.toFixed(2),
          stat.totalExtraHours.toFixed(2),
          stat.totalLunchDeduction.toFixed(2),
        ]);
      });

      summaryData.push([]);
      summaryData.push([
        "TOTALES",
        totalDays,
        totalWorkHours.toFixed(2),
        totalNightHours.toFixed(2),
        totalExtraHours.toFixed(2),
        totalLunchDeduction.toFixed(2),
      ]);

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
      ];
      summarySheet["!cols"] = [
        { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
      ];

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

      // ========== HOJAS POR EMPLEADO ==========
      allStats.forEach((stat) => {
        const employeeData: (string | number)[][] = [
          ["DETALLE DE ASISTENCIA"],
          [`Empleado: ${stat.name}`],
          [`Período: ${displayName}`],
          [`Fecha de generación: ${fechaGeneracion}`],
          [],
          ["RESUMEN"],
          ["Días trabajados", stat.totalDays],
          ["Horas trabajadas", stat.totalWorkHours.toFixed(2)],
          ["Horas nocturnas", stat.totalNightHours.toFixed(2)],
          ["Horas extra", stat.totalExtraHours.toFixed(2)],
          ["Ded. almuerzo", stat.totalLunchDeduction.toFixed(2)],
          [],
          ["DETALLE DIARIO"],
          ["Fecha", "Entrada", "Salida", "Horas Reg.", "Horas Noct.", "Horas Extra", "Ded. Almuerzo"],
        ];

        // Agregar detalle de cada día
        stat.details.forEach((record) => {
          employeeData.push([
            record.formatted_date,
            record.time_in?.slice(0, 5) || "-",
            record.time_out?.slice(0, 5) || "-",
            parseFloat(record.regular_hours).toFixed(2),
            parseFloat(record.night_hours).toFixed(2),
            parseFloat(record.extra_hours).toFixed(2),
            parseFloat(record.lunch_deduction).toFixed(2),
          ]);
        });

        const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
        employeeSheet["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
          { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
          { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
          { s: { r: 12, c: 0 }, e: { r: 12, c: 6 } },
        ];
        employeeSheet["!cols"] = [
          { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
        ];

        // Nombre de la hoja (máximo 31 caracteres, sin caracteres especiales)
        const sheetName = stat.name
          .replace(/[\\/*?:\[\]]/g, "")
          .substring(0, 31);

        XLSX.utils.book_append_sheet(workbook, employeeSheet, sheetName);
      });

      const fileName = `Asistencia_Completa_${displayName.replace(/\s+/g, "_")}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Error al exportar resumen:", err);
      setError("Error al generar el resumen de asistencia");
    } finally {
      setLoadingSummary(false);
    }
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
        <h1 className="text-3xl font-bold">Historial de Asistencia</h1>

        {/* Selector de período */}
        <PeriodSelector onPeriodSelected={handlePeriodSelected} />

        {/* Contenido condicional basado en el periodo seleccionado */}
        {selectedPeriod ? (
          <div className="space-y-8">
            {/* Resumen de asistencia del período */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Resumen de Asistencia
                    </CardTitle>
                    <CardDescription>
                      {selectedPeriod.description} | Total empleados:{" "}
                      {employeeStats.length}
                    </CardDescription>
                  </div>
                  {employees.length > 0 && (
                    <Button
                      onClick={exportSummaryToExcel}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={loadingSummary}
                    >
                      {loadingSummary ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Descargar Resumen
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <div className="text-sm text-muted-foreground">
                      Cargando datos de asistencia...
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-red-500">
                    <AlertTriangle className="h-8 w-8" />
                    <div className="text-sm">{error}</div>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-amber-500">
                    <AlertTriangle className="h-8 w-8" />
                    <div className="text-sm text-center">
                      No se encontraron empleados. Por favor cree empleados
                      primero en la sección correspondiente.
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empleado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeStats.map((stat) => (
                          <React.Fragment key={stat.id}>
                            <TableRow
                              className={
                                selectedEmployee === stat.id
                                  ? "bg-muted/50"
                                  : ""
                              }
                              onClick={() => handleEmployeeClick(stat.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  {stat.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                {selectedEmployee === stat.id ? (
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className="cursor-pointer bg-red-50 text-red-700 hover:bg-red-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEmployeeClick(stat.id);
                                      }}
                                    >
                                      ← Volver al Resumen
                                    </Badge>
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEmployeeClick(stat.id);
                                    }}
                                  >
                                    Ver Asistencia →
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>

                            {/* Detalle de asistencia por día */}
                            {selectedEmployee === stat.id && (
                              <TableRow className="bg-muted/20">
                                <TableCell colSpan={2} className="p-0">
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-sm font-medium">
                                        {attendanceData.length > 0
                                          ? `Detalle de asistencia diaria - ${stat.name}`
                                          : `Sin datos de asistencia - ${stat.name}`}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        {attendanceData.length > 0 && (
                                          <Button
                                            onClick={exportToExcel}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 text-xs"
                                          >
                                            <Download className="h-3 w-3" />
                                            Excel
                                          </Button>
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="cursor-pointer bg-red-50 text-red-700 hover:bg-red-100 text-xs"
                                          onClick={() =>
                                            handleEmployeeClick(stat.id)
                                          }
                                        >
                                          ✕ Cerrar
                                        </Badge>
                                      </div>
                                    </div>

                                    {attendanceData.length === 0 ? (
                                      // Mostrar mensaje cuando no hay datos
                                      <div className="flex flex-col items-center justify-center py-8 gap-3 text-amber-500">
                                        <AlertTriangle className="h-12 w-12" />
                                        <div className="text-center">
                                          <p className="font-medium">
                                            No hay datos de asistencia
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            Este empleado no tiene registros de
                                            entrada/salida para el período
                                            seleccionado
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 mt-2"
                                          onClick={() =>
                                            handleEmployeeClick(stat.id)
                                          }
                                        >
                                          ← Volver al Resumen
                                        </Badge>
                                      </div>
                                    ) : (
                                      // Mostrar datos cuando existen
                                      <>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Días trabajados
                                            </div>
                                            <div className="font-medium">
                                              {stat.totalDays}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Horas Trabajadas
                                            </div>
                                            <div className="font-medium">
                                              <Badge
                                                variant="outline"
                                                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                              >
                                                {stat.totalWorkHours.toFixed(1)}{" "}
                                                hrs
                                              </Badge>
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Horas Nocturnas
                                            </div>
                                            <div className="font-medium flex items-center gap-1">
                                              <Moon className="h-4 w-4 text-indigo-500" />
                                              {stat.totalNightHours.toFixed(1)} hrs
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-sm text-muted-foreground">
                                              Horas Extra
                                            </div>
                                            <div className="font-medium">
                                              <Badge
                                                variant="outline"
                                                className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                                              >
                                                <Timer className="h-4 w-4 mr-1" />
                                                {stat.totalExtraHours.toFixed(1)} hrs
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Entrada</TableHead>
                                                <TableHead>Salida</TableHead>
                                                <TableHead>
                                                  Horas Reg.
                                                </TableHead>
                                                <TableHead>
                                                  Horas Noct.
                                                </TableHead>
                                                <TableHead>
                                                  Horas Rebajadas de Almuerzo
                                                </TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {stat.details.map((detail) => (
                                                <TableRow key={detail.id}>
                                                  <TableCell>
                                                    <div className="flex items-center gap-1">
                                                      <Calendar className="h-3 w-3" />
                                                      {detail.formatted_date}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    {detail.time_in?.slice(0, 5) || '-'}
                                                  </TableCell>
                                                  <TableCell>
                                                    {detail.time_out?.slice(0, 5) || '-'}
                                                  </TableCell>
                                                  <TableCell>
                                                    {parseFloat(
                                                      detail.regular_hours,
                                                    ).toFixed(1)}
                                                  </TableCell>
                                                  <TableCell>
                                                    {parseFloat(
                                                      detail.night_hours,
                                                    ).toFixed(1)}
                                                  </TableCell>
                                                  <TableCell>
                                                    {parseFloat(
                                                      detail.lunch_deduction,
                                                    ).toFixed(1)}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center p-8 text-lg text-muted-foreground">
            Selecciona un período para ver el historial de asistencia
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceHistoryPage;
