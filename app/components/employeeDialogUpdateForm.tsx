"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateEmployee } from "../utils/api";
import { EmployeeInterface } from "../interfaces/employeInterfa";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario es requerido" }),
  first_name: z.string().min(1, { message: "El nombre es requerido" }),
  last_name: z.string().min(1, { message: "El apellido es requerido" }),
  salary_hour: z
    .string()
    .min(4, { message: "El salario por hora no puede ser menor que 1000" }),
  phone: z.string().max(12, {
    message: "El numero de telefono debe ser de no mas de 12 digitos",
  }),
  unique_pin: z
    .string()
    .min(4, { message: "El pin debe tener al menos 4 digitos" }),
  biweekly_hours: z
    .string()
    .min(1, { message: "El numero de horas quincenales es requerido" }),
  night_shift_factor: z
    .string()
    .min(1, { message: "El factor X de horas nocturnas es requerido" }),
});

const steps = [
  {
    id: "personal",
    title: "Datos Personales",
    description: "Nombre de usuario, nombre y apellido",
    fields: ["username", "first_name", "last_name"],
  },
  {
    id: "contact",
    title: "Contacto y Seguridad",
    description: "Teléfono e información de seguridad",
    fields: ["phone", "unique_pin"],
  },
  {
    id: "labor",
    title: "Información Laboral",
    description: "Salario y horas de trabajo",
    fields: ["salary_hour", "biweekly_hours", "night_shift_factor"],
  },
];

type EmployeeDialogUpdateFormProps = {
  employee: EmployeeInterface;
  onSuccess?: () => void;
};

export const EmployeeDialogUpdateForm = ({
  employee,
  onSuccess,
}: EmployeeDialogUpdateFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      username: employee.username || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      salary_hour: employee.salary_hour || "",
      phone: employee.phone || "",
      unique_pin: employee.unique_pin || "",
      biweekly_hours: employee.biweekly_hours || "96",
      night_shift_factor: employee.night_shift_factor || "1",
    },
  });

  const validateStep = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const isValid = await form.trigger(
      fieldsToValidate as (keyof z.infer<typeof formSchema>)[]
    );
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const submitToApi = async () => {
      try {
        await updateEmployee(employee.id, values as EmployeeInterface);
        toast("Empleado actualizado correctamente", {
          description: "Los cambios han sido guardados",
          icon: "👍",
          richColors: true,
        });
        setCurrentStep(0);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.log(error);
        toast("Error al actualizar el empleado", {
          icon: "🚨",
          description: "Por favor, intente nuevamente",
          richColors: true,
        });
      }
    };
    submitToApi();
  }

  const step = steps[currentStep];

  return (
    <div className="w-full bg-white p-0 rounded-lg">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="space-y-6"
        >
          {/* Indicador de progreso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <span className="text-sm text-gray-500">
                Paso {currentStep + 1} de {steps.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{step.description}</p>
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Paso 1: Datos Personales */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: juan_perez" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: Juan" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: Pérez" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Paso 2: Contacto y Seguridad */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+506 8123 4567" />
                    </FormControl>
                    <FormDescription>
                      Debe incluir <span className="font-bold">+506</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unique_pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN (4+ dígitos)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: 1234" type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Paso 3: Información Laboral */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="salary_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario por hora</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: 5000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="biweekly_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas quincenales</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: 96" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="night_shift_factor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor X nocturno</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: 1.25" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting
                  ? "Actualizando..."
                  : "Actualizar empleado"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
