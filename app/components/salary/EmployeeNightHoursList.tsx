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

// Tipo para errores de API
interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

interface EmployeeListForSalaryProps {
  periodId: number;
  onEmployeeSelected: (
    employee: nightHoursCountInterface | EmployeeWithNightHours,
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
    [],
  );
  const [error, setError] = React.useState<string | null>(null);
  const [nightHoursError, setNightHoursError] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    let isMounted = true;

    const fetchEmployees = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        setNightHoursError(null);

        if (!periodId || isNaN(periodId)) {
          if (isMounted) {
            setError("ID de período inválido");
          }
          return;
        }

        // Obtener todos los empleados
        let allEmployeesData;
        try {
          allEmployeesData = await getAllEmployees();
          if (!isMounted) return;

          if (
            !Array.isArray(allEmployeesData) ||
            allEmployeesData.length === 0
          ) {
            if (isMounted) {
              setError("No se encontraron empleados registrados");
            }
            return;
          }
        } catch (employeeError) {
          if (isMounted) {
            console.error("Error al obtener empleados:", employeeError);
            setError("No se pudieron cargar los empleados");
          }
          return;
        }

        // Obtener empleados con horas nocturnas (no crítico si falla)
        let nightHoursData: nightHoursCountInterface[] = [];
        try {
          nightHoursData = await getNightHoursCount(periodId);
          if (!isMounted) return;

          if (!Array.isArray(nightHoursData)) {
            nightHoursData = [];
            if (isMounted) {
              setNightHoursError("No se pudieron cargar las horas nocturnas");
            }
          }
        } catch (nightError: unknown) {
          if (isMounted) {
            console.error("Error al obtener horas nocturnas:", nightError);
            setNightHoursError("Error al cargar horas nocturnas");
          }
          nightHoursData = [];
        }

        // Mapear todos los empleados y agregar información de horas nocturnas si la tienen
        const employeesWithNightHours: EmployeeWithNightHours[] =
          allEmployeesData
            .filter(
              (employee) => employee.id !== undefined && employee.id !== null,
            )
            .map((employee) => {
              // Buscar si este empleado tiene horas nocturnas
              const nightData = Array.isArray(nightHoursData)
                ? nightHoursData.find((item) => item?.id === employee.id)
                : null;

              const firstName = employee.first_name || "";
              const lastName = employee.last_name || "";
              const fullName =
                `${firstName} ${lastName}`.trim() || "Sin nombre";

              return {
                id: employee.id as number,
                full_name: fullName,
                username: employee.username || "sin-usuario",
                night_hours: nightData?.night_hours
                  ? Number(nightData.night_hours)
                  : 0,
                night_shift_factor: nightData?.night_shift_factor
                  ? Number(nightData.night_shift_factor)
                  : 1.0,
                has_night_hours: !!nightData && nightData.night_hours > 0,
              };
            })
            .filter((employee) => employee.id > 0); // Filtrar IDs inválidos

        if (isMounted) {
          setEmployees(employeesWithNightHours);
          setLoading(false);
        }
      } catch (error: unknown) {
        if (isMounted) {
          console.error("Error general al cargar los empleados:", error);
          const apiError = error as ApiError;
          const errorMessage =
            apiError?.response?.data?.detail ||
            apiError?.message ||
            "Error desconocido al cargar los datos";
          setError(errorMessage);
          setEmployees([]);
          setLoading(false);
        }
      }
    };

    if (periodId && periodId > 0) {
      fetchEmployees();
    } else {
      if (isMounted) {
        setError("Debe seleccionar un período válido");
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [periodId]);

  const handleSelectEmployee = (employee: EmployeeWithNightHours) => {
    if (!employee || !employee.id) {
      console.error("Error: Empleado inválido");
      return;
    }
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
          {nightHoursError && (
            <div className="text-amber-600 text-sm mt-1">
              ⚠️ {nightHoursError}
            </div>
          )}
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
                    <div className="text-xs text-muted-foreground">
                      ID: {employee.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.has_night_hours && employee.night_hours > 0 ? (
                      <div className="flex items-center gap-1">
                        <Moon className="h-4 w-4 text-indigo-500" />
                        <span>
                          {isNaN(employee.night_hours)
                            ? "0.00"
                            : employee.night_hours.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Sin registros
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.has_night_hours && employee.night_hours > 0 ? (
                      <Badge
                        variant="outline"
                        className="bg-indigo-100 text-indigo-800"
                      >
                        {isNaN(employee.night_shift_factor)
                          ? "1.0"
                          : employee.night_shift_factor.toFixed(1)}
                        x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Sin registros
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectEmployee(employee)}
                      disabled={!employee.id}
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
