"use client";

import * as React from "react";
import { calculateSalary } from "@/app/utils/api";
import {
  nightHoursCountInterface,
  requestCalculateSalaryInterface,
  responseCalculateSalaryInterface,
} from "@/app/interfaces/salaryInterfaces";
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
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface SalaryCalculationFormProps {
  employee: nightHoursCountInterface;
  periodId: number;
  onCalculationComplete: () => void;
}

type FormData = {
  applyNightFactor: boolean;
  lunchDeductionHours: number;
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      applyNightFactor: true,
      lunchDeductionHours: 0,
      otherDeductions: 0,
      otherDeductionsDescription: "",
    },
  });

  const applyNightFactor = watch("applyNightFactor");

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const requestData: requestCalculateSalaryInterface = {
        employee_id: employee.id,
        apply_night_factor: data.applyNightFactor,
        period_id: periodId,
        lunch_deduction_hours: data.lunchDeductionHours,
        other_deductions: data.otherDeductions,
        other_deductions_description: data.otherDeductionsDescription,
      };

      const calculationResult = await calculateSalary(requestData);
      console.log(calculationResult);
      setResult(calculationResult);
      toast.success("Salario calculado con éxito");

      // Notificar que el cálculo se completó después de mostrar los resultados por un momento
      setTimeout(() => {
        onCalculationComplete();
      }, 3000);
    } catch (error) {
      console.error("Error al calcular el salario:", error);
      setError("No se pudo calcular el salario. Inténtalo de nuevo.");
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
        <CardDescription className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {employee.full_name} | Horas Nocturnas:{" "}
          {typeof employee.night_hours === "number"
            ? employee.night_hours.toFixed(2)
            : parseFloat(String(employee.night_hours)).toFixed(2)}
        </CardDescription>
      </CardHeader>

      {result ? (
        // Mostrar resultados del cálculo
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-2 gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <div className="text-lg font-semibold">Cálculo exitoso</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
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
                  result.other_deductions.toString()
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
              <Label htmlFor="lunch-deduction">
                Horas de almuerzo a deducir
              </Label>
              <Input
                id="lunch-deduction"
                type="number"
                step="0.5"
                min="0"
                {...register("lunchDeductionHours", {
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              {errors.lunchDeductionHours && (
                <p className="text-sm text-red-500">
                  {errors.lunchDeductionHours.message}
                </p>
              )}
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

          <CardFooter className="flex justify-between">
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
