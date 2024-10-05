// crel.js  document.createElement[NS]() wrapper
// const {要素名, ...} = crel(名前空間名URL)
// crel.要素名({属性名:属性値,...}, 子要素, ...)
;(function(){
class TYPE {
  is(tyNm,v) {return this[`is${tyNm.case.title}`](v)}
  iss(tyNm,v){return this.isAry(v) && v.every(V=>this[`is${tyNm}`](V))}
  throw(tyNm,v) {if(!this[`is${tyNm.case.title}`](v)){throw new Type()}}
  throws(tyNm,v) {if(!v.every(V=>this[`is${tyNm.case.title}s`](V))){throw new Type()}}

  isObj(v) {return 'object'===typeof v && Object===v.constructor}
  isStr(v) {return 'string'===typeof v || v instanceof String}
  isFn(v) {return 'function'===typeof v}
  isEl(v) {return v instanceof HTMLElement }
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
//const get = (q, target)=>(Type.isEl(target) ? target : document.querySelector(':root')).querySelector(q)
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
const tag = (ns, name, ...args) => {
    const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
    const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
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
const handler = ns=>({get:(_, name)=>tag.bind(undefined, ns, name)})
window.ml = {
    tags: new Proxy(ns=>new Proxy(tag, handler(ns)), handler()),
    add: add,
    set: set,
    get: get,
    gets: gets,
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

/*
Element.prototype.attr = {
    get:()=>new Attr(this),
}
*/
Object.defineProperty(Element.prototype, 'attr', {
//    value: new Attr(this),
//    get:()=>new Attr(this),
    get:()=>new Attr(Element.prototype),
})
class Css {
    constructor(el){this._el=el}
    get(k){getComputedStyle(this._el).getPropertyValue(k)}
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
Object.defineProperty(Element.prototype, 'css', {
    get:()=>new Css(this),
})
/*

const css = {}
Object.defineProperty(css, 'css', {
    get:()=>this,
})

Object.defineProperty(Element.prototype, 'css', {
    get: (()=>({
        get: (k)=>getComputedStyle(this).getPropertyValue(k),
        set: (k,v)=>this.style.setProperty(k,v),
        gets: (ks)=>{
            Type.throw('Strs', ks)
            return ks.map(k=>[k, this.css.get(k)]).toObject()
        },
        sets: (o)=>{
            Type.throw('Obj', ks);
            [...Object.entries(o)].map(([k,v])=>this.css.set(k,v))
        },
    }).bind(this)).bind(this),
})
Object.defineProperty(Element.prototype, 'attr', {
    get: (()=>({
        get:(k)=>{console.log(this);return this.getAttribute(k)},
        set:(k,v)=>this.setAttribute(k,v),
        gets: (ks)=>{
            Type.throw('Strs', ks);
            return ks.map(k=>[k, this.attr.get(k)]).toObject();
        },
        sets: (o)=>{
            Type.throw('Obj', ks);
            [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v));
        },
    }).bind(this)).bind(this),
})
*/
/*
class Attr {
    get (el,k){console.log(el);return el.getAttribute(k)}
    set (el,k,v){el.setAttribute(k,v)}
    gets (el,ks){
        Type.throw('Strs', ks);
        return ks.map(k=>[k, this.get(el,k)]).toObject();
    }
    sets (el,o) {
        Type.throw('Obj', ks);
        [...Object.entries(o)].map(([k,v])=>this.set(el,k,v));
    }
}
*/
/*
Element.prototype.attr = {}
Element.prototype.attr.get = (k)=>Attr.get(this, )
Object.defineProperty(Element.prototype.attr, 'attr', {
Object.defineProperty(Element.prototype, 'attr', {
    get: ()=>
        
    }
        get:(k)=>{console.log(this);return this.getAttribute(k)},
        set:(k,v)=>this.setAttribute(k,v),
        gets: (ks)=>{
            Type.throw('Strs', ks);
            return ks.map(k=>[k, this.attr.get(k)]).toObject();
        },
        sets: (o)=>{
            Type.throw('Obj', ks);
            [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v));
        },
    }).bind(this)).bind(this),
})
*/
/*
class Attr {
    get (k){console.log(this);return this.getAttribute(k)}
    set (k,v){this.setAttribute(k,v)}
    gets (ks){
        Type.throw('Strs', ks);
        return ks.map(k=>[k, this.attr.get(k)]).toObject();
    }
    sets (o) {
        Type.throw('Obj', ks);
        [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v));
    }
}

//Object.defineProperties(HTMLElement.prototype, {
Object.defineProperties(Element.prototype, {
    //css: {
    css: ()=>({
        get:(()=>{return {
                get: (k)=>getComputedStyle(this).getPropertyValue(k),
                set: (k,v)=>this.style.setProperty(k,v),
                gets: (ks)=>{
                    Type.throw('Strs', ks)
                    return ks.map(k=>[k, this.css.get(k)]).toObject()
                },
                sets: (o)=>{
                    Type.throw('Obj', ks);
                    [...Object.entries(o)].map(([k,v])=>this.css.set(k,v))
                },
            }
        }).bind(this)
    //}).bind(this),
    }),
    //attr: {
    //attr: (()=>{
    attr: ()=>({
//        get:(()=>{}).bind(this),
        get:()=>({
                //a:'',
                //get:(k)=>this.getAttribute(k),
                get:(k)=>{console.log(this);return this.getAttribute(k)},
                set:(k,v)=>this.setAttribute(k,v),
                gets: (ks)=>{
                    Type.throw('Strs', ks);
                    return ks.map(k=>[k, this.attr.get(k)]).toObject();
                },
                sets: (o)=>{
                    Type.throw('Obj', ks);
                    [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v));
                },
            }),
        //}).bind(this),
        //}),
    }),
    attr: ()=>{
        //get:(()=>{return {
        //get:()=>{return {
        get:()=>{
            return {
                a:'',
                //get:(k)=>this.getAttribute(k),
                get:(k)=>{console.log(this);return this.getAttribute(k)},
                set:(k,v)=>this.setAttribute(k,v),
                gets: (ks)=>{
                    Type.throw('Strs', ks);
                    return ks.map(k=>[k, this.attr.get(k)]).toObject();
                },
                sets: (o)=>{
                    Type.throw('Obj', ks);
                    [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v));
                },
            }
        //}).bind(this),
        },
    },
//    }).bind(this),
//    },
})
*/
/*
//HTMLElement.prototype.css = {}
//HTMLElement.prototype.attr = {}
//Object.defineProperties(HTMLElement.prototype.css.bind(HTMLElement.prototype), {
Object.defineProperties(HTMLElement.prototype.css, {
    get: {value:(k)=>getComputedStyle(this).getPropertyValue(k)},
    set: {value:(k,v)=>this.style.setProperty(k,v)},
    gets: {
        value:(ks)=>{
            Type.throw('Strs', ks)
            return ks.map(k=>[k, this.css.get(k)]).toObject()
        },
    },
    sets: {
        value:(o)=>{
            Type.throw('Obj', ks);
            [...Object.entries(o)].map(([k,v])=>this.css.set(k,v))
        },
    },
})
Object.defineProperties(HTMLElement.prototype.attr.bind(HTMLElement.prototype), {
    get:{value:(k)=>this.getAttribute(k)},
    set:{value:(k,v)=>this.setAttribute(k,v)},
    gets: {
        value:(ks)=>{
            Type.throw('Strs', ks)
            return ks.map(k=>[k, this.attr.get(k)]).toObject()
        },
    },
    sets: {
        value:(o)=>{
            Type.throw('Obj', ks);
            [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v))
        },
    },
})
*/
})();
