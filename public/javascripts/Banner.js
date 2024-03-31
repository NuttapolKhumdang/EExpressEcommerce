class Banner {
    constructor(container = document.getElementById(), data = [{ image, link }]) {
        this.section = container.querySelector("section");
        this.bleft = container.querySelector("div#b_left");
        this.bright = container.querySelector("div#b_right");
        this.renderingIndex = 0;
        this.data = data;
        this.datalength = data.length;
        this.child = null;

        this.bleft.addEventListener("click", () => this.prev());
        this.bright.addEventListener("click", () => this.next());

        this.intervalTime = 4000;
        this.interval = setInterval(() => this.next(), this.intervalTime);
    }

    prev() {
        if (this.renderingIndex - 1 == -1) this.renderingIndex = this.datalength;

        this.child.forEach(e => e.classList.remove('a'));
        this.child[--this.renderingIndex].classList.add("a");
        return this.renderingIndex;
    }

    next() {
        if (this.renderingIndex + 1 == this.datalength) this.renderingIndex = -1;

        this.child.forEach(e => e.classList.remove('a'));
        this.child[++this.renderingIndex].classList.add("a");
        return this.renderingIndex;
    }

    render() {
        const child = this.data.map(e => {
            const div = document.createElement("div");
            const img = document.createElement("img");
            img.src = e.image;
            div.insertAdjacentElement("beforeend", img);
            return div;
        });

        child.forEach(e => this.section.insertAdjacentElement("beforeend", e));
        child[0].classList.add("a");
        this.child = child;
    }
};