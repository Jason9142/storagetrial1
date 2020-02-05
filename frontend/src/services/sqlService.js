import http from "./httpService";

const apiEndPoint = `/sql`;

export async function getSql() {
  return await http.get(apiEndPoint);
}
