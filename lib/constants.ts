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

  // Coupon Service
  COUPON_SERVICE_URL: process.env.NEXT_PUBLIC_COUPON_SERVICE_URL || "http://localhost:8083",
  COUPON_API_URL: "/coupon",

  // Order Service 
  ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:8082",
  ORDER_API_URL: "/api/orders",
  CHECKOUT_API_URL: "/api/checkouts",
}

export const USER_ROLES = {
  ADMIN: "ROLE_ADMIN",
}

export enum MenuType {
  FOOD = "FOOD",
  DRINK = "DRINK",
}

export enum OrderStatus {
  NEW = "NEW",
  PROCESSING = "PROCESSING", 
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}
