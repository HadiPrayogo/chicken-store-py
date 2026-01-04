const a = document.querySelectorAll('.nav');
a.forEach((element) => {
  element.addEventListener('click', function () {
    alert('Login Untuk Berinteraksi');
  });
});

const btnProduct = document.querySelector('.produk');
btnProduct.addEventListener('click', function () {
  const homeContainer = document.querySelector('.home-container');
  homeContainer.className = 'container';
  homeContainer.innerHTML = `
  <h1 style="text-align: center;">Daftar Produk Ayam</h1>

    <div class="product-grid">
      <!-- CARD 1 -->
        <div class="product-card">
          <img src="templates/user/img/ayam-kampung.png" style="height: 400px" alt="ayam kampung" />
          <h3>Ayam Kampung</h3>
          <p>Ayam organik berkualitas, bobot ± 1 kg</p>
          <p>Jumlah : </p><input type="number" class="jumlah">
          <div class="price-btn">
            <span class="price">Rp 45.000</span>
            <button class="btn-add produk">Tambah</a>
          </div>
        </div>
      <?php endif; ?>

        <!-- CARD 2 -->
        <div class="product-card">
          <img src="templates/user/img/ayam-bangkok.webp" style="height: 400px" alt="ayam bangkok" />
          <h3>Ayam Bangkok</h3>
          <p>Siap Tarung</p>
          <p>Jumlah : </p><input type="number" class="jumlah">
          <div class="price-btn">
            <span class="price">Rp 300.000</span>
            <button class="btn-add produk">Tambah</a>
          </div>
        </div>
      <?php endif; ?>
    </div>`;

  const btnTambah = document.querySelectorAll('.btn-add');
  btnTambah.forEach((btn) => {
    btn.addEventListener('click', function () {
      alert('Login Untuk Berinteraksi');
    });
  });
});
