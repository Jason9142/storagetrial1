import http from "./httpService";

const apiEndpoint = `/excel`;

// function getUrl(pathParam) {
//   return `${apiEndpoint}/${pathParam}/`;
// }

export function transferExcelToDatabase(req) {
  return http.post(apiEndpoint, req);
}

export function downloadExcel(path) {
  return http.get(`/${path}`, {
    responseType: "blob"
  });
}

export function getExcels() {
  return http.get(`${apiEndpoint}`);
}
