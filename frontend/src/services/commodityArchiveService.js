import http from "./httpService";

const apiEndpoint = `/commoditiesArchive`;

function getUrl(pathParam) {
  return `${apiEndpoint}/${pathParam}/`;
}

function restoreCommodity(commodityId) {
  return http.delete(getUrl(commodityId));
}

function getCommodityArchive() {
  return http.get(apiEndpoint);
}

function getCommodityArchiveByOwner() {
  return http.get(getUrl("owner"));
}

function getCommodityArchiveById(commodityId) {
  return http.get(getUrl(commodityId));
}

function getCommodityArchiveByOwnerId(ownerId) {
  return http.get(getUrl(`owner/${ownerId}`));
}

export default {
  restoreCommodity,
  getCommodityArchive,
  getCommodityArchiveById,
  getCommodityArchiveByOwner,
  getCommodityArchiveByOwnerId
};
