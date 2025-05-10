"use client";

import * as r from "react";
import { getQRCode } from "../utils/api";
import { EmployeeInterface } from "../interfaces/employeInterfa";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  Download,
  History,
  QrCode,
  User,
  Clock,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const GetQRComponent = () => {
  const [open, setOpen] = r.useState(false);
  const [selectedEmployee, setSelectedEmployee] = r.useState<number | null>(
    null
  );
  const [employeeName, setEmployeeName] = r.useState<string>("");
  const [employeeList, setEmployeeList] = r.useState<EmployeeInterface[]>([]);
  const [isGenerating, setIsGenerating] = r.useState(false);
  const [recentHistory, setRecentHistory] = r.useState<
    { id: number; name: string; date: string }[]
  >([]);

  r.useEffect(() => {
    const employees = JSON.parse(
      localStorage.getItem("employees_list") || "[]"
    );
    setEmployeeList(employees);

    // Cargar historial del localStorage si existe
    const history = JSON.parse(localStorage.getItem("qr_history") || "[]");
    setRecentHistory(history);
  }, []);

  const handleQRCode = async () => {
    if (selectedEmployee) {
      try {
        setIsGenerating(true);
        await getQRCode(selectedEmployee);

        // Agregar al historial
        const employee = employeeList.find(
          (emp) => emp.id === selectedEmployee
        );
        if (employee) {
          const newHistory = [
            {
              id: selectedEmployee,
              name: `${employee.first_name} ${employee.last_name}`,
              date: new Date().toLocaleDateString("es-CR", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            ...recentHistory,
          ].slice(0, 5); // Mantener solo los últimos 5

          setRecentHistory(newHistory);
          localStorage.setItem("qr_history", JSON.stringify(newHistory));
        }
      } catch (error) {
        console.error("Error descargando QR code:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Función para cambiar a la pestaña de generar QR
  const switchToGenerateTab = () => {
    const generateTabElement = document.querySelector(
      '[data-value="generate"]'
    ) as HTMLElement;
    if (generateTabElement) {
      generateTabElement.click();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="generate" className="flex gap-2 items-center">
            <QrCode className="h-4 w-4" />
            Generar Código QR
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-2 items-center">
            <History className="h-4 w-4" />
            Historial Reciente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccione un Empleado</CardTitle>
              <CardDescription>
                Seleccione el empleado para generar su código QR de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {employeeName || "Seleccione un empleado..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar empleado..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                      <CommandGroup>
                        {employeeList.map((employee, index) => (
                          <CommandItem
                            key={employee.id || index}
                            value={`${employee.first_name} ${employee.last_name}`}
                            onSelect={() => {
                              // Solo asignar el ID si existe
                              if (employee.id !== undefined) {
                                setSelectedEmployee(employee.id);
                              }
                              setEmployeeName(
                                `${employee.first_name} ${employee.last_name}`
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedEmployee === employee.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {employee.first_name} {employee.last_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedEmployee
                  ? "Empleado seleccionado"
                  : "Ningún empleado seleccionado"}
              </p>
              <Button
                onClick={handleQRCode}
                disabled={!selectedEmployee || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 flex gap-2 items-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generar QR
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {selectedEmployee && (
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-700">
                      {employeeName}
                    </h3>
                    <p className="text-blue-600">
                      Haz clic en &quot;Generar QR&quot; para crear y descargar
                      el código QR
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedEmployee && (
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="pt-6 pb-6 flex items-center justify-center">
                <div className="text-center">
                  <User className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-blue-700">
                    Selecciona un empleado
                  </h3>
                  <p className="text-blue-600 max-w-md mt-1">
                    Para generar un código QR, primero selecciona un empleado de
                    la lista desplegable
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Códigos QR</CardTitle>
              <CardDescription>
                Últimos QR generados en este dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentHistory.length > 0 ? (
                <div className="space-y-4">
                  {recentHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <QrCode className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.date}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(item.id);
                          setEmployeeName(item.name);
                          switchToGenerateTab();
                        }}
                      >
                        Seleccionar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-500">
                    No hay historial
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto mt-1">
                    Los códigos QR generados aparecerán en este historial
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
