const AlertType = {
    ERROR: 'ERROR',
    INFO: 'INFO',
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
        const message = document.createElement("p");
        const button = document.createElement("button");
        const close = document.createElement("span");

        close.classList.add("material-icons-outlined")
        close.insertAdjacentHTML("beforeend", "close");
        button.insertAdjacentElement("beforeend", close);
        message.classList.add("sans");
        message.insertAdjacentHTML("beforeend", this.message);

        container.classList.add("webstatic", "alert-message-container", this.alertType);
        container.insertAdjacentElement("beforeend", document.createElement("div"));
        container.insertAdjacentElement("beforeend", message);
        container.insertAdjacentElement("beforeend", button);

        document.body.insertAdjacentElement("afterbegin", container);

        button.addEventListener("click", () => { this.remove() });
        if (this.alwayon) document.addEventListener("scroll", () => {
            if (window.scrollY == 0) container.classList.remove("follow");
            else container.classList.add("follow");
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
