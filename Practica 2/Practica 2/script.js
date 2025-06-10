// JavaScript para el menú hamburguesa
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Deshabilitar scroll cuando el menú está abierto
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
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.getElementById('menuToggle');
    
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

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelectorAll('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');

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
                const id = parseInt(e.target.dataset.id);
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

// Evento para el ícono del carrito
if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCartModal();
    });
}

// Evento para cerrar el carrito
document.querySelector('.close-cart')?.addEventListener('click', closeCartModal);

// Evento para el botón de realizar pedido (WhatsApp)
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const phoneNumber = '573204045564';
        let message = '¡Hola! Quiero hacer un pedido:%0A%0A';
        
        cart.forEach(item => {
            message += `- ${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}%0A`;
        });
        
        message += `%0ATotal: $${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}`;
        
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    });
}

// Modo oscuro
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');

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

// Inicializar el contador del carrito
updateCartCount();

document.addEventListener('DOMContentLoaded', () => {
    // Actualizar enlaces de contacto en el header
    const contactLinks = document.querySelectorAll('.nav-item a[href="#"]');
    contactLinks.forEach(link => {
        if (link.textContent.includes('Contacto')) {
            link.href = 'contact.html';
        }
    });
})

// Actualizar enlaces en el menú móvil
    const mobileContactLinks = document.querySelectorAll('.mobile-menu .nav-item a');
    mobileContactLinks.forEach(link => {
        if (link.textContent.includes('Contacto')) {
            link.href = 'contact.html';
        }
    });