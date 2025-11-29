"use client";

import * as React from "react";
import { getLiveSummary } from "@/app/utils/api";
import {
  LiveSummaryResponse,
  LiveSummaryEmployee,
  SalaryWarning,
} from "@/app/interfaces/salaryInterfaces";
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
  Users,
  AlertTriangle,
  Clock,
  Moon,
  Timer,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LiveSummaryProps {
  periodId?: number;
  employeeId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // en segundos
}

export function LiveSummary({
  periodId,
  employeeId,
  autoRefresh = false,
  refreshInterval = 30,
}: LiveSummaryProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<LiveSummaryResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  const fetchLiveSummary = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { period_id?: number; employee_id?: number } = {};
      if (periodId) params.period_id = periodId;
      if (employeeId) params.employee_id = employeeId;

      const response = await getLiveSummary(params);
      setData(response);
      setLastUpdate(new Date());
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar el resumen";
      setError(errorMessage);
      console.error("Error fetching live summary:", err);
    } finally {
      setLoading(false);
    }
  }, [periodId, employeeId]);

  // Efecto para carga inicial
  React.useEffect(() => {
    fetchLiveSummary();
  }, [fetchLiveSummary]);

  // Efecto para auto-refresh
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLiveSummary();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLiveSummary]);

  const formatCurrency = (value: string) => {
    const amount = parseFloat(value);
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getWarningIcon = (type: SalaryWarning["type"]) => {
    switch (type) {
      case "early_calculation":
        return <Clock className="h-4 w-4" />;
      case "missing_checkout":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getWarningVariant = (
    type: SalaryWarning["type"],
  ): "default" | "destructive" => {
    switch (type) {
      case "early_calculation":
        return "default";
      case "missing_checkout":
        return "destructive";
      default:
        return "default";
    }
  };

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <div className="text-sm text-muted-foreground">
            Cargando resumen de horas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
          <AlertTriangle className="h-8 w-8" />
          <div className="text-center">
            <p className="font-medium">Error al cargar el resumen</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchLiveSummary} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-2 text-amber-500">
          <AlertTriangle className="h-8 w-8" />
          <div className="text-sm">No hay datos disponibles</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resumen de Horas en Tiempo Real
            </CardTitle>
            <CardDescription>
              {data.period.description}
              {data.period.is_closed && (
                <Badge variant="outline" className="ml-2 bg-red-50">
                  Período Cerrado
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <div className="text-xs text-muted-foreground">
                Última actualización:{" "}
                {lastUpdate.toLocaleTimeString("es-CR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
            <Button
              onClick={fetchLiveSummary}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="mb-4 space-y-2">
            {data.warnings.map((warning, index) => (
              <Alert key={index} variant={getWarningVariant(warning.type)}>
                {getWarningIcon(warning.type)}
                <AlertTitle>Advertencia</AlertTitle>
                <AlertDescription>{warning.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-sm text-muted-foreground">
                Total Empleados
              </div>
            </div>
            <div className="text-2xl font-bold">{data.total_employees}</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div className="text-sm text-muted-foreground">
                Total Horas Trabajadas
              </div>
            </div>
            <div className="text-2xl font-bold">
              {data.employees
                .reduce((sum, emp) => sum + parseFloat(emp.total_hours), 0)
                .toFixed(1)}
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <div className="text-sm text-muted-foreground">
                Horas Nocturnas
              </div>
            </div>
            <div className="text-2xl font-bold">
              {data.employees
                .reduce((sum, emp) => sum + parseFloat(emp.night_hours), 0)
                .toFixed(1)}
            </div>
          </div>
        </div>

        {/* Tabla de empleados */}
        {data.employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-amber-500">
            <AlertTriangle className="h-8 w-8" />
            <div className="text-sm">
              No hay datos de asistencia para este período
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead className="text-right">Días</TableHead>
                  <TableHead className="text-right">Horas Reg.</TableHead>
                  <TableHead className="text-right">Horas Noct.</TableHead>
                  <TableHead className="text-right">Horas Extra</TableHead>
                  <TableHead className="text-right">Total Horas</TableHead>
                  <TableHead className="text-right">
                    Salario Estimado
                  </TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.employees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {employee.employee_username}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {employee.days_worked}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        {parseFloat(employee.regular_hours).toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Moon className="h-3 w-3 text-indigo-500" />
                        {parseFloat(employee.night_hours).toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Timer className="h-3 w-3 text-orange-500" />
                        {parseFloat(employee.extra_hours).toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-blue-50">
                        {parseFloat(employee.total_hours).toFixed(1)} hrs
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(employee.estimated_salary)}
                    </TableCell>
                    <TableCell className="text-center">
                      {employee.pending_checkout > 0 ? (
                        <Badge variant="outline" className="bg-amber-50">
                          {employee.pending_checkout} pendiente
                          {employee.pending_checkout > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50">
                          ✓ Completo
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer con información adicional */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            {autoRefresh && (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Actualización automática cada {refreshInterval}s
              </span>
            )}
          </div>
          <div>
            ℹ️ Los valores son estimados y no marcan registros como pagados
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
