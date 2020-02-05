import http from "./httpService";

const apiEndpoint = `/img`;

function getUrl(pathParam) {
  return `${apiEndpoint}/${pathParam}/`;
}

function uploadImage(req) {
  return http.post(apiEndpoint, req);
}

function updateImage(req) {
  return http.put(apiEndpoint, req);
}

function getImage(path) {
  return http.get(`/${path}`, {
    responseType: "blob"
  });
}

export default {
  getImage,
  updateImage,
  uploadImage
};
