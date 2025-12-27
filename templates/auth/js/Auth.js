async function register(name, address, email, password) {
  const res = await fetch('http://127.0.0.1:8000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.value,
      address: address.value,
      email: email.value,
      password: password.value,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    alert(data['message']);
  }
  if (res.status == 422) {
    alert(data['detail'][0].msg);
  }
}

async function login(username, password) {
  const res = await fetch(`http://127.0.0.1:8000/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: username.value,
      password: password.value,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data['detail']);
  }

  token = await parseJwt(data.access_token);

  sessionStorage.setItem('access_token', data.access_token);

  if (res.ok) {
    if (token.role == 'user') {
      sessionStorage.setItem('role', token.role);
      window.location.href = '../../../templates/user/dashboard.html';
    }
    if (token.role == 'admin') {
      sessionStorage.setItem('role', token.role);
      window.location.href = '../../templates/admin/dashboard.html';
    }
  }
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// function isTokenExpired(token) {
//   const payload = parseJwt(token);
//   const now = Math.floor(Date.now() / 1000);
//   return payload.exp < now;
// }

// (function authGuard() {
//   const token = localStorage.getItem('access_token');
//   if (!token || isTokenExpired(token)) {
//     localStorage.removeItem('access_token');
//     location.href = '/login.html';
//   }
// })();

// Items Input
const email = document.getElementById('email');
const password = document.getElementById('password');

// Tombol Login
const btnLogin = document.getElementById('btn-login');
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  login(email, password);
});

// Sign UP
const signup = document.querySelector('.signup');
const form = document.querySelector('.form');
signup.addEventListener('click', function () {
  form.innerHTML = `<h2>Sign Up</h2>
        <div class="inputBox">
          <input type="text" placeholder="Nama" name="nama" id="name" autocomplete="off" required />
        </div>
        <div class="inputBox">
          <input type="text" placeholder="Alamat" name="alamat" id="address" required />
        </div>
        <div class="inputBox">
          <input type="text" placeholder="Email" name="email" id="email" required />
        </div>
        <div class="inputBox">
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            autocomplete="off"
            required
          />
        </div>
        <div class="inputBox">
          <input type="submit" name="register" value="Register" id="btn-regist" />
        </div>
        <div class="group">
          <a href="auth.html">Sign in</a>
        </div>`;

  const name = document.getElementById('name');
  const address = document.getElementById('address');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  // Tombol Regist
  const btnRegist = document.getElementById('btn-regist');
  btnRegist.addEventListener('click', function (e) {
    e.preventDefault();
    register(name, address, email, password);
  });
});
