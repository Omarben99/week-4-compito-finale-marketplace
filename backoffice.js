const API_URL = 'https://striveschool-api.herokuapp.com/api/product/';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2MxODMzMzVjZDk5MjAwMTUwNTkyZGYiLCJpYXQiOjE3NDA3MzUyODMsImV4cCI6MTc0MTk0NDg4M30.vYLVlFeui4jRtZhk5eUSjNVZkIyV-d1oQe6Bn1CgHGc';

let cart = JSON.parse(localStorage.getItem('mangaCart')) || [];


const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const productIdInput = document.getElementById('productId');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const brandInput = document.getElementById('brand');
const imageUrlInput = document.getElementById('imageUrl');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const productsTable = document.getElementById('productsTable');


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
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}


async function fetchProductById(id) {
    try {
        const response = await fetch(`${API_URL}${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }
        
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}


async function createProduct(productData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create product');
        }
        
        const newProduct = await response.json();
        return newProduct;
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
}


async function updateProduct(id, productData) {
    try {
        const response = await fetch(`${API_URL}${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        
        const updatedProduct = await response.json();
        return updatedProduct;
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
}


async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_URL}${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}

// Render products table
async function renderProductsTable() {
    productsTable.innerHTML = `
        <div id="loader" class="text-center my-4">
            <div class="spinner-border text-orange" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    const products = await fetchProducts();
    
    if (products.length === 0) {
        productsTable.innerHTML = '<div class="alert alert-info">No manga available. Add your first manga above!</div>';
        return;
    }
    
    let tableHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Cover</th>
                        <th>Title</th>
                        <th>Series/Publisher</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    products.forEach(product => {
        tableHTML += `
            <tr>
                <td><img src="${product.imageUrl}" alt="${product.name}" style="width: 50px; height: 70px; object-fit: cover;"></td>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>€${product.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${product._id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${product._id}">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    productsTable.innerHTML = tableHTML;
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => loadProductForEdit(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteProduct(btn.getAttribute('data-id')));
    });
}

// Load product data for editing
async function loadProductForEdit(id) {
    const product = await fetchProductById(id);
    
    if (!product) {
        showAlert('Failed to load manga for editing.', 'danger');
        return;
    }
    
    // Fill the form with product data
    productIdInput.value = product._id;
    nameInput.value = product.name;
    descriptionInput.value = product.description;
    brandInput.value = product.brand;
    imageUrlInput.value = product.imageUrl;
    priceInput.value = product.price;
    
    // Update form title and submit button
    formTitle.textContent = 'Edit Manga';
    submitBtn.textContent = 'Update Manga';
    
    // Scroll to the form
    window.scrollTo(0, 0);
}

// Confirm product deletion
function confirmDeleteProduct(id) {
    if (confirm('Are you sure you want to delete this manga?')) {
        deleteProductAndRefresh(id);
    }
}

// Delete product and refresh the table
async function deleteProductAndRefresh(id) {
    const success = await deleteProduct(id);
    
    if (success) {
        renderProductsTable();
        showAlert('Manga deleted successfully!', 'success');
        
        // Also update cart if this product was in it
        updateCartAfterProductDeletion(id);
    } else {
        showAlert('Failed to delete manga.', 'danger');
    }
}

// Update cart after product deletion
function updateCartAfterProductDeletion(productId) {
    cart = cart.filter(item => item._id !== productId);
    localStorage.setItem('mangaCart', JSON.stringify(cart));
    updateCartDisplay();
}

// Reset the form
function resetForm() {
    productForm.reset();
    productIdInput.value = '';
    formTitle.textContent = 'Add New Manga';
    submitBtn.textContent = 'Add Manga';
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const productData = {
        name: nameInput.value,
        description: descriptionInput.value,
        brand: brandInput.value,
        imageUrl: imageUrlInput.value,
        price: parseFloat(priceInput.value)
    };
    
    const productId = productIdInput.value;
    let success = false;
    
    if (productId) {
        // Update existing product
        const updatedProduct = await updateProduct(productId, productData);
        success = !!updatedProduct;
        if (success) {
            showAlert('Manga updated successfully!', 'success');
            
            // Update cart if this product was in it
            updateCartAfterProductUpdate(productId, updatedProduct);
        } else {
            showAlert('Failed to update manga.', 'danger');
        }
    } else {
        // Create new product
        const newProduct = await createProduct(productData);
        success = !!newProduct;
        if (success) {
            showAlert('Manga added successfully!', 'success');
        } else {
            showAlert('Failed to add manga.', 'danger');
        }
    }
    
    if (success) {
        resetForm();
        renderProductsTable();
    }
}

// Update cart after product update
function updateCartAfterProductUpdate(productId, updatedProduct) {
    const cartItemIndex = cart.findIndex(item => item._id === productId);
    
    if (cartItemIndex !== -1) {
        cart[cartItemIndex].name = updatedProduct.name;
        cart[cartItemIndex].price = updatedProduct.price;
        cart[cartItemIndex].imageUrl = updatedProduct.imageUrl;
        
        localStorage.setItem('mangaCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const shippingCostElement = document.getElementById('shippingCost');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (!cartCountElement || !cartItemsContainer) return;
    
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
        cartSubtotalElement.textContent = '€0.00';
        shippingCostElement.textContent = '€0.00';
        cartTotalElement.textContent = '€0.00';
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="d-flex">
                    <div class="cart-item-img me-2">
                        <img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 70px; object-fit: cover;">
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between">
                            <h6 class="cart-item-title">${item.name}</h6>
                            <span class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="d-flex align-items-center justify-content-between mt-1">
                            <div class="quantity-control">
                                <button class="btn btn-sm btn-outline-secondary decrement-btn" data-id="${item._id}">-</button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary increment-btn" data-id="${item._id}">+</button>
                            </div>
                            <button class="btn btn-sm btn-danger remove-btn" data-id="${item._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    
    const shipping = subtotal >= 29 ? 0 : 4.99;
    const total = subtotal + shipping;
    
    
    cartSubtotalElement.textContent = `€${subtotal.toFixed(2)}`;
    shippingCostElement.textContent = shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`;
    cartTotalElement.textContent = `€${total.toFixed(2)}`;
    
    
    document.querySelectorAll('.increment-btn').forEach(btn => {
        btn.addEventListener('click', incrementCartItem);
    });
    
    document.querySelectorAll('.decrement-btn').forEach(btn => {
        btn.addEventListener('click', decrementCartItem);
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeCartItem);
    });
}


function incrementCartItem(event) {
    const productId = event.currentTarget.getAttribute('data-id');
    const item = cart.find(item => item._id === productId);
    
    if (item) {
        item.quantity += 1;
        localStorage.setItem('mangaCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}


function decrementCartItem(event) {
    const productId = event.currentTarget.getAttribute('data-id');
    const item = cart.find(item => item._id === productId);
    
    if (item) {
        item.quantity -= 1;
        
        if (item.quantity <= 0) {
            removeCartItem(event);
            return;
        }
        
        localStorage.setItem('mangaCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}


function removeCartItem(event) {
    const productId = event.currentTarget.getAttribute('data-id');
    cart = cart.filter(item => item._id !== productId);
    localStorage.setItem('mangaCart', JSON.stringify(cart));
    updateCartDisplay();
}


function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    
    if (!cookieConsent || !acceptCookiesBtn) return;
    
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookiesAccepted) {
        cookieConsent.classList.add('show');
        
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.classList.remove('show');
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    renderProductsTable();
    
    
    productForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);
    
   
    updateCartDisplay();
    initCookieConsent();
});
