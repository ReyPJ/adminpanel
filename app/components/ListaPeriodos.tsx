"use client";

import * as React from "react";
import { allPeriods } from "@/app/utils/api";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ListaPeriodos: React.FC = () => {
  const [periodos, setPeriodos] = React.useState<getPeriodResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        setLoading(true);
        const data = await allPeriods();
        setPeriodos(data);
      } catch (err) {
        setError("Error al cargar los períodos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodos();
  }, []);

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "No disponible";
    return format(new Date(fecha), "dd/MM/yyyy", { locale: es });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cargando períodos...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Calendar className="h-5 w-5" />
            {error}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historial de Períodos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {periodos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No hay períodos registrados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodos.map((periodo) => (
                <TableRow key={periodo.id}>
                  <TableCell className="font-medium">{periodo.id}</TableCell>
                  <TableCell>{periodo.description}</TableCell>
                  <TableCell>{formatFecha(periodo.start_date)}</TableCell>
                  <TableCell>{formatFecha(periodo.end_date)}</TableCell>
                  <TableCell>
                    {periodo.is_closed ? (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800"
                      >
                        Cerrado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        Activo
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
