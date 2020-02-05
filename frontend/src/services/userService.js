import http from "./httpService";

const apiEndpoint = `/users`;

function userUrl(pathParam) {
  return `${apiEndpoint}/${pathParam}/`;
}

function getUser() {
  return http.get(apiEndpoint);
}

function getUserById(userId) {
  return http.get(userUrl(userId));
}

export function getUsers() {
  return http.get(userUrl("viewAll"));
}

// function register(user) {
//   return http.post(apiEndpoint, {
//     email: user.username,
//     name: user.name,
//     password: user.password
//   });
// }

function saveUser(user, id) {
  if (id) {
    const body = { ...user };
    // delete body._id;
    return http.put(userUrl(id), user);
  }
  return http.post(apiEndpoint, user);
}

function archiveUser(user) {
  return http.delete(userUrl(user._id));
}

function forgetPassword(req) {
  return http.post(userUrl("forgetPassword"), req);
}

function authenticateToken(req) {
  return http.get(userUrl(`resetPassword/${req.token}`));
}

function resetPassword(token, data) {
  return http.post(userUrl(`resetPassword/${token}`), data);
}

function updatePassword(userId, body) {
  return http.put(userUrl(`updatePassword/${userId}`), body);
}

function approve(userId) {
  return http.get(userUrl(`approval/${userId}`));
}

function reject(userId) {
  return http.get(userUrl(`reject/${userId}`));
}

export default {
  // register,
  getUser,
  getUsers,
  getUserById,
  saveUser,
  forgetPassword,
  authenticateToken,
  resetPassword,
  updatePassword,
  approve,
  reject,
  archiveUser
};
