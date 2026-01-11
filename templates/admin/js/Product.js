const token = sessionStorage.getItem('access_token');

async function getAllProducts(page = 1) {
  const limit = 8;
  const offset = (page - 1) * limit;
  const res = await fetch(`http://127.0.0.1:8000/products?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  const dataProducts = document.querySelector('.data-products');

  let table = '';
  console.log(data);

  let no = offset + 1;
  const product_data = data.data;
  product_data.forEach((d) => {
    table += `<tr>
        <td>${no}</td>
        <td>${d.Product.name}</td>
        <td>${d.Product.stok} Ekor</td>
        <td>Rp ${d.Product.price.toLocaleString('id-ID')}</td>
        <td>${d.age} Hari</td>
        <td>${d.Product.status}</td>
        <td>
          <button class="btn-edit edit-ayam" value="${d.Product.id}">Edit</button>
          <button class="btn-delete hapus-ayam" value="${d.Product.id}">
          Hapus
          </button>
        </td>
        </tr>`;
    no += 1;
  });
  dataProducts.innerHTML = table;
  const btnEdit = document.querySelectorAll('.edit-ayam');
  btnEdit.forEach((btn) => {
    btn.addEventListener('click', function () {
      // document.location.href = 'admin-edit-ayam.html';
      getOneProduct(this.value);
    });
  });

  const btnDelete = document.querySelectorAll('.hapus-ayam');
  btnDelete.forEach((btn) => {
    btn.addEventListener('click', function () {
      ask = confirm('Yakin Mau Hapus?');
      if (ask) {
        deleteProduct(this.value);
        getAllProducts();
      }
    });
  });

  // PAGINATION
  const totalData = data.total;
  const totalPage = Math.ceil(totalData / 8);
  renderPagination(page, totalPage);
}

async function getOneProduct(id) {
  const res = await fetch(`http://127.0.0.1:8000/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  console.log(data);
  const mainContent = document.querySelector('.main-content');

  mainContent.innerHTML = `<h1>Edit Data Ayam</h1>

      <form action="" method="POST" class="form-card">
        <input type="hidden" name="id" value="${data.id}" />
        <div class="form-group">
          <label>Nama produk</label>
          <select name="jenis-ayam" id="${data.name}" value="${data.name}">
            <option value="${data.name}">${data.name}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Stok</label>
          <input type="number" name="stok" value="${data.stok}" id="stok"/>
        </div>

        <div class="form-group">
          <label>Harga (Rp)</label>
          <input type="number" name="harga" value="${data.price}" id="price"/>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select name="status-ayam" id="status">
            <option value="${data.status}">${data.status}</option>
            <option value="Siap Jual">Siap Jual</option>
          </select>
        </div>

        <div class="btn-flex">
          <button type="submit" class="btn-save btn-update" name="update" value="${data.id}">Update</button>
          <a href="product.html" class="btn-cancel">Batal</a>
        </div>
      </form>`;

  // INPUT ITEMS
  const stok = document.getElementById('stok');
  const price = document.getElementById('price');
  const status = document.getElementById('status');

  // TOMBOL UPDATE
  const btnUpdate = document.querySelector('.btn-update');
  btnUpdate.addEventListener('click', function (e) {
    e.preventDefault();
    updateProduct(this.value, stok, price, status);
  });
}

async function deleteProduct(id) {
  const res = await fetch(`http://127.0.0.1:8000/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function createProducts(name, stok, price) {
  const res = await fetch(`http://127.0.0.1:8000/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: name.value,
      stok: stok.value,
      price: price.value,
    }),
  });
  const data = await res.json();

  if (res.status == 422) {
    alert('Lengkapi Semua data');
  }

  if (res.ok) {
    alert(data['message']);
    document.location.href = 'product.html';
  }
}

async function updateProduct(id, stok, price, status) {
  const res = await fetch(`http://127.0.0.1:8000/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      stok: stok.value,
      price: price.value,
      status: status.value,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    alert(data['message']);
    document.location.href = 'product.html';
  }
}

// Main Content
const mainContent = document.querySelector('.main-content');

// Tombol Tambah Produk
btnAddProducts = document.querySelector('.btn-add');
btnAddProducts.addEventListener('click', function () {
  mainContent.innerHTML = `<h1>Tambah Data Ayam</h1>
    <form action=" " method="POST" class="form-card">
      <div class="form-group">
        <label>Jenis Ayam</label>
        <select name="jenis-ayam" id="jenis-ayam" required>
          <option value="" disabled selected>Pilih Jenis</option>
          <option value="Ayam Kampung">Ayam Kampung</option>
          <option value="Ayam Bangkok">Ayam Bangkok</option>
        </select>
      </div>

      <div class="form-group">
        <label>Stok</label>
        <input type="number" name="stok" id="stok" required />
      </div>

      <div class="form-group">
        <label>Harga (Rp)</label>
        <input type="number" name="price" id="price" required />
      </div>

      <div class="btn-flex">
        <button type="submit" class="btn-save" name="tambah">Tambah Data</button>
        <a href="product.html" class="btn-cancel">Batal</a>
      </div>
    </form>`;

  const name = document.getElementById('jenis-ayam');
  const stok = document.getElementById('stok');
  const price = document.getElementById('price');

  const btnSave = document.querySelector('.btn-save');
  btnSave.addEventListener('click', function (e) {
    e.preventDefault();
    createProducts(name, stok, price);
  });
});

function renderPagination(currentPage, totalPages) {
  const btnPageNumber = document.getElementById('pageNumbers');
  btnPageNumber.innerHTML = '';

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Atur Status Disabled
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  // Gunakan .onclick untuk menghindari penumpukan event listener
  prevBtn.onclick = () => {
    if (currentPage > 1) getAllProducts(currentPage - 1);
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) getAllProducts(currentPage + 1);
  };

  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    btnPageNumber.innerHTML += `<button class="page-num ${activeClass}" onclick="getAllProducts(${i})">${i}</button>`;
  }

  // Update info teks
  document.getElementById('total-pages-display').innerText = totalPages;
  document.getElementById('current-page-display').innerText = currentPage;
}