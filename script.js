const furniture = document.querySelector(".furniture-card");

// Getting products
class Products {
    async getItems() {
        try {
            let res = await fetch("./assests/json/product.json");
            let data = await res.json();

            let products = data.items;
            // console.log(products);
            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}
// cart
const cartContent = document.querySelector(".cart-content");
const cartStruct = document.querySelector(".cart-struct");
const cartItems = document.querySelector(".cart-items"); //the dynamic div
const clearCartBtn = document.querySelector(".clear-cart");
const cartTotal = document.querySelector(".cart-total");
const cartDOM = document.querySelector(".cart");
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".cart-close");
let cart = [];
let Allbuttons = [];

class UI {
    // Display products
    displayItems(products) {
        let result = "";
        // console.log(products);
        products.forEach((product) => {
            // console.log(product);
            result += `
            <div class="product">
              <div class="img-container">
                <img
                  src=${product.image}
                  alt="product"
                  class="product-img"
                />
                <button class="bag-btn btn" data-id=${product.id}>
                <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                add to cart     
                </button>
              </div>
              <h3>${product.title}</h3>
              <h4>Price: $ ${product.price}</h4>
            </div>`;
        });
        try {
            furniture.innerHTML = result;
        } catch (e) {
            console.log(`Error = ${e}`);
        }
    }
    getBagButton() {
        // through rest operator select all
        const buttons = [...document.querySelectorAll(".bag-btn")];

        Allbuttons = buttons;

        buttons.forEach((button) => {
            // which btn is clicked
            let id = button.dataset.id;
            let inCart = cart.find((item) => {
                item.id === id;
            });

            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            } else {
                button.addEventListener('click', (e) => {
                    e.target.innerText = "In cart";
                    e.target.disabled = true;
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };
                    cart = [...cart, cartItem];
                    Storage.saveCart(cart); //save
                    // set cart value
                    this.setCartValues(cart);

                    // displaying the cart item
                    this.addCartItem(cartItem);

                    // showing
                    this.showCart();
                })
            }
        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })

        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild;
                removeItem.parentElement.parentElement;
                this.removeItem(id);
            }
        });
    }
    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach((id) => this.removeItem(id));
        console.log(cartContent.children);

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id) {
        return Allbuttons.find((button) => button.dataset.id === id);
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML =
            `
        <img src= ${item.image} class= "product_img"/>
        <div>
              <h4>${item.title}</h4>
              <h5>Price : $ ${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
       `
        cartContent.appendChild(div);
    }
    showCart() {
        cartStruct.classList.add("transparentBG");
        cartDOM.classList.add("showCart");
    }

    hideCart() {
        cartStruct.classList.remove("transparentBG");
        cartDOM.classList.remove("showCart");
    }

    setUp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);

        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach((item) => {
            this.addCartItem(item);
        });
    }
}


// TODO: local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    // getProduct() method
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }

    // ? save cart item local storage
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // ? get cart item local storage
    static getCart() {
        return localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}


// Event listener
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const items = new Products();
    ui.setUp();

    items.getItems().then((item) => {
        ui.displayItems(item);
        Storage.saveProducts(item);
    }).then(() => {
        ui.getBagButton();
        ui.cartLogic();
    })
});