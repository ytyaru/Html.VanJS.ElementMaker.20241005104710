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
/*
const add = (...args)=>{
    if(0===args.length){return}
    Type.throws('Els',v)
    //if(Type.iss('El',args)){Type.throws('Els',v)}
    //const [parent, children] = [args[0], args.slice(1)]
    const [parent, children] = (1===args.length) ? [document.querySelector(':root'), args[0]] : [args[0], args.slice(1)]
    const frag = document.createDocumentFragment();
    for (let child of children.flat(Infinity)) { frag.append(child) }
    parent.append(frag)
}
*/
const get = (q, target)=>(Type.isEl(target) ? target : document.querySelector(':root')).querySelector(q)
const gets = (q, target)=>[...(target ? target : document.body).querySelectorAll(q)]
const set = (target, ...elements)=>target.replaceWith(...elements)
const add = (el, ...children)=>{
    const frag = document.createDocumentFragment();
    for (let child of children.flat(Infinity)) { frag.append(child) }
    el.append(frag)
}
const tag = (ns, name, ...args) => {
    const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
//    console.log(name, props, children)
    const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
    for (let [k, v] of Object.entries(props)) {
//        console.log(k, k.slice(2), k.startsWith('on'), v)
//        console.log(Type.getSetter(el, k))
        const propSetter = Type.getSetter(el, k);
        const setter = propSetter ? propSetter.bind(el, v) : null 
            ?? (k.startsWith('on') && Type.isFn(v)) 
            //? ()=>{console.log(k, k.slice(2), k.startsWith('on'), v);el.addEventListener(k.slice(2), v)}
            ? ()=>el.addEventListener(k.slice(2), v)
            : el.setAttribute.bind(el, k, v);
        setter()
//        console.log(el)
        // el[k] = v
        // setter, 関数, setAttribute, の優先順でセットすべき
        // 1. setter: HTMLElementを拡張したクラスの場合、HTML属性ではなくJSクラスのsetterとして代入すべき
        // 2. 関数：on系属性値の場合、その値は関数であるべき。
        // 3. setAttribute: 標準HTMLElementの属性値（文字列）として代入する
    }
    add(el, children)
//    console.log(el)
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
})();
