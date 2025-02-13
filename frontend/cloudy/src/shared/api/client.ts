import axios from "axios";
import {
  ApiErrorResponse,
  ApiRequestConfig,
  ApiResponse,
  ConditionalData,
  HttpMethod,
} from "./types";

const api = axios.create({
  baseURL: "http://k11a606.p.ssafy.io:8081",
  withCredentials: true,
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config: ApiRequestConfig) => {
    const token = localStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰을 가져옴
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const handleApiRequest = async <T, M extends HttpMethod, D = undefined>(
  url: string,
  method: M,
  data?: ConditionalData<M, D>,
  config?: ApiRequestConfig,
): Promise<T> => {
  try {
    const response = await api.request<ApiResponse<T>>({
      url,
      method,
      data,
      ...config,
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError: ApiErrorResponse = error.response.data;
      const apiErrorMessage = apiError.message
        ? apiError.message
        : error.message;
      console.error(
        "🚨 Error making API request to %c%s%c 🚨\n\n Error: %c%s%c",
        "color: black; background-color: yellow; font-weight: bold;",
        url,
        "",
        "color: white; background-color: red; font-weight: bold;",
        apiErrorMessage,
        "",
      );
      throw new Error(apiErrorMessage);
    }
    console.error("🚨 Unexpected error making API request 🚨\n", error);
    throw error;
  }
};

export default api;
