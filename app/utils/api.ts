import axios from "axios";
import {
  getPeriodResponse,
  postPeriodRequest,
} from "@/app/interfaces/periodsInterfaces";
import { AllEmployeeStats } from "@/app/interfaces/Stats";
import {
  EmployeeInterface,
  ActiveEmployeeInterface,
} from "../interfaces/employeInterfa";
import {
  AuthPostRequest,
  AuthPostResponse,
  NFCTokenResponse,
  NFCTokenValidateResponse,
} from "../interfaces/authInterfaces";
import {
  PostTimerInterface,
  TimerInterface,
  getAllTimersResponse,
} from "../interfaces/timersInterfaces";
import { salaryRecordInterface } from "../interfaces/salaryRecord";
import Cookies from "js-cookie";
import {
  nightHoursCountInterface,
  requestCalculateSalaryInterface,
  CalculateSalaryResponse,
  LiveSummaryResponse,
} from "../interfaces/salaryInterfaces";
import { attendanceInterface } from "../interfaces/attendanceDetailsInterface";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authenticateService = async (
  request: AuthPostRequest
): Promise<AuthPostResponse> => {
  try {
    const response = await api.post<AuthPostResponse>("auth/", request);
    Cookies.set("token", response.data.access, {
      expires: 1,
    });
    return response.data;
  } catch (error) {
    console.error("Error authenticating:", error);
    throw error;
  }
};

export const getAttendanceDetails = async (
  employeeId: number,
  periodId: number
): Promise<attendanceInterface[]> => {
  try {
    const response = await api.get<attendanceInterface[]>(
      "salary/attendance-details/",
      {
        params: {
          employee_id: employeeId,
          period_id: periodId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance details:", error);
    throw error;
  }
};

// If we pass is_active=true as a query parameter, we get the active period only
// If we pass is_active=true as a query parameter, we get the active period only
//if we pass period_id as a query parameter, we get the period with the given id
// Otherwise, we get all periods
export const getActivePeriod = async (): Promise<getPeriodResponse> => {
  try {
    console.log("Llamando a getActivePeriod API");
    const response = await api.get<getPeriodResponse>("salary/period/", {
      params: {
        is_active: true,
      },
    });
    console.log("Respuesta exitosa de getActivePeriod:", response.data);
    return response.data;
  } catch (error: unknown) {
    // Si es un 404, significa que no hay periodo activo, lo cual es un estado válido
    // y no un error técnico, por lo que no lo registramos en la consola
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 404
    ) {
      console.log("No hay periodo activo (404)");
      return {} as getPeriodResponse; // Devolvemos un objeto vacío que cumple con la interfaz
    }

    // Para cualquier otro tipo de error, sí lo registramos y lo lanzamos
    console.error("Error al obtener periodo activo:", error);
    console.error("Error fetching active period:", error);
    throw error;
  }
};

export const getPeriodById = async (
  periodId: number
): Promise<getPeriodResponse[]> => {
  try {
    const response = await api.get<getPeriodResponse[]>("salary/period/", {
      params: {
        period_id: periodId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching period by id:", error);
    throw error;
  }
};

export const allPeriods = async (): Promise<getPeriodResponse[]> => {
  try {
    const response = await api.get<getPeriodResponse[]>("salary/period/");
    return response.data;
  } catch (error) {
    console.error("Error fetching all periods:", error);
    throw error;
  }
};

export const postPeriod = async (periodData: postPeriodRequest) => {
  try {
    const response = await api.post("salary/period/", periodData);
    return response.data;
  } catch (error) {
    console.error("Error posting period:", error);
    throw error;
  }
};

export const closeCurrentPeriod = async (action: "close_current") => {
  try {
    const response = await api.post("salary/period/", {
      action,
    });
    return response.data;
  } catch (error) {
    console.error("Error closing period:", error);
    throw error;
  }
};

export const getNightHoursCount = async (
  periodId: number
): Promise<nightHoursCountInterface[]> => {
  try {
    const response = await api.get("salary/night-hours/", {
      params: {
        period_id: periodId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching night hours count:", error);
    throw error;
  }
};

export const calculateSalary = async (
  request: requestCalculateSalaryInterface
): Promise<CalculateSalaryResponse> => {
  try {
    const response = await api.post<CalculateSalaryResponse>(
      "salary/calculate/",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Error calculating salary:", error);
    throw error;
  }
};

export const getSalaryRecordsFromPeriod = async (
  periodId: number
): Promise<salaryRecordInterface[]> => {
  try {
    const response = await api.get<salaryRecordInterface[]>(
      `salary/records/?period_id=${periodId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching salary records from period:", error);
    throw error;
  }
};

export const getEmployeeStats = async (): Promise<AllEmployeeStats> => {
  try {
    const response = await api.get<AllEmployeeStats>("attendance/stats/");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    throw error;
  }
};

export const getAllEmployees = async (): Promise<EmployeeInterface[]> => {
  try {
    const response = await api.get<EmployeeInterface[]>("employee/");
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const createEmployee = async (employeeData: EmployeeInterface) => {
  try {
    const response = await api.post<EmployeeInterface>(
      "employee/",
      employeeData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const updateEmployee = async (
  employeeId: number | undefined,
  employeeData: EmployeeInterface
) => {
  try {
    const response = await api.put(`employee/${employeeId}/`, employeeData);
    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

export const deleteEmployee = async (employeeId: number | undefined) => {
  try {
    const response = await api.delete(`employee/${employeeId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

export const getActiveEmployee = async (): Promise<
  ActiveEmployeeInterface[]
> => {
  try {
    const response = await api.get<ActiveEmployeeInterface[]>(
      "employee/active/"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching active employee:", error);
    throw error;
  }
};

export const createNFCToken = async (
  employeeId: number,
  tagId: string
): Promise<NFCTokenResponse> => {
  try {
    const response = await api.post<NFCTokenResponse>(`auth/nfc/create/`, {
      employee_id: employeeId,
      tag_id: tagId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating NFC token:", error);
    throw error;
  }
};

export const revokeNFCToken = async (
  tokenId: number
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(
      `auth/nfc/revoke/${tokenId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error revoking NFC token:", error);
    throw error;
  }
};

export const validateNFCToken = async (
  token: string
): Promise<NFCTokenValidateResponse> => {
  try {
    const response = await api.post<NFCTokenValidateResponse>(
      `auth/nfc/validate/`,
      {
        token: token,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error validating NFC token:", error);
    throw error;
  }
};

export const getTimers = async (): Promise<getAllTimersResponse[]> => {
  try {
    const response = await api.get<getAllTimersResponse[]>("timer/");
    return response.data;
  } catch (error) {
    console.error("Error fetching timers:", error);
    throw error;
  }
};

export const createTimer = async (timerData: PostTimerInterface) => {
  try {
    const response = await api.post<TimerInterface>("timer/", timerData);
    return response.data;
  } catch (error) {
    console.error("Error creating timer:", error);
    throw error;
  }
};

export const getTimersByEmployeeId = async (
  employeeId: number
): Promise<TimerInterface[]> => {
  try {
    const response = await api.get<TimerInterface[]>(
      `/timer/${employeeId}/timers/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching timers by employee id:", error);
    throw error;
  }
};

export const getTimerByTimerId = async (
  timerId: number
): Promise<TimerInterface> => {
  try {
    const response = await api.get<TimerInterface>(`timer/${timerId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching timer by timer id:", error);
    throw error;
  }
};

export const updateTimer = async (
  timerId: number,
  timerData: TimerInterface
) => {
  try {
    const response = await api.put<TimerInterface>(
      `timer/${timerId}/`,
      timerData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating timer:", error);
    throw error;
  }
};

export const deleteTimer = async (timerId: number) => {
  try {
    const response = await api.delete(`timer/${timerId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting timer:", error);
    throw error;
  }
};

// Nueva función para obtener resumen de horas en tiempo real
export const getLiveSummary = async (params?: {
  period_id?: number;
  employee_id?: number;
}): Promise<LiveSummaryResponse> => {
  try {
    const response = await api.get<LiveSummaryResponse>(
      "salary/live-summary/",
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching live summary:", error);
    throw error;
  }
};
