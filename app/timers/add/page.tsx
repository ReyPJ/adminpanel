"use client";
import {
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Breadcrumb,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ToggleTheme } from "@/app/components/toggleTheme";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createTimer } from "@/app/utils/api";
import { PostTimerInterface } from "@/app/interfaces/timersInterfaces";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EmployeeInterface } from "@/app/interfaces/employeInterfa";
import {
  Loader2,
  Clock,
  Calendar,
  Moon,
  Sun,
  Users,
  HelpCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const AddTimerPage = () => {
  const segments = usePathname().split("/").filter(Boolean);
  const router = useRouter();
  let pathSoFar = "";

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeInterface[]>([]);
  const [formData, setFormData] = useState<PostTimerInterface>({
    employee: 0,
    day: 0,
    timeIn: "08:00",
    timeOut: "17:00",
    is_night_shift: false,
  });

  // Cargar la lista de empleados desde localStorage
  useEffect(() => {
    const employeesList = JSON.parse(
      localStorage.getItem("employees_list") || "[]"
    );
    setEmployees(employeesList);

    // Si hay empleados, seleccionar el primero por defecto
    if (employeesList.length > 0) {
      setFormData((prev) => ({ ...prev, employee: employeesList[0].id }));
    }
  }, []);

  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      timers: "Horarios",
      add: "Agregar Horario",
    };
    return (
      translations[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.employee === 0) {
      toast("😅 Error", {
        description: "Debes seleccionar un empleado",
        richColors: true,
      });
      return;
    }

    // Verificar que la hora de salida sea mayor que la hora de entrada
    const entryTime = new Date(`2000-01-01T${formData.timeIn}`);
    const exitTime = new Date(`2000-01-01T${formData.timeOut}`);

    if (exitTime <= entryTime && !formData.is_night_shift) {
      toast("⏰ Error en el horario", {
        description:
          "La hora de salida debe ser posterior a la hora de entrada",
        richColors: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Enviar el objeto a la API
      await createTimer(formData);

      toast("🎉 Horario creado", {
        description: "El horario ha sido creado exitosamente",
        richColors: true,
      });

      // Redireccionar a la página de horarios
      setTimeout(() => {
        router.push("/timers");
      }, 1500);
    } catch (error) {
      console.error("Error al crear horario:", error);
      toast("😵‍💫 Error", {
        description: "No se pudo crear el horario. Intenta de nuevo.",
        richColors: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mapeo de día numérico a nombre del día
  const getDayName = (day: number): string => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[day] || "";
  };

  // Calcular duración del turno en horas
  const calculateShiftDuration = (): string => {
    const entryTime = new Date(`2000-01-01T${formData.timeIn}`);
    const exitTime = new Date(`2000-01-01T${formData.timeOut}`);

    let hours;
    if (formData.is_night_shift && exitTime <= entryTime) {
      // Sumar 24 horas si es turno nocturno y la salida es anterior a la entrada
      const nextDay = new Date(exitTime);
      nextDay.setDate(nextDay.getDate() + 1);
      hours = (nextDay.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
    } else {
      hours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
    }

    // Si las horas son negativas (posible en turnos nocturnos), ajustar
    if (hours < 0) {
      hours += 24;
    }

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    return `${wholeHours} hora${wholeHours !== 1 ? "s" : ""} ${
      minutes > 0 ? `y ${minutes} minuto${minutes !== 1 ? "s" : ""}` : ""
    }`;
  };

  // Obtener el multiplicador de salario nocturno para el empleado seleccionado
  const getNightShiftFactor = (): string => {
    const selectedEmployee = employees.find(
      (emp) => emp.id === formData.employee
    );
    if (!selectedEmployee || !selectedEmployee.night_shift_factor)
      return "1.00";
    return parseFloat(selectedEmployee.night_shift_factor).toFixed(2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <ToggleTheme />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, idx) => {
              pathSoFar += `/${segment}`;
              const isLast = idx === segments.length - 1;
              return (
                <React.Fragment key={segment}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {translateSegment(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={pathSoFar}>
                        {translateSegment(segment)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 p-4 md:p-6 bg-muted/10">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-100/30 to-blue-50/10 dark:from-blue-900/20 dark:to-blue-800/10">
              <div className="flex items-center">
                <Clock className="mr-2 h-6 w-6 text-blue-500" />
                <CardTitle className="text-2xl">
                  Agregar Nuevo Horario
                </CardTitle>
              </div>
              <CardDescription>
                Crea un nuevo horario para un empleado. Define los días y horas
                de trabajo.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="employee" className="text-base">
                      Empleado
                    </Label>
                  </div>
                  <Select
                    value={formData.employee.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employee: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="employee" className="w-full">
                      <SelectValue placeholder="Selecciona un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.length > 0 ? (
                        employees.map((emp) => (
                          <SelectItem
                            key={emp.id}
                            value={emp.id?.toString() || ""}
                          >
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-employees" disabled>
                          No hay empleados disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="day" className="text-base">
                      Día de la semana
                    </Label>
                  </div>
                  <Select
                    value={formData.day.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="day" className="w-full">
                      <SelectValue placeholder="Selecciona un día" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {getDayName(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-5 w-5 text-yellow-500" />
                      <Label htmlFor="timeIn" className="text-base">
                        Hora de entrada
                      </Label>
                    </div>
                    <Input
                      id="timeIn"
                      type="time"
                      value={formData.timeIn}
                      onChange={(e) =>
                        setFormData({ ...formData, timeIn: e.target.value })
                      }
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-5 w-5 text-indigo-400" />
                      <Label htmlFor="timeOut" className="text-base">
                        Hora de salida
                      </Label>
                    </div>
                    <Input
                      id="timeOut"
                      type="time"
                      value={formData.timeOut}
                      onChange={(e) =>
                        setFormData({ ...formData, timeOut: e.target.value })
                      }
                      className="border-indigo-200 focus:border-indigo-400 dark:border-indigo-900"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-secondary/20 rounded-lg">
                  <Switch
                    id="is_night_shift"
                    checked={formData.is_night_shift}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_night_shift: checked })
                    }
                  />
                  <Label htmlFor="is_night_shift" className="text-base">
                    Turno nocturno
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Activa esta opción si el horario cruza la medianoche.
                          Esto aplicará el multiplicador de salario nocturno.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-2 pb-6 px-6 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/timers")}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Crear Horario
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Tarjeta de información lateral */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-100/30 to-indigo-50/10 dark:from-indigo-900/20 dark:to-indigo-800/10">
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
                  Resumen del Horario
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Día:</span>
                    <Badge variant="outline" className="font-medium">
                      {getDayName(formData.day)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Empleado:</span>
                    <Badge variant="outline" className="font-medium">
                      {formData.employee &&
                      employees.find((e) => e.id === formData.employee)
                        ? `${
                            employees.find((e) => e.id === formData.employee)
                              ?.first_name
                          } ${
                            employees.find((e) => e.id === formData.employee)
                              ?.last_name
                          }`
                        : "No seleccionado"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Horario:</span>
                    <Badge variant="outline" className="font-medium">
                      {formData.timeIn} - {formData.timeOut}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duración:</span>
                    <Badge className="bg-blue-500/80 hover:bg-blue-500/90">
                      {calculateShiftDuration()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tipo:</span>
                    <Badge
                      className={
                        formData.is_night_shift
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }
                    >
                      {formData.is_night_shift ? "Nocturno" : "Diurno"}
                    </Badge>
                  </div>
                  {formData.is_night_shift && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Factor nocturno:
                      </span>
                      <Badge className="bg-indigo-500/80 hover:bg-indigo-500/90">
                        {getNightShiftFactor()}x
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Información Importante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="turnos-nocturnos">
                    <AccordionTrigger className="text-sm">
                      Turnos Nocturnos
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Los turnos nocturnos aplican un multiplicador al salario
                        base por hora. Este se configura en el perfil de cada
                        empleado.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="dias-multiples">
                    <AccordionTrigger className="text-sm">
                      Asignación de días
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Puedes asignar múltiples días a un empleado. Crea un
                        horario individual para cada día de la semana que
                        trabaje.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="calculo-salario">
                    <AccordionTrigger className="text-sm">
                      Acerca de los horarios
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Los horarios son mas que nada una forma de tener un
                        referencia para el manejo de notificaciones estadisticas
                        y registos. El salario se calcula en base a las horas
                        trabajadas, sin ser totalmente dependiente a este
                        horario.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddTimerPage;
