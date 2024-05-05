const AlertType = {
    ERROR: "ERROR",
    INFO: "INFO",
}

class Alert {
    constructor(message = "", alertType = AlertType.INFO, alwayon = false, timeout = 0) {
        this.message = message;
        this.timeout = timeout;
        this.alertType = alertType;
        this.alwayon = alwayon;
        this.container;

        this.render();
    }

    render() {
        const container = document.createElement("header");
        const div = document.createElement("div");
        const message = document.createElement("p");
        const button = document.createElement("button");
        const close = document.createElement("span");

        close.classList.add("material-icons-outlined")
        close.insertAdjacentHTML("beforeend", "close");
        button.classList.add("h-8", "w-8", "flex", "items-center", "justify-center", "hover:bg-white", "hover:text-gray-950", "duration-100");
        button.insertAdjacentElement("beforeend", close);
        message.classList.add("font-sans", "font-bold");
        message.insertAdjacentHTML("beforeend", this.message);

        div.insertAdjacentElement("beforeend", message);
        div.insertAdjacentElement("beforeend", button);
        div.classList.add("grid", "w-full", "max-w-6xl", "grid-cols-[1fr_2rem]", "min-h-8", "place-items-center")

        container.insertAdjacentElement("beforeend", div);
        container.classList.add("flex", "h-max", "w-full", "items-center", "justify-center", "text-gray-50", this.alertType == 'ERROR' ? 'bg-rose-800' : 'bg-teal-800');
        document.body.insertAdjacentElement("afterbegin", container);

        button.addEventListener("click", () => { this.remove() });
        if (this.alwayon) document.addEventListener("scroll", () => {
            if (window.scrollY == 0) container.classList.remove("sticky", "top-16");
            else container.classList.add("sticky", "top-16");
        });

        if (this.timeout !== 0) setTimeout(() => this.remove(), this.timeout);
        this.container = container;
    }

    remove() {
        this.container.style.overflow = "hidden";
        this.container.style.transition = "160ms";
        this.container.style.height = 0;
        setTimeout(() => this.container.remove(), 320);
    }
}
