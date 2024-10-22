// crel.js  document.createElement[NS]() wrapper
// const {要素名, ...} = crel(名前空間名URL)
// crel.要素名({属性名:属性値,...}, 子要素, ...)
;(function(){
class TYPE {
  is(tyNm,v) {return this[`is${tyNm.case.title}`](v)}
  iss(tyNm,v){return this.isAry(v) && v.every(V=>this[`is${tyNm}`](V))}
  throw(tyNm,v,msg='') {if(!this[`is${tyNm.case.title}`](v)){throw new TypeError(msg)}}
  throws(tyNm,v,msg='') {if(!v.every(V=>this[`is${tyNm.case.title}s`](V))){throw new TypeError(msg)}}

  isObj(v) {return 'object'===typeof v && Object===v.constructor}
  isStr(v) {return 'string'===typeof v || v instanceof String}
  isFn(v) {return 'function'===typeof v}
  isEl(v) {return v instanceof Element }
  isAry(v) {return Array.isArray(v)}

  isStrs(v) {return this.isAry(v) && v.every(V=>this.isStr(V))}
  isEls(v) {return this.isAry(v) && v.every(V=>this.isEls(V))}

  getGetter(target, key) { return this.#getDesc(target, key)?.get ?? null }
  getSetter(target, key) { return this.#getDesc(target, key)?.set ?? null }
  #getDesc(target, key) {
    return target 
    ? Object.getOwnPropertyDescriptor(target, key) ?? this.#getDesc(Object.getPrototypeOf(target), key)
    : undefined
  }
}
const Type = new TYPE()
const get = (q, target)=>{
    const R = document.querySelector(':root')
    return (!Type.isStr(q)) ? R : (Type.isEl(target) ? target : R).querySelector(q)
}
const gets = (q, target)=>[...(target ? target : document.body).querySelectorAll(q)]
const set = (target, ...elements)=>target.replaceWith(...elements)
const add = (el, ...children)=>{
    const frag = document.createDocumentFragment();
    for (let child of children.flat(Infinity)) { frag.append(child) }
    el.append(frag)
}
const mixin = (el)=>{
    // 以下のようにアクセスしたい（CSSキー名を非文字列にしたい）
    // el.attr.[任意文字列]          // getter
    // el.attr.[任意文字列] = 任意値 // setter
    /*
    const handler = v=>({get:(t,k)=>ATTR.get.bind(t,k), set:(t,k,v)=>ATTR.set.bind(t,k,v)})
    Object.defineProperty(el, 'attr', {
        //get(){return new Proxy(ns=>new Proxy(tag, handler(ns)), handler())},
        get(){return new Proxy({}, handler())},
    })
    */
    Object.defineProperty(el, 'attr', {
        get(){
            if (!this._attr){this._attr=new Attr(this)}
            return this._attr
        },
    })
    Object.defineProperty(el, 'css', {
        get(){
            if (!this._css){this._css=new Css(this)}
            return this._css
        },
    })
    const on = new On(el)
    el.on = on.on
    el.off = on.off
    /*
    Object.defineProperty(el, 'on', {
        get(){
            if (!this._on){this._on=new On(this)}
            return this._on
        },
    })
    */
}
const tag = (ns, name, ...args) => {
    const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
    const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
    mixin(el)
    for (let [k, v] of Object.entries(props)) {
        const propSetter = Type.getSetter(el, k);
        const setter = propSetter ? propSetter.bind(el, v) : null 
            ?? (k.startsWith('on') && Type.isFn(v)) 
            ? ()=>el.addEventListener(k.slice(2), v)
            : el.setAttribute.bind(el, k, v);
        setter()
        // el[k] = v
        // setter, 関数, setAttribute, の優先順でセットすべき
        // 1. setter: HTMLElementを拡張したクラスの場合、HTML属性ではなくJSクラスのsetterとして代入すべき
        // 2. 関数：on系属性値の場合、その値は関数であるべき。
        // 3. setAttribute: 標準HTMLElementの属性値（文字列）として代入する
    }
    add(el, children)
    return el
}
class ATTR {
    static get(el,k){return el.getAttribute(k)}
    //static get(el,k){console.log(el,k);return el.getAttribute(k)}
    static set(el,k,v){el.setAttribute(k,v)}
    static gets(el,ks){
        Type.throw('Strs', ks);
        return ks.map(k=>[k, this.get(el,k)]).toObject();
    }
    static sets(el,o) {
        Type.throw('Obj', ks);
        [...Object.entries(o)].map(([k,v])=>this.set(el,k,v));
    }
}
class CSS {
    static get(el,k){return getComputedStyle(el).getPropertyValue(k)}
    static set(el,k,v){el.style.setProperty(k,v)}
    static gets(el,ks){
        Type.throw('Strs', ks)
        return ks.map(k=>[k, this.get(el,k)]).toObject()
    }
    static sets(el,o){
        Type.throw('Obj', ks);
        [...Object.entries(o)].map(([k,v])=>this.set(el,k,v))
    }
}
class ON {
    static on(el, evNm, fn, options) {
        const args = options ? [evNm, fn, options] : [evNm, fn]
        el.addEventListener(...args)
    }
    static off(el, evNm, fn, options) {
        const args = options ? [evNm, fn, options] : [evNm, fn]
        el.removeEventListener(...args)
    }
}

// 配列からオブジェクトに変換する
Array.prototype.toObject = function() {
    if (!this.every(v=>Array.isArray(v) && 2<=v.length)) { throw new TypeError(`[[key, value],...]であるべきです。`) }
    return Object.assign(...this.map(([k,v]) => ({[k]:v})))
}
// style/attr の糖衣構文
class Attr {
    constructor(el){this._el=el}
    get (k){console.log(this._el);return this._el.getAttribute(k)}
    set (k,v){this._el.setAttribute(k,v)}
    gets (ks){
        Type.throw('Strs', ks);
        return ks.map(k=>[k, this.get(k)]).toObject();
    }
    sets (o) {
        Type.throw('Obj', ks);
        [...Object.entries(o)].map(([k,v])=>this.set(k,v));
    }
}
class Css {
    constructor(el){this._el=el}
    get(k){return getComputedStyle(this._el).getPropertyValue(k)}
    set(k,v){this._el.style.setProperty(k,v)}
    gets(ks){
        Type.throw('Strs', ks)
        return ks.map(k=>[k, this.get(k)]).toObject()
    }
    sets(o){
        Type.throw('Obj', ks);
        [...Object.entries(o)].map(([k,v])=>this.set(k,v))
    }
}
class On {
    constructor(el){this._el=el;this._handlers=[]}
    on(evNm, fn, options) {
        const args = options ? [evNm, fn, options] : [evNm, fn]
        this._el.addEventListener(...args)
        if (this._handlers.hasOwnProperty(evNm)){this._handlers[evNm].push(args)}
        else {this._handlers[evNm] = [args]}
    }
    off(evNm, fn, options) {
        if (!evNm && !fn) { // 全削除
            for (let args of this._handlers) {
                this._el.removeEventListener(...args)
            }
        } else { // 単一削除
            const args = options ? [evNm, fn, options] : [evNm, fn]
            this._el.removeEventListener(...args)
            if (this._handlers.hasOwnProperty(evNm)){
                this._handlers = this._handlers.filter(v=>!(v.length===args.length && [...Array(v.length)].every((_,i)=>v[i]===args[i])))
            }
        }
    }
}
const handler = ns=>({get:(_, name)=>tag.bind(undefined, ns, name)})
window.ml = {
    tags: new Proxy(ns=>new Proxy(tag, handler(ns)), handler()),
    add: add,
    set: set,
    get: get,
    gets: gets,
    on: ON.on,
    off: ON.off,
}
Object.defineProperty(window.ml, 'root', {get(){document.querySelector(':root')}})
Object.defineProperty(window.ml, 'css', {get(){return CSS}})
Object.defineProperty(window.ml, 'attr', {get(){return ATTR}})
//Object.defineProperty(window.ml, 'on', {get(){return ON}})
})();
