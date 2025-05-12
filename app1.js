document.addEventListener('DOMContentLoaded', function() {
    // Loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('#navLinks a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Back to top button
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });
    
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Header scroll effect
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Shopping cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const navCartCount = document.getElementById('navCartCount');
    const navCartIcon = document.getElementById('navCartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeModal = document.querySelector('.close');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const continueShopping = document.getElementById('continueShopping');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Update cart count
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        navCartCount.textContent = count;
    }
    
    // Load products from JSON file
    let products = [];
    
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            renderProducts();
            loadingOverlay.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading products:', error);
            loadingOverlay.style.display = 'none';
            // Fallback to empty products
            products = [];
            renderProducts();
        });
    
    // Render products
    const productContainer = document.getElementById('productContainer');
    
    function renderProducts(filter = 'all') {
        productContainer.innerHTML = '';
        
        const filteredProducts = filter === 'all' 
            ? products 
            : products.filter(product => product.category === filter);
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.category = product.category;
            
            let badgeHTML = '';
            if (product.badge) {
                badgeHTML = `<span class="product-badge">${product.badge}</span>`;
            }
            
            let originalPriceHTML = '';
            if (product.originalPrice) {
                originalPriceHTML = `<span class="original-price">₹${product.originalPrice}</span>`;
            }
            
            productCard.innerHTML = `
                ${badgeHTML}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        <div class="price">
                            ${originalPriceHTML}
                            <span>₹${product.price}</span>
                        </div>
                        <button class="add-to-cart" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;
            
            productContainer.appendChild(productCard);
        });
        
        // Add event listeners to add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }
    
    // Product filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            renderProducts(filter);
        });
    });
    
    // Add to cart function
    function addToCart(e) {
        const productId = parseInt(e.target.closest('.add-to-cart').dataset.id);
        const product = products.find(p => p.id === productId);
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show added notification
        showNotification(`${product.name} added to cart!`);
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Cart modal functionality
    navCartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCartModal();
    });
    
    function openCartModal() {
        renderCartItems();
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeCartModal() {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    closeModal.addEventListener('click', closeCartModal);
    continueShopping.addEventListener('click', closeCartModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Render cart items with quantity controls
    function renderCartItems() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            cartTotal.innerHTML = '<p>Total: ₹0</p>';
            return;
        }
        
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} per item</p>
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-price">₹${item.price * item.quantity}</div>
                </div>
                <div class="cart-item-remove" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Calculate total
        updateCartTotal();
        
        // Add event listeners to quantity controls
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', updateQuantity);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });
    }
    
    // Update cart total
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.innerHTML = `<p>Total: ₹${total}</p>`;
    }
    
    // Quantity control functions
    function decreaseQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);
        
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            // Remove if quantity would go to 0
            cart = cart.filter(item => item.id !== productId);
            showNotification(`${item.name} removed from cart`);
        }
        
        saveAndUpdateCart();
    }
    
    function increaseQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);
        item.quantity++;
        saveAndUpdateCart();
    }
    
    function updateQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const newQuantity = parseInt(e.target.value);
        
        if (newQuantity < 1 || isNaN(newQuantity)) {
            e.target.value = 1;
            return;
        }
        
        const item = cart.find(item => item.id === productId);
        item.quantity = newQuantity;
        saveAndUpdateCart();
    }
    
    function saveAndUpdateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    }
    
    // Remove from cart
    function removeFromCart(e) {
        const productId = parseInt(e.target.closest('.cart-item-remove').dataset.id);
        const item = cart.find(item => item.id === productId);
        cart = cart.filter(item => item.id !== productId);
        
        showNotification(`${item.name} removed from cart`);
        saveAndUpdateCart();
    }
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }
        
        closeCartModal();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        
        // Populate order summary in contact form
        updateOrderSummary();
    });
    
    // Update order summary in contact form
    function updateOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        orderSummary.innerHTML = '';
        
        cart.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.className = 'cart-item';
            orderItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x ₹${item.price}</p>
                </div>
                <div class="cart-item-price">₹${item.price * item.quantity}</div>
            `;
            orderSummary.appendChild(orderItem);
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.innerHTML = `<p>Total: ₹${total}</p>`;
        orderSummary.appendChild(totalElement);
    }
    
    // Form validation and WhatsApp submission
    const orderForm = document.getElementById('orderForm');
    
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateOrderForm()) {
            sendOrderViaWhatsApp();
        }
    });
    
    // Validate order form
    function validateOrderForm() {
        let isValid = true;
        
        // Validate name
        const name = document.getElementById('name');
        if (!name.value.trim()) {
            showError(name, 'Please enter your name');
            isValid = false;
        } else {
            clearError(name);
        }
        
        // Validate email
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError(email, 'Please enter your email');
            isValid = false;
        } else if (!emailRegex.test(email.value)) {
            showError(email, 'Please enter a valid email');
            isValid = false;
        } else {
            clearError(email);
        }
        
        // Validate phone
        const phone = document.getElementById('phone');
        const phoneRegex = /^[0-9]{10}$/;
        if (!phone.value.trim()) {
            showError(phone, 'Please enter your phone number');
            isValid = false;
        } else if (!phoneRegex.test(phone.value)) {
            showError(phone, 'Please enter a valid 10-digit phone number');
            isValid = false;
        } else {
            clearError(phone);
        }
        
        // Validate address
        const address = document.getElementById('address');
        if (!address.value.trim()) {
            showError(address, 'Please enter your delivery address');
            isValid = false;
        } else {
            clearError(address);
        }
        
        return isValid;
    }
    
    // Send order via WhatsApp
    function sendOrderViaWhatsApp() {
        // Prepare WhatsApp message
        let message = `Hi PKZ Pickles,\n\nI would like to place an order:\n\n`;
        
        cart.forEach(item => {
            message += `${item.name} - ${item.quantity} x ₹${item.price} = ₹${item.price * item.quantity}\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\nTotal: ₹${total}\n\n`;
        message += `Delivery Details:\n`;
        message += `Name: ${document.getElementById('name').value}\n`;
        message += `Phone: ${document.getElementById('phone').value}\n`;
        message += `Email: ${document.getElementById('email').value}\n`;
        message += `Address: ${document.getElementById('address').value}\n`;
        
        const notes = document.getElementById('notes').value;
        if (notes) {
            message += `\nSpecial Instructions: ${notes}\n`;
        }
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp with the message
        window.open(`https://wa.me/919876543210?text=${encodedMessage}`, '_blank');
        
        // Optional: Clear cart after order
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateOrderSummary();
        
        // Reset form
        orderForm.reset();
    }
    
    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        
        input.style.borderColor = '#e74c3c';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function clearError(input) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        
        input.style.borderColor = '#ddd';
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]');
        
        if (email.value) {
            // In a real app, you would send this to your backend
            showNotification('Thank you for subscribing to our newsletter!');
            email.value = '';
        }
    });
    
    // Initialize cart count
    updateCartCount();
});