const token = sessionStorage.getItem('access_token');

async function getCart() {
  const res = await fetch(`http://127.0.0.1:8000/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  const cardContainer = document.querySelector('.cart-container');

  const items = data.Carts;

  cardContainer.innerHTML = `<h1>Keranjang Belanja</h1>

        <div class="cart-list">
          <!-- ITEM -->
          ${items
            .map((item) => {
              return `<div class="cart-item" data-id="${item.id}">
                <img src="img/ayam1.jpg" alt="" />
                <div class="cart-details">
                  <h3 class="name">${item.name_product}</h3>
                  <p>Bobot ± 1 Kg</p>
                  <span class="price" data-price="${item.price}">Rp ${item.price.toLocaleString(
                'id-ID'
              )}</span>
                </div>
                <div class="qty-box">
                  <button value="" class="kurang">-</button>
                  <input type="text" value="${item.quantity}" class="jumlah-pesanan" readonly />
                  <button value="" class="tambah">+</button>
                </div>
                <button class="remove" value="${item.id}">Hapus</button>
              </div>
            </div>`;
            })
            .join('')}

        <!-- TOTAL -->
        <div class="cart-summary">
          <h3>Total: <span>Rp ${data.total_price.toLocaleString('id-ID')}</span></h3>
          <div class="cart-button">
            <button href="payment.php" class="btn-update">Update Keranjang</button>
            <button href="payment.php" class="btn-checkout">Checkout</button>
          </div>
        </div>`;

  const btnTambah = document.querySelectorAll('.tambah');
  btnTambah.forEach((b) => {
    const jumlahPesanan = b.previousElementSibling;
    b.addEventListener('click', function () {
      // Read the current value each click so it's real-time
      let angka = parseInt(jumlahPesanan.value, 10);
      if (isNaN(angka)) angka = 0;
      angka += 1;
      jumlahPesanan.value = angka;
      // Emit input event in case other code listens for changes
      jumlahPesanan.dispatchEvent(new Event('input'));
    });
  });

  const btnKurang = document.querySelectorAll('.kurang');
  btnKurang.forEach((b) => {
    const jumlahPesanan = b.nextElementSibling;
    b.addEventListener('click', function () {
      // Read the current value each click so it's real-time
      let angka = parseInt(jumlahPesanan.value, 10);
      if (isNaN(angka) || angka <= 1) {
        angka = 1;
      } else {
        angka -= 1;
      }
      jumlahPesanan.value = angka;
      // Emit input event in case other code listens for changes
      jumlahPesanan.dispatchEvent(new Event('input'));
    });
  });

  // UPDATE KERANJANG
  const btnUpdate = document.querySelector('.btn-update');
  const cartItems = document.querySelectorAll('.cart-item');

  btnUpdate.addEventListener('click', function (e) {
    e.preventDefault();

    let items = [];

    cartItems.forEach((cart) => {
      const quantity = cart.querySelector('.jumlah-pesanan').value;
      const price = cart.querySelector('.price').dataset.price;
      const id = cart.dataset.id;

      items.push({ id: id, price: price, quantity: quantity });
    });

    updateCart(items);
  });

  // Tombol Hapus
  cartItems.forEach((cart) => {
    const btnHapus = cart.querySelector('.remove');

    btnHapus.addEventListener('click', function (e) {
      e.preventDefault();

      id = this.value;

      deleteCart(id);
    });
  });

  // Checkout
  const btnCheckout = document.querySelector('.btn-checkout');
  btnCheckout.addEventListener('click', function (e) {
    e.preventDefault();

    let items = [];

    cartItems.forEach((cart) => {
      const nameProduct = cart.querySelector('.name').textContent.trim();
      const quantity = cart.querySelector('.jumlah-pesanan').value;

      items.push({ product_name: nameProduct, quantity: quantity });
    });

    checkout(items);
  });
}

async function updateCart(items) {
  const res = await fetch(`http://127.0.0.1:8000/cart`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(items),
  });

  if (res.ok) {
    document.location.href = '../user/cart.html';
  }
}

async function deleteCart(id) {
  const res = await fetch(`http://127.0.0.1:8000/cart/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.ok) {
    document.location.href = '../user/cart.html';
  }
}

async function checkout(items) {
  const res = await fetch(`http://127.0.0.1:8000/order/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(items),
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data);
  }

  if (res.ok) {
    alert(data['message']);
    document.location.href = '../user/order.html';
  }
}
