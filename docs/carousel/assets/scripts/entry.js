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
        this.debounce = {
            snapCarousel: this.debouncify(this.snapCarousel, 50),
        };

        this.carousel = {
            timer: null,
            index: 0,
        };
        this.carousel2 = {
            timer: null,
            index: 0,
        };
    }

    /**
     * when Intaractive
     */
    onReady() {
        this.cacheElements();
        this.addEvents();
        this.startCarousel();
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

        const carousel2 = {
            wrapper: document.querySelector('.js-carousel2__item-wrapper'),
            prev: document.querySelector('.js-carousel2__button.-prev'),
            next: document.querySelector('.js-carousel2__button.-next'),
            indicators: document.querySelectorAll('.js-carousel2__indicator'),
            viewport: document.querySelector('.js-carousel2__viewport'),
        };

        this.ui = { root, header, headerTop, navs, carousel, carousel2 };
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

        this.ui.carousel2.prev.addEventListener('click', e => this.onCarousel2PrevClicked(e), false);
        this.ui.carousel2.next.addEventListener('click', e => this.onCarousel2NextClicked(e), false);

        this.carousel2.scrollEventHandler = e => this.onCarousel2Scrolled(e);
        this.ui.carousel2.viewport.addEventListener('scroll', this.carousel2.scrollEventHandler, false);
    }

    onCarousel2Scrolled(e) {
        clearTimeout(this.carousel2.timer);
        this.carousel2.timer = setTimeout(() => {
            this.ui.carousel2.next.click();
        }, 5000);

        this.debounce.snapCarousel();
    }

    snapCarousel() {
        const index = this.carousel2.index;
        const scrollX = this.ui.carousel2.viewport.scrollLeft;
        const style = this.ui.carousel2.viewport.style;

        let afterIndex;
        if (scrollX < 160) {
            afterIndex = 0;
        } else if (scrollX > 480) {
            afterIndex = 2;
        } else {
            afterIndex = 1;
        }

        if (scrollX % 320 !== 0) {
            this.ui.carousel2.viewport.removeEventListener('scroll', this.carousel2.scrollEventHandler);
            scrollXTo(
                this.ui.carousel2.viewport,
                afterIndex * 320,
                300,
                'easeInOutQuad',
            );
            Array.from(this.ui.carousel2.indicators).forEach((indicator, i) => {
                if (afterIndex === i) {
                    indicator.classList.add('-active');
                } else {
                    indicator.classList.remove('-active');
                }
            });
            this.carousel2.index = afterIndex;
            this.ui.carousel2.viewport.addEventListener('scroll', this.carousel2.scrollEventHandler);

        }
    }

    startCarousel() {
        this.carousel.timer = setTimeout(() => {
            this.ui.carousel.next.click();
        }, 5000);

        this.carousel2.timer = setTimeout(() => {
            this.ui.carousel2.next.click();
        }, 5000);
    }

    moveCarousel(isPrev) {
        clearTimeout(this.carousel.timer);
        this.carousel.timer = setTimeout(() => {
            this.ui.carousel.next.click();
        }, 5000);

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

    scrollCarousel(isPrev) {
        clearTimeout(this.carousel2.timer);
        this.carousel2.timer = setTimeout(() => {
            this.ui.carousel2.next.click();
        }, 5000);

        const wrapper = this.ui.carousel2.wrapper;
        const stopTransition = '-stop-transition';

        if (!wrapper.classList.contains(stopTransition)) {
            return;
        }

        const beforeIndex = this.carousel2.index;

        let afterIndex = beforeIndex + (isPrev ? -1 : 1);
        if (afterIndex < 0) {
            afterIndex = 2;
        } else if (afterIndex > 2) {
            afterIndex = 0;
        }

        wrapper.classList.remove(stopTransition);

        scrollXTo(
            this.ui.carousel2.viewport,
            afterIndex * 320,
            300,
            'easeInOutQuad',
            () =>  wrapper.classList.add(stopTransition),
        );

        Array.from(this.ui.carousel2.indicators).forEach((indicator, i) => {
            if (afterIndex === i) {
                indicator.classList.add('-active');
            } else {
                indicator.classList.remove('-active');
            }
        });

        this.carousel2.index = afterIndex;
    }

    onCarouselPrevClicked(e) {
        this.moveCarousel(true);
    }

    onCarouselNextClicked(e) {
        this.moveCarousel(false);
    }

    onCarousel2PrevClicked(e) {
        this.scrollCarousel(true);
    }

    onCarousel2NextClicked(e) {
        this.scrollCarousel(false);
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

    debouncify(callback, interval = 300) {
        let timer;
        return ((...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                callback.apply(this, args);
            }, interval);
        });
    }
}

function scrollXTo(element, x, duration, easingName, callback) {
    const startTime = performance.now();
    const from = element.scrollLeft;

    function scroll(timestamp) {
        const time = Math.min(1, ((timestamp - startTime) / duration));
        const easedTime = easing[easingName](time);
        const easedX = (easedTime * (x - from)) + from;

        element.scrollTo(easedX, 0);

        if (time < 1) {
            requestAnimationFrame(scroll);
        } else if(callback) {
            element.scrollTo(x, 0);
            callback();
        }
    }

    requestAnimationFrame(scroll)
}

const easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) +1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 -8 * (--t) * t *  t * t,
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t  => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    easeOutCirc: t => Math.sqrt(1 - ( --t * t )),
};


const portalApp = new PortalApp();
portalApp.initialize();
