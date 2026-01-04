const token = sessionStorage.getItem('access_token');

async function getOrder() {
  const res = await fetch(`http://127.0.0.1:8000/order/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  const orderList = document.querySelector('.order-list');
  let order = '';

  data.forEach((d) => {
    const items = d.items;
    order += `<div class="order-card">
    <div class="order-details">
        <div class="order-header" style="display: flex; gap: 10px; margin-bottom: 10px;">
            <span class="order-status ${d.status.toLowerCase()}">${d.status}</span>
            
            <span class="payment-tag ${d.payment_status === 'Lunas' ? 'lunas' : 'pending'}">
                ${d.payment_status}
            </span>
        </div>

        <p><strong>Tanggal: </strong>${new Date(d.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>

        <p><strong>Alamat Penerima: </strong>${d.owner.address}</p>

        <p><strong>Metode Pembayaran:</strong> 
            <span class="pay-method">${d.payment_method || 'Belum dipilih'}</span>
        </p>

        <p><strong>Produk:</strong>
            <ul style="margin-left: 20px; font-size: 0.9rem; color: #555;">
                ${items
                  .map(
                    (item) => `
                    <li class="items" data-status="${d.status}"><span class="name-product">${item.product.name}</span> <strong>(<span class="quantity">${item.quantity}</span> Ekor)</strong></li>
                `
                  )
                  .join('')}
            </ul>
        </p>

        <p style="margin-top: 10px;"><strong>Total Tagihan:</strong> 
            <span class="price">Rp ${d.total_price.toLocaleString('id-ID')}</span>
        </p>
    </div>

    <div class="order-actions">
        ${
          d.status === 'Selesai'
            ? '<button class="btn-hapus">Hapus</button>'
            : `<button class="btn-cancel" value="${d.id}">Batalkan</button>`
        }

        ${
          d.payment_status === 'Bukti Tidak Valid'
            ? `<button class="btn-detail btnbayar" value="${d.id}">Bayar</button>`
            : ''
        }

        ${
          d.payment_method === null
            ? `<button class="btn-detail btnbayar" value="${d.id}">Bayar</button>`
            : ''
        }
    </div>
</div>`;
  });

  orderList.innerHTML = order;

  const orderContainer = document.querySelectorAll('.order-card');
  orderContainer.forEach((card) => {
    const list = card.querySelectorAll('.items');
    const btnCancel = card.querySelector('.btn-cancel');
    if (btnCancel != null) {
      btnCancel.addEventListener('click', function (e) {
        e.preventDefault();

        let items = [];
        const id = this.value;

        list.forEach((item) => {
          const nameProduct = item.querySelector('.name-product').textContent.trim();
          const quantity = item.querySelector('.quantity').textContent.trim();

          items.push({ product_name: nameProduct, quantity: quantity });
        });

        console.log(items);

        ask = confirm('Yakin?');
        if (ask) {
          cancelOrder(id, items);
        }
      });
    }

    // TOMBOL HAPUS
    const btnHapus = card.querySelector('.btn-hapus');
    if (btnHapus != null) {
      btnHapus.addEventListener('click', function (e) {
        e.preventDefault();

        card.style.display = 'none';
      });
    }
  });

  // TOMBOL BAYAR
  const btnBayar = document.querySelectorAll('.btnbayar');
  btnBayar.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const id = this.value;

      getOneOrder(id);
    });
  });
}

async function cancelOrder(id, items) {
  const res = await fetch(`http://127.0.0.1:8000/order/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(items),
  });

  if (res.ok) {
    getOrder();
  }
}

async function getOneOrder(id) {
  const res = await fetch(`http://127.0.0.1:8000/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  const container = document.querySelector('.container');

  const items = data.items;

  container.innerHTML = `<h1>Pembayaran</h1>

      <div class="checkout-content">
        <!-- FORM -->
        <div class="checkout-form">
          <h2>Data Pengiriman</h2>
          <form class="payment">
            <label>Nama Penerima</label>
            <input type="text" value="${data.owner.name}" readonly />

            <label>Alamat Lengkap</label>
            <textarea rows="4" id="address">${data.owner.address}</textarea>

            <label>Metode Pembayaran</label>
            <select name="metode-pembayaran" id="metode-pembayaran" required>
            <option value="COD">COD</option>
            <option value="Transfer">Transfer</option>
            </select>

            <div id="upload-container" style="display: none; margin-top: 15px;">
              <div id="bank-info" style="background: #fff5f5; border: 1px solid #8f2c24; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <p style="font-weight: bold; color: #8f2c24; margin-bottom: 10px;">Informasi Pembayaran:</p>
                  <div style="display: flex; align-items: center; gap: 15px;">
                      <div style="background: #fff; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                          <strong style="font-size: 1.2rem;">BANK BRI</strong>
                      </div>
                      <div>
                          <p style="margin: 0; font-size: 0.9rem;">Nomor Rekening:</p>
                          <p style="margin: 0; font-size: 1.1rem; font-weight: bold; letter-spacing: 1px;">0021-01-123456-50-2</p>
                          <p style="margin: 0; font-size: 0.9rem;">a.n. <strong>Kelompok PPL</strong></p>
                      </div>
                  </div>
                  <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">* Pastikan nominal transfer sesuai dengan total tagihan.</p>
              </div>
              <label for="transfer_method">Unggah Bukti Transfer</label>
              <input type="file" id="transfer_method" name="payment_proof">
              <p class="note" style="font-size: 12px; color: #666;">* Format: JPG, PNG (Maks. 2MB)</p>
            </div>

            <label>Status</label>
            <input type="text" value="${data.payment_status}" readonly />

            <button type="submit" class="btn-bayar" value="${data.id}">Bayar Sekarang</button>
          </form>
          <button class="btn-batal">Batal</button>
        </div>

        <!-- RINGKASAN -->
        <div class="checkout-summary">
          <h2>Ringkasan Pesanan</h2>

          ${items
            .map((item) => {
              return ` <div class="summary-item">
            <p>${item.product.name} (${item.quantity} Ekor)</p>
            <span>Rp ${item.subtotal.toLocaleString('id-ID')}</span>
            </div>`;
            })
            .join('')}

          <hr />

          <div class="summary-item total">
            <p>Total Pembayaran</p>
            <span>Rp ${data.total_price.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>`;

  const metodePembayaran = document.getElementById('metode-pembayaran');
  const containerUpload = document.getElementById('upload-container');
  metodePembayaran.addEventListener('change', function () {
    if (this.value == 'Transfer') {
      containerUpload.style.display = 'block';
      const fileInput = document.getElementById('transfer_method');
      fileInput.setAttribute('required', '');
    }
  });

  const btnBatal = document.querySelector('.btn-batal');
  btnBatal.addEventListener('click', () => {
    getOrder();
  });

  const btnBayar = document.querySelector('.btn-bayar');
  const formPayment = document.querySelector('.payment'); // Ambil formnya

  formPayment.addEventListener('submit', function (e) {
    e.preventDefault(); // Mencegah reload halaman

    const id = btnBayar.value;
    const addressValue = document.getElementById('address').value;
    const metodeValue = document.getElementById('metode-pembayaran').value;
    if (containerUpload.style.display == 'block') {
      const fileInput = document.getElementById('transfer_method');
      fileInput.setAttribute('required', '');

      // Ambil file aslinya (Objek Blob/File)
      const fileAyam = fileInput.files[0];
      payment(id, addressValue, metodeValue, fileAyam);
    }

    payment(id, addressValue, metodeValue, (payment_proof = null));
  });
}

async function payment(id, address, payment_method, payment_proof) {
  // 1. Gunakan FormData untuk membungkus File dan Teks
  const formData = new FormData();
  formData.append('address', address);
  formData.append('payment_method', payment_method);

  // Hanya masukkan file jika metodenya transfer dan file ada
  if (payment_method === 'Transfer' && payment_proof) {
    formData.append('file', payment_proof);
  }

  const res = await fetch(`http://127.0.0.1:8000/order/payment/${id}`, {
    method: 'PUT',
    headers: {
      // PENTING: Jangan tulis Content-Type di sini jika pakai FormData
      Authorization: `Bearer ${token}`,
    },
    body: formData, // Kirim objek FormData
  });

  const data = await res.json();

  if (res.ok) {
    alert('Pembayaran berhasil dikirim!');
    document.location.href = '../user/order.html';
  } else {
    alert('Gagal: ' + (data.detail || 'Terjadi kesalahan'));
  }
}
