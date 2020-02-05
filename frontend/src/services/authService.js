import jwtDecode from "jwt-decode";
import http from "./httpService";
import cookie from "react-cookies";

const apiEndPoint = `/auth`;
const tokenKey = "token";

http.setJwt(getJwt());

async function login(email, password) {
  return await http.post(apiEndPoint, { email, password });
}

async function verify2fa(token) {
  const { data: jwt } = await http.get(`${apiEndPoint}/${token}`);
  return cookie.save(tokenKey, jwt, { path: "/" });
}

function logout() {
  cookie.remove(tokenKey, { path: "/" });
  cookie.remove("navBar", { path: "/" });
}

function getCurrentUser() {
  try {
    const jwt = cookie.load(tokenKey);
    return jwtDecode(jwt);
  } catch (error) {
    return undefined;
  }
}

function getJwt() {
  return cookie.load(tokenKey);
}

export default {
  login,
  verify2fa,
  logout,
  getCurrentUser,
  getJwt
};
