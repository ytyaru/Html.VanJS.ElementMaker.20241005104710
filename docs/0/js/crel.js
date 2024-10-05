// crel.js  document.createElement[NS]() wrapper
// const {要素名, ...} = crel(名前空間名URL)
// crel.要素名({属性名:属性値,...}, 子要素, ...)
;(function(){
/*
const el = document.querySelector('#target')
const proto = Object.getPrototypeOf(el)
const getDesc = proto=>proto
    ? Object.getOwnPropertyDescriptor(proto, 'class') ?? getDesc(Object.getPrototypeOf(proto))
    : undefined
const desc = Object.getOwnPropertyDescriptor(proto, 'class') 
          ?? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(proto), 'class')
const setter = desc
*/
// van.tags.div('D')
// van.tags.div({id:''})
// van.tags.div({id:''}, 'D')
class TYPE {
  isObj(v) {return 'object'===typeof v && Object===v.constructor}
  isStr(v) {return 'string'===typeof v || v instanceof String}
  isFn(v) {return 'function'===typeof v}
  getGetter(target, key) { return this.#getDesc(target, key)?.get ?? null }
  getSetter(target, key) { return this.#getDesc(target, key)?.set ?? null }
  #getDesc(target, key) {
    console.log(target, key)
    return target 
    ? Object.getOwnPropertyDescriptor(target, key) ?? this.#getDesc(Object.getPrototypeOf(target), key)
    : undefined
  }
}
const Type = new TYPE()
const add = (el, ...children)=>{
    const frag = document.createDocumentFragment();
    for (let child of children.flat(Infinity)) { frag.append(child) }
    el.append(frag)
}
const tag = (ns, name, ...args) => {
    const [props, ...children] = Type.isObj(args[0] ?? 0) ? args : [{}, ...args];
    console.log(name, props, children)
    const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
    for (let [k, v] of Object.entries(props)) {
        console.log(k, k.slice(2), k.startsWith('on'), v)
        console.log(Type.getSetter(el, k))
        const propSetter = Type.getSetter(el, k);
        const setter = propSetter ? propSetter.bind(el, v) : null 
            ?? (k.startsWith('on') && Type.isFn(v)) 
            ? ()=>{console.log(k, k.slice(2), k.startsWith('on'), v);el.addEventListener(k.slice(2), v)}
            : el.setAttribute.bind(el, k, v);
        setter()
        console.log(el)
        // el[k] = v
        // setter, 関数, setAttribute, の優先順でセットすべき
        // 1. setter: HTMLElementを拡張したクラスの場合、HTML属性ではなくJSクラスのsetterとして代入すべき
        // 2. 関数：on系属性値の場合、その値は関数であるべき。
        // 3. setAttribute: 標準HTMLElementの属性値（文字列）として代入する
    }
    add(el, children)
    console.log(el)
    return el
}
/*
const tag = (ns, name, ...args) => {

  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = ns ? document.createElementNS(ns, name) : document.createElement(name)
  for (let [k, v] of Object.entries(props)) {
    let getPropDescriptor = proto => proto ?
      Object.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :
      _undefined
    let cacheKey = name + "," + k
    let propSetter = propSetterCache[cacheKey] ??= getPropDescriptor(protoOf(dom))?.set ?? 0
    let setter = k.startsWith("on") ?
      (v, oldV) => {
        let event = k.slice(2)
        dom.removeEventListener(event, oldV)
        dom.addEventListener(event, v)
      } :
      propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k)
    let protoOfV = protoOf(v ?? 0)
    k.startsWith("on") || protoOfV === funcProto && (v = derive(v), protoOfV = stateProto)
    protoOfV === stateProto ? bind(() => (setter(v.val, v._oldVal), dom)) : setter(v)
  }
  return add(dom, children)
}
//const handler = ns=>({get:(_, name)=>tag.bind(_undefined, ns, name)})
*/
const handler = ns=>({get:(_, name)=>tag.bind(undefined, ns, name)})
window.ele = new Proxy(ns=>new Proxy(tag, handler(ns)), handler());
window.ele = {
    tags: new Proxy(ns=>new Proxy(tag, handler(ns)), handler()),
    add: add,
}
})();
