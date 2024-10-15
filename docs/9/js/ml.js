;(function(){
// 依存ライブラリ Type(isObj,isFn,getSetter)
class ML { // 要素を操作する（生成、追加、取得、置換、削除）。CSSセレクタ／XPath
    get tags(){return new Proxy(ns=>new Proxy(this.#tag, this.#handler(ns)), this.#handler())}
    #handler(ns){return {get:(_,name)=>this.#tag.bind(this, ns, name)}}
    #tag(ns, name, ...args) {
        const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
        const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
        for (let [k, v] of Object.entries(props)) {this.#getSetter(el, k, v, Type.getSetter(el, k))()}
        console.log(this)
        return this.add(el, children)
    }
    #getSetter(el, k, v, propSetter) {return propSetter ? propSetter.bind(el, v) : null 
        ?? (k.startsWith('on') && Type.isFn(v)) 
        ? ()=>el.addEventListener(k.slice(2), v)
        : el.setAttribute.bind(el, k, v)
    }
    get root() { return document.querySelector(':root') }
    add(el, ...children) {
        const frag = document.createDocumentFragment();
        for (let child of children.flat(Infinity)) { frag.append(child) }
        el.append(frag)
        return el
    }
    addRoot(...cs) {return this.add(this.root, ...cs)}
    get(q,e){return (e ?? this.root).querySelector(q)}
    gets(q,e){return (e ?? this.root).querySelectorAll(q)}
    set(e, ...cs){return e.replaceWith(...cs)}
    del(e){e.remove()}
    // XPath系
    getPath(e){return XPath.getPath(e)}
    getX(xpath,e){return XPath.getEl(xpath, e ?? this.root)}
    getXs(xpath,e){return XPath.getEls(xpath, e ?? this.root)}
    setX(xpath,...es){return XPath.setEls(xpath, ...es)}
    delX(xpath){return XPath.delEls(xpath)}
    // イベント系
//    on(el, evNm, fn, opt) { el.addEventListener(evNm, fn, opt) }
//    off(el, evNm, fn, opt) { el.removeEventListener(evNm, fn, opt) }
    on(el, evNm, fn, opt) { el.events.on(evNm, fn, opt) }
    off(el, evNm, fn, opt) { el.events.off(evNm, fn, opt) }
    get onStart() {return window.events.getFirstFn('DOMContentLoaded')}
    set onStart(fn) { window.events.on('DOMContentLoaded', fn) }
    get onEnd() {return window.events.events.getFirstFn('beforeunload')}
    set onEnd(fn) { window.events.on('beforeunload', fn) }
}
class XPath {
    static getPath(el) {
        if(el && el.parentNode) {
            let xpath = this.getPath(el.parentNode) + '/' + el.tagName;
            const s = [...Array(el.parentNode.childNodes.length)].map((_,i)=>e.tagName===el.tagName ? el.parentNode.childNodes[i] : null).filter(v=>v)
            if(1 < s.length) {
                for(var i=0; i<s.length; i++) {
                    if(s[i] === el) {xpath += '[' + (i+1) + ']';break;}
                }
            }
            return xpath.toLowerCase();
        } else {return ''}
    }
    static getEl(xpath){
        const a = this.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        if (a.snapshotLength > 0) { return a.snapshotItem(0); }
    }
    static getEls(xpath){
        const a = this.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        return [...Array(a.snapshotLength)].map((_,i)=>a.snapshotItem(i))
    }
    static delEls(xpath){
        const a = this.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).parentNode.removeChild(a.snapshotItem(i))} 
    }
    static setEls(xpath, ...newEls){
        const a = this.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).replaceWith(...newEls)}
    }
}
class EventListener {
    constructor(el) {
        console.log(el)
        this._el = el
        this._map = new Map() // {click:[[fn,opt],...]}
    }
    get map() { return this._map }
    // 同一evNmに一つだけ関数をセットする
    on(evNm, fn, opt) { this.del(evNm); this.add(evNm, fn, opt); }
    off(evNm) { this.del(evNm); }

    // 同一evNmに複数関数をセットする
    get(evNm, fn, opt) {
        const t = this._map.get(evNm).filter(([FN,OPT])=>fn===FN&&opt===OPT)
        return 0===t.length ? null : t[0]
    }
    has(evNm, fn, opt) { return !!this.get(evNm, fn, opt) }
    //getFn(evNm, fn, opt) {const t=this.get(evNm, fn, opt); return t ? t[0] : null }
    getFirstFn(evNm) {
        const fnOpt = this._map.get(evNm)
        return fnOpt ? fnOpt[0][0] : null
    }
    add(evNm, fn, opt) {
        if (this._map.has(evNm)) {this._map.get(evNm).push([fn,opt])}
        else {this._map.set(evNm, [[fn,opt]])}
        return this._el.addEventListener(evNm, fn, opt)
    }
    del(evNm, fn, opt) {
        if (!evNm && !fn && !opt) {this.clear()}
        else if (evNm && !fn && !opt && this._map.has(evNm)) { for (let [FN,OPT] of this._map.get(evNm)) {this._el.removeEventListener(evNm, FN, OPT)} }
        else {
            console.log(this._el)
            this._el.removeEventListener(evNm, fn, opt)
            if (this._map.has(evNm)) {this._map.set(evNm, this._map.get(evNm).filter(([FN,OPT])=>fn!==FN&&opt!==OPT))}
        }
    }
    set(evNm, fnOptO, fnOptN) { // fnOptO/N: [fn, opt]
        if (this.get(evNm, ...fnOptO)) {
            this.del(evNm, ...fnOptO)
            this.add(evNm, ...fnOptN)
        }
    }
    clear() {
        for (let [k,v] of this._map) { this._el.removeEventListener(k, ...v) }
        this._map.clear()
    }
}
Object.defineProperty(window, 'events', {get(){if(!this._events){this._events=new EventListener(this)};return this._events;}})
Object.defineProperty(Element.prototype, 'events', {get(){if(!this._events){this._events=new EventListener(this)};return this._events;}})
window.ml = new ML()
})();

