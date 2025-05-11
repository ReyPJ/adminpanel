"use client";

import * as React from "react";
import { allPeriods } from "@/app/utils/api";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PeriodSelectorProps {
  onPeriodSelected: (period: getPeriodResponse) => void;
}

export function PeriodSelector({ onPeriodSelected }: PeriodSelectorProps) {
  const [loading, setLoading] = React.useState(true);
  const [periods, setPeriods] = React.useState<getPeriodResponse[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<string>("");

  React.useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setLoading(true);
        const periodsData = await allPeriods();
        setPeriods(periodsData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los periodos:", error);
        setLoading(false);
      }
    };

    fetchPeriods();
  }, []);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriodId(value);
    const selectedPeriod = periods.find((p) => p.id.toString() === value);
    if (selectedPeriod) {
      onPeriodSelected(selectedPeriod);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5" />
          Selección de Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando períodos...</span>
          </div>
        ) : periods.length === 0 ? (
          <div className="text-muted-foreground">
            No hay períodos disponibles. Crea un período primero.
          </div>
        ) : (
          <Select onValueChange={handlePeriodChange} value={selectedPeriodId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un período" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Períodos disponibles</SelectLabel>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.description} ({formatDate(period.start_date)} -{" "}
                    {formatDate(period.end_date)})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
