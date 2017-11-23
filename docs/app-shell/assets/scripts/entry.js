/**
 * Potral class
 */
class PortalApp {
    /**
     * constructor
     */
    constructor() {
        /** @property {Object} ui - cached elements */
        this.ui = {};

        /** @property {Number} scrollPosition - scroll position */
        this.scrollPosition = 0;

        /** @property {Number} scrollPosition - scroll direction */
        this.scrollDirection = 0;

        /** @property {Number} scrollPosition - scroll distance */
        this.scrollDistance = 0;

        /** @property {boolean} scrollShrinked - scroll shrinked */
        this.scrollShrinked = false;

        /** @property {Number} throttle - throttled methods */
        this.throttle = {
            updateHeader: this.throttlify(this.updateHeader),
        };
    }

    /**
     * when Intaractive
     */
    onReady() {
        this.cacheElements();
        this.addEvents();
    }

    /**
     * when cliecked nav
     *
     * @param {Event} e - event
     */
    onNavClick(e) {
        const target = e.currentTarget;
    }

    /**
     * when scrolled
     */
    onScroll(e) {
        this.updateModel();
        this.updateHeader();
    }

    /**
     * initialize
     */
    initialize() {
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', () => onReady(), false);
        } else {
            this.onReady();
        }
    }

    updateModel() {
        const min = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        const position = (() => {
            let y = window.pageYOffset;
            if (y < min) {
                y = min;
            } else if (y > max) {
                y = max;
            }
            return y;
        })();

        const direction = position > this.scrollPosition ? 1 : -1;
        const distance = (() => {
            let y = direction === this.scrollDirection ? this.scrollDistance : 0;
            y += Math.abs(position - this.scrollPosition);
            return y;
        })();

        const shrinked = (() => {
            const height = this.ui.headerTop.scrollHeight;
            let s = this.scrollShrinked;

            if (distance < height) {
                return s;
            }

            if (!s && direction > 0) {
                return true;
            }

            if (s && direction < 0) {
                return false;
            }

            return s;
        })();


        this.scrollPosition = position;
        this.scrollDirection = direction;
        this.scrollDistance = distance;
        this.scrollShrinked = shrinked;
    }

    /**
     * cache elements
     */
    cacheElements() {
        const root = document.querySelector('.app');
        const header = root.querySelector('.header');
        const headerTop = header.querySelector('.header__top');
        const navs = Array.from(header.querySelectorAll('.header__nav-item'));

        this.ui = { root, header, headerTop, navs };
    }

    /**
     * add events
     */
    addEvents() {
        const navs = this.ui.navs;

        window.addEventListener('scroll', e => this.onScroll(e), false);

        navs.forEach((nav) => {
            nav.addEventListener('click', e => this.onNavClick(e), false);
        });
    }

    /**
     * update header
     */
    updateHeader() {
        const shrink = this.scrollShrinked;
        const header = this.ui.header;
        const method = shrink ? 'add' : 'remove';
        header.classList[method]('-shrink');
    }

    /**
     * throttle func
     */
    throttlify(callback, interval = 300) {
        let lastTime = new Date().getTime() - interval;
        let timer;
        return (...args) => {
            const now = new Date().getTime();
            if ((lastTime + interval) <= now) {
                lastTime = now;
                callback.apply(this, args);
                return;
            }
            clearTimeout(timer);
            timer = setTimeout(() => callback.apply(this, args), interval);
        };
    }
}

const portalApp = new PortalApp();
portalApp.initialize();
