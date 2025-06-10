// Datos de los platos (ejemplo) 
const menuItems = [
    {
        id: 1,
        name: "Poke Crispy",
        description: "Pollo apanado con una base de arroz blanco con ajonjolí, aguacate en cubos, lechuga crespa, tomates cherry y maiz asado.",
        description2: "Incluye Salsa Picante.",  
        price: 17.5,
        image: "Imagenes/pexels-deruzzi-6546181.jpg"
    },
    {
        id: 2,
        name: "Poke Guajiro",
        description: "Chivo guisado acompañado de arroz de frijol guajiro, chips de plátano, aguacate y ensalada de payaso",
        description2: "",  
        price: 18.0,
        image: "Practica 2/Practica 2/Imagenes/poke-de-salmongettyimages-1663600349[1].jpg"
    },
    {
        id: 3,
        name: "Poke Tonkatsu",
        description: "Lomo de cerdo apanado con una base de arroz, aguacte, coliflor al vapor, mango y repollo. SALSA TONKATSU.",
        description2: "Incluye Salsa Tonkatsu.",  
        price: 18.0,
        image: "Practica 2/Practica 2/Imagenes/photo-1597958792579-bd3517df6399[1].jpg"
    },
    {
        id: 4,
        name: "Poke Mediterraneo",
        description: "Pechuga de pollo asado con arroz, pepino, tomate, aceitunas, lechuga crespa con lentejas crocantes. SALSA GRIEGA",
        description2: "",  
        price: 16.5,
        image: "Practica 2/Practica 2/Imagenes/f57867c82ce62ebd841b0a13ccdae86d[1].jpg"
    },
];

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menuContainer');
    
    if (menuContainer) {
        menuItems.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.classList.add('menu-item');
            menuItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-item-img">
                <div class="menu-item-info">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p class="menu-item-desc">${item.description}</p>
                    <!-- SUBPÁRRAFO AÑADIDO PARA SEGUNDA DESCRIPCIÓN -->
                    <p class="menu-item-desc2">${item.description2}</p>
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
        
        // ... (el resto del código se mantiene igual)
        // Eventos para añadir al carrito
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
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
                const id = parseInt(e.target.dataset.id);
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
});