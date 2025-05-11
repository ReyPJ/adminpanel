"use client";
import * as React from "react";
import { getActivePeriod } from "@/app/utils/api";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircle, Lock, Loader2, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ActivePeriod(): React.ReactNode {
  const [activePeriod, setActivePeriod] =
    React.useState<getPeriodResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [noPeriodActive, setNoPeriodActive] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchActivePeriod = async () => {
      try {
        const period = await getActivePeriod();

        // Si no hay periodo activo (objeto vacío o sin ID)
        if (!period || !period.id) {
          setNoPeriodActive(true);
          setIsLoading(false);
          return;
        }

        // convert start_date and end_date to date objects
        const startDate = new Date(period.start_date ?? "");
        const endDate = new Date(period.end_date);
        // format start_date and end_date to dd - mm - yyyy
        const formattedStartDate = startDate.toLocaleDateString("es-CR");
        const formattedEndDate = endDate.toLocaleDateString("es-CR");
        // format description to uppercase
        period.start_date = formattedStartDate;
        period.end_date = formattedEndDate;
        setActivePeriod(period);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching active period:", error);
        setNoPeriodActive(true);
        setIsLoading(false);
      }
    };
    fetchActivePeriod();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-56 w-full gap-2">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <span className="text-lg text-muted-foreground">
          Cargando periodo activo...
        </span>
      </div>
    );
  }

  if (noPeriodActive) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>No hay periodo activo</span>
            <AlertTriangle className="text-amber-600" size={22} />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-2 mt-2">
            <Info className="text-amber-500 mt-1" size={20} />
            <p className="text-base text-justify">
              No hay ningún periodo de pago activo actualmente. Es necesario
              crear uno para poder registrar entradas/salidas y visualizar
              estadísticas.
            </p>
          </div>
          <div className="flex justify-center mt-4">
            <Button asChild variant="default" size="lg">
              <Link href="/payments/periods">Crear periodo nuevo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span>Periodo Actualmente Activo</span>
          {!activePeriod?.is_closed ? (
            <CheckCircle className="text-green-600" size={22} />
          ) : (
            <Lock className="text-red-600" size={22} />
          )}
        </CardTitle>
        <CardDescription className="text-lg text-primary font-semibold">
          {activePeriod?.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-2 text-base font-medium">
            Inicio: {activePeriod?.start_date}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-2 text-base font-medium">
            Fin: {activePeriod?.end_date}
          </Badge>
        </div>
        <div className="flex items-start gap-2 mt-2">
          <Info className="text-blue-500 mt-1" size={20} />
          <p className="text-base text-justify">
            El periodo actualmente activo es el{" "}
            <b>{activePeriod?.description}</b>, todo registro de entradas y
            salidas será correspondiente a este periodo, todas las estadísticas
            también corresponden a este periodo.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Badge
          variant={activePeriod?.is_closed ? "destructive" : "default"}
          className={`text-sm px-4 py-2 ${
            activePeriod?.is_closed ? "bg-red-600" : "bg-green-600"
          } text-white flex items-center gap-1`}
        >
          {!activePeriod?.is_closed ? (
            <CheckCircle size={16} className="mr-1" />
          ) : (
            <Lock size={16} className="mr-1" />
          )}
          {activePeriod?.is_closed
            ? "Cerrado"
            : "Este periodo se encuentra activo"}
        </Badge>
      </CardFooter>
    </Card>
  );
}
