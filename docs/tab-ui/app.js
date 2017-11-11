/**
 * スロットル関数
 */
function createThrottle() {
    let resizeTimer;
    return ((callback, interval = 300) => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(callback, interval);
    });
}

/**
 * ニュース
 */
class News {
    /**
     * @property {string} ui - UI
     */
    static get ui() {
        return {
            block: 'News',
            overlay: `News__overlay`,
            tabIndex: `News__tab-index`,
            tabBar: `News__tab-bar`,
            tabBarInner: `News__tab-bar-inner`,
            tabDecorator: `News__tab-decorator`,
            tabList: `News__tab-list`,
            tabItem: `News__tab-item`,
            tabPanelList: `News__tab-panel-list`,
            tabPanelItem: `News__tab-panel-item`,
            link: `News__link`,
            article: `News__article`,
        }
    }

    /**
     * コンストラクタ
     *
     * @param {Object} classes - エレメント定義
     */
    constructor(classes) {
        this.block = document.querySelector(`.${News.ui.block}`);
        this.overlay = this.block.querySelector(`.${News.ui.overlay}`);
        this.tabIndex = this.block.querySelector(`.${News.ui.tabIndex}`);
        this.tabBar = this.block.querySelector(`.${News.ui.tabBar}`);
        this.tabBarInner = this.tabBar.querySelector(`.${News.ui.tabBarInner}`);
        this.tabDecorator = this.tabBar.querySelector(`.${News.ui.tabDecorator}`);
        this.tabList = this.tabBarInner.querySelector(`.${News.ui.tabList}`);
        this.tabItems = this.tabList.querySelectorAll(`.${News.ui.tabItem}`);
        this.tabPanelList = this.block.querySelector(`.${News.ui.tabPanelList}`);
        this.tabPanelItems = this.tabPanelList.querySelectorAll(`.${News.ui.tabPanelItem}`);
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
        this.initializeArticles();
    }

    /**
     * 記事を初期化
     */
    initializeArticles() {
        Array.from(this.tabPanelItems).forEach((tabPanelItem) => {
            const articles = tabPanelItem.querySelectorAll(`.${News.ui.link}`);
            Array.from(articles).forEach(article => {
                article.addEventListener('click', e => this.onArticleClick(e));
            });
        });
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
        window.addEventListener('orientationchange', (e) => this.onWindowResize(e));
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
     * 記事詳細を取得する
     *
     * @param {HTMLLinkElement} link - リンク
     */
    showArticle(link) {
        const parent = link.parentNode;
        let frame = parent.querySelector(`.${News.ui.article}`);

        if (!frame) {
            frame = document.createElement('iframe');
            frame.classList.add(News.ui.article);
            link.parentNode.appendChild(frame);
        }

        requestAnimationFrame(() => {
            this.overlay.classList.add('-show');
            frame.classList.add('-show');
            if (!frame.src) {
                frame.src = link.getAttribute('href');
            }

            setTimeout(() => {
                this.overlay.classList.remove('-show');
                frame.classList.remove('-show');
            }, 5000);
        });
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
        }, 200);
    }

    /**
     * 記事クリック
     */
    onArticleClick(e) {
        e.preventDefault();
        this.showArticle(e.currentTarget);
    }
}
