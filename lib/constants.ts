// API URLs for each feature
export const API_URLS = {
  // Authentication
  AUTH_LOGIN_API_URL: "/api/auth/login",
  AUTH_REGISTER_API_URL: "/api/auth/register",
  AUTH_LOGOUT_API_URL: "/api/auth/logout",

  // Menu Management
  MENU_LIST_API_URL: "/api/menu",
  MENU_CREATE_API_URL: "/api/menu/create",
  MENU_UPDATE_API_URL: "/api/menu/update",
  MENU_DELETE_API_URL: "/api/menu/delete",

  // Table Management
  TABLE_LIST_API_URL: "/api/tables",
  TABLE_CREATE_API_URL: "/api/tables/create",
  TABLE_UPDATE_API_URL: "/api/tables/update",
  TABLE_DELETE_API_URL: "/api/tables/delete",

  // Order Management
  ORDER_CREATE_API_URL: "/api/orders/create",
  ORDER_LIST_API_URL: "/api/orders",
  ORDER_UPDATE_API_URL: "/api/orders/update",
}

export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
}
