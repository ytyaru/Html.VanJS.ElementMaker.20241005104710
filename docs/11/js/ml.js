;(function(){
// 依存ライブラリ Type(isObj,isFn,getSetter)
class ML { // 要素を操作する（生成、追加、取得、置換、削除）。CSSセレクタ／XPath
    //constructor(){this._node=new Nodes();}
    constructor(){this._node=new Nodes();this._ce=new CustomEvents();}

    get el(){return new Proxy(ns=>new Proxy(this.#el, this.#handler(ns)), this.#handler())}
    #handler(ns){return {get:(_,name)=>this.#el.bind(this, ns, name)}}
    #el(ns, name, ...args) {
        const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
        const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
        for (let [k, v] of Object.entries(props)) {const K=/^data[A-Z]/.test(k) ? k.case.chain : k; console.log(K);this.#getSetter(el, K, v, Type.getSetter(el, K))();}
        console.log(this)
        return this.add(el, children)
    }
    #getSetter(el, k, v, propSetter) {return propSetter ? propSetter.bind(el, v) : null 
        ?? (k.startsWith('on') && Type.isFn(v)) 
        ? ()=>el.addEventListener(k.slice(2), v)
        : el.setAttribute.bind(el, k, v)
    }
    get node() { return this._node }
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
    getP(e,q){return e.closest(q)}
    set(e, ...cs){return e.replaceWith(...cs)}
    del(e){return e.remove()}
    // XPath系
    getPath(e){return XPath.getPath(e)}
    getX(xpath,e){return XPath.getEl(xpath, e ?? this.root)}
    getXs(xpath,e){return XPath.getEls(xpath, e ?? this.root)}
    setX(xpath,...es){return XPath.setEls(xpath, ...es)}
    delX(xpath){return XPath.delEls(xpath)}
    // イベント系
    on(el, evNm, fn, opt) { el.events.on(evNm, fn, opt) }
    off(el, evNm, fn, opt) { el.events.off(evNm, fn, opt) }
    get onStart() {return window.events.getFirstFn('DOMContentLoaded')}
    set onStart(fn) { window.events.on('DOMContentLoaded', fn) }
    get onEnd() {return window.events.getFirstFn('beforeunload')}
    set onEnd(fn) { window.events.on('beforeunload', fn) }
    trigger(el,ev){return el.dispatchEvent(Type.isStr(ev) ? new Event(ev) : ev)}
    get events() { return this._ce }
}
class Nodes {
    frag(...els){const f=document.createDocumentFragment(); f.append(...els); return f;}
    text(v){return document.createTextNode(v)}
    comment(v){return document.createComment(v)}
    cdata(v){return document.createCDATASection(v)}
    proc(t,d){return document.createProcessingInstruction(t,d)}
    get attr(){return new Proxy(ns=>new Proxy(this.#attr, this.#handler(ns)), this.#handler())}
    #handler(ns){return {get:(_,name)=>this.#attr.bind(this, ns, name)}}
    #attr(ns, name, value) {
        const attr = ns ? document.createAttributeNS(ns, name.case.chain) : document.createAttribute(name.case.chain)
        attr.value = value
        return attr
    }
    get el(){return ml.el}
}
class Css {
    constructor() {
        this._cp = new Proxy(this, {
            get(t,k){return ml.root.style.getPropertyValue(`--${k.case.chain}`)},
            set(t,k,v){Type.isNU(v) ? ml.root.style.removeProperty(`--${k.case.chain}`) : ml.root.style.setProperty(`--${k.case.chain}`,v)}
        });
        this._CP = new Proxy(this, {
            get(t,k){return getComputedStyle(ml.root).getPropertyValue(`--${k.case.chain}`)},
            set(t,k,v){throw new TypeError('CPに値はセットできません。代わりにcpを使用してください。')}
        });
    }
    get cp() {return this._cp} // CSS variable / CSS Custom Property  style
    get CP() {return this._CP} // CSS variable / CSS Custom Property  getComputedStyle
    get sheets() {return document.styleSheets}
    add(attrs, text, cbFn) { // <style>動的挿入  css.add({id:'some-css'}, `:root{--main-color:red;}`, ()=>alert('Added CSS!!'))
        const [opt, child, fn] = Type.isObj(attrs) ? [attrs, text, cbFn] : [{}, attrs, text]
        if (Type.isFn(fn)) { opt.onload = fn }
        const style = ml.el.style(opt, child)
        const parent = ml.root.get('head') ?? ml.root.get('body') ?? ml.root
        parent.append(style)
    }
}

class XPath {
    static getPath(el) { // https://qiita.com/ProjectICKX/items/eb4a48598a15675897cb
        const NODE_TYPE_ELEMENT_NODE = 1;
        if (el instanceof Array) { el = el[0] }
        if (el.nodeType != NODE_TYPE_ELEMENT_NODE) {
            throw new TypeError('Nodes other than the element node was passed. node_type:'+ el.nodeType +' node_name:'+ el.nodeName);
        }
        if (null===el.parentNode) {throw new TypeError('Element has no parent node. The element may not have been added to the document. Please do document.body.append(el).')}
        const stacker = [];
        let node_name = '';
        let node_count = 0;
        let node_point = null;
        do {
            node_name = el.nodeName.toLowerCase();
            if (el.parentNode.children.length > 1) {
                node_count = 0;
                node_point = null;
                for (let i=0; i<el.parentNode.children.length; i++) {
                    if (el.nodeName == el.parentNode.children[i].nodeName) {
                        node_count++;
                        if (el == el.parentNode.children[i]) { node_point = node_count }
                        if (node_point != null && node_count > 1) {
                            node_name += '['+ node_point +']';
                            break;
                        }
                    }
                }
            }
            stacker.unshift(node_name);
        } while ((el = el.parentNode) != null && el.nodeName != '#document');
        return '/' + stacker.join('/').toLowerCase();
    }
    static getEl(xpath){
        const a = this.#get(xpath)
        if (a.snapshotLength > 0) { return a.snapshotItem(0); }
        else {return null}
    }
    static getEls(xpath){
        const a = this.#get(xpath)
        return [...Array(a.snapshotLength)].map((_,i)=>a.snapshotItem(i))
    }
    static delEls(xpath){
        const a = this.#get(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).parentNode.removeChild(a.snapshotItem(i))} 
    }
    static setEls(xpath, ...newEls){
        const a = this.#get(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).replaceWith(...newEls)}
    }
    static #get(xpath, typ=XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {return document.evaluate(xpath, document, null, typ, null)}
}
class CustomEvents {
    //constructor() { this._events = {}; }
    // options:{detail:null, bubbles:false, cancelable:false, composed:false}
    //make(name, option) {const e = new CustomEvent(name, option); this._events[name]=e; return e; }
    constructor() { this._map = new Map(); }
    new(name, option) {return new CustomEvent(name, option);}
    make(name, option) {const e = new CustomEvent(name, option); this._map.set(name,e); return e; }
    get(name){return this._map.get(name)}
    get keys() {return this._map.keys()}
    get values() {return this._map.values()}
    get entries() {return this._map.entries()}
    get map() { return this._map }
    get obj() {
        const O = [...this._map.entries()].toObject()
        return new Proxy(O, {get:(_,k)=>this.#getObjItem(k),set:(_,k,v)=>this.#setObjItem(k,v)})
    }
    #getObjItem(evNm) {return [...this._map.entries()].toObject()[evNm]}
    #setObjItem(evNm,opt) { this._map.delete(evNm); this._map.set(evNm, opt); }
    set obj(v) {
        if (Type.isObj(v)) {
            this._map.clear();
            this._map = new Map([...v.entries()])
        }
    }

//    get(name){return this._events[name]}
//    get keys() {return Object.keys(this._events)}
//    get values() {return Object.values(this._events)}
//    get entries() {return Object.entries(this._events)}
//    get obj() { return this._events }
    trigger(el,ev) {return el.dispatchEvent(ev instanceof Event ? ev : (Type.isStr(ev) ? new Event(ev) : (()=>{throw new TypeError(`ev type invalid. String or Event only.`)})()))}
}
class EventListener {
    constructor(el) {
        console.log(el)
        this._el = el
        this._map = new Map() // {click:[[fn,opt],...]}
    }
    get obj() {
        const O = [...this._map.entries()].toObject()
        return new Proxy(O, {get:(_,k)=>this.#getObjItem(k),set:(_,k,v)=>this.#setObjItem(k,v)})
    }
    #getObjItem(evNm) {return [...this._map.entries()].toObject()[evNm]}
    #setObjItem(evNm,fnOpts) { this._map.delete(evNm); this._map.set(evNm, fnOpts); }
    set obj(v) {
        if (Type.isObj(v)) {
            this.clear();
            this._map = new Map([...v.entries()])
        }
    }
    get map() { return this._map }
    // 同一evNmに一つだけ関数をセットする
    on(evNm, fn, opt) { this.del(evNm); this.add(evNm, fn, opt); }
    off(evNm) { this.del(evNm); }

    // 同一evNmに複数関数をセットする
    get(evNm, fn, opt) {
        if (!this._map.has(evNm)) {return null}
        const t = this._map.get(evNm).filter(([FN,OPT])=>fn===FN&&opt===OPT)
        return 0===t.length ? null : t[0]
    }
    gets(evNm) { return this._map.get(evNm) }
    has(evNm, fn, opt) { return !!this.get(evNm, fn, opt) }
    getFirstFn(evNm) {
        const fnOpt = this._map.get(evNm)
        return fnOpt ? fnOpt[0][0] : null
    }
    add(evNm, fn, opt) {
        if (!Type.isStr(evNm) || !Type.isFn(fn)){return}
        if (this._map.has(evNm)) {this._map.get(evNm).push([fn,opt])}
        else {this._map.set(evNm, [[fn,opt]])}
        return this._el.addEventListener(evNm, fn, opt)
    }
    del(evNm, fn, opt) {
        if (!evNm && !fn && !opt) {this.clear()}
        else if (evNm && !fn && !opt && this._map.has(evNm)) { for (let [FN,OPT] of this._map.get(evNm)) {this._el.removeEventListener(evNm, FN, OPT)}; this._map.delete(evNm); }
        else {
            console.log(this._el)
            this._el.removeEventListener(evNm, fn, opt)
            if (this._map.has(evNm)) {
                this._map.set(evNm, this._map.get(evNm).filter(([FN,OPT])=>fn!==FN&&opt!==OPT))
                if (!this._map.get(evNm) || 0===this._map.get(evNm).length) { this._map.delete(evNm) }
            }
        }
    }
    set(evNm, fnOptO, fnOptN) { // fnOptO/N: [fn, opt]
        if (this.get(evNm, ...fnOptO)) {
            this.del(evNm, ...fnOptO)
            this.add(evNm, ...fnOptN)
        }
    }
    clear() {
        //for (let [k,v] of this._map) { this._el.removeEventListener(k, ...v) }
        for (let [k,v] of this._map) { for (let [fn, opt] of v) { this._el.removeEventListener(k, fn, opt) } }
        this._map.clear()
    }
}
Object.defineProperty(window, 'events', {get(){if(!this._events){this._events=new EventListener(this)};return this._events;}})
Object.defineProperty(Element.prototype, 'events', {get(){if(!this._events){this._events=new EventListener(this)};return this._events;}})
//Element.prototype.trigger = function(ev){ return this.dispatchEvent(ev instanceof Event ? ev : (Type.isStr(ev) ? new Event(ev) : (()=>{throw new TypeError(`ev type invalid. String or Event only.`)})())) }
Element.prototype.trigger = function(ev){
    const R = this.dispatchEvent(ev instanceof Event ? ev : (Type.isStr(ev) ? new Event(ev) : (()=>{throw new TypeError(`ev type invalid. String or Event only.`)})()))
    // once:trueなイベントのみ実行後に削除する
    const name = ev instanceof Event ? ev.type : ev
    if (this.events.map.has(name)) {
        const [fn, opt] = this.events.map.get(name)
        const onces = this.events.map.get(name).filter(fnOpt=>Type.isObj(fnOpt[1]) && fnOpt[1].once)
        onces.map(fnOpt=>this.events.del(name, ...fnOpt))
    }
    return R
//    return this.dispatchEvent(ev instanceof Event ? ev : (Type.isStr(ev) ? new Event(ev) : (()=>{throw new TypeError(`ev type invalid. String or Event only.`)})()))
}
window.ml = new ML()
window.css = new Css()
})();

