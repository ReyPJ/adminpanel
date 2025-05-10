import axios from "axios";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
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
} from "../interfaces/timersInterfaces";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: "http://localhost:8000/v1/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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

export const getActivePeriod = async (): Promise<getPeriodResponse> => {
  try {
    const response = await api.get<getPeriodResponse[]>("salary/period/");
    return response.data[0];
  } catch (error) {
    console.error("Error fetching active period:", error);
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

export const getTimers = async (): Promise<TimerInterface[]> => {
  try {
    const response = await api.get<TimerInterface[]>("timer/");
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
