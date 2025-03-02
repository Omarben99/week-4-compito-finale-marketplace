const API_URL = 'https://striveschool-api.herokuapp.com/api/product/';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2MxODMzMzVjZDk5MjAwMTUwNTkyZGYiLCJpYXQiOjE3NDA3MzUyODMsImV4cCI6MTc0MTk0NDg4M30.vYLVlFeui4jRtZhk5eUSjNVZkIyV-d1oQe6Bn1CgHGc';


let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let allProducts = [];

// Aggiungi una barra di ricerca nella navbar
const navbar = document.querySelector('.navbar .container');
const searchForm = document.createElement('form');
searchForm.classList.add('d-flex', 'ms-3');
searchForm.innerHTML = `
    <input class="form-control me-2" type="search" placeholder="Search Manga..." aria-label="Search" id="searchInput">
    <button class="btn btn-outline-dark" type="submit"><i class="fas fa-search"></i></button>
`;
navbar.appendChild(searchForm);

// Funzione per recuperare i prodotti dall'API
async function fetchProducts() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
}

// Funzione per mostrare i prodotti nel DOM
function displayProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'mb-4', 'product');
        productElement.innerHTML = `
            <div class="card product-card">
                <div class="position-relative">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                    <button class="btn btn-sm position-absolute top-0 end-0 m-2 wishlist-toggle btn-outline-danger" 
                            onclick="toggleWishlistItem('${product._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.brand}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="h5">€${product.price.toFixed(2)}</span>
                        <div>
                            <button class="btn btn-sm btn-success" onclick="toggleCartItem('${product._id}')">
                                Add to Cart
                            </button>
                            <a href="product.html?id=${product._id}" class="btn btn-sm btn-primary">
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        productsContainer.appendChild(productElement);
    });
}


function filterProducts() {
    const searchText = searchInput.value.toLowerCase();
    const filteredProducts = allProducts.filter(product => product.name.toLowerCase().includes(searchText));
    displayProducts(filteredProducts);
}


searchForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita il ricaricamento della pagina
    filterProducts();
});

searchInput.addEventListener('input', filterProducts);


fetchProducts();





const getTheme = () => localStorage.getItem('theme') || 'light';
const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
};


async function fetchProducts() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        allProducts = products;
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}


async function renderProducts() {
    const products = await fetchProducts();
    
    if (products.length === 0) {
        document.getElementById('productsContainer').innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
        return;
    }
    
    renderProductSection('productsContainer', products);
    
    
    const newReleases = products.filter(p => p.description.toLowerCase().includes('new') || getRandomBoolean(0.3));
    const bestSellers = products.filter(p => p.description.toLowerCase().includes('popular') || getRandomBoolean(0.3));
    const merchandise = products.filter(p => p.description.toLowerCase().includes('merch') || p.name.toLowerCase().includes('figure') || getRandomBoolean(0.3));
    
    renderProductSection('newReleasesContainer', newReleases);
    renderProductSection('bestSellersContainer', bestSellers);
    renderProductSection('merchandiseContainer', merchandise);
    
    updateCartDisplay();
}


function getRandomBoolean(probability) {
    return Math.random() < probability;
}


function renderProductSection(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No products found in this category.</p></div>';
        return;
    }
    
    
    container.dataset.allProducts = JSON.stringify(products);
    container.dataset.currentPage = 1;
    const productsPerPage = 8;
    
    
    const visibleProducts = products.slice(0, productsPerPage);
    
    visibleProducts.forEach(product => {
        const inCart = cart.some(item => item.id === product._id);
        const inWishlist = wishlist.some(item => item.id === product._id);
        
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        productCard.innerHTML = `
            <div class="card product-card ${inCart ? 'border-primary' : ''}">
                <div class="position-relative">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                    <button class="btn btn-sm position-absolute top-0 end-0 m-2 wishlist-toggle ${inWishlist ? 'btn-danger' : 'btn-outline-danger'}" 
                            onclick="toggleWishlistItem('${product._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.brand}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="h5">€${product.price.toFixed(2)}</span>
                        <div>
                            <button class="btn btn-sm ${inCart ? 'btn-danger' : 'btn-success'}" 
                                    onclick="toggleCartItem('${product._id}')">
                                ${inCart ? 'Remove' : 'Add to cart'}
                            </button>
                            <a href="product.html?id=${product._id}" class="btn btn-sm btn-primary">
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
    
    
    if (products.length > productsPerPage) {
        const seeMoreRow = document.createElement('div');
        seeMoreRow.className = 'row mt-4 mb-5';
        seeMoreRow.innerHTML = `
            <div class="col-12 text-center">
                <button class="btn btn-primary see-more-btn" onclick="loadMoreProducts('${containerId}')">
                    See More
                </button>
            </div>
        `;
        container.appendChild(seeMoreRow);
    }
}


function loadMoreProducts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const allProducts = JSON.parse(container.dataset.allProducts);
    const currentPage = parseInt(container.dataset.currentPage);
    const productsPerPage = 8;
    
    // Calculate next page
    const nextPage = currentPage + 1;
    container.dataset.currentPage = nextPage;
    
    // Get current products to keep
    const currentItems = Array.from(container.querySelectorAll('.product-card')).map(card => card.closest('.col-lg-3'));
    
    // Get the see more button row to remove
    const seeMoreBtn = container.querySelector('.see-more-btn').closest('.row');
    if (seeMoreBtn) {
        container.removeChild(seeMoreBtn);
    }
    
    // Add new batch of products
    const startIndex = (currentPage) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = allProducts.slice(startIndex, endIndex);
    
    newProducts.forEach(product => {
        const inCart = cart.some(item => item.id === product._id);
        const inWishlist = wishlist.some(item => item.id === product._id);
        
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        productCard.innerHTML = `
            <div class="card product-card ${inCart ? 'border-primary' : ''}">
                <div class="position-relative">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                    <button class="btn btn-sm position-absolute top-0 end-0 m-2 wishlist-toggle ${inWishlist ? 'btn-danger' : 'btn-outline-danger'}" 
                            onclick="toggleWishlistItem('${product._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.brand}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="h5">€${product.price.toFixed(2)}</span>
                        <div>
                            <button class="btn btn-sm ${inCart ? 'btn-danger' : 'btn-success'}" 
                                    onclick="toggleCartItem('${product._id}')">
                                ${inCart ? 'Remove' : 'Add to cart'}
                            </button>
                            <a href="product.html?id=${product._id}" class="btn btn-sm btn-primary">
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
    
    // Add "See More" button again if there are more products
    if (endIndex < allProducts.length) {
        const seeMoreRow = document.createElement('div');
        seeMoreRow.className = 'row mt-4 mb-5';
        seeMoreRow.innerHTML = `
            <div class="col-12 text-center">
                <button class="btn btn-primary see-more-btn" onclick="loadMoreProducts('${containerId}')">
                    See More
                </button>
            </div>
        `;
        container.appendChild(seeMoreRow);
    }
}

// Toggle item in cart
function toggleCartItem(productId) {
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Remove from cart
        cart.splice(existingItemIndex, 1);
    } else {
        // Add to cart
        const product = allProducts.find(p => p._id === productId);
        if (product) {
            cart.push({
                id: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1
            });
        }
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartDisplay();
    renderProducts();
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        updateCartDisplay();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    
    if (!cartItemsEl) return;
    
    // Update cart count
    cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart items display
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<div class="text-center py-3">Your cart is empty</div>';
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="dropdown-item d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <img src="${item.imageUrl}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;">
                    <div>
                        <div class="fw-bold">${item.name}</div>
                        <div>€${item.price.toFixed(2)} x ${item.quantity}</div>
                    </div>
                </div>
                <div class="d-flex">
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = `€${total.toFixed(2)}`;
}

// Toggle wishlist item
function toggleWishlistItem(productId) {
    const existingItemIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Remove from wishlist
        wishlist.splice(existingItemIndex, 1);
    } else {
        // Add to wishlist
        const product = allProducts.find(p => p._id === productId);
        if (product) {
            wishlist.push({
                id: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl
            });
        }
    }
    
    // Save wishlist to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Update UI
    updateWishlistDisplay();
    renderProducts();
}

// Update wishlist display
function updateWishlistDisplay() {
    const wishlistItemsEl = document.getElementById('wishlistItems');
    const wishlistCountEl = document.getElementById('wishlistCount');
    
    if (!wishlistItemsEl || !wishlistCountEl) return;
    
    // Update wishlist count
    wishlistCountEl.textContent = wishlist.length;
    
    // Update wishlist items display
    if (wishlist.length === 0) {
        wishlistItemsEl.innerHTML = '<div class="text-center py-3">Your wishlist is empty</div>';
    } else {
        wishlistItemsEl.innerHTML = wishlist.map(item => `
            <div class="wishlist-item d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <img src="${item.imageUrl}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;">
                    <div>
                        <div class="fw-bold">${item.name}</div>
                        <div>€${item.price.toFixed(2)}</div>
                    </div>
                </div>
                <div class="d-flex">
                    <button class="btn btn-sm btn-success me-1" onclick="toggleCartItem('${item.id}')">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="toggleWishlistItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Handle wishlist dropdown
function handleWishlistDropdown() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    const wishlistDropdown = document.getElementById('wishlistDropdown');
    const closeWishlistBtn = document.getElementById('closeWishlist');
    
    if (!wishlistBtn || !wishlistDropdown || !closeWishlistBtn) return;
    
    wishlistBtn.addEventListener('click', () => {
        wishlistDropdown.classList.toggle('active');
    });
    
    closeWishlistBtn.addEventListener('click', () => {
        wishlistDropdown.classList.remove('active');
    });
    
    
    document.addEventListener('click', (e) => {
        if (!wishlistBtn.contains(e.target) && 
            !wishlistDropdown.contains(e.target)) {
            wishlistDropdown.classList.remove('active');
        }
    });
}


function handleDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    
    setTheme(getTheme());
    
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        
        const icon = darkModeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
    
    
    const icon = darkModeToggle.querySelector('i');
    if (icon) {
        icon.className = getTheme() === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}


function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        
       
        console.log('Contact form submitted:', { name, email, subject, message });
        
       
        alert('Thank you for your message! We will get back to you soon.');
        
       
        contactForm.reset();
        
       
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        if (modal) {
            modal.hide();
        }
    });
}


function handleCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    
    if (localStorage.getItem('cookiesAccepted')) {
        cookieConsent.style.display = 'none';
    } else {
        cookieConsent.style.display = 'flex';
        
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.style.display = 'none';
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    setTheme(getTheme());
    
    
    renderProducts();
    handleCookieConsent();
    handleWishlistDropdown();
    handleDarkModeToggle();
    handleContactForm();
    updateWishlistDisplay();
});



window.toggleCartItem = toggleCartItem;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlistItem = toggleWishlistItem;
window.loadMoreProducts = loadMoreProducts;
