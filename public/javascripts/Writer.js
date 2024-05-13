class WriterGetImage {
    constructor(callback = (filename = String) => { }) {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");

        input.onchange = async (e) => {
            const fd = new FormData();
            fd.append("image", e.target.files[0]);
            const res = await fetchJson("/article/image/" + DOCUMENT_ID, {
                method: "POST",
                body: fd,
            },);

            if (res.status === 201) return callback(res.filename);
            else new Alert(res.message, AlertType.ERROR, true);
        };

        input.click();
    }
}

class Writer {
    constructor(container = document.getElementById()) {
        this.container = container;
        this.select = null;

        this.update_timeout = 2000;
        this.timeout_object = setTimeout(() => { }, this.update_timeout);

        this.container.querySelectorAll("textarea").forEach((e) => {
            this.initTextInput(e);
        });

        this.container.querySelectorAll("img").forEach((e) => {
            this.initImage(e);
        });
    }

    unSelectImage() {
        SX_MENU_IMG_OPTIONS.classList.add("hidden");
        this.container
            .querySelectorAll("img")
            .forEach((e) => (e.classList = "border-2 border-transparent mb-2"));
    }

    initTextInput(obj = document.getElementById()) {
        obj.setAttribute(
            "style",
            "height:" + obj.scrollHeight + "px;overflow-y:hidden;",
        );
        obj.addEventListener("input", OnTextInput, false);
        obj.addEventListener("keydown", OnKeydown, false);
        obj.addEventListener("focus", (e) => {
            this.unSelectImage();
            this.select = obj;
        });

        obj.addEventListener("keypress", () => this.update(), false);
    }

    initImage(obj = document.getElementById()) {
        obj.addEventListener("click", (e) => {
            this.unSelectImage();
            obj.classList.remove("border-transparent");
            obj.classList.add("border-black", "rounded");

            this.select = obj;
            SX_MENU_IMG_OPTIONS.classList.remove("hidden");
        });
    }

    createTextInput(template) {
        const template_title = {
            heading: "หัวข้อ",
            subheading: "หัวข้อรอง",
            paragraph: "เนื้อความ",
        };

        const textarea = document.createElement("textarea");
        textarea.classList = template + " w-full resize-none bg-gray-100 px-2 py-4 min-h-12 h-auto";
        if (template == "heading")
            textarea.classList.add("text-4xl", "font-bold");
        if (template == "subheading")
            textarea.classList.add("text-2xl", "font-bold");

        textarea.setAttribute("placeholder", template_title[template]);
        this.initTextInput(textarea);

        return textarea;
    }

    replaceImage() {
        new WriterGetImage((filename) => {
            this.select.setAttribute("src", BASE_IMAGE_ROUTE + "/" + filename);
            this.update();
        });
    }

    removeImage() {
        this.select.remove();
        this.select = null;
        this.unSelectImage();
        this.update();
    }

    createImage() {
        new WriterGetImage((filename) => {
            const img = document.createElement("img");
            img.setAttribute("src", BASE_IMAGE_ROUTE + "/" + filename);

            img.classList = "border-2 border-transparent mb-2";

            this.select
                ? this.select.insertAdjacentElement("afterend", img)
                : this.container.insertAdjacentElement("beforeend", img);
            this.initImage(img);
            this.update();
        });
    }

    insert(template) {
        if (this.select && !["ARTICLE"].includes(this.select.parentElement.tagName)) return;
        let object;

        if (["paragraph", "heading", "subheading"].includes(template))
            object = this.createTextInput(template);
        if (template == "image") return this.createImage();

        this.select
            ? this.select.insertAdjacentElement("afterend", object)
            : this.container.insertAdjacentElement("beforeend", object);
        focus(object);
    }

    content() {
        const title = document.getElementById("article-title").value;
        const description = document.getElementById("article-description").value;
        const content = [];

        for (let child of this.container.children) {
            let data;

            if (child.tagName == "TEXTAREA" && child.value) {
                data = {
                    style: child.classList.toString().split(" ")[0],
                    text: child.value,
                };
            } else if (child.tagName == "IMG" && child.src) {
                data = {
                    tag: "img",
                    style: child.classList.toString(),
                    src: child.src.split("/").reverse()[0],
                };
            } else continue;

            content.push(data);
        }

        return { title, description, content };
    }

    update(update_route = writer_config?.update_route ?? "/article/writer/" + DOCUMENT_ID) {
        clearTimeout(this.timeout_object);
        SX_MENU_SAVING_OPTIONS.querySelector("#isloading").checked = true;

        this.timeout_object = setTimeout(() => fetch(update_route, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify(this.content())
        })
            .then((res) => res.json())
            .then((res) => { if (res.status !== 200) new Alert(res.message, AlertType.ERROR, true) })
            .catch((e) => {
                console.error(e);
                new Alert("เกิดข้อผิดพลาดบางอย่าง ลองอีกครั้งในภายหลัง", AlertType.ERROR, true);
            })
            .finally(() => {
                SX_MENU_SAVING_OPTIONS.querySelector("#isloading").checked = false;
            }),

            this.update_timeout,
        );
    }
}

function OnKeydown(k = new KeyboardEvent()) {
    if (k.code == "Backspace" && !this.value) {
        k.preventDefault();
        if (
            writer.container.children.length - 1 > 1 &&
            writer.select.parentElement.tagName == "ARTICLE"
        ) {
            let currentIndex = 0;
            for (let i = 0; i < writer.container.children.length; i++)
                if (writer.container.children[i] == this) currentIndex = i;
            focus(
                writer.container.children[
                currentIndex - 1 >= 0 ? currentIndex - 1 : 0
                ],
            );

            this.remove();
        }

        writer.update();
    }

    if (k.ctrlKey && k.code == "Enter") {
        k.preventDefault();
        if (writer.select.parentElement.tagName == "ARTICLE") writer.insert("paragraph");
    }

    if (
        (k.code == "ArrowUp" && this.selectionStart == 0) ||
        (k.ctrlKey && k.code == "ArrowUp")
    ) {
        let currentIndex = 0;
        for (let i = 0; i < writer.container.children.length; i++)
            if (writer.container.children[i] == this) currentIndex = i;
        focus(writer.container.children[currentIndex - 1 >= 0 ? currentIndex - 1 : 0]);
    }

    if (
        (k.code == "ArrowDown" && this.selectionStart == this.value.length) ||
        (k.ctrlKey && k.code == "ArrowDown")
    ) {
        let currentIndex = 0;
        for (let i = 0; i < writer.container.children.length; i++)
            if (writer.container.children[i] == this) currentIndex = i;
        focus(
            writer.container.children[
            currentIndex + 1 >= writer.container.children.length - 1
                ? writer.container.children.length - 1
                : currentIndex + 1
            ],
        );
    }
}

function OnTextInput() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
}

function focus(obj = document.getElementById()) {
    return obj.focus();
}

let writer = new Writer(WRITER_CONTAINER);