const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTPtt5U3y0VP-Fxg6yIw5MfBkEocQcZd-SWRq-s3x2mvtrlqHNwDkjpE9KWJq9hXjBCRIW5wdMUsh3g/pub?gid=0&single=true&output=tsv';

fetch(SHEET_URL)
  .then(response => response.text())
  .then(data => {
    const rows = data.trim().split('\n').map(row => row.split('\t'));
  
    const products = rows.slice(1).map(columns => ({
      name: columns[0],
      price: columns[1],
      detail: columns[2],
      url: columns[3],
      images: columns[4].split(',').map(img => img.trim()),
      id: columns[5],
      subCategory: columns[6],
      mainCategory: columns[7],
      rank: columns[8].trim().toLowerCase() === 'true'
    }));

// Populate collection list
const collectionList = document.getElementById('collection-list');
if (collectionList) {
  const categories = [...new Set(products.map(product => product.mainCategory))].slice(0, 3);
  categories.forEach(category => {
    const categoryProducts = products.filter(product => product.mainCategory === category);
    const randomProduct = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
    if (randomProduct && randomProduct.images[0]) {
      const collectionItem = document.createElement('li');
      collectionItem.innerHTML = `
        <div class="collection-card" style="background-image: url('${randomProduct.images[0]}')">
          <h3 class="h4 card-title">${category}</h3>
          <a href="category.html?category=${category}" target="_blank" class="btn btn-secondary">
            <span>Explore All</span>
            <ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon>
          </a>
        </div>
      `;
      collectionList.appendChild(collectionItem);
    }
  });
}

    // Populate product list
    const productList = document.getElementById('product-list');
    if (productList) {
      products.forEach(product => {
        if (product.name && product.price && product.images[0]) {
          const productItem = createProductItem(product);
          productList.appendChild(productItem);
        }
      });
    }

    // Function to create product item
    function createProductItem(product) {
      const productItem = document.createElement('li');
      productItem.classList.add('product-item');
      productItem.innerHTML = `
        <div class="product-card" tabindex="0">
          <figure class="card-banner">
            <img src="${product.images[0]}" width="312" height="350" loading="lazy" alt="${product.name}" class="image-contain">
            <div class="card-badge">New</div>
            <ul class="card-action-list">
              <li class="card-action-item">
                <button class="card-action-btn" aria-labelledby="card-label-1" data-id="${product.id}">
                  <ion-icon name="cart-outline"></ion-icon>
                </button>
                <div class="card-action-tooltip" id="card-label-1">Add to Cart</div>
              </li>
              <li class="card-action-item">
                <button class="card-action-btn" aria-labelledby="card-label-2" data-id="${product.id}">
                  <ion-icon name="heart-outline"></ion-icon>
                </button>
                <div class="card-action-tooltip" id="card-label-2">Add to Wishlist</div>
              </li>
              <li class="card-action-item">
                <button class="card-action-btn" aria-labelledby="card-label-3">
                  <ion-icon name="eye-outline"></ion-icon>
                </button>
                <div class="card-action-tooltip" id="card-label-3">Quick View</div>
              </li>
            </ul>
          </figure>
          <div class="card-content">
            <div class="card-cat">
              <a href="#" class="card-cat-link">${product.mainCategory}</a> /
              <a href="#" class="card-cat-link">${product.subCategory}</a>
            </div>
            <h3 class="h3 card-title">
              <a href="#" data-id="${product.id}">${product.name}</a>
            </h3>
            <data class="card-price" value="${product.price}">$${product.price}</data>
          </div>
        </div>
      `;
      return productItem;
    }

    // Get the view cart button
    const viewCartBtn = document.getElementById('view-cart-btn');

    // Function to view cart
    function viewCart() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const cartList = document.getElementById('cart-list');
      cartList.innerHTML = '';
      cart.forEach(productId => {
        // Find the product details from the products array
        const product = products.find(product => product.id === productId);
        if (product) {
          const cartItem = document.createElement('li');
          cartItem.innerHTML = `
            <img src="${product.images[0]}" width="50" height="50" alt="${product.name}">
            <span>${product.name}</span>
            <span>$${product.price}</span>
            <button class="remove-from-cart" data-id="${product.id}">Remove</button>
          `;
          cartList.appendChild(cartItem);
        }
      });
    }

    // Add event listener to view cart button
    if (viewCartBtn) {
      viewCartBtn.addEventListener('click', viewCart);
    }

    // Function to remove item from cart
    function removeItemFromCart(productId) {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart = cart.filter(id => id !== productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadgeCount();
      viewCart();
    }

    // Add event listener to remove from cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-from-cart')) {
        const productId = e.target.getAttribute('data-id');
        removeItemFromCart(productId);
      }
    }); 
    // Get the cart and wishlist buttons
    const cartBtn = document.querySelector('.nav-action-btn[aria-label="Cart"]');
    const wishlistBtn = document.querySelector('.nav-action-btn[aria-label="Wishlist"]');

    // Get the cart and wishlist badge elements
    const cartBadge = cartBtn.querySelector('.nav-action-badge');
    const wishlistBadge = wishlistBtn.querySelector('.nav-action-badge');

    // Function to update the cart badge count
    function updateCartBadgeCount() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      cartBadge.textContent = cart.length;
    }

    // Function to update the wishlist badge count
    function updateWishlistBadgeCount() {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      wishlistBadge.textContent = wishlist.length;
    }

    // Call the update functions when the page loads
    updateCartBadgeCount();
    updateWishlistBadgeCount();

    // Add event listeners to cart and wishlist buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-action-btn')) {
        const productId = e.target.getAttribute('data-id');
        if (e.target.querySelector('ion-icon').getAttribute('name') === 'cart-outline') {
          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          cart.push(productId);
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartBadgeCount();
          alert('Product added to cart!');
        } else if (e.target.querySelector('ion-icon').getAttribute('name') === 'heart-outline') {
          let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
          wishlist.push(productId);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          updateWishlistBadgeCount();
          alert('Product added to wishlist!');
        }
      }
    });

    // Populate CTA list
    const ctaList = document.getElementById('cta-list');
    if (ctaList) {
      products.slice(0, 2).forEach(product => {
        if (product.name && product.images[0]) {
          const ctaItem = document.createElement('li');
          ctaItem.innerHTML = `
            <div class="cta-card" style="background-image: url('${product.images[0]}')">
              <p class="card-subtitle">${product.name}</p>
              <h3 class="h2 card-title">The Summer Sale Off 50%</h3>
              <a href="#" class="btn btn-link">
                <span>Shop Now</span>
                <ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon>
              </a>
            </div>
          `;
          ctaList.appendChild(ctaItem);
        }
      });
    }

    // Populate special product
    const specialProduct = document.getElementById('special-product');
    if (specialProduct) {
      const productListSpecial = specialProduct.querySelector('.product-list');
      const lastProduct = products[products.length - 1];
      if (lastProduct && lastProduct.name && lastProduct.price && lastProduct.images[0]) {
        const productItem = createProductItem(lastProduct);
        productListSpecial.appendChild(productItem);
      }
    }

  

   // Populate Instagram posts
const instaPostList = document.getElementById('insta-post-list');
if (instaPostList) {
  products.slice(0, 8).forEach(product => {
    if (product.images[0]) {
      const instaPostItem = document.createElement('li');
      instaPostItem.classList.add('insta-post-item');
      instaPostItem.innerHTML = `
        <img src="${product.images[0]}" width="100" height="100" loading="lazy" alt="Instagram post" class="insta-post-banner image-contain">
        <a href="#" class="insta-post-link">
          <ion-icon name="logo-instagram"></ion-icon>
        </a>
      `;
      instaPostList.appendChild(instaPostItem);
    }
  });
}
  })
  .catch(error => console.error('Error fetching data:', error));

// Navbar toggle
const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navLinks = document.querySelectorAll(".navbar-link");

if (overlay && navOpenBtn && navbar && navCloseBtn) {
  const navElems = [overlay, navOpenBtn, navCloseBtn];

  navElems.forEach(elem => {
    elem.addEventListener("click", () => {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  });

  // Close navbar when link is clicked
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navbar.classList.remove("active");
      overlay.classList.remove("active");
    });
  });
}

// Header & Go Top Btn Active on Page Scroll
const header = document.querySelector("[data-header]");
const goTopBtn = document.getElementById('go-top');

if (header && goTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY >= 80) {
      header.classList.add("active");
      goTopBtn.classList.add("active");
    } else {
      header.classList.remove("active");
      goTopBtn.classList.remove("active");
    }
  });

  // Smooth Scroll for Go Top Btn
  goTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
