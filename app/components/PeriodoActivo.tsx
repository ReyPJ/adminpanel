"use client";

import * as React from "react";
import { getActivePeriod } from "@/app/utils/api";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const PeriodoActivo: React.FC = () => {
  const [periodo, setPeriodo] = React.useState<getPeriodResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [noPeriodoActivo, setNoPeriodoActivo] = React.useState(false);

  React.useEffect(() => {
    const fetchPeriodoActivo = async () => {
      try {
        setLoading(true);
        const data = await getActivePeriod();
        // Verificar si el objeto devuelto realmente tiene un ID
        // Si no tiene ID, significa que no hay periodo activo
        if (data && data.id) {
          setPeriodo(data);
          setNoPeriodoActivo(false);
        } else {
          setNoPeriodoActivo(true);
          setPeriodo(null);
        }
      } catch (err: unknown) {
        // Si es un 404, simplemente significa que no hay periodo activo
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response &&
          err.response.status === 404
        ) {
          setNoPeriodoActivo(true);
          setError(null);
        } else {
          setError("Error al cargar el periodo activo");
          console.error("Error inesperado:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodoActivo();
  }, []);

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "No disponible";
    return format(new Date(fecha), "dd 'de' MMMM, yyyy", { locale: es });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Cargando periodo activo...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (noPeriodoActivo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Periodo Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>No hay un período activo actualmente</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Puedes crear un nuevo período usando el botón &quot;Crear Nuevo
            Periodo&quot;
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <CalendarDays className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!periodo) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Periodo Activo
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
            Activo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Descripción:</div>
            <div className="text-sm font-medium">{periodo.description}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">
              Fecha de inicio:
            </div>
            <div className="text-sm font-medium">
              {formatFecha(periodo.start_date)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Fecha de fin:</div>
            <div className="text-sm font-medium">
              {formatFecha(periodo.end_date)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
