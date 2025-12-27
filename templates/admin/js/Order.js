const token = sessionStorage.getItem('access_token');

async function getAllOrder() {
  const res = await fetch('http://127.0.0.1:8000/order', {
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
              <button class="btn-detail-payment badge success" value="${
                d.id
              }">Payment Check</button>
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

  // TOMBOL PAYMENT CHECK
  const btnPayment = document.querySelectorAll('.btn-detail-payment');
  btnPayment.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const id = this.value;

      paymentCheck(id);
    });
  });
}

async function paymentCheck(id) {
  const res = await fetch(`http://127.0.0.1:8000/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  const mainContent = document.querySelector('.main-content');

  mainContent.innerHTML = `<div class="header-flex">
    <h1>Konfirmasi Pembayaran</h1>
    <a href="../admin/order.html" class="btn-cancel">Kembali</a>
</div>

<div class="form-card">
    <h3>Informasi Pembayaran</h3>
    
    ${
      data.payment_method != null
        ? `<div class="detail-info mt-20">
        <div class="form-group">
            <label>Metode Pembayaran</label>
            <input type="text" value="${data.payment_method}" readonly style="background: #f3f4f6;">
        </div>`
        : `<div class="detail-info mt-20">
        <div class="form-group">
            <label>Metode Pembayaran</label>
            <input type="text" value="Belum Bayar" readonly style="background: #f3f4f6;">
        </div>`
    }    

        ${
          data.payment_method === 'Transfer'
            ? `
            <div class="form-group">
                <label>Bukti Transfer</label>
                <div class="proof-container">
                    ${
                      data.payment_proof
                        ? `<img src="../../../${data.payment_proof}" alt="Bukti Transfer" class="preview-img-payment" onclick="window.open(this.src)">
                         <p class="note">* Klik gambar untuk memperbesar</p>`
                        : `<p style="color: #dc2626; font-style: italic;">User belum mengunggah bukti transfer.</p>`
                    }
                </div>
            </div>
        `
            : `
            <div class="form-group">
                <label>Info COD</label>
                <p class="note">Pembayaran dilakukan secara tunai saat barang diterima.</p>
            </div>
        `
        }

        <div class="form-group">
            <label>Status Pembayaran</label>
            <select id="update_payment_status">
                <option value="${data.payment_status}">${data.payment_status}</option>
                ${
                  data.payment_method === 'Transfer'
                    ? `<option value="Bukti Tidak Valid">Bukti Tidak Valid</option>`
                    : ``
                }
                <option value="Lunas">Lunas</option>
            </select>
        </div>

        <div class="btn-flex">
            <button class="btn-save" id="save-payment" value="${
              data.id
            }">Update Status Pembayaran</button>
        </div>
    </div>
</div>`;

  const btnUpdate = document.getElementById('save-payment');
  btnUpdate.addEventListener('click', function (e) {
    e.preventDefault();

    const id = this.value;
    const newStatus = document.getElementById('update_payment_status').value;

    updatePaymentStatus(id, newStatus);
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

            <br>
            <label>Status Pesanan</label>
                <select name="status_pesanan" id="status-pesanan" required>
                    <option value="${data.status}"> ${data.status}</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Dikemas">Dikemas</option>
                    <option value="Dikirim">Dikirim</option>
                    <option value="Selesai">Selesai</option>
                </select>

                <div class="btn-flex" style="margin-top: 15px;">
                    <button type="submit" class="btn-save status" value="${
                      data.id
                    }" name="update">Update</button>
                </div>

            <div class="btn-flex mt-20">
                <a href="order.html" class="btn-cancel">Kembali</a>
            </div>
        </div>`;

  // TOMBOL UPDATE
  const status = document.getElementById('status-pesanan');
  const btnUpdate = document.querySelector('.status');
  btnUpdate.addEventListener('click', function (e) {
    e.preventDefault();

    // console.log(status.value);
    updateStatusOrder(this.value, status);
  });
}

async function updateStatusOrder(id, status) {
  const newStatus = status.value;
  const res = await fetch(`http://127.0.0.1:8000/order/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: newStatus,
    }),
  });
  const data = await res.json();

  if (res.ok) {
    alert(data['message']);
    document.location.href = 'order.html';
  }
}

async function updatePaymentStatus(id, newStatus) {
  const res = await fetch(`http://127.0.0.1:8000/order/payment/status/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      payment_status: newStatus,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    alert(data['message']);
    document.location.href = '../admin/order.html';
  }
}
