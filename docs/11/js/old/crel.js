// ml.js  document.createElement[NS]() wrapper
// const {要素名, ...} = ml.tags(名前空間名URL)
// ml.tags.要素名({属性名:属性値,...}, 子要素, ...)
// ml.add(parent, child, child, ...)
// ml.set(oldEl, newEl, newEl, ...)
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

class _StringCase {
    constructor() {
        this.cases = {
            'chain':    {name:'chain', delimiter:'-', method:'toLowerCase', target:'all'},
            'snake':    {name:'snake', delimiter:'_', method:'toLowerCase', target:'all'},
            'camel':    {name:'camel', delimiter:'',  method:'capitalize',  target:'word2'},
            'pascal':   {name:'pascal', delimiter:'',  method:'capitalize',  target:'word'},
            'constant': {name:'constant', delimiter:'_', method:'toUpperCase', target:'all'},
            'title':    {name:'title', delimiter:' ', method:'capitalize',  target:'all'},
        }
    }
    get Names() { return Object.keys(this.cases) }
    isSome(str) { return ['Chain','Snake','Camel','Pascal','Constant','Title'].map(m=>this[`is${m}`](str)).some(b=>b) }
//    match(caseName, str) {
//        if (!this.isSome(caseName)) {throw new TypeError(`caseNameは${this.Names}のいずれかであるべきです。`)}
//        return this[`is${this.toTitle(caseName)}`](str)
//    }
    getName(str) {
        for (let name of this.Names.map(v=>this.toTile(v))) {
            if (this[`is${name}`](str)) { return name.toLowerCase() }
        }
    }
    isChain(str) {return /^[a-z][a-z0-9\-]+$/g.test(str)}
    isSnake(str) {return /^[a-z][a-z0-9_]+$/g.test(str)}
    isCamel(str) {return /^[a-z][a-zA-Z0-9]+$/g.test(str)}
    isPascal(str) {return /^[A-Z][a-zA-Z0-9]+$/g.test(str)}
    isConstant(str) {return /^[A-Z_][A-Z0-9_]+$/g.test(str)}
    isTitle(str) {return (str.includes(' ') && /^[A-Z]+$/g.test(str[0]))}
    getType(str) {
        if (this.isChain(str)) { return this.cases.chain }
        else if (this.isConstant(str)) { return this.cases.constant } // upper snake
        else if (this.isPascal(str)) { return this.cases.pascal }     // upper camel
        else if (this.isSnake(str)) { return this.cases.snake }
        else if (this.isCamel(str)) { return this.cases.camel }
        else if (this.isTitle(str)) { return this.cases.title }
        else { return null }
    }
    getName(str) {
        if (this.isChain(str)) { return 'chain' }
        else if (this.isConstant(str)) { return 'constant' } // upper snake
        else if (this.isPascal(str)) { return 'pascal' }     // upper camel
        else if (this.isSnake(str)) { return 'snake' }
        else if (this.isCamel(str)) { return 'camel' }
        else if (this.isTitle(str)) { return 'title' }
        else { return '' }
    }
    toChain(str) {return this.to(str, this.cases.chain).toString()}
    toSnake(str) {return this.to(str, this.cases.snake).toString()}
    toCamel(str) {return this.to(str, this.cases.camel).toString()}
    toPascal(str) {return this.to(str, this.cases.pascal).toString()}
    toConstant(str) {return this.to(str, this.cases.constant).toString()}
    toTitle(str) {return this.to(str, this.cases.title).toString()}
    to(str, to) {
        const from = this.getType(str)
        if (!to) { throw new Error(`出力ケースは次のいずれかであるべきです。${this.Names.join(',')}`) }
        if (!from) {
            if (1===str.length && 'constant,pascal,title'.split(',').some(c=>c===to.name)) { return str.toUpperCase() }
            return str
        }
        if (from===to) { return str }
        return this.#join(this.#split(str, from), to)
    }
    #split(str, from) { return (1===from.delimiter.length) ? str.split(from.delimiter) : str.split(/(?=[A-Z])/) }
    #join(words, to) {
        if ('all' === to.target) { return words.join(to.delimiter)[to.method]() }
        else if ('word'===to.target) { return words.map(w=>w[to.method]()).join(to.delimiter) }
        else if ('word2'===to.target) { return [words[0].toLowerCase(), ...words.slice(1).map(w=>w[to.method]())].join(to.delimiter) }
        else { throw new Error('引数to(Case)のtargetはall,word,word2のいずれかであるべきです。') }
    }
}
const StringCase = new _StringCase()
String.prototype.case = {}
/*
const cases = 'title,chain,snake,camel,pascal'.split(',')
const tos = cases.map(c=>`to${StringCase.Title(c)}`)
const iss = cases.map(c=>`is${StringCase.Title(c)}`)
for (let methodName of [...tos, ...iss, 'Names', 'getName']) {
    const name = methodName.startsWith('to') ? methodName.slice(2).toLowerCase() : methodName
    Object.defineProperty(String.prototype.case, name, {get:()=>{return StringCase[methodName](this)}}
}
// プロパティ呼出
String.prototype.case.Names = ()=>{return StringCase.Names}}
// メソッド定義
String.prototype.case.getName = ()=>{return StringCase.getName(this)}}
*/
// ゲッター定義
Object.defineProperties(String.prototype.case.bind(String.prototype), {
    // 変換
    title: {get:()=>{return StringCase.toTitle(this)}},
    chain: {get:()=>{return StringCase.toChain(this)}},
    snake: {get:()=>{return StringCase.toSnake(this)}},
    camel: {get:()=>{return StringCase.toCamel(this)}},
    pascal: {get:()=>{return StringCase.toPascal(this)}},
    constant: {get:()=>{return StringCase.toConstant(this)}},
    // 判定
    isTitle: {get:()=>{return StringCase.isTitle(this)}},
    isChain: {get:()=>{return StringCase.isChain(this)}},
    isSnake: {get:()=>{return StringCase.isSnake(this)}},
    isCamel: {get:()=>{return StringCase.isCamel(this)}},
    isPascal: {get:()=>{return StringCase.isPascal(this)}},
    isConstant: {get:()=>{return StringCase.isConstant(this)}},
    isSome: {get:()=>{return StringCase.isSome(this)}},
//    match: {value:(caseName)=>{return StringCase.isSome(this)}}
    // ケース名
    names: {get:()=>{return StringCase.Names}},
    name: {get:()=>{return StringCase.getName(this)}},
});
/*
Object.defineProperty(String.prototype.case, 'title', {get:()=>{return this.charAt(0).toUpperCase() + this.slice(1)}});
Object.defineProperty(String.prototype.case, 'chain', {get:()=>{return StringCase.toChain(this)}});
Object.defineProperty(String.prototype.case, 'snake', {get:()=>{return StringCase.toSnake(this)}});
Object.defineProperty(String.prototype.case, 'camel', {get:()=>{return StringCase.toCamel(this)}});
Object.defineProperty(String.prototype.case, 'pascal', {get:()=>{return StringCase.toPascal(this)}});
Object.defineProperty(String.prototype.case, 'constant', {get:()=>{return StringCase.toConstant(this)}});
Object.defineProperty(String.prototype.case, 'title', {get:()=>{return StringCase.toTitle(this)}});
Object.defineProperty(String.prototype.case, 'isChain', {get:()=>{return StringCase.isChain(this)}});
Object.defineProperty(String.prototype.case, 'isSnake', {get:()=>{return StringCase.isSnake(this)}});
Object.defineProperty(String.prototype.case, 'isCamel', {get:()=>{return StringCase.isCamel(this)}});
Object.defineProperty(String.prototype.case, 'isPascal', {get:()=>{return StringCase.isPascal(this)}});
Object.defineProperty(String.prototype.case, 'isConstant', {get:()=>{return StringCase.isConstant(this)}});
Object.defineProperty(String.prototype.case, 'isTitle', {get:()=>{return StringCase.isTitle(this)}});
*/

class TYPE {
  isObj(v) {return 'object'===typeof v && Object===v.constructor}
  isStr(v) {return 'string'===typeof v || v instanceof String}
  isFn(v) {return 'function'===typeof v}
  isEl(v) {return v instanceof HTMLElement }
  isAry(v) {return Array.isArray(v)}
  isStrs(v) {return this.isAry(v) && v.every(V=>this.isStr(V))}
  is(tyNm,v) {return this[`is${tyNm.case.title}`](v)}
  throw(tyNm,v) {if(!this[`is${tyNm.case.title}`](v)){throw new Type()}}
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
    const el = ns ? document.createElementNS(ns, name) : document.createElement(name)
    for (let [k, v] of Object.entries(props)) {
        const propSetter = Type.getSetter(el, k);
        const setter = propSetter ? propSetter.bind(el, v) : null 
            ?? (k.startsWith('on') && Type.isFn(v)) 
            ? ()=>{console.log(k, k.slice(2), k.startsWith('on'), v);el.addEventListener(k.slice(2), v)}
            : el.setAttribute.bind(el, k, v);
        setter()
        // setter, 関数, setAttribute, の優先順でセットすべき
        // 1. setter: HTMLElementを拡張したクラスの場合、HTML属性ではなくJSクラスのsetterとして代入すべき
        // 2. 関数：on系属性値の場合、その値は関数であるべき。
        // 3. setAttribute: 標準HTMLElementの属性値（文字列）として代入する
    }
    add(el, children)
    return el
}

//const getTarget = (el)=>el instanceof HTMLElement ? el : (Type.isStr(el) ? document.body.querySelector(el))
const set = (target, ...elements)=>target.replaceWith(...elements)
const get = (q, target)=>(Type.isEl(target) ? target : document.querySelector(':root')).querySelector(q)
const gets = (q, target)=>[...(target ? target : document.body).querySelectorAll(q)]
const style = (el,pseudoElt)=>getComputedStyle(el,pseudoElt)
const css = {
    get: (el,k)=>getComputedStyle(el).getPropertyValue(k),
    set: (el,k,v)=>el.style.setProperty(k, v),
//    get: (el,k)=>getComputedStyle(getTarget(el)).getPropertyValue(k),
//    set: (el,k,v)=>getTarget(el).style.setProperty(k, v),
}

ml.css.get(ml.get('#id', el), 'display')
ml.css.set(ml.get('#id', el), 'display', 'none')
ml.css.set(ml.get('#id', el), {display:'none', writingMode:'horizontal-tb', 'writing-mode':'vertical-rl'})

ml.attr.get(ml.get('#id', el), 'tabindex')
ml.attr.get(ml.get('#id', el), ['tabindex', 'id']) // {tabindex:'', id:''}
ml.attr.set(ml.get('#id', el), 'tabindex', 0)
ml.attr.set(ml.get('#id', el), {tabindex:0, id:'someID'})

el.css.get('display')
el.css.get(['display', 'writing-mode'])
el.css.set('display', 'none')
el.css.set({display:'none', writingMode:'horizontal-tb', 'writing-mode':'vertical-rl'})
el.attr.get('tabindex')
el.attr.get(['tabindex','id'])
el.attr.set('tabindex', 0)
el.attr.set({tabindex:0, id:'someID'})

Array.prototype.toObject = function() {
    if (!this.every(v=>Array.isArray(v) && 2<=v.length)) { throw new TypeError(`[[key, value],...]であるべきです。`) }
    return Object.assign(...this.map(([k,v]) => ({[k]:v})))
}

HTMLElement.prototype.css = {}
HTMLElement.prototype.attr = {}
Object.defineProperties(HTMLElement.prototype.css.bind(HTMLElement.prototype), {
    get: {value:(k)=>getComputedStyle(this).getPropertyValue(k)},
    set: {value:(k,v)=>this.style.setProperty(k,v)}
    gets: {
        value:(ks)=>{
            Type.throw('strs', ks)
            return ks.map(k=>[k, this.css.get(k)]).toObject()
        },
    },
    sets: {
        value:(o)=>{
            Type.throw('obj', ks)
            [...Object.entries(o)].map(([k,v])=>this.css.set(k,v))
        },
    },
})
Object.defineProperties(HTMLElement.prototype.attr.bind(HTMLElement.prototype), {
    get:{value:(k)=>this.getAttribute(k)},
    set:{value:(k,v)=>this.setAttribute(k,v)},
    gets: {
        value:(ks)=>{
            Type.throw('strs', ks)
            return ks.map(k=>[k, this.attr.get(k)]).toObject()
        },
    },
    sets: {
        value:(o)=>{
            Type.throw('obj', ks)
            [...Object.entries(o)].map(([k,v])=>this.attr.set(k,v))
        },
    },
})
/*
HTMLElement.prototype.css = {
    get:(k)=>{
        if (Type.isStr(k)) {}
        else {throw new TypeError()}
    },
    set:(k,v)=>{
        if (Type.isStr(k)) {}
        else {throw new TypeError()}
        if (Type.isStr(v)) {}
        else {throw new TypeError()}
    },
    gets:(ks)=>{
        if (Type.isStrs(k)) {}
        else {throw new TypeError()}
    }
    sets:(o)=>{
        if (Type.isStr(k)) {}
        else {throw new TypeError()}

    }
}
HTMLElement.prototype.attr = {
    get:(k)=>{
        
    },
    set:(k,v)=>{

    },
}


ml.css.prop.get()
ml.css.prop.get(ml.style(el), 'display')
ml.css.get(ml.style(el), 'display')
ml.css.set(ml.style(el), 'display')

ml.css.get(el, 'display')
ml.css.set(ml.style(el), 'display')


el.style.getPropertyValue('--a')
getComputedStyle(document.querySelector('#b')).getPropertyValue('--a')
*/
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
window.ml = new Proxy(ns=>new Proxy(tag, handler(ns)), handler());
window.ml = {
    tags: new Proxy(ns=>new Proxy(tag, handler(ns)), handler()),
    add: add,
    set: set,
    get: get,
    gets: gets,
}
})();
