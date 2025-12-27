function logout() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('role');
  document.location.href = '../auth/auth.html';
}

// Logout
const btnLogout = document.querySelector('.logout');
if (btnLogout) {
  btnLogout.addEventListener('click', function (e) {
    e.preventDefault();

    logout();
  });
}

const cart = document.querySelector('.cart');
cart.addEventListener('click', function () {
  document.location.href = '../user/cart.html';
});
