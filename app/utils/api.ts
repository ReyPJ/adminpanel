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
  AuthPostResponse,
  AuthPostRequest,
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
  responseCalculateSalaryInterface,
} from "../interfaces/salaryInterfaces";

export const api = axios.create({
  baseURL: "http://localhost:8000/v1/",
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

// If we pass is_active=true as a query parameter, we get the active period only
//if we pass period_id as a query parameter, we get the period with the given id
// Otherwise, we get all periods
export const getActivePeriod = async (): Promise<getPeriodResponse> => {
  try {
    const response = await api.get<getPeriodResponse[]>("salary/period/", {
      params: {
        is_active: true,
      },
    });
    return response.data[0];
  } catch (error) {
    console.error("Error fetching active period:", error);
    throw error;
  }
};

export const getPeriodById = async (
  periodId: number
): Promise<getPeriodResponse> => {
  try {
    const response = await api.get<getPeriodResponse[]>("salary/period/", {
      params: {
        period_id: periodId,
      },
    });
    return response.data[0];
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
    const response = await api.get("salary/night-hours-count/", {
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
): Promise<responseCalculateSalaryInterface> => {
  try {
    const response = await api.post("salary/calculate/", request);
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

export const getQRCode = async (employeeId: number): Promise<void> => {
  try {
    const response = await api.post(
      `employee/${employeeId}/make-qr-code/`,
      null,
      {
        responseType: "blob",
      }
    );
    const disposition = response.headers["content-disposition"];
    const findFullName = JSON.parse(
      localStorage.getItem("employees_list") || "[]"
    ).find((employee: EmployeeInterface) => employee.id === employeeId);
    let filename = `${findFullName.first_name}_${findFullName.last_name}_qr.png`;
    if (disposition && disposition.indexOf("filename=") !== -1) {
      const match = disposition.match(/filename="(.+)"/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      link.parentNode?.removeChild(link);
    }, 100);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error fetching QR code:", error);
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
