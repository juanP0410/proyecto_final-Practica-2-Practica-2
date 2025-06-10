// URLs del backend Flask
const API_URL = 'http://127.0.0.1:5000';
const API_URLS = {
    menu: `${API_URL}/api/menu`,
    orders: `${API_URL}/api/orders`
};

// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let menuItems = [];

// Elementos del DOM
const menuContainer = document.getElementById('menuContainer');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelectorAll('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');

// Función para obtener los elementos del menú desde la API
async function fetchMenuItems() {
    try {
        const response = await fetch(API_URLS.menu);
        if (!response.ok) {
            throw new Error('Error al obtener el menú');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Función para renderizar los elementos del menú
function renderMenuItems() {
    if (!menuContainer) return;

    menuContainer.innerHTML = '';
    menuItems.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.classList.add('menu-item');
        menuItemElement.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="menu-item-img">
            <div class="menu-item-info">
                <h3 class="menu-item-title">${item.name}</h3>
                <p class="menu-item-desc">${item.description}</p>
                ${item.description2 ? `<p class="menu-item-desc2">${item.description2}</p>` : ''}
                <p class="menu-item-price">$${item.price.toFixed(2)}</p>
                <div class="menu-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" data-id="${item.id}" value="1" min="1">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="add-to-cart" data-id="${item.id}">
                        <i class="fas fa-cart-plus"></i> Añadir
                    </button>
                    <button class="share-btn" data-id="${item.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
        menuContainer.appendChild(menuItemElement);
    });

    // Eventos para añadir al carrito
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id || e.target.closest('.add-to-cart').dataset.id);
            const menuItem = menuItems.find(item => item.id === id);
            const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
            const quantity = parseInt(quantityInput.value);
            
            if (menuItem) {
                addToCart(menuItem.id, menuItem.name, menuItem.price, quantity);
            }
        });
    });
    
    // Eventos para los botones de cantidad
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
            let quantity = parseInt(input.value);
            
            if (e.target.classList.contains('minus')) {
                if (quantity > 1) {
                    quantity--;
                    input.value = quantity;
                }
            } else if (e.target.classList.contains('plus')) {
                quantity++;
                input.value = quantity;
            }
        });
    });
    
    // Eventos para compartir
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id || e.target.closest('.share-btn').dataset.id);
            const menuItem = menuItems.find(item => item.id === id);
            
            if (menuItem) {
                const shareData = {
                    title: menuItem.name,
                    text: menuItem.description,
                    url: window.location.href.split('?')[0] + `?item=${id}`
                };
                
                if (navigator.share) {
                    navigator.share(shareData)
                        .catch(error => console.error('Error sharing:', error));
                } else {
                    // Fallback: copiar enlace al portapapeles
                    navigator.clipboard.writeText(shareData.url)
                        .then(() => alert('Enlace copiado al portapapeles'))
                        .catch(err => console.error('Error al copiar:', err));
                }
            }
        });
    });
}

// Función para añadir un item al carrito
function addToCart(id, name, price, quantity) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity });
    }
    
    updateCartCount();
    openCartModal();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.forEach(span => {
        span.textContent = count;
    });
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para abrir el modal del carrito
function openCartModal() {
    if (cartModal) {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderCartItems();
    }
}

// Función para cerrar el modal del carrito
function closeCartModal() {
    if (cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Función para renderizar los items del carrito
function renderCartItems() {
    if (cartItems && cartTotal) {
        cartItems.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            cartTotal.textContent = '0.00';
            return;
        }
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItemElement);
        });
        
        cartTotal.textContent = total.toFixed(2);
        
        // Eventos para los botones de cantidad y eliminar en el carrito
        document.querySelectorAll('.cart-item-quantity .minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                updateCartItem(id, -1);
            });
        });
        
        document.querySelectorAll('.cart-item-quantity .plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                updateCartItem(id, 1);
            });
        });
        
        document.querySelectorAll('.cart-item-quantity input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 1) {
                    updateCartItemQuantity(id, newQuantity);
                }
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id || e.target.closest('.remove-item').dataset.id);
                removeCartItem(id);
            });
        });
    }
}

// Función para actualizar la cantidad de un item en el carrito
function updateCartItem(id, change) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart[index].quantity += change;
        
        if (cart[index].quantity < 1) {
            cart.splice(index, 1);
        }
        
        updateCartCount();
        renderCartItems();
    }
}

// Función para actualizar la cantidad de un item en el carrito mediante input
function updateCartItemQuantity(id, newQuantity) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart[index].quantity = newQuantity;
        updateCartCount();
        renderCartItems();
    }
}

// Función para eliminar un item del carrito
function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartCount();
    renderCartItems();
}

// Función para enviar el pedido por WhatsApp
function sendOrderViaWhatsApp() {
    const phoneNumber = '573204045564';
    let message = '¡Hola! Quiero hacer un pedido:%0A%0A';
    
    cart.forEach(item => {
        message += `- ${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}%0A`;
    });
    
    message += `%0ATotal: $${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}

// Función para crear un pedido en la base de datos
async function createOrder() {
    try {
        const orderData = {
            items: cart,
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            customer_phone: prompt('Por favor, ingresa tu número de teléfono:') || 'No proporcionado'
        };
        
        const response = await fetch(API_URLS.orders, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear el pedido');
        }
        
        const result = await response.json();
        console.log('Pedido creado:', result);
        return result;
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        return null;
    }
}

// Función para manejar el proceso de pedido
async function handleCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Crear pedido en la base de datos
    const orderResult = await createOrder();
    
    if (orderResult) {
        // Enviar pedido por WhatsApp
        sendOrderViaWhatsApp();
        
        // Vaciar el carrito
        cart = [];
        updateCartCount();
        localStorage.removeItem('cart');
        closeCartModal();
        
        alert('¡Pedido realizado con éxito! Se ha abierto WhatsApp para que completes tu pedido.');
    }
}

// Función para configurar el modo oscuro
function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        if (themeToggleMobile) themeToggleMobile.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        if (themeToggleMobile) themeToggleMobile.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }
}

// Función para inicializar la aplicación
async function initApp() {
    // Obtener elementos del menú
    menuItems = await fetchMenuItems();
    
    // Renderizar menú si estamos en la página de menú
    if (menuContainer && menuItems.length > 0) {
        renderMenuItems();
    }
    
    // Inicializar el contador del carrito
    updateCartCount();
    
    // Configurar eventos del carrito
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            openCartModal();
        });
    }
    
    // Evento para cerrar el carrito
    document.querySelector('.close-cart')?.addEventListener('click', closeCartModal);
    
    // Evento para el botón de realizar pedido
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout();
        });
    }
    
    // Menú hamburguesa
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Cerrar menú al hacer clic en un enlace
    if (mobileMenu) {
        const navItems = mobileMenu.querySelectorAll('.nav-item a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Cambiar estilo del header al hacer scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
                header.style.height = '70px';
            } else {
                header.style.boxShadow = 'none';
                header.style.height = '90px';
            }
        }
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
        if (mobileMenu && menuToggle) {
            const isMenuOpen = mobileMenu.classList.contains('active');
            const isClickInsideMenu = mobileMenu.contains(e.target);
            const isClickOnToggle = menuToggle.contains(e.target);
            
            if (isMenuOpen && !isClickInsideMenu && !isClickOnToggle) {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Efecto de animación para el botón de WhatsApp
    const whatsappLinks = document.querySelectorAll('.whatsapp-link');
    whatsappLinks.forEach(link => {
        link.addEventListener('mouseover', () => {
            const icon = link.querySelector('i');
            icon.style.animation = 'pulse 1.5s infinite';
        });
        
        link.addEventListener('mouseout', () => {
            const icon = link.querySelector('i');
            icon.style.animation = '';
        });
    });
    
    // Modo oscuro
    // Inicializar tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setTheme(true);
    } else {
        setTheme(false);
    }
    
    // Eventos para botones de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            setTheme(!isDark);
        });
    }
    
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            setTheme(!isDark);
        });
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initApp);