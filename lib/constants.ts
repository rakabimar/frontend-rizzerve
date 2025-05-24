// API URLs for each feature
export const API_URLS = {
  // Authentication
  AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8080",
  AUTH_LOGIN_API_URL: "/api/auth/login",
  AUTH_REGISTER_API_URL: "/api/auth/register",
  AUTH_PROFILE_API_URL: "/api/auth/profile",

  // Menu Service
  MENU_SERVICE_URL: process.env.NEXT_PUBLIC_MENU_SERVICE_URL || "http://localhost:8081",
  MENU_API_URL: "/menu",

  // Rating Service
  RATING_SERVICE_URL: process.env.NEXT_PUBLIC_RATING_SERVICE_URL || "http://localhost:8084",
  RATING_API_URL: "/api/ratings",

  // Table Service
  TABLE_SERVICE_URL: process.env.NEXT_PUBLIC_TABLE_SERVICE_URL || "http://localhost:8085",
  TABLE_API_URL: "/api/table",

  ORDER_SERVICE_URL: "/api/orders",
}

export const USER_ROLES = {
  ADMIN: "ROLE_ADMIN",
}

export enum MenuType {
  FOOD = "FOOD",
  DRINK = "DRINK",
}
