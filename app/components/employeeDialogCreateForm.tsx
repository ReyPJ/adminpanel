"use client";
import { createEmployee } from "../utils/api";
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

export const EmployeeDialogCreateForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      salary_hour: "",
      phone: "",
      unique_pin: "",
      biweekly_hours: "96",
      night_shift_factor: "1",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    const submitToApi = async () => {
      try {
        await createEmployee(values);
        toast("Empleado creado correctamente", {
          description: "Ya puede cerrar la ventana",
          icon: "👍",
          richColors: true,
        });
        form.reset();
      } catch (error) {
        console.log(error);
        toast("Error al crear el empleado", {
          icon: "🚨",
          description: "Por favor, intente nuevamente",
          richColors: true,
        });
      }
    };
    submitToApi();
  }
  return (
    <div className="mx-auto my-4 max-w-2xl w-full bg-white p-6 rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    El numero debe contener{" "}
                    <span className="font-bold">+506</span>
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
                  <FormLabel>Pin</FormLabel>
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
                  <FormLabel>Factor X de horas nocturnas</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {form.formState.isSubmitting ? "Cargando..." : "Crear empleado"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
