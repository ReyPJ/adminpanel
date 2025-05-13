"use client";
import {
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Breadcrumb,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ToggleTheme } from "@/app/components/toggleTheme";
import { PeriodoActivo } from "@/app/components/PeriodoActivo";
import { ListaPeriodos } from "@/app/components/ListaPeriodos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, AlertTriangle, Calendar } from "lucide-react";
import { getActivePeriod, closeCurrentPeriod } from "@/app/utils/api";
import { GestionPeriodos } from "@/app/components/GestionPeriodos";
import { toast } from "sonner";
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

// Componente Alert personalizado
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative w-full rounded-lg border p-4 ${className}`}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`text-sm opacity-90 ${className}`} {...props} />
));
AlertDescription.displayName = "AlertDescription";

const PeriodsPage: React.FC = () => {
  const segments = usePathname().split("/").filter(Boolean);
  let pathSoFar = "";
  const [loading, setLoading] = React.useState(false);
  const [activePeriod, setActivePeriod] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkActivePeriod = async () => {
      try {
        const data = await getActivePeriod();
        setActivePeriod(!!data.id);
      } catch (err: unknown) {
        // Si el error es 404, simplemente significa que no hay periodo activo
        // No es realmente un error para nuestra lógica de negocio
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response &&
          err.response.status === 404
        ) {
          setActivePeriod(false);
        } else {
          console.error("Error al verificar periodo activo:", err);
        }
      }
    };

    checkActivePeriod();
  }, []);

  const handleClosePeriod = async () => {
    try {
      setLoading(true);
      await closeCurrentPeriod("close_current");
      toast.success("Periodo actual cerrado exitosamente");
      // Recargar la página para actualizar la información
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Error al cerrar el periodo actual");
    } finally {
      setLoading(false);
    }
  };

  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      payments: "Pagos",
      periods: "Periodos",
    };
    return (
      translations[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <ToggleTheme />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, idx) => {
              pathSoFar += `/${segment}`;
              const isLast = idx === segments.length - 1;
              return (
                <React.Fragment key={segment}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {translateSegment(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={pathSoFar}>
                        {translateSegment(segment)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Periodos de Pago</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Periodo Activo */}
          <PeriodoActivo />

          {/* Gestion de Periodos */}
          <GestionPeriodos />

          {/* Historial de Periodos */}
          <ListaPeriodos />
        </div>
      </main>
    </div>
  );
};

export default PeriodsPage;
