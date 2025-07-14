// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Expand the WebApp to full view
tg.expand();

// DOM Elements
const homeView = document.getElementById('homeView');
const cartView = document.getElementById('cartView');
const orderConfirmationView = document.getElementById('orderConfirmationView');
const cartButton = document.getElementById('cartButton');
const backButton = document.getElementById('backButton');
const backToMenuButton = document.getElementById('backToMenuButton');
const checkoutButton = document.getElementById('checkoutButton');
const menuItemsContainer = document.getElementById('menuItems');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountElement = document.getElementById('cartCount');
const cartTotalElement = document.getElementById('cartTotal');
const orderNumberElement = document.getElementById('orderNumber');
const categoryButtons = document.querySelectorAll('.category-btn');

// State
let cart = [];
let currentCategory = 'all';

// Menu Data
const menuData = [
    {
        id: 1,
        title: 'Брускетта с томатами',
        description: 'Хрустящий хлеб с свежими томатами и базиликом',
        price: 350,
        category: 'starters',
        image: 'assets/images/dish1.jpg'
    },
    {
        id: 2,
        title: 'Карпаччо из говядины',
        description: 'Тонкие ломтики сырой говядины с пармезаном и рукколой',
        price: 450,
        category: 'starters',
        image: 'assets/images/dish2.jpg'
    },
    {
        id: 3,
        title: 'Стейк Рибай',
        description: 'Премиальный кусок говядины с овощами гриль',
        price: 1200,
        category: 'main',
        image: 'assets/images/dish1.jpg'
    },
    {
        id: 4,
        title: 'Лосось на гриле',
        description: 'Филе лосося с лимонным соусом и спаржей',
        price: 950,
        category: 'main',
        image: 'assets/images/dish2.jpg'
    },
    {
        id: 5,
        title: 'Тирамису',
        description: 'Классический итальянский десерт',
        price: 400,
        category: 'desserts',
        image: 'assets/images/dish1.jpg'
    },
    {
        id: 6,
        title: 'Чизкейк',
        description: 'Нежный чизкейк с ягодным соусом',
        price: 350,
        category: 'desserts',
        image: 'assets/images/dish2.jpg'
    },
    {
        id: 7,
        title: 'Мохито',
        description: 'Освежающий коктейль с лаймом и мятой',
        price: 300,
        category: 'drinks',
        image: 'assets/images/dish1.jpg'
    },
    {
        id: 8,
        title: 'Вино красное',
        description: 'Бокал красного вина, 150 мл',
        price: 450,
        category: 'drinks',
        image: 'assets/images/dish2.jpg'
    }
];

// Initialize the app
function initApp() {
    renderMenuItems();
    setupEventListeners();
    loadCart();
    updateCartUI();
}

// Render menu items based on current category
function renderMenuItems() {
    menuItemsContainer.innerHTML = '';
    
    const filteredItems = currentCategory === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === currentCategory);
    
    filteredItems.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item';
        menuItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="menu-item-img">
            <div class="menu-item-details">
                <h4 class="menu-item-title">${item.title}</h4>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">${item.price} ₽</span>
                    <button class="add-to-cart-btn" data-id="${item.id}">+</button>
                </div>
            </div>
        `;
        menuItemsContainer.appendChild(menuItemElement);
    });
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            addToCart(itemId);
        });
    });
}

// Add item to cart
function addToCart(itemId) {
    const item = menuData.find(i => i.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    
    // Show feedback animation
    const button = document.querySelector(`.add-to-cart-btn[data-id="${itemId}"]`);
    button.textContent = '✓';
    button.style.backgroundColor = '#4caf50';
    
    setTimeout(() => {
        button.textContent = '+';
        button.style.backgroundColor = 'var(--primary-color)';
    }, 1000);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    renderCartItems();
}

// Update item quantity in cart
function updateCartItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
        renderCartItems();
    }
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Ваша корзина пуста</div>';
        checkoutButton.disabled = true;
        return;
    }
    
    checkoutButton.disabled = false;
    
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">${item.price} ₽ × ${item.quantity} = ${item.price * item.quantity} ₽</p>
                <div class="cart-item-controls">
                    <button class="decrease-quantity" data-id="${item.id}">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="increase-quantity" data-id="${item.id}">+</button>
                    <button class="cart-item-remove" data-id="${item.id}">×</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to cart item controls
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(i => i.id === itemId);
            if (item) {
                updateCartItemQuantity(itemId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(i => i.id === itemId);
            if (item) {
                updateCartItemQuantity(itemId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(itemId);
        });
    });
}

// Update cart UI (count and total)
function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCountElement.textContent = totalCount;
    cartTotalElement.textContent = `${totalPrice} ₽`;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    cartButton.addEventListener('click', () => {
        homeView.classList.add('hidden');
        cartView.classList.remove('hidden');
        orderConfirmationView.classList.add('hidden');
        renderCartItems();
    });
    
    backButton.addEventListener('click', () => {
        homeView.classList.remove('hidden');
        cartView.classList.add('hidden');
        orderConfirmationView.classList.add('hidden');
    });
    
    backToMenuButton.addEventListener('click', () => {
        homeView.classList.remove('hidden');
        cartView.classList.add('hidden');
        orderConfirmationView.classList.add('hidden');
    });
    
    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.getAttribute('data-category');
            renderMenuItems();
        });
    });
    
    // Checkout
    checkoutButton.addEventListener('click', () => {
        // In a real app, you would send this data to your backend
        const orderData = {
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            user: tg.initDataUnsafe?.user
        };
        
        // Generate random order number
        const orderNumber = '#' + Math.floor(10000 + Math.random() * 90000);
        orderNumberElement.textContent = orderNumber;
        
        // Show confirmation
        homeView.classList.add('hidden');
        cartView.classList.add('hidden');
        orderConfirmationView.classList.remove('hidden');
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        
        // In a real app, you would send the order to your backend here
        console.log('Order placed:', orderData);
        
        // You can also send data back to the bot
        // tg.sendData(JSON.stringify(orderData));
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);