const token = sessionStorage.getItem('access_token');

async function getProducts() {
  const res = await fetch(`http://127.0.0.1:8000/products/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  const mainContent = document.querySelector('.product-grid');
  mainContent.innerHTML = `<!-- CARD 1 -->
        <div class="product-card">
          <img src="img/ayam-kampung.png" style="height: 400px" alt="${data.products[0].name}" />
          <h3 class="name">${data.products[0].name}</h3>
          ${
            data.products[0].name === 'Ayam Kampung'
              ? `<p>Ayam organik berkualitas, bobot ± 1 kg</p>`
              : `<p>Siap Tarung</p>`
          }
          <p>Stok :
            <span class="stok">${data.products[0].total_stok}</span>
          </p>
          <p>Jumlah : </p><input type="number" class="jumlah">
          <div class="price-btn">
            <span class="price">Rp ${data.products[0].price.toLocaleString('id-ID')}</span>
            <button class="btn-add produk" data-product="${data.products[0].name}" data-price="${
    data.products[0].price
  }" value="${data.owner}">Tambah</a>
          </div>
        </div>

        <!-- CARD 2 -->
        <div class="product-card">
          <img src="img/ayam-bangkok.webp" style="height: 400px" alt="${data.products[1].name}" />
          <h3 class="name">${data.products[1].name}</h3>
          ${
            data.products[1].name === 'Ayam Bangkok'
              ? `<p>Siap Tarung</p>`
              : `<p>Ayam organik berkualitas, bobot ± 1 kg</p>`
          }
          <p>Stok :
            <span class="stok">${data.products[1].total_stok}</span>
          </p>
          <p>Jumlah : </p><input type="number" class="jumlah">
          <div class="price-btn">
            <span class="price">Rp ${data.products[1].price.toLocaleString('id-ID')}</span>
            <button class="btn-add produk" data-product="${data.products[1].name}" data-price="${
    data.products[1].price
  }">Tambah</a>
          </div>
        </div>`;

  const productCard = document.querySelectorAll('.product-card');
  productCard.forEach((card) => {
    const btnAdd = card.querySelector('.btn-add');
    btnAdd.addEventListener('click', function (e) {
      e.preventDefault();

      const name = this.dataset.product;
      const price = this.dataset.price;
      const quantity = card.querySelector('.jumlah').value;

      addToCart(name, price, quantity);
    });
  });
}

async function addToCart(name, price, quantity) {
  const res = await fetch(`http://127.0.0.1:8000/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name_product: name,
      price: price,
      quantity: quantity,
    }),
  });

  if (res.status == 422) {
    alert('Lengkapi semua data');
  }

  const data = await res.json();

  if (res.ok) {
    alert(data['message']);
  }
}
