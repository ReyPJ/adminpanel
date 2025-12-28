"use client";

import * as React from "react";
import { getSalaryRecordsFromPeriod } from "@/app/utils/api";
import { salaryRecordInterface } from "@/app/interfaces/salaryRecord";
import * as XLSX from "xlsx";
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
import { FileText, Loader2, AlertTriangle, Moon, Download } from "lucide-react";

interface SalaryRecordsListProps {
  periodId: number;
  periodName?: string;
  refresh?: boolean;
}

export function SalaryRecordsList({
  periodId,
  periodName,
  refresh = false,
}: SalaryRecordsListProps) {
  const [loading, setLoading] = React.useState(true);
  const [records, setRecords] = React.useState<salaryRecordInterface[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (records.length === 0) return;

    // Preparar datos para el Excel
    const excelData = records.map((record) => ({
      "Empleado": record.employee_name,
      "Horas Netas": Number(record.net_hours ?? record.total_hours).toFixed(2),
      "Horas Extra": Number(record.extra_hours || 0).toFixed(2),
      "Horas Nocturnas": Number(record.night_hours || 0).toFixed(2),
      "Ded. Almuerzo": Number(record.lunch_deduction_hours || 0).toFixed(2),
      "Salario Bruto": record.gross_salary ? `₡${parseFloat(record.gross_salary).toLocaleString()}` : "N/A",
      "Otras Ded.": record.other_deductions ? `₡${parseFloat(record.other_deductions).toLocaleString()}` : "₡0",
      "Salario a Pagar": `₡${parseFloat(record.salary_to_pay).toLocaleString()}`,
    }));

    // Calcular totales
    const totalSalary = records.reduce((sum, r) => sum + parseFloat(r.salary_to_pay), 0);
    const totalNetHours = records.reduce((sum, r) => sum + Number(r.net_hours ?? r.total_hours), 0);
    const totalExtraHours = records.reduce((sum, r) => sum + Number(r.extra_hours || 0), 0);

    // Agregar fila de totales
    excelData.push({
      "Empleado": "TOTALES",
      "Horas Netas": totalNetHours.toFixed(2),
      "Horas Extra": totalExtraHours.toFixed(2),
      "Horas Nocturnas": "",
      "Ded. Almuerzo": "",
      "Salario Bruto": "",
      "Otras Ded.": "",
      "Salario a Pagar": `₡${totalSalary.toLocaleString()}`,
    });

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 25 }, // Empleado
      { wch: 12 }, // Horas Netas
      { wch: 12 }, // Horas Extra
      { wch: 14 }, // Horas Nocturnas
      { wch: 13 }, // Ded. Almuerzo
      { wch: 15 }, // Salario Bruto
      { wch: 12 }, // Otras Ded.
      { wch: 16 }, // Salario a Pagar
    ];
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salarios");

    // Generar nombre del archivo
    const displayName = periodName || records[0]?.period_name || `Periodo_${periodId}`;
    const fileName = `Resumen_Salarios_${displayName.replace(/\s+/g, "_")}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
  };

  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSalaryRecordsFromPeriod(periodId);
        console.log(data);
        setRecords(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los registros de salario:", error);
        setError("No se pudieron cargar los registros de salario");
        setLoading(false);
      }
    };

    if (periodId) {
      fetchRecords();
    }
  }, [periodId, refresh]);

  const formatCurrency = (value: string) => {
    return `₡${parseFloat(value).toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Registros de Salarios
            </CardTitle>
            <CardDescription>
              {periodName || `Periodo ID: ${periodId}`} | Total: {records.length} registros
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
              Cargando registros de salario...
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
              No hay registros de salario para este período
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Horas Totales</TableHead>
                  <TableHead>Nocturnas</TableHead>
                  <TableHead>Horas Extra</TableHead>
                  <TableHead>Salario Bruto</TableHead>
                  <TableHead>Salario a Pagar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.employee_name}
                    </TableCell>
                    <TableCell>
                      {Number.isFinite(Number(record.total_hours))
                        ? Number(record.total_hours).toFixed(2)
                        : "0.00"}{" "}
                      hrs
                    </TableCell>
                    <TableCell>
                      {record.has_night_hours ? (
                        <div className="flex items-center gap-1">
                          <Moon className="h-4 w-4 text-indigo-500" />
                          <span>
                            {Number.isFinite(Number(record.night_hours))
                              ? Number(record.night_hours).toFixed(2)
                              : "0.00"}{" "}
                            hrs
                          </span>
                        </div>
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    <TableCell>
                      {Number.isFinite(Number(record.extra_hours))
                        ? Number(record.extra_hours).toFixed(2)
                        : "0.00"}{" "}
                      hrs
                    </TableCell>
                    <TableCell>
                      {record.gross_salary
                        ? formatCurrency(record.gross_salary)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {formatCurrency(record.salary_to_pay)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
