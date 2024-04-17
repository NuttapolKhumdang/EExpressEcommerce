function loadimage(pid, index) {
    return `/images/products/${pid}/${imagefile[index]}`;
}

function createOptionTemplate(pid = "", index = 0, title = "", price = "", optionId = uuidv4(), imageindex = "", imagepreview = null) {
    return /*html*/`
        <div class="options" id="${optionId}">
            <button type="button" onclick="pOptions.removeOption('${optionId}')"><span class="material-icons-outlined">delete</span></button>
            <section>
                <header class="mono">ตัวเลือก ${index + 1}</header>
                <menu>
                    ${imageindex
            ? /*html*/`<img src="${imagepreview ?? loadimage(pid, imageindex)}" onclick="selectOptionImage('${optionId}')">`
            : /*html*/`<button type="button" onclick="selectOptionImage('${optionId}')">
                    <span class="material-icons-outlined">art_track</span>
                    <p class="sans">เลือกรูปภาพสินค้า</p>
                </button>`}
                </menu>
            </section>
            <fieldset>
                <input type="hidden" id="imageindex" value="${imageindex}">
                <input type="hidden" id="optionid" value="${optionId}">
                <label for="title" class="mono">ชื่อตัวเลือก</label>
                <input type="text" id="title" class="sans" placeholder="ชื่อตัวเลือก" value="${title ? title : ''}">
                <label for="price" class="mono">ราคา</label>
                <input type="number" id="price" class="sans" placeholder="ราคา" min="0" value="${price ? price : ''}">
            </fieldset >
        </div >`;
}

class ProductOptions {
    constructor(container, product_id) {
        this.container = container;
        this.index = 0;
        this.result = [];
        this.timeout = 100;
        this.inputTimeout = setTimeout(() => { }, 0);
        this.product_id = product_id;

        this.update();
        this.listen();
    }

    listen() {
        const input = this.container.querySelectorAll("input");

        input.forEach((e = document.getElementById()) => {
            e.addEventListener("input", () => {
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => this.update(), this.timeout);
            });
        });
    }

    insertOption() {
        const template = createOptionTemplate(this.product_id, this.index);
        this.container.insertAdjacentHTML("beforeend", template);
        this.index++;
        this.update();
        this.listen();
    }

    removeOption(id) {
        if (this.container.children.length <= 1) return;

        this.result = this.result.filter(e => e.id != id);
        this.index = this.result.length;
        this.render();
    }

    render() {
        this.container.innerHTML = "";

        this.result.forEach((e, index) => {
            const template = createOptionTemplate(this.product_id, index, e?.title, e?.price, e.id, e.imageindex, e.imagepreview);
            this.container.insertAdjacentHTML("beforeend", template);
        });
        this.update();
    }

    update() {
        this.result = [];

        this.container.childNodes.forEach(e => {
            if (e.tagName === "DIV" && e.classList.contains('options')) {

                const title = e.querySelector("input#title").value;
                const price = e.querySelector("input#price").value;
                const id = e.querySelector("input#optionid").value;
                const imageindex = e.querySelector("input#imageindex").value;

                let imagepreview;
                try { imagepreview = e.querySelector("img").src; }
                catch { imagepreview = null; }

                const option = { title, price, id, imageindex, imagepreview };

                this.result.push(option);
            }
        });

        this.index = this.result.length;
    }

    getresult() {
        this.update();
        const result = this.result.map(e => {
            e.imagepreview = '';
            return e;
        });

        return result;
    }
}