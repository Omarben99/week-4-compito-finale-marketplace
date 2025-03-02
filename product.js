const API_URL = 'https://striveschool-api.herokuapp.com/api/product/';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2MxODMzMzVjZDk5MjAwMTUwNTkyZGYiLCJpYXQiOjE3NDA3MzUyODMsImV4cCI6MTc0MTk0NDg4M30.vYLVlFeui4jRtZhk5eUSjNVZkIyV-d1oQe6Bn1CgHGc';


let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];



function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}


async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${API_URL}${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
}


function toggleCartItem(productId) {
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex !== -1) {
       
        cart.splice(existingItemIndex, 1);
    } else {
        
        fetchProductAndAddToCart(productId);
        return;
    }

    
    localStorage.setItem('cart', JSON.stringify(cart));

  
    updateCartDisplay();
    displayProductDetails();
}


function toggleWishlistItem(productId) {
    const existingItemIndex = wishlist.findIndex(item => item.id === productId);

    if (existingItemIndex !== -1) {
       
        wishlist.splice(existingItemIndex, 1);
    } else {
        
        fetchProductAndAddToWishlist(productId);
        return;
    }

    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

   
    updateWishlistDisplay();
    displayProductDetails();
}


async function fetchProductAndAddToWishlist(productId) {
    try {
        const response = await fetch(`${API_URL}${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }

        const product = await response.json();

        
        wishlist.push({
            id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl
        });

        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        
        updateWishlistDisplay();
        displayProductDetails();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add product to wishlist');
    }
}


async function fetchProductAndAddToCart(productId) {
    try {
        const response = await fetch(`${API_URL}${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }

        const product = await response.json();

       
        cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });

        localStorage.setItem('cart', JSON.stringify(cart));

        
        updateCartDisplay();
        displayProductDetails();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add product to cart');
    }
}


function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }

        
        localStorage.setItem('cart', JSON.stringify(cart));

        
        updateCartDisplay();
    }
}


function updateCartDisplay() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');

    if (!cartItemsEl) return;

    
    cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);

   
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

    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = `€${total.toFixed(2)}`;
}


function updateWishlistDisplay() {
    const wishlistItemsEl = document.getElementById('wishlistItems');
    const wishlistCountEl = document.getElementById('wishlistCount');

    if (!wishlistItemsEl || !wishlistCountEl) return;

    
    wishlistCountEl.textContent = wishlist.length;

    
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


function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

function getTheme() {
    return localStorage.getItem('theme') || 'light';
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


async function displayProductDetails() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert('Product ID is missing');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();

        
        const inCart = cart.some(item => item.id === product._id);
        const inWishlist = wishlist.some(item => item.id === product._id);

       
        const productDetailsEl = document.getElementById('productDetails');
        productDetailsEl.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                     <div class="position-relative">
                        <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid product-image">
                        <div class="position-absolute top-0 end-1 p-1">
                           <button class="btn ${inWishlist ? 'btn-danger' : 'btn-outline-danger'} heart-btn" 
                                    onclick="toggleWishlistItem('${product._id}')" title="${inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-7">
                     <h1 style="color: var(--primary)">${product.name}</h1>
                    <p style="color: var(--primary)">${product.brand}</p>
                     <div class="my-3 p-3 border-start border-primary description" style="border-width: 4px !important; background: rgba(255, 140, 0, 0.05);">
                        <p style="color: var(--primary)">${product.description}</p>
                    </div>
                     <h2 class="mt-3" style="color: var(--primary)">€${product.price.toFixed(2)}</h2>
                    <div class="mt-4">
                        <button class="btn ${inCart ? 'btn-danger' : 'btn-success'} btn-lg" 
                                onclick="toggleCartItem('${product._id}')">
                            <i class="fas ${inCart ? 'fa-trash' : 'fa-cart-plus'}"></i>
                            ${inCart ? 'Remove from Cart' : 'Add to Cart'}
                        </button>
                        <a href="index.html" class="btn btn-secondary btn-lg ms-2">
                            <i class="fas fa-arrow-left"></i> Back to Shopping
                        </a>
                    </div>
                </div>
            </div>
        `;

       
        document.title = `${product.name} - Benaissa Mangabro`;

    } catch (error) {
        console.error('Error:', error);
        const productDetailsEl = document.getElementById('productDetails');
        productDetailsEl.innerHTML = `
            <div class="alert alert-danger">
                <p>Failed to load product details. Please try again later.</p>
                <a href="index.html" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Shopping
                </a>
            </div>
        `;
    }
}



document.addEventListener('DOMContentLoaded', () => {
    
    setTheme(getTheme());

    displayProductDetails();
    updateCartDisplay();
    updateWishlistDisplay();
    handleWishlistDropdown();
    handleDarkModeToggle();
    handleContactForm();
    handleCookieConsent();
});


window.toggleCartItem = toggleCartItem;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlistItem = toggleWishlistItem;