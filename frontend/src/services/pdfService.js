import http from "./httpService";

const apiEndpoint = `/pdf`;

function getUrl(pathParam) {
  return `${apiEndpoint}/${pathParam}/`;
}

export function getPdfForUser(id) {
  return http.get(getUrl(id), { responseType: "blob" });
}

export function getPdfForAdmin() {
  return http.get(apiEndpoint, { responseType: "blob" });
}

export function getPdfForArchivedUser(id) {
  return http.get(getUrl(`archive/${id}`), { responseType: "blob" });
}
