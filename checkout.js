// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Display checkout items and calculate totals
function displayCheckoutItems() {
    const checkoutItemsEl = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (!checkoutItemsEl) return;
    
    if (cart.length === 0) {
        checkoutItemsEl.innerHTML = '<div class="text-center py-3">Your cart is empty</div>';
        return;
    }
    
    // Display checkout items
    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <div>
                        <div class="fw-bold">${item.name}</div>
                        <div class="text-muted">Qty: ${item.quantity}</div>
                    </div>
                </div>
                <div>€${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    
    checkoutItemsEl.innerHTML = itemsHtml;
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 29 ? 0 : 5.99;
    const tax = subtotal * 0.22;
    const total = subtotal + shipping + tax;
    
    // Update UI
    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    shippingEl.textContent = shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`;
    taxEl.textContent = `€${tax.toFixed(2)}`;
    totalEl.textContent = `€${total.toFixed(2)}`;
}

// Handle checkout steps
function handleCheckoutSteps() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const nextToPaymentBtn = document.getElementById('nextToPayment');
    const backToShippingBtn = document.getElementById('backToShipping');
    const placeOrderBtn = document.getElementById('placeOrder');
    
    // Continue to payment
    nextToPaymentBtn.addEventListener('click', () => {
        const shippingForm = document.getElementById('shippingForm');
        
        // Check form validity
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }
        
        step1.classList.add('d-none');
        step2.classList.remove('d-none');
    });
    
    // Back to shipping
    backToShippingBtn.addEventListener('click', () => {
        step2.classList.add('d-none');
        step1.classList.remove('d-none');
    });
    
    // Place order
    placeOrderBtn.addEventListener('click', () => {
        const paymentForm = document.getElementById('paymentForm');
        
        // Check form validity
        if (!paymentForm.checkValidity()) {
            paymentForm.reportValidity();
            return;
        }
        
        // Set confirmation details
        const email = document.getElementById('email').value;
        document.getElementById('confirmationEmail').textContent = email;
        
        // Generate random order ID
        const orderId = 'BMB-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('orderId').textContent = orderId;
        
        // Show confirmation
        step2.classList.add('d-none');
        step3.classList.remove('d-none');
        
        // Clear cart
        localStorage.removeItem('cart');
        cart = [];
    });
}

// Handle cookie consent
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayCheckoutItems();
    handleCheckoutSteps();
    handleCookieConsent();
});
