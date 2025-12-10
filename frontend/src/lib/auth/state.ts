export function getToken() {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem("groney_auth_token");
}

export function isLoggedIn() {
    return !!getToken();
}
