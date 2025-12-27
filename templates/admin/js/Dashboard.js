const token = sessionStorage.getItem('access_token');

async function getInfoDashboard() {
  const res = await fetch('http://127.0.0.1:8000/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();

  const mainContent = document.querySelector('.main-content');

  mainContent.innerHTML = `<h1>Dashboard</h1>
      <p class="welcome">Selamat datang Admin</p>

      <div class="card-container">
        <div class="card">
          <h2>Total Ayam</h2>
          <p class="value">${data.products_stok_count} Ekor</p>
        </div>

        <div class="card">
          <h2>Total Pesanan</h2>
          <p class="value">${data.orders_count} Pesanan</p>
        </div>
      </div>`;
}

window.onload = getInfoDashboard();
