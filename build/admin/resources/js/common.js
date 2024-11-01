class Slider {
    constructor(rangeElement, valueElement, options) {
        this.rangeElement = rangeElement;
        this.valueElement = valueElement;
        this.options = options;

        // Attach a listener to "change" event
        this.rangeElement.style.background = this.rangeElement.style = this.generateBackground(this.rangeElement.value)
        this.rangeElement.addEventListener('input', this.updateSlider.bind(this))
    }

    // Initialize the slider
    init() {
        this.rangeElement.setAttribute('min', this.options.min);
        this.rangeElement.setAttribute('max', this.options.max);
        this.rangeElement.setAttribute('step', this.options.step);
        this.rangeElement.value = this.options.cur;

        // console.log(this.options.cur)

        this.updateSlider()
    }

    // Format the money
    asUnit(value) {
        return parseFloat(value) + this.options.unit

    }

    generateBackground(rangeElement) {
        if (this.rangeElement.value === this.options.min) {
            return
        }

        let percentage = (this.rangeElement.value - this.options.min) / (this.options.max - this.options.min) * 100
        return `background: linear-gradient(to right, ${this.options.style.range} ` + percentage + `%, ${this.options.style.track} ` + percentage + `%, ${this.options.style.track} 100%)`
    }

    updateSlider(newValue) {
        if (this.valueElement) {
            this.valueElement.value = this.asUnit(this.rangeElement.value)
        }
        this.rangeElement.style = this.generateBackground(this.rangeElement.value)
    }
}


class CheckFunction {
    constructor(parent, children) {
        this.parent = parent;
        this.children = children;

        this.init(this.parent, this.children);
    }

    parentFunction() {
        const _parent = document.querySelector(this.parent);

        _parent.addEventListener('click', () => {
            const isChecked = _parent.checked;

            if (isChecked) {
                const _childrens = document.querySelectorAll(this.children);

                for (const _children of _childrens) {
                    _children.checked = true;
                }
            } else {
                const _childrens = document.querySelectorAll(this.children);

                for (const _children of _childrens) {
                    _children.checked = false;
                }
            }
        })
    }

    childrenFunction() {
        const _childrens = document.querySelectorAll(this.children);

        for (const children of _childrens) {
            children.addEventListener('click', () => {
                const totalCnt = _childrens.length;

                const checkedCnt = document.querySelectorAll(`${this.children}:checked`).length;

                if (totalCnt == checkedCnt) {
                    document.querySelector(this.parent).checked = true
                } else {
                    document.querySelector(this.parent).checked = false
                }
            })
        }
    }

    init() {
        this.parentFunction();
        this.childrenFunction();
    }


}




function handleChange(t) {
    const icon = t.children[0];
    const stateShow = icon.dataset.check;
    const stateHide = icon.dataset.uncheck;

    if (t.classList.contains('disabled')) {
        icon.className = `ico24 ${stateShow}`;
        t.classList.remove('disabled');
    } else {
        icon.className = `ico24 ${stateHide}`;
        t.classList.add('disabled')
    }
}

