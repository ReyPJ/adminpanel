"use client";

import * as React from "react";
import {
  postPeriod,
  closeCurrentPeriod,
  getActivePeriod,
} from "@/app/utils/api";
import { postPeriodRequest } from "@/app/interfaces/periodsInterfaces";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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

export const GestionPeriodos: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<
    Omit<postPeriodRequest, "action">
  >({
    start_date: "",
    end_date: "",
    description: "",
  });

  const [hasActivePeriod, setHasActivePeriod] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchActivePeriod = async () => {
      const activePeriod = await getActivePeriod();
      if (activePeriod.id) {
        setHasActivePeriod(true);
      }
    };
    fetchActivePeriod();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await postPeriod({
        ...formData,
        action: "create_new",
      });
      toast.success("Periodo creado exitosamente");
      setIsDialogOpen(false);
      // Recargar la página para mostrar el nuevo periodo
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el periodo");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePeriod = async () => {
    try {
      setLoading(true);
      await closeCurrentPeriod("close_current");
      toast.success("Periodo actual cerrado exitosamente");
      // Recargar la página para actualizar  la información
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Error al cerrar el periodo actual");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gestión de Períodos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="flex flex-col items-center gap-2">
            {hasActivePeriod && (
              <p className="text-sm text-red-500 text-center">
                Debes cerrar el período actual para crear un nuevo período
              </p>
            )}

            <DialogTrigger asChild>
              <Button className="mr-2" disabled={hasActivePeriod}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Nuevo Período
              </Button>
            </DialogTrigger>
          </div>
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
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ej: Quincena 1 - Enero 2024"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Fecha de inicio</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">Fecha de fin</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Período Actual
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción cerrará el período actual y no se podrá deshacer.
                Los registros de tiempo y pagos quedarán finalizados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClosePeriod}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600"
              >
                {loading ? "Cerrando..." : "Cerrar Período"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
