function loadimage(pid, index) {
    return `/images/products/${pid}/${imagefile[index]}`;
}

function createOptionTemplate(pid = "", index = 0, title = "", price = "", optionId = uuidv4(), imageindex = "", imagepreview = null) {
    //  /*html*/`
    //     <div class="options" id="${optionId}">
    //         <button type="button" onclick="pOptions.removeOption('${optionId}')"><span class="material-icons-outlined">delete</span></button>
    //         <section>
    //             <header class="mono">ตัวเลือก ${index + 1}</header>
    //             <menu>
    //                 ${imageindex
    //         ? /*html*/`<img src="${imagepreview ?? loadimage(pid, imageindex)}" onclick="selectOptionImage('${optionId}')">`
    //         : /*html*/`<button type="button" onclick="selectOptionImage('${optionId}')">
    //                 <span class="material-icons-outlined">art_track</span>
    //                 <p class="sans">เลือกรูปภาพสินค้า</p>
    //             </button>`}
    //             </menu>
    //         </section>
    //         <fieldset>
    //             <input type="hidden" id="imageindex" value="${imageindex}">
    //             <input type="hidden" id="optionid" value="${optionId}">
    //             <label for="title" class="mono">ชื่อตัวเลือก</label>
    //             <input type="text" id="title" class="sans" placeholder="ชื่อตัวเลือก" value="${title ? title : ''}">
    //             <label for="price" class="mono">ราคา</label>
    //             <input type="number" id="price" class="sans" placeholder="ราคา" min="0" value="${price ? price : ''}">
    //         </fieldset >
    //     </div >`;

    return /*html*/`<div id="${optionId}" class="options relative grid grid-cols-[16rem_1fr] gap-2 border-2 border-gray-950" >
        <button type="button" onclick="pOptions.removeOption('${optionId}')" class="absolute right-0 top-0 flex h-max w-max items-center justify-center border-b-2 border-l-2 border-gray-950 p-1 hover:bg-gray-950 hover:text-white" >
          <span class="material-icons-outlined">delete</span>
        </button>

        <section class="flex flex-col gap-2 p-4">
            <header class="font-mono text-lg">ตัวเลือก ${index + 1}</header>
                <menu>
                ${imageindex
            ? /*html*/` <img onclick="selectOptionImage('{{ option.id }}')" src="${imagepreview ?? loadimage(pid, imageindex)}" loading="lazy" alt="option image preview" class="h-auto max-h-48 w-full object-cover" />`
            : /*html*/` <button type="button" onclick="selectOptionImage('${optionId}')" class="flex min-h-12 w-full flex-row items-center justify-center gap-2 border-2 border-gray-950 hover:bg-gray-950 hover:text-white">
                            <span class="material-icons-outlined">art_track</span>
                            <p class="sans">เลือกรูปภาพสินค้า</p>
                        </button>`}
                </menu>
        </section>
        <fieldset class="flex h-full flex-col gap-4 border-l-2 border-gray-950 p-4">
            <input type="hidden" id="imageindex" value="${imageindex}">
            <input type="hidden" id="optionid" value="${optionId}">
          
            <label for="title" class="grid grid-cols-1 gap-2">
                <span class="w-max font-mono text-sm underline">ชื่อสินค้า</span>
                <input type="text" id="title" placeholder="ชื่อตัวเลือก" value="${title ? title : ''}" class="h-12 border-b-2 border-gray-950 py-4 font-sans outline-offset-4" />
            </label>

            <label for="price" class="grid grid-cols-1 gap-2">
                <span class="w-max font-mono text-sm underline">ราคา</span>
                <input type="number" id="price" placeholder="ราคา" min="0" value="${price ? price : ''}" class="h-12 border-b-2 border-gray-950 py-4 font-sans outline-offset-4" />
            </label>
        </fieldset>
    </div>`;
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