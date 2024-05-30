export const dynamoDBConfig = {
  tables: {
    users: "User-api-users",
  },
};

export const API_PATH = {
  USER: "/user",
  USER_ID: (id: string) => `/user/${id}`,
  USERS: "/users",
};
