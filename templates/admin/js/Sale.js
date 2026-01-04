const token = sessionStorage.getItem('access_token');

async function getAllOrder() {
  const res = await fetch('http://127.0.0.1:8000/sales', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  const tableBody = document.querySelector('.table-body');

  let table = '';
  let no = 1;

  data.forEach((d) => {
    table += `<tr>
            <td>${no}</td>
            <td>${d.owner.name}</td>
            <td>${new Date(d.created_at).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</td>
            <td>Rp ${d.total_price.toLocaleString('id-ID')}</td>
            <td><span class="badge waiting">${d.status}</span></td>
            <td><span class="badge pending">${d.payment_status}</span></td>
            <td>
              <button class="btn-detail" value="${d.id}">Detail</button>
            </td>
          </tr>`;
    no++;
  });

  tableBody.innerHTML = table;

  // TOMBOL DETAIL
  const btnDetail = document.querySelectorAll('.btn-detail');
  btnDetail.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      get_detail_order(this.value);
    });
  });
}

async function get_detail_order(id) {
  const res = await fetch(`http://127.0.0.1:8000/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  const mainContent = document.querySelector('.main-content');
  items = data.items;
  mainContent.innerHTML = `<h1>Detail Pesanan</h1>

        <div class="detail-card">
            <h2>Informasi Pembeli</h2>
            <p><strong>Nama: ${data.owner.name}</p>
            <p><strong>Alamat: ${data.owner.address}</p>

            <h2 class="mt-20">Detail Produk</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Jumlah</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                ${items
                  .map((item) => {
                    return `<tr>
                      <td>${item.product.name}</td>
                      <td>${item.quantity} Ekor</td>
                      <td>Rp ${item.product.price.toLocaleString('id-ID')}</td>
                      <td>Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                  </tr>`;
                  })
                  .join('')}
                </tbody>
            </table>

            <div class="btn-flex mt-20">
                <a href="sale.html" class="btn-cancel">Kembali</a>
            </div>
        </div>`;
}
