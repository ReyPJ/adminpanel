"use client";
import * as r from "react";
import { EmployeeInterface } from "../interfaces/employeInterfa";
import { getAllEmployees } from "../utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Loader2, MoreHorizontal, PenSquare, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmployeeDialogCreateForm } from "./employeeDialogCreateForm";
import { EmployeeDialogUpdateForm } from "./employeeDialogUpdateForm";
import { deleteEmployee } from "../utils/api";
import { toast } from "sonner";

export function EmployeeList() {
  const [employeesList, setEmployeesList] = r.useState<EmployeeInterface[]>([]);
  const [loading, setLoading] = r.useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeInterface | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4, // Configuramos para mostrar 4 empleados por página
  });

  r.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await getAllEmployees();
        // set employees List on localStorage so we can use it on any component without fetching again
        localStorage.setItem("employees_list", JSON.stringify(response));
        setEmployeesList(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const columns: ColumnDef<EmployeeInterface>[] = [
    {
      accessorKey: "first_name",
      header: "Nombre",
      cell: ({ row }) => <div>{row.getValue("first_name")}</div>,
    },
    {
      accessorKey: "last_name",
      header: "Apellido",
      cell: ({ row }) => <div>{row.getValue("last_name")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "unique_pin",
      header: "PIN",
      cell: ({ row }) => <div>{row.getValue("unique_pin")}</div>,
    },
    {
      accessorKey: "salary_hour",
      header: () => <div className="text-right">Salario/Hora</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("salary_hour"));
        const formatted = new Intl.NumberFormat("es-CR", {
          style: "currency",
          currency: "CRC",
          minimumFractionDigits: 0,
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "night_shift_factor",
      header: () => <div className="text-right">Factor Nocturno</div>,
      cell: ({ row }) => {
        const value = parseFloat(row.getValue("night_shift_factor"));
        return (
          <div className="text-right font-medium">{value.toFixed(2)}x</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const employee_id = row.original.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2"
                onSelect={(e) => {
                  e.preventDefault();
                  setEditingEmployee(row.original);
                  setEditDialogOpen(true);
                }}
              >
                <PenSquare className="h-4 w-4" />
                <Button variant={"ghost"}>Editar</Button>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    deleteEmployee(employee_id);
                    toast("Empleado eliminado correctamente", {
                      icon: "👍",
                      richColors: true,
                      description:
                        "El empleado ha sido eliminado correctamente",
                    });
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}
                >
                  <span>Eliminar</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: employeesList,
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

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Lista de Empleados</CardTitle>
          <CardDescription>
            Gestiona los empleados registrados en el sistema
          </CardDescription>
          <div className="flex flex-col sm:flex-row items-center py-4 justify-between gap-3 w-full">
            <Input
              placeholder="Buscar empleado..."
              value={
                (table.getColumn("first_name")?.getFilterValue() as string) ??
                ""
              }
              onChange={(e) =>
                table.getColumn("first_name")?.setFilterValue(e.target.value)
              }
              className="w-full sm:max-w-sm"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Agregar Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full sm:max-w-4xl w-[95vw] sm:w-full flex flex-col max-h-[90vh] overflow-y-auto">
                <DialogHeader className="w-full px-4 sm:px-8 pt-6">
                  <DialogTitle>Creación de empleado</DialogTitle>
                  <DialogDescription>
                    Formulario para crear empleado.
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full px-4 sm:px-8 pb-6">
                  <EmployeeDialogCreateForm />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-2">
              <Loader2 className="animate-spin text-blue-500" size={36} />
              <span className="text-lg text-muted-foreground">
                Cargando empleados...
              </span>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
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
                          No se encontraron empleados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Mostrando {table.getRowModel().rows.length} de{" "}
                  {employeesList.length} empleados
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-4xl w-[95vw] sm:w-full flex flex-col max-h-[90vh] overflow-y-auto">
          <DialogHeader className="w-full px-4 sm:px-8 pt-6">
            <DialogTitle>Editar empleado</DialogTitle>
            <DialogDescription>
              Formulario para editar empleado.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full px-4 sm:px-8 pb-6">
            {editingEmployee && (
              <EmployeeDialogUpdateForm
                employee={editingEmployee}
                onSuccess={() => {
                  setEditDialogOpen(false);
                  // Refrescar la lista de empleados después de editar
                  getAllEmployees().then(setEmployeesList);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
