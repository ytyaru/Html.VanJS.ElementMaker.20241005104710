;(function(){
function isLower(v){return v===v.toLowerCase()}
function isUpper(v){return v===v.toUpperCase()}
// 全部小文字[a-z]の場合、区別不能（chain,snake,camelすべて真である）
function isChain(v){return v.includes('-') || isLower(v)}
function isSnake(v){return v.includes('_') || isLower(v)}
function isCamel(v){return !v.includes('-') && !v.includes('_')}
function capitalize(v) { return v[0].toUpperCase() + v.slice(1).toLowerCase() }
function camel2Chain(v) { return v.replace(/_/g,'-').replace(/([A-Z][A-Z0-9]*)/g, (match, p1)=>`-${p1.toLowerCase()}`) }
function chain2Camel(v) { return v.replace(/^([\-]+)/g,(_,p)=>'_'.repeat(p.length)).replace(/\-([a-z][a-z0-9]*)/g,(_,p)=>`${capitalize(p)}`) }
function pascal2Camel(v) { return chain2Camel(v.replace('_','-')) }
console.assert('main-menu'===camel2Chain('mainMenu'))
console.assert('-main-menu'===camel2Chain('MainMenu'))
console.assert('-main-menu'===camel2Chain('_mainMenu'))
console.assert('--main-menu'===camel2Chain('_MainMenu'))
console.assert('--main-menu'===camel2Chain('__mainMenu'))
console.assert('---main-menu'===camel2Chain('__MainMenu'))
console.assert('-webkit-transition'===camel2Chain('_webkitTransition'))
console.assert('-webkit-transition'===camel2Chain('WebkitTransition'))
console.assert('--css-prop-val'===camel2Chain('_CssPropVal'))
console.assert('--css-prop-val'===camel2Chain('__cssPropVal'))
console.assert('a1-key'===camel2Chain('a1Key'))
console.assert('-html5'===camel2Chain('HTML5'))
console.assert('-htmlelement'===camel2Chain('HTMLElement')) // -html-element になってほしいが単語区切が識別不能か
function key(k) { return isChain(k) ? k : camel2Chain(k) } // el['chain-case'] = 'v' / el.camelCase = 'v'
function prop(k) { return isCamel(k) ? k : chain2Camel(k) } // css['writing-mode'] = 'v' / css.writingMode = 'v'
function a2o(a) { return 0===a.length ? {} : Object.assign(...a.map(([k,v])=>({[k]:v}))) } // [[k,v], ...] => {k:v, ...}
function isNU(v) { return [null,undefined].some(V=>V===v) }
function isObj(v) { return isNU(v) ? false : 'object'===typeof v && Object===v.constructor }
function isStr(v) { return 'string'===typeof v || v instanceof String }
function isStrs(v) { return Array.isArray(v) && v.every(V=>isStr(V)) }
function matchKey(k, ...args) {
    
    //for (let i=0; i<args.length; i+=2) { if (k===args[i]) {args[i+1]()} }
    for (let i=0; i<args.length; i+=2) { console.log(k, i, args[i], args[i+1]()); if (k===args[i]) {return args[i+1]()} }
    if (0===args.length%2) {
        const keys = [...args].filter((v,i)=>0===i%2)
        throw new TypeError(`kはどれとも一致しませんでした。k:${k}。次のいずれかに一致すべきです。${keys}`)
    }
    else {args[args.length-1]()}
}
Object.defineProperties(Element.prototype, {
    attr: { // HTML Element attribute
        get() { return new Proxy(this, {
            get(t,k){return t.getAttribute(key(k))}, 
            set(t,k,v){isNU(v) ? t.removeAttribute(key(k)) : t.setAttribute(key(k),v)},
        }) },
    },
    data: { // HTML Element data-attribute
        get() { return new Proxy(this, {
            get(t,k){return t.attr[`data-${key(k)}`]}, 
            set(t,k,v){t.attr[`data-${key(k)}`]=v}
        }) },
    },
    cp: { // CSS variable / CSS Custom Property  
        get() { return new Proxy(this, {
            get(t,k){return getComputedStyle(t).getPropertyValue(`--${key(k)}`)}, 
            set(t,k,v){isNU(v) ? t.style.removeProperty(`--${key(k)}`) : t.style.setProperty(`--${key(k)}`,v)}
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
                if ('v'===k) {t.className=v}
            },
        }) },
    },
    // HTML Element attribute style    el.style（標準API）

    // 複数形（objectによる一括取得＆一括設定）
    attrs: {
        get() { return a2o([...Array(this.attributes.length)].map((_,i)=>{const a=this.attributes.item(i);return [a.name, a.value]})) },
        set(v) {
            if (isNU(v) || isObj(v)) {
                [...Object.keys(this.attrs)].map(k=>this.attr[k]=null) // 全削除
                if (isObj(v)) { for (let [K,V] of Object.entries(v)) { this.attr[K] = V } } // 各キーに代入
            }
        },
    },
    datas: {
        get() { return a2o([...Array(this.attributes.length)].map((_,i)=>this.attributes.item(i)).filter(a=>a.name.startsWith('data-')).map(a=>[chain2Camel(a.name.replace(/^data-/,'')), a.value])) },
        set(v) {
            if (isNU(v) || isObj(v)) {
                [...Object.keys(this.datas)].map(k=>this.data[k]=null) // 全削除
                if (isObj(v)) { for (let [K,V] of Object.entries(v)) { this.data[K] = V } } // 各キーに代入
            }
        },
    },
    cps: { // CSS variable / CSS Custom Property  
        get() { return a2o([...this.computedStyleMap().entries()].filter(([k,v])=>k.startsWith('--')).map(kv=>[prop(kv[0].replace(/\-+/,'')), kv[1].toString()])) },
        set(o) {
            if (isNU(o) || isObj(o)) {
                [...Object.keys(this.cps)].map(k=>this.data[k]=null) // 全削除
                if (isObj(o)) { for (let [K,V] of Object.entries(o)) { this.cp[K] = V } } // 各キーに代入
            }
        },
    },
    classs: {
        get() { return this.className.split(' ') },
        set(v) {
            if (isStr(v)) { this.className = v }
            else if(isStrs(v)) { this.className = v.join(' ') }
            else {throw new TypeError('classsは文字列かその配列であるべきです。')}
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
                if (''!==k) {kvs.push([chain2Camel(k),this.style[prop(k)]])}
            }
            return a2o(kvs)
        },
        set(v) {
            if (isNU(v) || isObj(v)) {
                this.removeAttribute('style');
                if (isObj(v)) { for (let [K,V] of Object.entries(v)) { this.style[K] = V } } // 各キーに代入
            }
        },
    },

    // Element/Node 命名統一系
    E: { // Element系
        get() { return new Proxy(this, {
            get(t,k){
                const kvs = {
                    // 自身の相対位置にある要素を取得する
                    'next': ()=>t.nextElementSibling,
                    'prev': ()=>t.previousElementSibling,
                    'parent': ()=>t.parentElement,
                    'children': ()=>t.children,
                    'first': ()=>t.parentElement ? t.parentElement.firstElementChild : null, // firstSibling（長兄）
                    'last': ()=>t.parentElement ? t.parentElement.firstElementChild : null,  // lastSibling（末弟）
                    //'firstChild': ()=>t.firstElementChild,
                    //'firstChild': ()=>{console.log(this);return t.firstElementChild},
                    //'firstChild': (()=>{console.log(this);return t.firstElementChild}).bind(t),
                    'firstChild': ()=>{console.log(this, t);return t.firstElementChild},
                    'lastChild': ()=>t.lastElementChild,
//                    'descendants': ()=>{}, // 子孫
//                    'ancestors': ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst': ()=>null===t.previousElementSibling,
                    'isLast': ()=>null===t.nextElementSibling,
//                    'isFirstBro': ()=>null===t.previousElementSibling,
//                    'isLastBro': ()=>null===t.nextElementSibling,
//                    'isFirstChild': ()=>this===t.parentElement.firstChild,
//                    'isLastChild': ()=>this===t.parentElement.lastChild,
                    'hasParent': ()=>null!==t.parentElement,
                    'hasChild': ()=>0<t.children.length,
                    // 自身の名前
                    'name': ()=>t.tagName,
                }
//                console.log([...Object.entries(kvs)].map(([k,fn])=>[k, fn.bind(t)]).flat())
                //return matchKey(k, ...[...Object.entries(kvs)].map(([k,fn])=>[k, fn.bind(t)]).flat())
                //return matchKey(k, ...[...Object.entries(kvs)].map(([k,fn])=>[k, fn.bind(this)]).flat())
                return matchKey(k, ...[...Object.entries(kvs)].map(([k,fn])=>[k,fn]).flat())
                /*
                new Proxy(t, {
                    // 自身の相対位置にある要素を取得する
                    'next': ()=>this.nextElementSibling,
                    'prev': ()=>this.previousElementSibling,
                    'parent': ()=>this.parentElement,
                    'children': ()=>this.children,
                    'first': ()=>this.parentElement ? this.parentElement.firstElementChild : null, // firstSibling（長兄）
                    'last': ()=>this.parentElement ? this.parentElement.firstElementChild : null,  // lastSibling（末弟）
                    //'firstChild': ()=>this.firstElementChild,
                    //'firstChild': ()=>{console.log(this);return this.firstElementChild},
                    'firstChild': (()=>{console.log(this);return this.firstElementChild}).bind(t),
                    'lastChild': ()=>this.lastElementChild,
//                    'descendants': ()=>{}, // 子孫
//                    'ancestors': ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst': ()=>null===this.previousElementSibling,
                    'isLast': ()=>null===this.nextElementSibling,
//                    'isFirstBro': ()=>null===this.previousElementSibling,
//                    'isLastBro': ()=>null===this.nextElementSibling,
//                    'isFirstChild': ()=>this===this.parentElement.firstChild,
//                    'isLastChild': ()=>this===this.parentElement.lastChild,
                    'hasParent': ()=>null!==this.parentElement,
                    'hasChild': ()=>0<this.children.length,
                    // 自身の名前
                    'name': ()=>this.tagName,
                })
                return matchKey(k, ...[...Object.entries(kvs)].map(([k,fn])=>[k, fn.bind(t)]).flat())
                */
                /*
                return matchKey(k,
                    // 自身の相対位置にある要素を取得する
                    'next', ()=>this.nextElementSibling,
                    'prev', ()=>this.previousElementSibling,
                    'parent', ()=>this.parentElement,
                    'children', ()=>this.children,
                    'first', ()=>this.parentElement ? this.parentElement.firstElementChild : null, // firstSibling（長兄）
                    'last', ()=>this.parentElement ? this.parentElement.firstElementChild : null,  // lastSibling（末弟）
                    'firstChild', ()=>this.firstElementChild,
                    'lastChild', ()=>this.lastElementChild,
//                    'descendants', ()=>{}, // 子孫
//                    'ancestors', ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst', ()=>null===this.previousElementSibling,
                    'isLast', ()=>null===this.nextElementSibling,
//                    'isFirstBro', ()=>null===this.previousElementSibling,
//                    'isLastBro', ()=>null===this.nextElementSibling,
//                    'isFirstChild', ()=>this===this.parentElement.firstChild,
//                    'isLastChild', ()=>this===this.parentElement.lastChild,
                    'hasParent', ()=>null!==this.parentElement,
                    'hasChild', ()=>0<this.children.length,
                    // 自身の名前
                    'name', ()=>this.tagName,
                )
                */
            }, 
        })},
    },
    N: { // Node系
        get() { return new Proxy(this, {
            get(t,k){
                if ('typeName'===k) { return ((i)=>{ // i: Node.nodeType
                        const ts = Object.entries(t.N.typeObj).filter(([k,v])=>v===i)
                        return 0===ts.length ? null : ts[0][0]
                    })
                }
                // 子ノードのタイプに応じて一括処理する
                else if ('processChildrenByType'===k) { return ((o)=>{ // o:{typeName: ()=>{処理}, ...}
                        console.log(t, t.childNodes)
                        const rets = []
                        for (let child of t.childNodes) {
                            const n = t.nodeTypeName(child.nodeType)
                            if (o.hasOwnProperty(n)) {
                                rets.push(o[n](child, i, gi))
                                gi++;
                            }
                            i++;
                        }
                        return rets
                    })
                }
                /*
                if ('typeName'===k) { return ((i)=>{
                        const ts = Object.entries(t.N.typeObj).filter(([k,v])=>v===i)
                        return 0===ts.length ? null : ts[0][0]
                    })
                }
                // // 子ノードのタイプに応じて一括処理する
                else if ('processChildrenByType'===k) { return ((o)=>{ // o:{typeName: ()=>{処理}, ...}
                        console.log(t, t.childNodes)
                        const rets = []
                        for (let child of t.childNodes) {
                            const n = t.nodeTypeName(child.nodeType)
                            if (o.hasOwnProperty(n)) {
                                rets.push(o[n](child, i, gi))
                                gi++;
                            }
                            i++;
                        }
                        return rets
                    }),
                }
                */
                const kvs = {
                    // 自身の相対位置にある要素を取得する
                    'next': ()=>t.nextSibling,
                    'prev': ()=>t.previousSibling,
                    'parent': ()=>t.parentNode,
                    'children': ()=>t.childNodes,
                    'first': ()=>t.parentNode ? t.parentNode.firstChild : null,
                    'last': ()=>t.parentNode ? t.parentNode.firstChild : null,
                    //'firstChild': ()=>t.firstChild,
                    'firstChild': ()=>t.firstChild,
                    'lastChild': ()=>t.lastChild,
//                    'descendants': ()=>{}, // 子孫
//                    'ancestors': ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst': ()=>null===t.previousSibling,
                    'isLast': ()=>null===t.nextSibling,
                    'hasParent': ()=>null!==t.parentNode,
                    'hasChild': ()=>0<t.childNodes.length,
//                    'hasDescendants': ()=>{}, // 子孫
//                    'hasAncestors': ()=>{}, // 先祖

                    // 自身の名前
                    'name': ()=>t.nodeName,
                    'type': ()=>t.nodeType,
                    'value': ()=>t.nodeValue,

                    types: ()=>a2o(t.N.typePascalNames.map(k=>[pascal2Camel(k), t[`${k}_NODE`]])),
                    typeNames: ()=>this.N.typePascalNames.map(v=>pascal2Camel(v)),
                    typePascalNames: ()=>'ELEMENT,ATTRIBUTE,TEXT,CDATA_SECTION,PROCESSING_INSTRUCTION,COMMENT,DOCUMENT,DOCUMENT_TYPE,DOCUMENT_FRAGMENT'.split(','),
//                    typeName: (i)=>{
//                        const ts = Object.entries(this.nodeTypeObj).filter(([k,v])=>v===i)
//                        return 0===ts.length ? null : ts[0][0]
//                    }},
                    typeObj: {
                        get() {
                            return ({
                                element: Node.ELEMENT_NODE, // 1 <p>
                                attribute: Node.ATTRIBUTE_NODE, // 2  id="v"
                                text: Node.TEXT_NODE, // 3 <>text<>
                                cdata: Node.CDATA_SECTION_NODE, // 4 <!CDATA[[ … ]]>
                                processingInstruction: Node.PROCESSING_INSTRUCTION_NODE, // 7 <?xml-stylesheet … ?>
                                comment: Node.COMMENT_NODE, // 8 <!-- -->
                                document: Node.DOCUMENT_NODE, // 9
                                documentType: Node.DOCUMENT_TYPE_NODE, // 10 <!DOCTYPE html>
                                documentFragment: Node.DOCUMENT_FRAGMENT_NODE, // 11
                            })
                        },
                    },
                    processChildrenByType: { // 子ノードのタイプに応じて一括処理する
                        value: (o)=>{ // {typeName: ()=>{処理}, ...}
                            console.log(this, this.childNodes)
                            const rets = []
                            for (let child of this.childNodes) {
                                const n = this.nodeTypeName(child.nodeType)
                                if (o.hasOwnProperty(n)) {
                                    rets.push(o[n](child, i, gi))
                                    gi++;
                                }
                                i++;
                            }
                            return rets
                        },
                    },


                }
                //return matchKey(k, ...[...Object.entries(kvs)].map(([k,fn])=>[k, fn.bind(t)]).flat())
                return matchKey(k, ...[...Object.entries(kvs)].map(([k,fn])=>[k,fn]).flat())
                /*
                return matchKey(k,
                    // 自身の相対位置にある要素を取得する
                    'next', ()=>this.nextSibling,
                    'prev', ()=>this.previousSibling,
                    'parent', ()=>this.parentNode,
                    'children', ()=>this.childNodes,
                    'first', ()=>this.parentNode ? this.parentNode.firstChild : null,
                    'last', ()=>this.parentNode ? this.parentNode.firstChild : null,
                    'firstChild', ()=>this.firstChild,
                    'lastChild', ()=>this.lastChild,
//                    'descendants', ()=>{}, // 子孫
//                    'ancestors', ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst', ()=>null===this.previousSibling,
                    'isLast', ()=>null===this.nextSibling,
                    'hasParent', ()=>null!==this.parentNode,
                    'hasChild', ()=>0<this.childNodes.length,
//                    'hasDescendants', ()=>{}, // 子孫
//                    'hasAncestors', ()=>{}, // 先祖

                    // 自身の名前
                    'name', ()=>this.nodeName,
                    'type', ()=>this.nodeType,
                    'value', ()=>this.nodeValue,
                )
                */
            }, 
        })},
    },

    // has系は Node.contain(node) でOK（子孫の中にnodeがあれば真を返す）
    // 先祖に持っている場合のメソッドも欲しい。名前を以下のどちらにすべきか。
    // Node.hasAncestor(node) 
    // Node.isDescendantOf(node) 

    /*
    has: { // 指定した要素を子孫に持っているか
        value: (descend)=>this===descend ? false : this.contains(descend),
    },
    hasChild: { // 指定した要素を子に持っているか（子孫以下に持っていてもfalseを返す）
        value: (child)=>0<[...this.children].filter(c=>c===child).length,
    },
    hasAncestor: { // 指定した要素を先祖に持っているか
        //value: (anc)=>0<[...this.children].filter(c=>c===child).length,
        value: (anc, depth=0)=>{
            if(anc===this){return 0===depth ? false : true}
            const P = this.parentElement
            if (P) { return P.hasAncestor(anc, ++depth) }
            else {return false}
        },
    },
    */
    /*
    hasDescendants: { // 指定した要素を子孫に持っているか
        value: (child)=>0<[...this.children].filter(c=>c===child).length,
    },
    hasAncestors: { // 指定した要素を先祖に持っているか
        value: (child)=>0<[...this.children].filter(c=>c===child).length,
    },
    */


    /*
    el.get.next.el
    el.get.next.node

    ml.n(el).get.next    // .nextElementSibling
    ml.e(node).get.next  // .nextSibling

    el.E.next // .nextElementSibling
    el.N.next // .nextSibling
    */
    /*

    el: {
        get() { return new Proxy(this, {
            get(t,k){
                return matchKey(k,
                    // 自身の相対位置にある要素を取得する
                    'next', ()=>this.nextElementSibling,
                    'prev', ()=>this.previousElementSibling,
                    'parent', ()=>this.parentElement,
                    'children', ()=>this.children,
                    'firstBro', ()=>this.parentElement.firstElementChild,
                    'lastBro', ()=>this.parentElement.firstElementChild,
                    'firstChild', ()=>this.firstElementChild,
                    'lastChild', ()=>this.lastElementChild,
//                    'descendants', ()=>{}, // 子孫
//                    'ancestors', ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst', ()=>null===this.previousElementSibling,
                    'isLast', ()=>null===this.nextElementSibling,
                    'hasParent', ()=>null!==this.parentElement,
                    'hasChild', ()=>0<this.children.length,
                    // 自身の名前
                    'name', ()=>this.tagName,
                )
            }, 
        }
    )},
    node: {
        get() { return new Proxy(this, {
            get(t,k){
                return matchKey(k,
                    // 自身の相対位置にある要素を取得する
                    'next', ()=>this.nextSibling,
                    'prev', ()=>this.previousSibling,
                    'parent', ()=>this.parentNode,
                    'children', ()=>this.childNodes,
                    'firstBro', ()=>this.parentNode.firstChild,
                    'lastBro', ()=>this.parentElement.firstChild,
                    'firstChild', ()=>this.firstChild,
                    'lastChild', ()=>this.lastChild,
//                    'descendants', ()=>{}, // 子孫
//                    'ancestors', ()=>{}, // 先祖

                    // 自身の相対位置に関する真偽値を返す
                    'isFirst', ()=>null===this.previousSibling,
                    'isLast', ()=>null===this.nextSibling,
                    'hasParent', ()=>null!==this.parentNode,
                    'hasChild', ()=>0<this.childNodes.length,
                    // 自身の名前
                    'name', ()=>this.nodeName,
                    'type', ()=>this.nodeType,
                    'value', ()=>this.nodeValue,
                )
            }, 
        }
    )},
    cs: { // computedStyle() CSS再計算するためパフォーマンス低下する content-visibility:hidden で再計算を防ぐと吉
        get() {return getComputedStyle(this)},
    },
    cp: { // CSS Custom Property
        get() { return new Proxy(this, {
            get(t,k){return getComputedStyle(t).getPropertyValue(`--${key(k)}`)}, 
            set(t,k,v){t.style[key(k)]=v} // setProperty()の省略形
//            set(t,k,v){t.style.setProperty(key(k), v)}
        }) },
    },
    css: {
        get() { return new Proxy(this, {
            get(t,k){const v=getComputedStyle(t).getPropertyValue(key(k)); console.log(v, t.style, prop(k), key(k), v ? v : t.style[key(k)]);return v ? v : t.style[key(k)]},
            //set(t,k,v){console.log(t,key(k),v);t.style.setProperty(key(k),v)}
            set(t,k,v){isNU(v) ? t.style.removeProperty(key(k)) : t.style.setProperty(key(k),v)}
        })},
    },
    */

})

/*
// 名前重複してしまう。Elementのnext等と
Object.defineProperties(Node.prototype, {
    // ノードを取得する（自身の相対位置にある要素）
    // Node: DOM要素
    // Element: Nodeのうちtype=Elementのもの（他にもテキスト、コメント等の別typeなノードがある）
    next: {get() {return this.nextSibling}},
    prev: {get() {return this.previousSibling}},
    parent: {get() {return this.parentNode}},
    children: {get() {return this.childNodes}}
 
})
*/
/*
// Node.contain()があるので不要？
Object.defineProperties(Node.prototype, {
    has: { // 指定したノードを子に持っているか
        value: (child)=>0<[...this.childNodes].filter(c=>c===child).length,
    }
})
*/


/*
Object.defineProperties(Node.prototype, {
    nodeTypes: {get(){return a2o(this.nodeTypePascalNames.map(k=>[pascal2Camel(k), Node[`${k}_NODE`]])) }},
    nodeTypeNames: {get(){return this.nodeTypePascalNames.map(v=>pascal2Camel(v)) }},
    nodeTypePascalNames: {get() { return 'ELEMENT,ATTRIBUTE,TEXT,CDATA_SECTION,PROCESSING_INSTRUCTION,COMMENT,DOCUMENT,DOCUMENT_TYPE,DOCUMENT_FRAGMENT'.split(',') }},
    //nodeTypeName: {value:(i)=>Object.entries(this.nodeTypeObj).filter(([k,v])=>v===i)[0][0]}
    nodeTypeName: {value:(i)=>{
        const ts = Object.entries(this.nodeTypeObj).filter(([k,v])=>v===i)
        return 0===ts.length ? null : ts[0][0]
    }},
    nodeTypeObj: {
        get() {
            return ({
                element: Node.ELEMENT_NODE, // 1 <p>
                attribute: Node.ATTRIBUTE_NODE, // 2  id="v"
                text: Node.TEXT_NODE, // 3 <>text<>
                cdata: Node.CDATA_SECTION_NODE, // 4 <!CDATA[[ … ]]>
                processingInstruction: Node.PROCESSING_INSTRUCTION_NODE, // 7 <?xml-stylesheet … ?>
                comment: Node.COMMENT_NODE, // 8 <!-- -->
                document: Node.DOCUMENT_NODE, // 9
                documentType: Node.DOCUMENT_TYPE_NODE, // 10 <!DOCTYPE html>
                documentFragment: Node.DOCUMENT_FRAGMENT_NODE, // 11
            })
        },
    },
    processChildrenByType: { // 子ノードのタイプに応じて一括処理する
        value: (o)=>{ // {typeName: ()=>{処理}, ...}
            console.log(this, this.childNodes)
            const rets = []
            for (let child of this.childNodes) {
                const n = this.nodeTypeName(child.nodeType)
                if (o.hasOwnProperty(n)) {
                    rets.push(o[n](child, i, gi))
                    gi++;
                }
                i++;
            }
            return rets
        },
    },
})
*/

})();

