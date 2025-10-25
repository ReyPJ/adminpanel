"use client";
import React, { useEffect, useState } from "react";
import {
  getTimers,
  deleteTimer,
  getTimerByTimerId,
  updateTimer,
} from "../utils/api";
import {
  getAllTimersResponse,
  TimerInterface,
} from "../interfaces/timersInterfaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeInterface } from "../interfaces/employeInterfa";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6; // Número de cards por página

// Interfaz para formulario de edición
interface TimerFormValues {
  id: number;
  employee: number;
  day: number;
  timeIn: string;
  timeOut: string;
  is_night_shift: boolean;
}

const AllTimers = () => {
  const [employeeTimers, setEmployeeTimers] = useState<getAllTimersResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeesData, setEmployeesData] = useState<EmployeeInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTimer, setEditingTimer] = useState<TimerFormValues | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  // Función para cargar todos los horarios
  const fetchAllTimers = async () => {
    try {
      setLoading(true);
      const data = await getTimers();
      setEmployeeTimers(data);

      // Obtener la lista de empleados del localStorage
      const employeesList = JSON.parse(
        localStorage.getItem("employees_list") || "[]"
      );
      setEmployeesData(employeesList);
    } catch (err) {
      console.error("Error al cargar los horarios:", err);
      setError("Error al cargar los horarios.");
      toast.error("Error al cargar los horarios", {
        description: "No se pudieron cargar los horarios. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTimers();
  }, []);

  // Función para obtener detalles de un timer específico
  const handleEditTimer = async (timerId: number) => {
    try {
      setIsEditing(true);
      const timerData = await getTimerByTimerId(timerId);
      setEditingTimer({
        id: timerData.id,
        employee: timerData.employee,
        day: timerData.day,
        timeIn: timerData.timeIn,
        timeOut: timerData.timeOut,
        is_night_shift: timerData.is_night_shift || false,
      });
    } catch (err) {
      console.error("Error al obtener los detalles del horario:", err);
      toast.error("Error al cargar el horario", {
        description: "No se pudieron cargar los detalles del horario.",
      });
    }
  };

  // Función para actualizar un timer
  const handleUpdateTimer = async () => {
    if (!editingTimer) return;

    try {
      // Creamos un objeto que cumpla con la interfaz TimerInterface
      const timerData: Partial<TimerInterface> = {
        id: editingTimer.id,
        employee: editingTimer.employee,
        day: editingTimer.day,
        timeIn: editingTimer.timeIn,
        timeOut: editingTimer.timeOut,
        is_night_shift: editingTimer.is_night_shift,
      };

      await updateTimer(editingTimer.id, timerData as TimerInterface);
      toast.success("Horario actualizado", {
        description: "El horario se ha actualizado correctamente.",
      });
      setIsEditing(false);
      fetchAllTimers(); // Recargar los datos
    } catch (err) {
      console.error("Error al actualizar el horario:", err);
      toast.error("Error al actualizar", {
        description: "No se pudo actualizar el horario. Intenta de nuevo.",
      });
    }
  };

  // Función para eliminar un timer
  const handleDeleteTimer = async (timerId: number) => {
    try {
      await deleteTimer(timerId);
      toast.success("Horario eliminado", {
        description: "El horario se ha eliminado correctamente.",
      });
      fetchAllTimers(); // Recargar los datos
    } catch (err) {
      console.error("Error al eliminar el horario:", err);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el horario. Intenta de nuevo.",
      });
    }
  };

  // Función para obtener el nombre completo del empleado por su ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employeesData.find((emp) => emp.id === employeeId);
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : `Empleado #${employeeId}`;
  };

  // Función para formatear la hora (de 24h a 12h con AM/PM)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Filtrar empleados por búsqueda
  const filteredEmployees = employeeTimers.filter((employeeData) => {
    const employeeName = getEmployeeName(employeeData.employee).toLowerCase();
    return employeeName.includes(searchTerm.toLowerCase());
  });

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  // Obtener los empleados para la página actual
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Navegar a la página anterior
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Navegar a la página siguiente
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Ir a una página específica
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Renderizar los botones de paginación
  const renderPaginationButtons = () => {
    const items = [];

    // Agregar botones de números para páginas cercanas a la actual
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Primera página
        i === totalPages || // Última página
        (i >= currentPage - 1 && i <= currentPage + 1) // Páginas cercanas a la actual
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === currentPage}
              onClick={() => goToPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        // Agregar elipsis para páginas no mostradas
        items.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    return items;
  };

  if (loading)
    return <div className="flex justify-center p-4">Cargando horarios...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empleado..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Volver a la primera página al buscar
          }}
        />
      </div>

      {/* Grid de tarjetas de empleados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentEmployees.map((employeeData) => (
          <Card
            key={employeeData.employee}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle>{getEmployeeName(employeeData.employee)}</CardTitle>
              <CardDescription>
                {employeeData.timers.length} días asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Ver Horarios
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      Horarios de {getEmployeeName(employeeData.employee)}
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 mb-4">
                      <TabsTrigger value="0">Dom</TabsTrigger>
                      <TabsTrigger value="1">Lun</TabsTrigger>
                      <TabsTrigger value="2">Mar</TabsTrigger>
                      <TabsTrigger value="3">Mié</TabsTrigger>
                      <TabsTrigger value="4">Jue</TabsTrigger>
                      <TabsTrigger value="5">Vie</TabsTrigger>
                      <TabsTrigger value="6">Sáb</TabsTrigger>
                    </TabsList>

                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const dayTimer = employeeData.timers.find(
                        (timer) => timer.day === day
                      );

                      return (
                        <TabsContent
                          key={day}
                          value={day.toString()}
                          className="space-y-4"
                        >
                          {dayTimer ? (
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Día:</span>
                                <span>{dayTimer.day_display}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Entrada:</span>
                                <span>{formatTime(dayTimer.timeIn)}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Salida:</span>
                                <span>{formatTime(dayTimer.timeOut)}</span>
                              </div>
                              <div className="flex justify-between mb-3">
                                <span className="font-medium">
                                  Turno nocturno:
                                </span>
                                <span>
                                  {dayTimer.is_night_shift ? "Sí" : "No"}
                                </span>
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => handleEditTimer(dayTimer.id)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  Editar
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="flex items-center gap-1"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Eliminar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        ¿Eliminar este horario?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Este
                                        horario será eliminado permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteTimer(dayTimer.id)
                                        }
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No hay horario asignado para este día
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {searchTerm
              ? "No se encontraron empleados con ese nombre"
              : "No hay horarios asignados. ¡Qué tigra!"}
          </div>
        )}
      </div>

      {/* Paginación */}
      {filteredEmployees.length > ITEMS_PER_PAGE && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={goToPreviousPage} />
            </PaginationItem>

            {renderPaginationButtons()}

            <PaginationItem>
              <PaginationNext onClick={goToNextPage} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Diálogo de edición de horario */}
      <Dialog
        open={isEditing}
        onOpenChange={(open) => !open && setIsEditing(false)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar horario</DialogTitle>
            <DialogDescription>
              Modifica los detalles del horario. Presiona guardar cuando hayas
              terminado.
            </DialogDescription>
          </DialogHeader>
          {editingTimer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="day">Día</Label>
                <Select
                  value={editingTimer.day.toString()}
                  onValueChange={(value) =>
                    setEditingTimer({
                      ...editingTimer,
                      day: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Lunes</SelectItem>
                    <SelectItem value="2">Martes</SelectItem>
                    <SelectItem value="3">Miércoles</SelectItem>
                    <SelectItem value="4">Jueves</SelectItem>
                    <SelectItem value="5">Viernes</SelectItem>
                    <SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeIn">Hora de entrada</Label>
                <Input
                  id="timeIn"
                  type="time"
                  value={editingTimer.timeIn}
                  onChange={(e) =>
                    setEditingTimer({
                      ...editingTimer,
                      timeIn: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeOut">Hora de salida</Label>
                <Input
                  id="timeOut"
                  type="time"
                  value={editingTimer.timeOut}
                  onChange={(e) =>
                    setEditingTimer({
                      ...editingTimer,
                      timeOut: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_night_shift"
                  checked={editingTimer.is_night_shift}
                  onCheckedChange={(checked) =>
                    setEditingTimer({
                      ...editingTimer,
                      is_night_shift: checked,
                    })
                  }
                />
                <Label htmlFor="is_night_shift">Turno nocturno</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateTimer}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllTimers;
