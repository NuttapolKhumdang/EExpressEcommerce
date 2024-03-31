function createCartviewItem({ id, product, option, quantity } = e) {
    return /*html*/`<div>
        <img src="/images/${product.images[option.imageindex ? option.imageindex : 0]}">

        <h4 class="sans">
            <a href="/${product.search}?option=${option.id}">${product.name} &mdash; ${option.title}</a>
        </h4>

        <div>
            <p class="display">
                <span>${quantity} x</span>
                <span>${option.price}</span>
            </p>

            <menu>
                <button onclick="cart.remove('${id}')"><span class="material-icons-outlined">delete</span></button>
            </menu>
        </div>
    </div>`;
}

class Cart {
    constructor(cartcontainer = document.getElementById(), container = document.getElementById()) {
        this.cartlist = getLocalStorage('cart', true) ?? [];
        this.cartcontainer = cartcontainer;
        this.container = container;
        this.promotion = null;
        this.emptyContainer = `<span class="sans">ยังไม่มีสินค้าในตะกร้า</span>`;

        this.summaryChild = {
            subtotal: cartcontainer.querySelector("p#subtotal"),
            shiping: cartcontainer.querySelector("p#shiping"),
            discount: cartcontainer.querySelector("p#discount"),
            total: cartcontainer.querySelector("p#total"),
        }

        this.summaryData = {
            subtotal: 0,
            shiping: 0,
            discount: 0,
            total: 0,
        }

        this.render();
    }

    add(product = { id: String, name: String, image: String, link: String },
        option = { id: String, title: String, price: Number },
        quantity = 1
    ) {
        const cartitem = {
            id: uuidv4(),
            product,
            option,
            quantity
        }

        this.cartlist.push(cartitem);
        this.update();
        return cartitem;
    }

    remove(id) {
        this.cartlist = this.cartlist.filter(e => e.id != id);
        this.update();
    }

    render() {
        this.container.innerHTML = "";
        this.summaryData.subtotal = 0;
        this.summary(true);

        this.cartlist.forEach(e => {
            const t = createCartviewItem(e);
            this.container.insertAdjacentHTML("beforeend", t);
            this.summaryData.subtotal += e.option.price * e.quantity;
        });

        this.applyPromotion(this.promotion, false);
        this.summaryData.total = (this.summaryData.subtotal - this.summaryData.discount) + this.summaryData.shiping;

        this.setSummary(this.summaryChild.subtotal, this.summaryData.subtotal);
        this.setSummary(this.summaryChild.discount, this.summaryData.discount);
        this.setSummary(this.summaryChild.shiping, this.summaryData.shiping);
        this.setSummary(this.summaryChild.total, this.summaryData.total);

        if (this.cartlist.length == 0) {
            this.container.innerHTML = this.emptyContainer;
            this.summary(false);
        }
    }

    applyPromotion(promo, render = true) {
        if (!promo) return;

        if (promo.discountByPercen)
            this.summaryData.discount = this.summaryData.subtotal * (promo.discount / 100);
        else
            this.summaryData.discount = promo.discount;

        if (promo.maximumDiscount && this.summaryData.discount > promo.maximumDiscount)
            this.summaryData.discount = promo.maximumDiscount;

        if (promo.minimumPrice && this.summaryData.subtotal < promo.minimumPrice) {
            new Alert("การใช้โปรโมชั่นนี้สินค้าต้องมีราคา " + promo.minimumPrice + " บาทขึ้นไป", AlertType.ERROR);
            this.summaryData.discount = 0;
        }

        if (render) this.render();
    }

    applyDiscardCode(code) {
        fetch('/api/promocode/' + code)
            .then(res => res.json())
            .then(json => {
                console.log(json);

                if (json.status === 200 && json?.promo?._id) {
                    const promo = json.promo;
                    this.promotion = promo;

                    this.applyPromotion(promo);
                } else {
                    return new Alert("รหัสส่วนลดไม่สามารถใช้งานได้ โปรโมชั่นนี้อาจหมดอายุแล้ว โปรดตรวจสอบความถูกต้องแล้วลองอีกครั้ง", AlertType.ERROR);
                }
            }).catch(e => {
                return new Alert("เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง", AlertType.ERROR);
            });
    }

    setSummary(k, v) {
        k.innerHTML = v;
    }

    summary(show = false) {
        if (show) this.cartcontainer.querySelector("summary").classList.remove("hide");
        else this.cartcontainer.querySelector("summary").classList.add("hide");
    }

    update() {
        this.render();
        setLocalStorage('cart', this.cartlist, true);
    }
}