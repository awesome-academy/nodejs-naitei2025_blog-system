// Định nghĩa kiểu dữ liệu trả về từ Server
// T là kiểu dữ liệu của 'data' (ví dụ: User, Product...)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

type CustomOptions = RequestInit & {
  baseURL?: string | undefined;
};

// 1. SỬA: HttpError thông minh hơn
export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    error?: any;
    success: boolean;
  };

  constructor({ status, payload }: { status: number; payload: ApiResponse }) {
    // Gọi super với message từ server để khi log lỗi sẽ thấy ngay nguyên nhân
    super(payload.message || "Http Error"); 
    this.status = status;
    this.payload = payload;
  }
}

// 2. SỬA: Thêm Generic <T> để định kiểu kết quả trả về
const request = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options?: CustomOptions | undefined
) => {
  const body = options?.body;
  const baseHeaders = {
    "Content-Type": "application/json",
  };

  const baseUrl =
    options?.baseURL === undefined
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : options?.baseURL;

  // Xử lý path slash an toàn hơn
  const fullUrl = url.startsWith("/") 
    ? `${baseUrl}${url}` 
    : `${baseUrl}/${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload: ApiResponse<T>;

  try {
    payload = await response.json();
  } catch (error) {
    // Fallback nếu server lỗi 500 trả về HTML hoặc không phải JSON chuẩn
    payload = {
      success: false,
      message: response.statusText || "Lỗi không xác định từ server",
      error: error,
    };
  }

  // 3. Xử lý lỗi dựa trên status code HOẶC flag success (tùy backend của bạn)
  if (!response.ok) {
    throw new HttpError({
      status: response.status,
      payload: payload,
    });
  }

  // (Tuỳ chọn) Nếu backend trả về 200 OK nhưng success: false
  // thì mở comment đoạn dưới đây:
  /*
  if (payload.success === false) {
     throw new HttpError({
      status: response.status, // Vẫn là 200 nhưng logic là lỗi
      payload: payload,
    });
  }
  */

  return payload; // Trả về full object { success, message, data }
};

const http = {
  // Thêm Generic <ResponseData> để khi dùng có thể define kiểu
  get<ResponseData>(url: string, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<ResponseData>("GET", url, options);
  },
  post<ResponseData>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<ResponseData>("POST", url, { ...options, body });
  },
  put<ResponseData>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<ResponseData>("PUT", url, { ...options, body });
  },
  delete<ResponseData>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<ResponseData>("DELETE", url, { ...options, body });
  },
};

export default http;