// crel.js  document.createElement[NS]() wrapper
// const {要素名, ...} = crel(名前空間名URL)
// crel.要素名({属性名:属性値,...}, 子要素, ...)
;(function(){
function camel2Chain(s) { return ifel(s.case.isCamel, ()=>s.case.chain,
    s.pCase.isCamel, ()=>s.pCase.chain) }
function chain2Camel(s) { return ifel(s.case.isChain, ()=>s.case.camel,
    s.pCase.isChain, ()=>s.pCase.camel) }
Object.defineProperties(Element.prototype, {
    attr: { // HTML Element attribute
        get() { return new Proxy(this, {
            get(t,k){return t.getAttribute(k.case.chain)}, 
            set(t,k,v){Type.isNU(v) ? t.removeAttribute(k.case.chain) : t.setAttribute(k.case.chain,v)},
        }) },
    },
    data: { // HTML Element data-attribute
        get() { return new Proxy(this, {
            get(t,k){return t.attr[`data-${k.case.chain}`]}, 
            set(t,k,v){t.attr[`data-${k.case.chain}`]=v}
        }) },
    },
    cp: { // CSS variable / CSS Custom Property  style
        get() { return new Proxy(this, {
            get(t,k){console.log(k,k.case.chain,t.style.getPropertyValue(`--${k.case.chain}`),t.style.getPropertyValue(`--${k.case.chain}`));return t.style.getPropertyValue(`--${k.case.chain}`)}, // getComputedStyle(t).getPropertyValue(...)
            set(t,k,v){Type.isNU(v) ? t.style.removeProperty(`--${k.case.chain}`) : t.style.setProperty(`--${k.case.chain}`,v)}
        }) },
    },
    CP: { // CSS variable / CSS Custom Property  getComputedStyle
        get() { return new Proxy(this, {
            get(t,k){return getComputedStyle(t).getPropertyValue(`--${k.case.chain}`)}, 
            set(t,k,v){throw new TypeError(`getComputedStyle()にはセットできません。`)}
        }) },
    },

    class: { // HTML Element attribute class
        get() { return new Proxy(this, {
            get(t,k){
                if ('v'===k) {return t.className}
                else if ('l'===k) {return t.classList}
                else {throw new TypeError(`class.vかclass.lのみ参照可能です。それぞれel.className, el.classListの略称です。`)}
            }, 
            set(t,k,v){
                if ('v'===k || 'l'===k) {
                    if (Type.isStr(v)) {t.className=v}
                    else if(Type.isStrs(v)) {t.className=v.join(' ')}
                }
                else {throw new TypeError(`class.vかclass.lのみ参照可能です。それぞれel.className, el.classListの略称です。`)}
//                if ('v'===k) {t.className=v}
//                else if ('l'===k) {}
            },
        }) },
    },
    // HTML Element attribute style    el.style（標準API）

    // 複数形（objectによる一括取得＆一括設定）
    attrs: {
        get() { return ([...Array(this.attributes.length)].map((_,i)=>{const a=this.attributes.item(i);return [a.name.case.camel, a.value]}).filter(v=>v)).toObject() },
        set(v) {
            if (Type.isNU(v) || Type.isObj(v)) {
                [...Object.keys(this.attrs)].map(k=>this.attr[k]=null) // 全削除
                if (Type.isObj(v)) { for (let [K,V] of Object.entries(v)) { this.attr[K] = V } } // 各キーに代入
            }
        },
    },
    datas: {
        get() { return ([...Array(this.attributes.length)].map((_,i)=>this.attributes.item(i)).filter(a=>a.name.startsWith('data-')).map(a=>[a.name.replace(/^data-/,'').case.camel, a.value])).toObject() },
        set(v) {
            if (Type.isNU(v) || Type.isObj(v)) {
                [...Object.keys(this.datas)].map(k=>this.data[k]=null) // 全削除
                if (Type.isObj(v)) { for (let [K,V] of Object.entries(v)) { this.data[K] = V } } // 各キーに代入
            }
        },
    },
    cps: { // CSS variable / CSS Custom Property  
        get() { return [...Object.entries(this.styles)].filter(([k,v])=>k.startsWith('__')).map(([k,v])=>[k.pCase.main,v]).toObject() },
        set(o) {
            if (Type.isNU(o) || Type.isObj(o)) {
                [...Object.keys(this.cps)].map(k=>this.cp[k]=null) // 全削除
                if (Type.isObj(o)) { for (let [K,V] of Object.entries(o)) { this.cp[K] = V } } // 各キーに代入
            }
        },
    },
    CPS: { // CSS variable / CSS Custom Property  
        get() { return ([...this.computedStyleMap().entries()].filter(([k,v])=>k.pCase.isChain).map(kv=>[kv[0].pCase.camelT, kv[1].toString()])).toObject() },
        set(v){throw new TypeError(`getComputedStyle()にはセットできません。`)}
    },
    classs: {
        get() { return this.className.split(' ').filter(v=>0<v.length) },
        set(v) {
            if (Type.isStr(v)) { this.className = v }
            else if(Type.isStrs(v)) { this.className = v.join(' ') }
            else {throw new TypeError('classsにセットする値は文字列かその配列であるべきです。')}
        }
    },
    // Style:  CSSStyleDeclaration
    // HTML inline style: HTMLのstyle属性値に書かれた値のみ。しかも値は現在値でなくDOMにセットされた値。（DOM操作）
    // CSS document.styleSheets[0].cssRules[0].style
    // getComputedStyle: 外部CSS等の対象になるCSSプロパティを含める。値は現在値。（CSS操作）※再計算されてパフォーマンス低下する。
    styles: {
        get() {
            const kvs = []
            for (let kv of (this.getAttribute('style') ?? '').split(';')) {
                const k = kv.split(':')[0].trim()
                const ck = chain2Camel(k)
                if (''!==k) {kvs.push([ck, this.style[ck] ?? this.style.getPropertyValue(k)])}
            }
            return kvs.toObject()
        },
        set(v) {
            if (Type.isNU(v) || Type.isObj(v)) {
                this.removeAttribute('style');
                if (Type.isObj(v)) {
                    for (let [K,V] of Object.entries(v)) {
                        const key = K[(K.pCase.hasP) ? 'pCase' : 'case'].chain;
                        this.style.setProperty(key, V)
                    }
                }
            }
        },
    },
    // Element/Node（本当なら型をダウンキャストして対応したいがJSでは不可能のため）
    E: {
        get() {
            if (!this._elm){this._elm=new Elm(this)}
            return this._elm;
        },
    },
    N: {
        get() {
            if (!this._node){this._node=new Node(this)}
            return this._node;
        },
    },

    // 短縮形
    get: {value(q,e){return document.querySelector(q, e ?? this)}},
    gets: {value(q,e){return document.querySelectorAll(q, e ?? this)}},
    getP: {value(q){return this.closest(q)}},
    set: {value(...es){return this.replaceWith(...es)}},
    del: {value(){this.remove()}},
    // append,prepend,before,after,replaceWith,remove,insertAdjacent[Element|HTML|Text]
    add: {value(...cs){return this.append(...cs)}},
    pdd: {value(...cs){return this.prepend(...cs)}},
    ins: {value(...cs){return this.after(...cs)}},
    pns: {value(...cs){return this.before(...cs)}},
    // XPath
    xpath: {get(){return XPath.getPath(this)}},
    getX: {value(p){return XPath.getEl(p)}},
    getXs: {value(p){return XPath.getEls(p)}},
    setX: {value(p, ...es){return XPath.replaceEls(p, ...es)}},
    delX: {value(p){return XPath.delEls(p)}},
})
class Elm {
    constructor(el) { this._el = el } // window.Element
    get name() { return this._el.tagName }
    get next() { return this._el.nextElementSibling }
    get prev() { return this._el.previousElementSibling}
    get parent() { return this._el.parentElement }
    get children() { return this._el.children }
    get first() { return this._el.parentElement ? this._el.parentElement.firstElementChild : null }
    get last() { return this._el.parentElement ? this._el.parentElement.lastElementChild : null }
    get firstChild() { return this._el.firstElementChild }
    get lastChild() { return this._el.lastElementChild }
    get isFirst() { return null===this._el.previousElementSibling }
    get isLast() { return null===this._el.nextElementSibling }
    get hasParent() { return null!==this._el.parentElement }
    get hasChild() { return 0<this._el.children.length }
    get ancestors() { return this.#getAncestors(this._el) }
    #getAncestors(el,l) {
        if (!l) {l=[]}
        if (el) {
            const p = el.parentElement
            if (p) { l.push(p); this.#getAncestors(p, l) }
            return l
        }
        else {return l}
    }
}
class Node {
    constructor(el) { this._el = el } // window.Element
    // 相対
    get next() { return this._el.nextSibling }
    get prev() { return this._el.previousSibling }
    get parent() { return this._el.parentNode }
    get children() { return this._el.childNodes }
    get first() { return this._el.parentNode ? this._el.parentNode.firstChild : null }
    get last() { return this._el.parentNode ? this._el.parentNode.firstChild : null }
    get firstChild() { return this._el.firstChild }
    get lastChild() { return this._el.lastChild }
    get isFirst() { return null===this._el.previousSibling }
    get isLast() { return null===this._el.nextSibling }
    get hasParent() { return null!==this._el.parentNode }
    get hasChild() { return 0<this._el.childNodes.length }
    get ancestors() { return this.#getAncestors(this._el) }
    #getAncestors(el,l) {
        if (!l) {l=[]}
        if (el) {
            const p = el.parentNode
            if (p) { l.push(p); this.#getAncestors(p, l) }
            return l
        }
        else {return l}
    }
    // 自身
    get name() { return this._el.nodeName }
    get type() { return this._el.nodeType }
    get value() { return this._el.nodeValue}
    get typeName() { return this.typeAry.filter(([k,v])=>v===this._el.nodeType)[0][0] }
    get types() { return this.#typePascalIds.map(k=>[k.case.camel, this._el[`${k}_NODE`]]).toObject() }
    get typeNames() { return this.#typePascalIds.map(v=>v.case.camel) }
    get #typePascalIds() { return 'ELEMENT,ATTRIBUTE,TEXT,CDATA_SECTION,PROCESSING_INSTRUCTION,COMMENT,DOCUMENT,DOCUMENT_TYPE,DOCUMENT_FRAGMENT'.split(',') }
    get typeObj() { return ({
        element: Node.ELEMENT_NODE, // 1 <p>
        attribute: Node.ATTRIBUTE_NODE, // 2  id="v"
        text: Node.TEXT_NODE, // 3 <>text<>
        cdata: Node.CDATA_SECTION_NODE, // 4 <!CDATA[[ … ]]>
        processingInstruction: Node.PROCESSING_INSTRUCTION_NODE, // 7 <?xml-stylesheet … ?>
        comment: Node.COMMENT_NODE, // 8 <!-- -->
        document: Node.DOCUMENT_NODE, // 9
        documentType: Node.DOCUMENT_TYPE_NODE, // 10 <!DOCTYPE html>
        documentFragment: Node.DOCUMENT_FRAGMENT_NODE, // 11
    })}
    get typeAry() { return [
        ['element', this._el.ELEMENT_NODE],
        ['attribute', this._el.ATTRIBUTE_NODE],
        ['text', this._el.TEXT_NODE],
        ['cdataSection', this._el.CDATA_SECTION_NODE], // <!CDATA[[ … ]]>
        ['processingInstruction', this._el.PROCESSING_INSTRUCTION_NODE], // <?xml-stylesheet … ?>
        ['comment', this._el.COMMENT_NODE], // <!-- … -->
        ['document', this._el.DOCUMENT_NODE],
        ['documentType', this._el.DOCUMENT_TYPE_NODE], // <!DOCTYPE html>
        ['documentFragment', this._el.DOCUMENT_FRAGMENT_NODE],
    ] }
    get typeObj() { return this.typeAry.toObject() }
    get typeMap() { return new Map(this.typeAry) }
    getTypeName(i) {
        const ts = this.typeAry.filter(([k,v])=>v===i)
        console.log(ts, this.typeAry)
        return 0===ts.length ? null : ts[0][0]
    }
    // 子のノードタイプに応じてコールバック関数を実行しその戻り値を配列として返す
    mapChildrenByType(o) { // o:{text:(el,i,gi)=>...,comment:(el,i,gi)=>...,element:(el,i,gi)=>...}
        console.log(this, this._el.childNodes)
        const rets = []
        let [i,gi] = [0,0]
        for (let child of this._el.childNodes) {
            const n = this.getTypeName(child.nodeType)
            console.log(n, child.nodeType)
            if (o.hasOwnProperty(n)) {
                rets.push(o[n](child, i, gi))
                gi++;
            }
            i++;
        }
        console.log(rets)
        return rets
    }
    // 子のノードタイプに応じて置換処理する（コールバック関数で置換したいノードを返す）
    setChildrenByType(o) {
        const newChildren = this.mapChildrenByType(o)
        if (newChildren.length!==this._el.childNodes.length){throw new TypeError(`現在の子ノードと新しいノードの数が違います。一致させてください。document.createDocumentFragment()等を使えば一致させられます。`)}
        for (let i=0; i<this._el.childNodes.length; i++) {
            this._el.replaceChild(newChildren[i], this._el.childNodes[i])
        }
    }
}
class XPath {
    static getPath(el) {
        if(el && el.parentNode) {
            var xpath = this.getPath(el.parentNode) + '/' + el.tagName;
            var s = [];
            for(var i=0; i<el.parentNode.childNodes.length; i++) {
                var e = el.parentNode.childNodes[i];
                if(e.tagName == el.tagName) {s.push(e)}
            }
            if(1 < s.length) {
                for(var i=0; i<s.length; i++) {
                    if(s[i] === el) { xpath += '[' + (i+1) + ']'; break; }
                }
            }
            return xpath.toLowerCase();
        } else {return ''}
    }
    static getEl(xpath){
        const a = this.#get(xpath)
        if (a.snapshotLength > 0) { return a.snapshotItem(0); }
    }
    static getEls(xpath){
        const a = this.#get(xpath)
        return [...Array(a.snapshotLength)].map((_,i)=>a.snapshotItem(i))
    }
    static delEls(xpath){
        const a = this.#get(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).parentNode.removeChild(a.snapshotItem(i))} 
    }
    static replaceEls(xpath, ...newEls){
        const a = this.#get(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).replaceWith(...newEls)}
    }
    static #get(xpath, typ=XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {return document.evaluate(xpath, document, null, typ, null)}
}
})();
