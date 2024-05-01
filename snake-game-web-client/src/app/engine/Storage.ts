export const Storage = {
  setInstanceId: (data: string) => {
    return localStorage.setItem("instanceId", data);
  },
  getInstanceId: (): string => {
    if (
      localStorage.getItem("instanceId") &&
      localStorage.getItem("instanceId") != "null"
    )
      return localStorage.getItem("instanceId");
    return "";
  },
};
