"use client";
import * as React from "react";
import { getActivePeriod, getEmployeeStats } from "@/app/utils/api";
import { AllEmployeeStats } from "@/app/interfaces/Stats";
import {
  Loader2,
  Clock,
  Users,
  Award,
  TrendingUp,
  BarChart,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PeriodMetrics() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [stats, setStats] = React.useState<AllEmployeeStats | null>(null);
  const [noPeriodActive, setNoPeriodActive] = React.useState<boolean>(false);
  const [metrics, setMetrics] = React.useState({
    totalHours: 0,
    averageHours: 0,
    topEmployee: { name: "", hours: 0 },
    comparison: {
      percentage: 0,
      minEmployee: { name: "", hours: 0 },
    },
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Primero verificamos si hay un periodo activo
        const activePeriod = await getActivePeriod();

        // Si no hay un periodo activo (objeto vacío o sin ID)
        if (!activePeriod || !activePeriod.id) {
          setNoPeriodActive(true);
          setLoading(false);
          return;
        }

        // Si hay un periodo activo, obtenemos las estadísticas
        const data = await getEmployeeStats();
        setStats(data);

        // Calcular métricas
        if (data.stats.length > 0) {
          // Total de horas trabajadas
          const totalHours = data.stats.reduce(
            (sum, employee) => sum + employee.total_hours,
            0
          );

          // Promedio de horas por empleado
          const averageHours = totalHours / data.stats.length;

          // Empleado con más horas
          const topEmployee = data.stats.reduce(
            (max, employee) =>
              employee.total_hours > max.hours
                ? { name: employee.employee_name, hours: employee.total_hours }
                : max,
            { name: "", hours: 0 }
          );

          // Empleado con menos horas
          const minEmployee = data.stats.reduce(
            (min, employee) =>
              (min.hours === 0 || employee.total_hours < min.hours) &&
              employee.total_hours > 0
                ? { name: employee.employee_name, hours: employee.total_hours }
                : min,
            { name: "", hours: 0 }
          );

          // Calcular la diferencia porcentual entre el que más y el que menos horas hace
          let percentageDiff = 0;
          if (minEmployee.hours > 0) {
            percentageDiff =
              ((topEmployee.hours - minEmployee.hours) / minEmployee.hours) *
              100;
          }

          setMetrics({
            totalHours,
            averageHours,
            topEmployee,
            comparison: {
              percentage: percentageDiff,
              minEmployee,
            },
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats for metrics:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span>Métricas del Período</span>
          <BarChart className="text-blue-600" size={22} />
        </CardTitle>
        <CardDescription>
          {stats?.pay_period
            ? `Período: ${stats.pay_period.description}`
            : noPeriodActive
            ? "No hay periodo activo"
            : "Cargando..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-2">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <span className="text-lg text-muted-foreground">
              Cargando métricas...
            </span>
          </div>
        ) : noPeriodActive ? (
          <div className="flex flex-col items-center justify-center h-56 gap-2 text-amber-600">
            <AlertTriangle size={36} />
            <span className="text-lg text-center">
              No hay un periodo activo.
              <br />
              Crea un nuevo periodo para ver las métricas.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total de horas trabajadas */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                  Total de horas
                </h3>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {metrics.totalHours.toFixed(2)}
              </p>
            </div>

            {/* Promedio de horas por empleado */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2">
                <Users className="text-green-600" size={20} />
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                  Promedio por empleado
                </h3>
              </div>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {metrics.averageHours.toFixed(2)}
              </p>
            </div>

            {/* Empleado destacado */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="flex items-center gap-2">
                <Award className="text-yellow-600" size={20} />
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
                  Empleado destacado
                </h3>
              </div>
              <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                {metrics.topEmployee.name}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {metrics.topEmployee.hours.toFixed(2)} horas
              </p>
            </div>

            {/* Comparación con período anterior */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={20} />
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300">
                  Diferencia max/min
                </h3>
              </div>
              <div className="flex flex-col">
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  +{metrics.comparison.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                  {metrics.comparison.minEmployee.name} (
                  {metrics.comparison.minEmployee.hours.toFixed(2)} hrs)
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {!noPeriodActive && stats && stats.stats && stats.stats.length > 0 && (
          <div className="flex gap-2 font-medium leading-none text-muted-foreground">
            {`Basado en datos de ${stats.stats.length} empleados`}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
