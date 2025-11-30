"use client";

import * as React from "react";
import {
  postPeriod,
  closeAndCreateNewPeriod,
  getActivePeriod,
} from "@/app/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const GestionPeriodos: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    start_date: string;
    end_date: string;
  }>({
    start_date: "",
    end_date: "",
  });
  const [closeFormData, setCloseFormData] = React.useState<{
    start_date: string;
    end_date: string;
  }>({
    start_date: "",
    end_date: "",
  });
  const [formError, setFormError] = React.useState<string>("");
  const [closeFormError, setCloseFormError] = React.useState<string>("");

  const [hasActivePeriod, setHasActivePeriod] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchActivePeriod = async () => {
      try {
        const activePeriod = await getActivePeriod();
        if (
          activePeriod &&
          Object.keys(activePeriod).length > 0 &&
          activePeriod.id
        ) {
          setHasActivePeriod(true);
        } else {
          setHasActivePeriod(false);
        }
      } catch (error) {
        console.error("Error al verificar período activo:", error);
        // En caso de error, asumimos que no hay período activo para permitir la creación
        setHasActivePeriod(false);
      }
    };
    fetchActivePeriod();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCloseFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    // Validar formato dd/mm/yyyy
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (
      !dateRegex.test(formData.start_date) ||
      !dateRegex.test(formData.end_date)
    ) {
      setFormError("Las fechas deben tener el formato dd/mm/yyyy");
      return;
    }
    try {
      setLoading(true);
      await postPeriod({
        start_date: formData.start_date,
        end_date: formData.end_date,
        action: "create_new",
      });
      toast.success("Periodo creado exitosamente");
      setIsDialogOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el periodo");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAndCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloseFormError("");

    // Validar formato dd/mm/yyyy si se proporcionan fechas
    if (closeFormData.start_date || closeFormData.end_date) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (
        (closeFormData.start_date &&
          !dateRegex.test(closeFormData.start_date)) ||
        (closeFormData.end_date && !dateRegex.test(closeFormData.end_date))
      ) {
        setCloseFormError("Las fechas deben tener el formato dd/mm/yyyy");
        return;
      }
    }

    try {
      setLoading(true);
      const result = await closeAndCreateNewPeriod(
        closeFormData.start_date || undefined,
        closeFormData.end_date || undefined
      );

      // Mostrar información de migración si hay empleados migrados
      if (result.migration.migrated_count > 0) {
        const employeeNames = result.migration.migrated_employees
          .map((e) => e.employee_username)
          .join(", ");

        toast.success(
          `Periodo cerrado exitosamente. ${result.migration.migrated_count} empleados migrados al nuevo periodo: ${employeeNames}`,
          {
            duration: 6000,
          }
        );
      } else {
        toast.success("Periodo cerrado y nuevo periodo creado exitosamente");
      }

      setIsCloseDialogOpen(false);
      // Recargar la página para actualizar la información
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Error al cerrar el periodo y crear uno nuevo");
    } finally {
      setLoading(false);
    }
  };

  // Manejar el clic en el botón para crear período
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gestión de Períodos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col items-center gap-2">
          {hasActivePeriod && (
            <p className="text-sm text-red-500 text-center">
              Debes cerrar el período actual para crear un nuevo período
            </p>
          )}

          <Button
            className="mr-2"
            onClick={handleOpenDialog}
            disabled={hasActivePeriod}
            data-test-id="create-period-button"
          >
            {hasActivePeriod ? "✓ " : ""}
            <Plus className="mr-2 h-4 w-4" />
            Crear Nuevo Período
            {hasActivePeriod ? " (Deshabilitado)" : ""}
          </Button>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Período</DialogTitle>
              <DialogDescription>
                Ingresa la información del nuevo período de pago
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Fecha de inicio</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="text"
                    value={formData.start_date}
                    onChange={handleChange}
                    placeholder="dd/mm/yyyy"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">Fecha de fin</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="text"
                    value={formData.end_date}
                    onChange={handleChange}
                    placeholder="dd/mm/yyyy"
                    required
                  />
                </div>
                {formError && (
                  <p className="text-red-500 text-sm text-center">
                    {formError}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creando..." : "Crear Período"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="destructive"
          onClick={() => setIsCloseDialogOpen(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Período y Crear Nuevo
        </Button>

        <Dialog
          open={isCloseDialogOpen}
          onOpenChange={(open) => {
            setIsCloseDialogOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cerrar Período Actual y Crear Nuevo</DialogTitle>
              <DialogDescription>
                Esta acción cerrará el período actual y creará uno nuevo. Los
                empleados actualmente trabajando serán migrados automáticamente
                al nuevo periodo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCloseAndCreatePeriod}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="close_start_date">
                    Fecha de inicio del nuevo período (opcional)
                  </Label>
                  <Input
                    id="close_start_date"
                    name="start_date"
                    type="text"
                    value={closeFormData.start_date}
                    onChange={handleCloseFormChange}
                    placeholder="dd/mm/yyyy (por defecto: hoy)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="close_end_date">
                    Fecha de fin del nuevo período (opcional)
                  </Label>
                  <Input
                    id="close_end_date"
                    name="end_date"
                    type="text"
                    value={closeFormData.end_date}
                    onChange={handleCloseFormChange}
                    placeholder="dd/mm/yyyy (por defecto: hoy + 15 días)"
                  />
                </div>
                {closeFormError && (
                  <p className="text-red-500 text-sm text-center">
                    {closeFormError}
                  </p>
                )}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Los empleados actualmente trabajando serán migrados
                    automáticamente al nuevo periodo.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCloseDialogOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {loading ? "Cerrando y creando..." : "Cerrar y Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
