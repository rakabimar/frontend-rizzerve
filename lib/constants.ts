// API URLs for each feature
export const API_URLS = {
  // Authentication
  AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8080",
  AUTH_LOGIN_API_URL: "/api/auth/login",
  AUTH_REGISTER_API_URL: "/api/auth/register",
  AUTH_PROFILE_API_URL: "/api/auth/profile",

  // Other service paths (these will be appended to AUTH_SERVICE_URL)
  MENU_SERVICE_URL: "/api/menu",
  TABLE_SERVICE_URL: "/api/tables",
  ORDER_SERVICE_URL: "/api/orders",
}

export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
}
