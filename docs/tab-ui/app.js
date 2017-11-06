/**
 * スロットル関数
 */
function createThrottle() {
    let resizeTimer;
    return ((callback, interval = 300) => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            return callback();
        }, interval);
    });
}

/**
 * ニュース
 */
class News {
    /**
     * @property {string} BLOCK - ブロック
     */
    static get BLOCK() {
        return 'News';
    }

    /**
     * コンストラクタ
     *
     * @param {Object} classes - エレメント定義
     */
    constructor(classes) {
        this.el = document.querySelector(`.${News.BLOCK}`);
        this.tabIndex = this.el.querySelector(`.${News.BLOCK}__${classes.tabIndex}`);
        this.tabBar = this.el.querySelector(`.${News.BLOCK}__${classes.tabBar}`);
        this.tabBarInner = this.tabBar.querySelector(`.${News.BLOCK}__${classes.tabBarInner}`);
        this.tabDecorator = this.tabBar.querySelector(`.${News.BLOCK}__${classes.tabDecorator}`);
        this.tabList = this.tabBarInner.querySelector(`.${News.BLOCK}__${classes.tabList}`);
        this.tabItems = this.tabList.querySelectorAll(`.${News.BLOCK}__${classes.tabItems}`);
        this.tabPanelList = this.el.querySelector(`.${News.BLOCK}__${classes.tabPanelList}`);
        this.tabPanelItems = this.tabPanelList.querySelectorAll(`.${News.BLOCK}__${classes.tabPanelItems}`);
    }

    /**
     * 初期化
     */
    initialize() {
        const defaultIndex = Number(this.tabIndex.value) || 0;
        const defaultTabItem = this.tabItems[defaultIndex];

        this.throttle = createThrottle();

        this.updateTabIndex(defaultIndex);
        this.scrollTabBarInner(defaultTabItem);
        this.initializeTabDecorator(defaultTabItem.offsetLeft, defaultTabItem.offsetWidth);
        this.initializeTabItems();
    }

    /**
     * マーカーを初期化
     *
     * @param {Number} left - X座標
     * @param {Number} wdith - 横幅
     */
    initializeTabDecorator(left, width) {
        const tabDecorator = this.tabDecorator;

        this.transformDecorator(left, width);

        // アニメーションしないようにタイミングをずらす
        requestAnimationFrame(() => {
            tabDecorator.classList.add('-ready');
        });
    }

    /**
     * タブを初期化(イベントハンドラをバインド)
     */
    initializeTabItems() {
        const tabItems = this.tabItems;
        Array.from(tabItems).forEach(tabItem => {
            tabItem.addEventListener('click', e => this.onClickTabItem(e));
        });
        window.addEventListener('resize', (e) => this.onWindowResize(e));
    }

    /**
     * マーカーの移動
     *
     * @param {Number} left - X座標
     * @param {Number} wdith - 横幅
     */
    transformDecorator(left, width) {
        this.tabDecorator.style.transform = `translateX(${left}px) scaleX(${width})`;
    }

    /**
     * タブを更新する
     *
     * @param {Number} tabItemIndex
     */
    updateTabIndex(tabItemIndex) {
        this.tabIndex.value = tabItemIndex;
        this.updateActiveTabItem(tabItemIndex);
        this.updateActiveTabPanelItem(tabItemIndex);
    }

    /**
     * タブをアクティブにする
     *
     * @param {Number} index - インデックス
     */
     updateActiveTabItem(index) {
        Array.from(this.tabItems).forEach((tabItem, tabItemIndex) => {
            if (tabItemIndex === index) {
                tabItem.classList.add('-active');
            } else {
                tabItem.classList.remove('-active');
            }
        });
    }

    /**
     * タブパネルをアクティブにする
     *
     * @param {Number} index - インデックス
     */
    updateActiveTabPanelItem(index) {
        Array.from(this.tabPanelItems).forEach((tabPanelItem, tabPanelItemIndex) => {
            if (tabPanelItemIndex === index) {
                tabPanelItem.classList.add('-active');
            } else {
                tabPanelItem.classList.remove('-active');
            }
        });
    }

    /**
     * 指定したタブが真ん中に来るように横スクロール
     *
     * @param {Element} tabItem - タブ
     */
    scrollTabBarInner(tabItem) {
        const tabBarInner = this.tabBarInner;
        let distance = (tabItem.offsetLeft + (tabItem.offsetWidth / 2)) - tabBarInner.scrollLeft - (window.innerWidth / 2);
        const maxScrollLeft = distance > 0 ? tabBarInner.scrollWidth - window.innerWidth : 0;
        const expectedScrollLeft = tabBarInner.scrollLeft + distance + (tabItem.scrollHeight / 2);
        if ((distance > 0 && expectedScrollLeft > maxScrollLeft) || (distance < 0 && expectedScrollLeft < maxScrollLeft)) {
            distance = maxScrollLeft - tabBarInner.scrollLeft;
        }

        const start = tabBarInner.scrollLeft;
        const duration = 300;
        const delay = 0;
        const max = tabBarInner.scrollWidth - window.innerWidth;
        let timeStart, timeElapsed;

        requestAnimationFrame((time) => {
            timeStart = time;
            loop(time);
        });

        function loop(time) {
            timeElapsed = time - timeStart;

            const scrollLeft = easeOutExpo(timeElapsed, start, distance, duration);
            tabBarInner.scrollLeft = scrollLeft;

            if (timeElapsed < duration) {
                requestAnimationFrame(loop)
            } else {
                tabBarInner.scrollLeft = start + distance;
            }
        }

        function easeOutExpo(t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        }
    }

    /**
     * タブがクリックされたとき
     *
     * @param {Event} e - イベント
     */
    onClickTabItem(e) {
        const tabBarInner = this.tabBarInner;
        const tabItem = e.currentTarget;
        const tabItemIndex = Array.from(this.tabItems).indexOf(tabItem);

        this.transformDecorator(tabItem.offsetLeft, tabItem.offsetWidth);
        this.updateTabIndex(tabItemIndex);
        this.scrollTabBarInner(tabItem);
    }

    /**
     * ウィンドウがリサイズされたとき
     */
    onWindowResize() {
        this.throttle(() => {
            const tabItem = this.tabItems[this.tabIndex.value];
            this.transformDecorator(tabItem.offsetLeft, tabItem.offsetWidth);
            this.scrollTabBarInner(tabItem);
        }, 300);
    }
}
