"use client";

import * as r from "react";
import { getActiveEmployee } from "../utils/api";
import { ActiveEmployeeInterface } from "../interfaces/employeInterfa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, User, UserCircle, LogIn } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export const ActiveEmployees = () => {
  const [isLoading, setIsLoading] = r.useState<boolean>(true);
  const [activeEmployeesData, setActiveEmployeesData] = r.useState<
    ActiveEmployeeInterface[]
  >([]);

  r.useEffect(() => {
    try {
      const fetchActiveEmployees = async () => {
        const activeEmployees = await getActiveEmployee();
        setActiveEmployeesData(activeEmployees);
        setIsLoading(false);
      };
      fetchActiveEmployees();
    } catch (error) {
      console.error("Error fetching active employees:", error);
      setIsLoading(false);
    }
  }, []);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "HH - mm");
    } catch (error) {
      console.error("Error formatting time:", error);
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-t-lg py-4">
        <CardTitle className="text-xl text-center font-bold text-primary">
          Empleados activos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activeEmployeesData.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No hay empleados activos en este momento
          </p>
        ) : (
          <div
            className="max-h-[400px] overflow-y-auto pr-2"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="flex flex-col gap-4">
              {activeEmployeesData.map((employee) => (
                <Card
                  key={employee.id}
                  className="overflow-hidden hover:border-primary transition-colors duration-200 shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserCircle className="h-7 w-7" />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="text-lg font-medium text-primary mb-1">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-medium"
                              >
                                {employee.full_name}
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-60">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">
                                  Nombre completo
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Nombre completo del empleado registrado en el
                                  sistema.
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm font-normal text-muted-foreground"
                                >
                                  {employee.username}
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-60">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    Nombre de usuario
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Identificador único del empleado para
                                    iniciar sesión en el sistema.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>

                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm font-normal text-muted-foreground"
                                >
                                  {formatTime(employee.timestamp_in)}
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-60">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    Hora de ingreso
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Hora en que el empleado registró su entrada
                                    al trabajo en formato 24 horas.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>

                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <LogIn className="h-3.5 w-3.5" />
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm font-normal text-muted-foreground"
                                >
                                  {employee.method}
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-60">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    Método de ingreso
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Sistema utilizado por el empleado para
                                    registrar su entrada (PIN, biométrico, etc).
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
