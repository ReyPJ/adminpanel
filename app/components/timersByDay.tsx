"use client";
import React, { useEffect, useState } from "react";
import {
  getTimers,
  deleteTimer,
  getTimerByTimerId,
  updateTimer,
} from "../utils/api";
import { EmployeeInterface } from "../interfaces/employeInterfa";
import { TimerInterface } from "../interfaces/timersInterfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Interfaz para el formato de datos agrupados por día
interface TimersByDayRow {
  day: number;
  day_display: string;
  employees: {
    employee_id: number;
    employee_name: string;
    timeIn: string;
    timeOut: string;
    is_night_shift: boolean;
    timer_id: number;
  }[];
}

// Interfaz para formulario de edición
interface TimerFormValues {
  id: number;
  employee: number;
  day: number;
  timeIn: string;
  timeOut: string;
  is_night_shift: boolean;
}

const TimersByDay = () => {
  const [timersByDay, setTimersByDay] = useState<TimersByDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 7, // Mostrar todos los días en una página
  });
  const [editingTimer, setEditingTimer] = useState<TimerFormValues | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  // Función para cargar todos los horarios
  const fetchTimers = async () => {
    try {
      setLoading(true);
      const data = await getTimers();

      // Obtener la lista de empleados del localStorage
      const employeesList: EmployeeInterface[] = JSON.parse(
        localStorage.getItem("employees_list") || "[]"
      );

      // Mapear los días de la semana
      const daysMap: { [key: number]: TimersByDayRow } = {
        0: { day: 0, day_display: "Domingo", employees: [] },
        1: { day: 1, day_display: "Lunes", employees: [] },
        2: { day: 2, day_display: "Martes", employees: [] },
        3: { day: 3, day_display: "Miércoles", employees: [] },
        4: { day: 4, day_display: "Jueves", employees: [] },
        5: { day: 5, day_display: "Viernes", employees: [] },
        6: { day: 6, day_display: "Sábado", employees: [] },
      };

      // Función para obtener el nombre del empleado
      const getEmployeeName = (employeeId: number) => {
        const employee = employeesList.find((emp) => emp.id === employeeId);
        return employee
          ? `${employee.first_name} ${employee.last_name}`
          : `Empleado #${employeeId}`;
      };

      // Procesar y agrupar los datos por día
      data.forEach((employeeData) => {
        employeeData.timers.forEach((timer) => {
          if (!daysMap[timer.day]) return;

          daysMap[timer.day].employees.push({
            employee_id: timer.employee,
            employee_name: getEmployeeName(timer.employee),
            timeIn: timer.timeIn,
            timeOut: timer.timeOut,
            is_night_shift: timer.is_night_shift || false,
            timer_id: timer.id,
          });
        });
      });

      // Convertir el objeto a un array
      const daysArray = Object.values(daysMap);
      setTimersByDay(daysArray);
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
    fetchTimers();
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
      fetchTimers(); // Recargar los datos
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
      fetchTimers(); // Recargar los datos
    } catch (err) {
      console.error("Error al eliminar el horario:", err);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el horario. Intenta de nuevo.",
      });
    }
  };

  // Formatear la hora (de 24h a 12h con AM/PM)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const columns: ColumnDef<TimersByDayRow>[] = [
    {
      accessorKey: "day_display",
      header: "Día",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("day_display")}</div>
      ),
    },
    {
      id: "employees",
      header: "Empleados",
      cell: ({ row }) => {
        const dayData = row.original;

        return (
          <div className="space-y-2 py-2">
            {dayData.employees.length > 0 ? (
              dayData.employees.map((emp, index) => (
                <div
                  key={`${emp.employee_id}-${index}`}
                  className="border rounded-md p-2 bg-muted/20"
                >
                  <div className="font-medium">{emp.employee_name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                    <div className="flex justify-between">
                      <span>Entrada:</span>
                      <span className="font-semibold">
                        {formatTime(emp.timeIn)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salida:</span>
                      <span className="font-semibold">
                        {formatTime(emp.timeOut)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turno nocturno:</span>
                      <span className="font-semibold">
                        {emp.is_night_shift ? "Sí" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-end col-span-2 gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleEditTimer(emp.timer_id)}
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
                              Esta acción no se puede deshacer. Este horario
                              será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTimer(emp.timer_id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground italic">
                No hay empleados asignados este día
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: timersByDay,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-2">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <span className="text-lg text-muted-foreground">
          Cargando horarios...
        </span>
      </div>
    );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Horarios por Día</CardTitle>
          <CardDescription>
            Vista de todos los horarios organizados por día de la semana
          </CardDescription>
          <div className="flex items-center py-4 w-full">
            <Input
              placeholder="Filtrar por día..."
              value={
                (table.getColumn("day_display")?.getFilterValue() as string) ??
                ""
              }
              onChange={(e) =>
                table.getColumn("day_display")?.setFilterValue(e.target.value)
              }
              className="w-full sm:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No se encontraron horarios.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 py-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <div className="text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

export default TimersByDay;
