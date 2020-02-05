import http from "./httpService";

const apiEndpoint = `/usersArchive`;

function getUrl(pathParam) {
  return `${apiEndpoint}/${pathParam}/`;
}

function restoreUser(commodityId) {
  return http.delete(getUrl(commodityId));
}

function getUserArchive() {
  return http.get(apiEndpoint);
}

function getUserArchiveById(userId) {
  return http.get(getUrl(userId));
}

export default {
  restoreUser,
  getUserArchive,
  getUserArchiveById
};
