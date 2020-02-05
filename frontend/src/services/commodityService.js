import http from "./httpService";

const apiEndpoint = `/commodities`;

function getUrl(pathParam) {
  return `${apiEndpoint}/${pathParam}/`;
}

export function getCommodity() {
  return http.get(apiEndpoint);
}

//get commodity by commodityID
function getCommodityById(commodityId) {
  return http.get(getUrl(commodityId));
}

function getCommodities() {
  return http.get(getUrl("viewAll"));
}

//get commodity by userID
function getCommodityByUserId(userId) {
  return http.get(getUrl(`getByOwner/${userId}`));
}

function saveCommodity(commodity, userId) {
  if (commodity._id) {
    const body = { ...commodity };
    delete body._id;
    return http.put(getUrl(commodity._id), body);
  }
  return http.post(`${apiEndpoint}/${userId}`, commodity);
}

function archiveCommodity(commodityId, archiveStatus) {
  return http.delete(getUrl(commodityId), { data: { archiveStatus } });
}

export default {
  getCommodity,
  getCommodityById,
  getCommodityByUserId,
  getCommodities,
  saveCommodity,
  archiveCommodity
};
