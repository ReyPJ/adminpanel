"use client";

import * as React from "react";
import { getSalaryRecordsFromPeriod } from "@/app/utils/api";
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
import { FileText, Loader2, AlertTriangle, Moon } from "lucide-react";

interface SalaryRecordsListProps {
  periodId: number;
  refresh?: boolean;
}

export function SalaryRecordsList({
  periodId,
  refresh = false,
}: SalaryRecordsListProps) {
  const [loading, setLoading] = React.useState(true);
  const [records, setRecords] = React.useState<salaryRecordInterface[]>([]);
  const [error, setError] = React.useState<string | null>(null);

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
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Registros de Salarios
        </CardTitle>
        <CardDescription>
          Periodo ID: {periodId} | Total: {records.length} registros
        </CardDescription>
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
