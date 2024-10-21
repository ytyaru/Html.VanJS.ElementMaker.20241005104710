;(function(){
// 依存ライブラリ Type(isObj,isFn,getSetter)
class ML { // 要素を操作する（生成、追加、取得、置換、削除）。CSSセレクタ／XPath
    constructor(){this._node=new Nodes();}
    // createElement[NS]
    get el(){return new Proxy(ns=>new Proxy(this.#el, this.#handler(ns)), this.#handler())}
    #handler(ns){return {get:(_,name)=>this.#el.bind(this, ns, name)}}
    #el(ns, name, ...args) {
        const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
        const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
        //for (let [k, v] of Object.entries(props)) {this.#getSetter(el, k, v, Type.getSetter(el, k))();}
        for (let [k, v] of Object.entries(props)) {const K=/^data[A-Z]/.test(k) ? k.case.chain : k; console.log(K);this.#getSetter(el, K, v, Type.getSetter(el, K))();}
        console.log(this)
        return this.add(el, children)
    }
    #getSetter(el, k, v, propSetter) {return propSetter ? propSetter.bind(el, v) : null 
        ?? (k.startsWith('on') && Type.isFn(v)) 
        ? ()=>el.addEventListener(k.slice(2), v)
        : el.setAttribute.bind(el, k, v)
    }
    // create[TextNode/Comment/DocumentFragment/CDATA/PI/Attr]
    get node() { return this._node }
    //mkFrg(...els){return document.createDocumentFragment(...els)}
    //mkTxt(v){return document.createTextNode(v)}
    //mkCmt(v){return document.createComment(v)}
    //mkCdt(v){return document.createCDATASection(v)}
    //mkProcInst(t,d){return document.createProcessingInstruction(t,d)}
    //mkAttr(n){return document.createAttribute(n)}

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
    //getP(q,e){console.log(e,this.root);return (e ?? this.root).closest(q)}
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
//    on(el, evNm, fn, opt) { el.addEventListener(evNm, fn, opt) }
//    off(el, evNm, fn, opt) { el.removeEventListener(evNm, fn, opt) }
    on(el, evNm, fn, opt) { el.events.on(evNm, fn, opt) }
    off(el, evNm, fn, opt) { el.events.off(evNm, fn, opt) }
    get onStart() {return window.events.getFirstFn('DOMContentLoaded')}
    set onStart(fn) { window.events.on('DOMContentLoaded', fn) }
    get onEnd() {return window.events.events.getFirstFn('beforeunload')}
    set onEnd(fn) { window.events.on('beforeunload', fn) }
    trigger(el,ev){return el.dispatchEvent(Type.isStr(ev) ? new Event(ev) : ev)}
}
class Nodes {
//    frag(...els){return document.createDocumentFragment(...els)}
    frag(...els){const f=document.createDocumentFragment(); f.append(...els); return f;}
    text(v){return document.createTextNode(v)}
    comment(v){return document.createComment(v)}
    cdata(v){return document.createCDATASection(v)}
    proc(t,d){return document.createProcessingInstruction(t,d)}
    //attr(n){return document.createAttribute(n)}
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
        this._v = new Proxy(this, {
            get(t,k){return ml.root.style.getPropertyValue(`--${k.case.chain}`)},
            set(t,k,v){Type.isNU(v) ? ml.root.style.removeProperty(`--${k.case.chain}`) : ml.root.style.setProperty(`--${k.case.chain}`,v)}
        });
        this._V = new Proxy(this, {
            get(t,k){return getComputedStyle(ml.root).getPropertyValue(`--${k.case.chain}`)},
//            set(t,k,v){Type.isNU(v) ? ml.root.style.removeProperty(`--${k.case.chain}`) : ml.root.style.setProperty(`--${k.case.chain}`,v)}
        });
        /*
        this._cp = return new Proxy(this, {
            get(t,k){return t.root.style.getPropertyValue(`--${k.case.chain}`)}, // getComputedStyle(t).getPropertyValue(...)
            set(t,k,v){Type.isNU(v) ? t.root.style.removeProperty(`--${k.case.chain}`) : t.root.style.setProperty(`--${k.case.chain}`,v)}
        });
        */
    }
    get v() {return this._v} // CSS variable / CSS Custom Property  style
    get V() {return this._V} // CSS variable / CSS Custom Property  getComputedStyle
    get sheets() {return document.styleSheets}
}

class XPath {
    /*
    static getPath(el) {
        if(el && el.parentNode) {
            let xpath = this.getPath(el.parentNode) + '/' + el.tagName;
            const s = [...Array(el.parentNode.childNodes.length)].map((_,i)=>el.tagName===el.tagName ? el.parentNode.childNodes[i] : null).filter(v=>v)
            if(1 < s.length) {
                for(var i=0; i<s.length; i++) {
                    if(s[i] === el) {xpath += '[' + (i+1) + ']';break;}
                }
            }
            return xpath.toLowerCase();
        } else {return ''}
    }
    */
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
        //const a = this.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        const a = this.#get(xpath)
        if (a.snapshotLength > 0) { return a.snapshotItem(0); }
        else {return null}
    }
    static getEls(xpath){
        //const a = this.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        const a = this.#get(xpath)
        return [...Array(a.snapshotLength)].map((_,i)=>a.snapshotItem(i))
    }
    static delEls(xpath){
        //const a = this.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        const a = this.#get(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).parentNode.removeChild(a.snapshotItem(i))} 
    }
    static setEls(xpath, ...newEls){
        //const a = this.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        const a = this.#get(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).replaceWith(...newEls)}
    }
    static #get(xpath, typ=XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {return document.evaluate(xpath, document, null, typ, null)}
}
class Events {
    constructor() { this._events = {}; }
    // options:{detail:null, bubbles:false, cancelable:false, composed:false}
    make(name, option) {const e = new CustomEvent(name, option); this._events[name]=e; return e; }
    get(name){return this._events[name]}
    keys() {return Object.keys(this._events)}
    values() {return Object.values(this._events)}
    entries() {return Object.entries(this._events)}
    trigger(el,ev) {return el.dispatchEvent(ev instanceof Event ? ev : (Type.isStr(ev) ? new Event(ev) : (()=>{throw new TypeError(`ev type invalid. String or Event only.`)})()))}
}
class EventListener {
    constructor(el) {
        console.log(el)
        this._el = el
        this._map = new Map() // {click:[[fn,opt],...]}
    }
    //get obj() { return [...this._map.entries()].toObject() }
//    get obj() { return new Proxy(this, {
//        get(t,k){ console.log([...t._map.entries()], [...t._map.entries()].toObject());return [...t._map.entries()].toObject() },
//        set(t,k,v){ if (Type.isArys(v)) { v.del(k); v.map(fnOpt=>t.add(k, ...fnOpt)); } },
//    })}
/*
    get obj() {
        const O = [...this._map.entries()].toObject()
        return new Proxy(O, {
            get(t,k){return t[k]},
            set(t,k,v){ if (Type.isArys(v)) { this.del(k); this.map(fnOpt=>t.add(k, ...fnOpt)); } },
        })
    }
*/
    //get el(){return new Proxy(ns=>new Proxy(this.#el, this.#handler(ns)), this.#handler())}
//    get obj(){return new Proxy(evNm=>new Proxy(this.#obj(evNm), this.#handler(evNm)), this.#handler())}
    /*
    get obj() {
        const O = [...this._map.entries()].toObject()
        return new Proxy(this, {
            get(t,k){return t[k]},
            set(t,k,v){ if (Type.isArys(v)) { this.del(k); this.map(fnOpt=>t.add(k, ...fnOpt)); } },
        })
    }
    */
    //get #obj() { return [...this._map.entries()].toObject() }
//    #obj(evNm) {
//        const O = [...this._map.entries()].toObject()
//        return evNm ? O[evNm] : O
//    }
//    #handler(evNm){return {get:(_,evNm)=>this.#obj.bind(this, evNm)}}
//    #obj(evNm) {
//        const O = [...this._map.entries()].toObject()
//        return evNm ? O[evNm] : O
//    }
//    set obj(v) { if (Type.isObj(v)) { this.clear(); this._map = new Map([...v.entries()]); } }
    /*
    get obj() {
        const O = [...this._map.entries()].toObject()
        //return new Proxy(new Proxy(this, {
        return new Proxy(new Proxy(O, {
                //get(t,k){return [...t._map.entries()].toObject()},
                get(t,k){return t[k]},
                set(t,k,v){ if (Type.isArys(v)) { v.del(k); v.map(fnOpt=>t.add(k, ...fnOpt)); } },
            }), {
            get(t,k){return t},
            //set(t,k,v){ if (Type.isArys(v)) { v.del(k); v.map(fnOpt=>t.add(k, ...fnOpt)); } },
            set(t,k,v){ if (Type.isObj(v)) { this.clear(); this._map = new Map([...v.entries()]); } },
//            get(t,k){return [...t._map.entries()].toObject()},
//            set(t,k,v){ if (Type.isArys(v)) { v.del(k); v.map(fnOpt=>t.add(k, ...fnOpt)); } },
//                set(t,k,v){ if (Type.isAry(v)) { v.del(k,...v); t.add(k, ...v); } },
        })
//        get(t,k){ console.log([...t._map.entries()], [...t._map.entries()].toObject());return [...t._map.entries()].toObject() },
//        set(t,k,v){ if (Type.isArys(v)) { v.del(k); v.map(fnOpt=>t.add(k, ...fnOpt)); } },
    //})}
    }
    */
    //#el(ns, name, ...args) {

    get obj() {
        const O = [...this._map.entries()].toObject()
        //return new Proxy(O, this.#handler())
        //return new Proxy(O, {get:(_,k)=>this.#getObj.bind(this,k),set:(_,k,v)=>this.#setObj.bind(this,k,v)})
        return new Proxy(O, {get:(_,k)=>this.#getObjItem(k),set:(_,k,v)=>this.#setObjItem(k,v)})
    }
//    #handler(){return {get:(_,k)=>this.#getObj.bind(this,k),set:(_,k,v)=>this.#setObj.bind(this,k,v)}}
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
window.css = new Css()
})();

