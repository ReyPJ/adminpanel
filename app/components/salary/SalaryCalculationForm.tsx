"use client";

import * as React from "react";
import { calculateSalary, getAttendanceDetails } from "@/app/utils/api";
import {
  nightHoursCountInterface,
  requestCalculateSalaryInterface,
  responseCalculateSalaryInterface,
  SalaryWarning,
} from "@/app/interfaces/salaryInterfaces";
import { attendanceInterface } from "@/app/interfaces/attendanceDetailsInterface";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator,
  Loader2,
  User,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipo para errores de API
interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

interface SalaryCalculationFormProps {
  employee: nightHoursCountInterface;
  periodId: number;
  onCalculationComplete: () => void;
}

type FormData = {
  applyNightFactor: boolean;
  otherDeductions: number;
  otherDeductionsDescription: string;
};

export function SalaryCalculationForm({
  employee,
  periodId,
  onCalculationComplete,
}: SalaryCalculationFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] =
    React.useState<responseCalculateSalaryInterface | null>(null);
  const [warnings, setWarnings] = React.useState<SalaryWarning[]>([]);
  const [attendanceData, setAttendanceData] = React.useState<
    attendanceInterface[]
  >([]);
  const [attendanceLoading, setAttendanceLoading] = React.useState(true);
  const [attendanceError, setAttendanceError] = React.useState<string | null>(
    null,
  );
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      applyNightFactor: true,
      otherDeductions: 0,
      otherDeductionsDescription: "",
    },
  });

  const applyNightFactor = watch("applyNightFactor");

  // Cargar datos de asistencia al montar el componente
  React.useEffect(() => {
    let isMounted = true;

    const fetchAttendanceData = async () => {
      try {
        if (!isMounted) return;
        setAttendanceLoading(true);
        setAttendanceError(null);

        if (!employee?.id || !periodId) {
          if (isMounted) {
            setAttendanceError("Faltan datos del empleado o período");
          }
          return;
        }

        const attendance = await getAttendanceDetails(employee.id, periodId);
        if (isMounted) {
          setAttendanceData(Array.isArray(attendance) ? attendance : []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar datos de asistencia:", error);
          setAttendanceError("No se pudieron cargar los datos de asistencia");
          setAttendanceData([]);
        }
      } finally {
        if (isMounted) {
          setAttendanceLoading(false);
        }
      }
    };

    fetchAttendanceData();

    return () => {
      isMounted = false;
    };
  }, [employee.id, periodId]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calcular días trabajados de forma segura
  const workDays = React.useMemo(() => {
    return Array.isArray(attendanceData) ? attendanceData.length : 0;
  }, [attendanceData]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones adicionales
      if (!employee?.id) {
        setError("Error: No se encontró el ID del empleado");
        return;
      }

      if (!periodId) {
        setError("Error: No se encontró el ID del período");
        return;
      }

      // Validar que los números sean válidos
      const otherDeductions = isNaN(data.otherDeductions)
        ? 0
        : data.otherDeductions;

      const requestData: requestCalculateSalaryInterface = {
        employee_id: employee.id,
        apply_night_factor: data.applyNightFactor,
        period_id: periodId,
        other_deductions: otherDeductions,
        other_deductions_description: data.otherDeductionsDescription || "",
      };

      const calculationResult = await calculateSalary(requestData);

      if (!calculationResult) {
        setError("Error: Respuesta vacía del servidor");
        return;
      }

      console.log(calculationResult);

      // Manejar warnings si existen
      if (calculationResult.warnings && calculationResult.warnings.length > 0) {
        setWarnings(calculationResult.warnings);
        // Mostrar warnings como toast
        calculationResult.warnings.forEach((warning) => {
          if (warning.type === "early_calculation") {
            toast.warning(warning.message, {
              duration: 5000,
            });
          } else if (warning.type === "missing_checkout") {
            toast.error(warning.message, {
              duration: 5000,
            });
          } else {
            toast.info(warning.message, {
              duration: 5000,
            });
          }
        });
      }

      setResult(calculationResult.salary_record);
      toast.success("Salario calculado con éxito");

      // Notificar que el cálculo se completó después de mostrar los resultados por un momento
      timeoutRef.current = setTimeout(() => {
        onCalculationComplete();
      }, 3000);
    } catch (error: unknown) {
      console.error("Error al calcular el salario:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError?.response?.data?.detail ||
        apiError?.message ||
        "No se pudo calcular el salario. Inténtalo de nuevo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cálculo de Salario
        </CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {employee?.full_name || "N/A"} | Horas Nocturnas:{" "}
            {typeof employee?.night_hours === "number"
              ? employee.night_hours.toFixed(2)
              : employee?.night_hours
                ? parseFloat(String(employee.night_hours)).toFixed(2)
                : "0.00"}
          </div>
          {!attendanceLoading && !attendanceError && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Días trabajados: {workDays}
            </div>
          )}
          {attendanceError && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {attendanceError}
            </div>
          )}
        </CardDescription>
      </CardHeader>

      {result ? (
        // Mostrar resultados del cálculo
        <CardContent className="space-y-4">
          {/* Mostrar warnings si existen */}
          {warnings.length > 0 && (
            <div className="space-y-2 mb-4">
              {warnings.map((warning, index) => (
                <Alert
                  key={index}
                  variant={
                    warning.type === "missing_checkout"
                      ? "destructive"
                      : "default"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {warning.type === "early_calculation"
                      ? "Cálculo Anticipado"
                      : warning.type === "missing_checkout"
                        ? "Registro Incompleto"
                        : "Advertencia"}
                  </AlertTitle>
                  <AlertDescription>{warning.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center py-2 gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <div className="text-lg font-semibold">Cálculo exitoso</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Horas Regulares:</Label>
              <div className="font-medium">
                {typeof result.regular_hours === "number"
                  ? result.regular_hours.toFixed(2)
                  : parseFloat(result.regular_hours || "0").toFixed(2)}{" "}
                hrs
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Horas Nocturnas:</Label>
              <div className="font-medium">
                {typeof result.night_hours === "number"
                  ? result.night_hours.toFixed(2)
                  : parseFloat(result.night_hours || "0").toFixed(2)}{" "}
                hrs
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Salario Bruto:</Label>
              <div className="font-medium">
                ₡{parseFloat(result.gross_salary.toString()).toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Deducciones:</Label>
              <div className="font-medium">
                ₡
                {parseFloat(
                  result.other_deductions.toString(),
                ).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-lg font-semibold text-center text-green-800 dark:text-green-200">
              Salario a Pagar:
            </div>
            <div className="text-2xl font-bold text-center text-green-800 dark:text-green-200">
              ₡{parseFloat(result.salary_to_pay.toString()).toLocaleString()}
            </div>
          </div>
        </CardContent>
      ) : (
        // Mostrar formulario de cálculo
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center p-3 text-red-800 rounded-md bg-red-100">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="apply-night-factor"
                checked={applyNightFactor}
                onCheckedChange={(checked) => {
                  register("applyNightFactor").onChange({
                    target: { name: "applyNightFactor", value: checked },
                  });
                }}
              />
              <Label htmlFor="apply-night-factor">
                Aplicar factor nocturno ({employee.night_shift_factor}x)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-deductions">Otras deducciones (₡)</Label>
              <Input
                id="other-deductions"
                type="number"
                step="100"
                min="0"
                {...register("otherDeductions", {
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              {errors.otherDeductions && (
                <p className="text-sm text-red-500">
                  {errors.otherDeductions.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deduction-description">
                Descripción de deducciones
              </Label>
              <Textarea
                id="deduction-description"
                placeholder="Motivo de las deducciones"
                {...register("otherDeductionsDescription")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCalculationComplete}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                "Calcular Salario"
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
