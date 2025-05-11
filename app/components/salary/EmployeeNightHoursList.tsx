"use client";

import * as React from "react";
import { getNightHoursCount, getAllEmployees } from "@/app/utils/api";
import { nightHoursCountInterface } from "@/app/interfaces/salaryInterfaces";
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
import { Moon, Loader2, Users, AlertTriangle } from "lucide-react";

interface EmployeeListForSalaryProps {
  periodId: number;
  onEmployeeSelected: (
    employee: nightHoursCountInterface | EmployeeWithNightHours
  ) => void;
}

// Interfaz para mapear empleados con sus horas nocturnas
interface EmployeeWithNightHours {
  id: number;
  full_name: string;
  username: string;
  night_hours: number;
  night_shift_factor: number;
  has_night_hours: boolean;
}

export function EmployeeNightHoursList({
  periodId,
  onEmployeeSelected,
}: EmployeeListForSalaryProps) {
  const [loading, setLoading] = React.useState(true);
  const [employees, setEmployees] = React.useState<EmployeeWithNightHours[]>(
    []
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todos los empleados
        const allEmployeesData = await getAllEmployees();

        // Obtener empleados con horas nocturnas
        const nightHoursData = await getNightHoursCount(periodId);

        // Mapear todos los empleados y agregar información de horas nocturnas si la tienen
        const employeesWithNightHours: EmployeeWithNightHours[] =
          allEmployeesData
            .filter((employee) => employee.id !== undefined)
            .map((employee) => {
              // Buscar si este empleado tiene horas nocturnas
              const nightData = nightHoursData.find(
                (item) => item.id === employee.id
              );

              return {
                id: employee.id as number,
                full_name: `${employee.first_name} ${employee.last_name}`,
                username: employee.username || "",
                night_hours: nightData ? nightData.night_hours : 0,
                night_shift_factor: nightData
                  ? nightData.night_shift_factor
                  : 1.0,
                has_night_hours: !!nightData,
              };
            });

        setEmployees(employeesWithNightHours);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los empleados:", error);
        setError("No se pudieron cargar los datos de empleados");
        setLoading(false);
      }
    };

    if (periodId) {
      fetchEmployees();
    }
  }, [periodId]);

  const handleSelectEmployee = (employee: EmployeeWithNightHours) => {
    onEmployeeSelected(employee);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Empleados
        </CardTitle>
        <CardDescription>
          Periodo ID: {periodId} | Total: {employees.length} empleados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="text-sm text-muted-foreground">
              Cargando datos de empleados...
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
              No hay empleados registrados
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Horas Nocturnas</TableHead>
                <TableHead>Factor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.full_name}
                  </TableCell>
                  <TableCell>
                    {employee.has_night_hours ? (
                      <div className="flex items-center gap-1">
                        <Moon className="h-4 w-4 text-indigo-500" />
                        <span>
                          {typeof employee.night_hours === "number"
                            ? employee.night_hours.toFixed(2)
                            : parseFloat(String(employee.night_hours)).toFixed(
                                2
                              )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Salario ya calculado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.has_night_hours ? (
                      <Badge
                        variant="outline"
                        className="bg-indigo-100 text-indigo-800"
                      >
                        {employee.night_shift_factor}x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Salario ya calculado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectEmployee(employee)}
                    >
                      Calcular Salario
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
