"use client";

import * as r from "react";
import { createNFCToken, revokeNFCToken } from "../utils/api";
import { EmployeeInterface } from "../interfaces/employeInterfa";
import { NFCTokenResponse } from "../interfaces/authInterfaces";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  Tag,
  History,
  Copy,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const NFCTokenComponent = () => {
  const [open, setOpen] = r.useState(false);
  const [selectedEmployee, setSelectedEmployee] = r.useState<number | null>(
    null
  );
  const [employeeName, setEmployeeName] = r.useState<string>("");
  const [tagId, setTagId] = r.useState<string>("");
  const [employeeList, setEmployeeList] = r.useState<EmployeeInterface[]>([]);
  const [isGenerating, setIsGenerating] = r.useState(false);
  const [generatedToken, setGeneratedToken] =
    r.useState<NFCTokenResponse | null>(null);
  const [recentTokens, setRecentTokens] = r.useState<
    (NFCTokenResponse & { employee_name: string })[]
  >([]);

  // Cargar la lista de empleados cuando se monta el componente
  r.useEffect(() => {
    const employees = JSON.parse(
      localStorage.getItem("employees_list") || "[]"
    );
    setEmployeeList(employees);

    // Cargar tokens recientes del localStorage si existen
    const tokens = JSON.parse(localStorage.getItem("nfc_tokens") || "[]");
    setRecentTokens(tokens);
  }, []);

  const handleCreateToken = async () => {
    if (selectedEmployee && tagId.trim()) {
      try {
        setIsGenerating(true);
        const token = await createNFCToken(selectedEmployee, tagId);
        setGeneratedToken(token);

        // Agregar al historial local
        const employee = employeeList.find(
          (emp) => emp.id === selectedEmployee
        );

        if (employee) {
          const newToken = {
            ...token,
            employee_name: `${employee.first_name} ${employee.last_name}`,
          };

          const newTokens = [newToken, ...recentTokens].slice(0, 10); // Guardar los últimos 10
          setRecentTokens(newTokens);
          localStorage.setItem("nfc_tokens", JSON.stringify(newTokens));

          toast.success(
            `Token NFC generado para ${employee.first_name} ${employee.last_name}`
          );
        }
      } catch (error) {
        console.error("Error generando token NFC:", error);
        toast.error("No se pudo generar el token NFC");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado al portapapeles");
  };

  const handleRevokeToken = async (tokenId: number) => {
    try {
      await revokeNFCToken(tokenId);
      // Actualizar la lista de tokens recientes
      const updatedTokens = recentTokens.map((token) =>
        token.id === tokenId ? { ...token, revoked: true } : token
      );
      setRecentTokens(updatedTokens);
      localStorage.setItem("nfc_tokens", JSON.stringify(updatedTokens));

      toast.success("El token NFC ha sido revocado exitosamente");
    } catch (error) {
      console.error("Error revocando token:", error);
      toast.error("No se pudo revocar el token");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="generate" className="flex gap-2 items-center">
            <Tag className="h-4 w-4" />
            Generar Token NFC
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-2 items-center">
            <History className="h-4 w-4" />
            Historial de Tokens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generar Token NFC</CardTitle>
              <CardDescription>
                Seleccione un empleado y proporcione un ID de etiqueta NFC para
                generar un token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Empleado</Label>
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
                        <CommandEmpty>
                          No se encontraron empleados.
                        </CommandEmpty>
                        <CommandGroup>
                          {employeeList.map((employee, index) => (
                            <CommandItem
                              key={employee.id || index}
                              value={`${employee.first_name} ${employee.last_name}`}
                              onSelect={() => {
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagId">ID de Etiqueta NFC</Label>
                <Input
                  id="tagId"
                  placeholder="Ingrese el ID de la etiqueta NFC"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Este es un identificador único para la etiqueta física NFC
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedEmployee && tagId.trim()
                  ? "Listo para generar token"
                  : "Debe seleccionar un empleado y proporcionar un ID de etiqueta"}
              </p>
              <Button
                onClick={handleCreateToken}
                disabled={!selectedEmployee || !tagId.trim() || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 flex gap-2 items-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Tag className="h-4 w-4" />
                    Generar Token
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {generatedToken && (
            <Card className="bg-green-50 border-green-100">
              <CardHeader>
                <CardTitle className="text-green-700">Token Generado</CardTitle>
                <CardDescription className="text-green-600">
                  Token NFC generado exitosamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-green-700">Token JWT:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-green-700 border-green-200"
                      onClick={() => handleCopyToken(generatedToken.token)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </Button>
                  </div>
                  <div className="p-3 bg-white rounded-md border border-green-200 overflow-auto">
                    <code className="text-xs break-all">
                      {generatedToken.token}
                    </code>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-sm text-green-700">
                      ID: {generatedToken.id}
                    </span>
                    <span className="text-sm text-green-700">
                      Tag ID: {generatedToken.tag_id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Tokens NFC</CardTitle>
              <CardDescription>
                Lista de tokens NFC generados recientemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTokens.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">
                    No hay tokens NFC generados recientemente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTokens.map((token) => (
                    <div
                      key={token.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{token.employee_name}</div>
                        <Badge
                          className={
                            token.revoked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {token.revoked ? "Revocado" : "Activo"}
                        </Badge>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>ID de Token: {token.id}</span>
                        <span>Tag ID: {token.tag_id}</span>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => handleCopyToken(token.token)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copiar Token
                        </Button>

                        {!token.revoked && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleRevokeToken(token.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Revocar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
