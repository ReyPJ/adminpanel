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

type EmployeeDialogUpdateFormProps = {
  employee: EmployeeInterface;
  onSuccess?: () => void;
};

export const EmployeeDialogUpdateForm = ({
  employee,
  onSuccess,
}: EmployeeDialogUpdateFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const submitToApi = async () => {
      try {
        await updateEmployee(employee.id, values as EmployeeInterface);
        toast("Empleado actualizado correctamente", {
          description: "Los cambios han sido guardados",
          icon: "👍",
          richColors: true,
        });
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

  return (
    <div className="mx-auto my-4 max-w-4xl w-full bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Datos Personales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Datos Personales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Información de Contacto y Seguridad */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contacto y Seguridad</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Incluir <span className="font-bold">+506</span>
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Información Laboral */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Información Laboral</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="salary_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario por hora</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {form.formState.isSubmitting
              ? "Cargando..."
              : "Actualizar empleado"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
