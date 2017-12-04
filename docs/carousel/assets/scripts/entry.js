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

        this.carousel = {
            index: 0,
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

        const carousel = {
            wrapper: document.querySelector('.js-carousel__item-wrapper'),
            prev: document.querySelector('.js-carousel__button.-prev'),
            next: document.querySelector('.js-carousel__button.-next'),
            indicators: document.querySelectorAll('.js-carousel__indicator'),
        };

        this.ui = { root, header, headerTop, navs, carousel };
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

        this.ui.carousel.prev.addEventListener('click', e => this.onCarouselPrevClicked(e), false);
        this.ui.carousel.next.addEventListener('click', e => this.onCarouselNextClicked(e), false);
    }

    moveCarousel(isPrev) {
        const wrapper = this.ui.carousel.wrapper;
        const stopTransition = '-stop-transition';

        if (!wrapper.classList.contains(stopTransition)) {
            return;
        }

        const direction = isPrev ? '-prev' : '-next';
        const beforeIndex = this.carousel.index;

        let afterIndex = beforeIndex + (isPrev ? -1 : 1);
        if (afterIndex < 0) {
            afterIndex = 2;
        } else if (afterIndex > 2) {
            afterIndex = 0;
        }

        const onTransitionEnd = (e) => {
            wrapper.classList.add(stopTransition);
            wrapper.classList.remove(direction);

            if (afterIndex <= 0) {
                wrapper.classList.remove('-right');
                wrapper.classList.add('-left');
            } else if (afterIndex >= 2) {
                wrapper.classList.remove('-left');
                wrapper.classList.add('-right');
            } else {
                wrapper.classList.remove('-left', '-right');
            }

            wrapper.removeEventListener('transitionend', onTransitionEnd);
        };

        wrapper.addEventListener('transitionend', onTransitionEnd, false);

        wrapper.classList.remove(stopTransition);
        wrapper.classList.add(direction);

        Array.from(this.ui.carousel.indicators).forEach((indicator, i) => {
            if (afterIndex === i) {
                indicator.classList.add('-active');
            } else {
                indicator.classList.remove('-active');
            }
        });

        this.carousel.index = afterIndex;
    }

    onCarouselPrevClicked(e) {
        this.moveCarousel(true);
    }

    onCarouselNextClicked(e) {
        this.moveCarousel(false);
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
