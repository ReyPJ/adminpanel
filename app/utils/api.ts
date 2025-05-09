import axios from "axios";
import { getPeriodResponse } from "@/app/interfaces/periodsInterfaces";
import { AllEmployeeStats } from "@/app/interfaces/Stats";
import {
  EmployeeInterface,
  ActiveEmployeeInterface,
} from "../interfaces/employeInterfa";

export const api = axios.create({
  baseURL: "http://localhost:8000/v1/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
// Commented for now for development purposes
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

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
