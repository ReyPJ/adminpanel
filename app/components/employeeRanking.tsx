"use client";
import { getActivePeriod, getEmployeeStats } from "@/app/utils/api";
import { AllEmployeeStats } from "@/app/interfaces/Stats";
import { TrendingUp, Loader2, AlertTriangle } from "lucide-react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type EmployeeRankData = {
  name: string;
  hours: number;
};

const chartConfig = {
  hours: {
    label: "Horas",
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--chart-label)",
  },
} satisfies ChartConfig;

export function EmployeeRanking() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [stats, setStats] = React.useState<AllEmployeeStats | null>(null);
  const [chartData, setChartData] = React.useState<EmployeeRankData[]>([]);
  const [noPeriodActive, setNoPeriodActive] = React.useState<boolean>(false);

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

        // Transformar y ordenar datos para el chart
        const sortedStats = [...data.stats].sort(
          (a, b) => b.total_hours - a.total_hours
        );
        const transformedData = sortedStats.map((employee) => ({
          name: employee.employee_name,
          hours: parseFloat(employee.total_hours.toFixed(2)),
        }));

        setChartData(transformedData);
        setLoading(false);
      } catch (error) {
        // Si hay un error 400 o 404, puede que no haya periodo activo
        console.error("Error fetching employee stats:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Horas Trabajadas</CardTitle>
        <CardDescription>
          {stats?.pay_period
            ? `Periodo: ${stats.pay_period.description}`
            : noPeriodActive
            ? "No hay periodo activo"
            : "Cargando..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-2">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <span className="text-lg text-muted-foreground">
              Cargando ranking de empleados...
            </span>
          </div>
        ) : noPeriodActive ? (
          <div className="flex flex-col items-center justify-center h-80 gap-2 text-amber-600">
            <AlertTriangle size={36} />
            <span className="text-lg text-center">
              No hay un periodo activo.
              <br />
              Crea un nuevo periodo para ver las estadísticas.
            </span>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
                left: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={100}
              />
              <XAxis dataKey="hours" type="number" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="hours"
                layout="vertical"
                fill="var(--chart-1)"
                radius={4}
              >
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  offset={8}
                  className="fill-[var(--chart-label)]"
                  fontSize={14}
                />
                <LabelList
                  dataKey="hours"
                  position="right"
                  offset={8}
                  className="fill-[var(--chart-label)]"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {stats?.stats.length
            ? `${stats.stats.length} empleados en este período`
            : ""}
          {!noPeriodActive && <TrendingUp className="h-4 w-4" />}
        </div>
        {!noPeriodActive && (
          <div className="leading-none text-muted-foreground">
            Mostrando horas totales trabajadas en el período actual
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
