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
function key(k) { return isChain(k) ? k : camel2Chain(k) } // el['chain-case'] = 'v' / el.camelCase = 'v'
function prop(k) { return isCamel(k) ? k : chain2Camel(k) } // css['writing-mode'] = 'v' / css.writingMode = 'v'
function a2o(a) { return 0===a.length ? {} : Object.assign(...a.map(([k,v])=>({[k]:v}))) } // [[k,v], ...] => {k:v, ...}
function isNU(v) { return [null,undefined].some(V=>V===v) }
function matchKey(k, ...args) {
    for (let i=0; i<args.length; i+=2) {
        if (k===args[i]) {args[i+1]()}
    }
    //if (1===args.length%2) { args[args.length-1]() }
    const keys = [...args].filter((v,i)=>0===i%2)
    if (1===args.length%2) { throw new TypeError(`kはどれとも一致しませんでした。k:${k}。次のいずれかに一致すべきです。${keys}`) }
}
Object.defineProperties(Element.prototype, {
    attr: { // HTML Element attribute
        get() { return new Proxy(this, {
            get(t,k){return t.getAttribute(key(k))}, 
            set(t,k,v){console.log('attr set():',k,v,isNU(v),key(k));isNU(v) ? t.removeAttribute(key(k)) : t.setAttribute(key(k),v)},
        }) },
    },
    data: { // HTML Element data-attribute
        get() { return new Proxy(this, {
            get(t,k){return t.attr[`data-${key(k)}`]}, 
            set(t,k,v){console.log('data set():',k,v);t.attr[`data-${key(k)}`]=v}
        }) },
    },
    cssv: { // CSS variable / CSS Custom Property  
        get() { return new Proxy(this, {
            get(t,k){return getComputedStyle(t).getPropertyValue(`--${key(k)}`)}, 
            //set(t,k,v){t.style[`--${key(k)}`]=v},
            //set(t,k,v){t.style.setProperty(`--${key(k)}`,v)}
            //set(t,k,v){isNU(v) ? t.style.removeProperty(key(k)) : t.style.setProperty(key(k),v)}
            set(t,k,v){isNU(v) ? t.style.removeProperty(`--${key(k)}`) : t.style.setProperty(`--${key(k)}`,v)}
        }) },
    },
    class: { // HTML Element attribute class
        get() { return new Proxy(this, {
            get(t,k){
                if ('v'===k) {t.className}
                else if ('l'===k) {t.classList}
                else {throw new TypeError(`class.vかclass.lのみ参照可能です。それぞれel.className, el.classListの略称です。`)}
            }, 
        }) },
    },
    // HTML Element attribute style    el.style（標準API）


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
    /*
    hasDescendants: { // 指定した要素を子孫に持っているか
        value: (child)=>0<[...this.children].filter(c=>c===child).length,
    },
    hasAncestors: { // 指定した要素を先祖に持っているか
        value: (child)=>0<[...this.children].filter(c=>c===child).length,
    },
    */

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
        /*
        // 要素を取得する（自身の相対位置にある要素）
        first: {get() {return this.firstElementChild}},
        last: {get() {return this.lastElementChild}},
        next: {get() {return this.nextElementSibling}},
        prev: {get() {return this.previousElementSibling}},
        parent: {get() {return this.parentElement}},
        children: {get() {return this.children}},
        */
    )},
    node: {
        /*
        // ノードを取得する（自身の相対位置にある要素）
        // Node: DOM要素
        // Element: Nodeのうちtype=Elementのもの（他にもテキスト、コメント等の別typeなノードがある）
        first: {get() {return this.firstChild}},
        last: {get() {return this.lastChild}},
        next: {get() {return this.nextSibling}},
        prev: {get() {return this.previousSibling}},
        parent: {get() {return this.parentNode}},
        children: {get() {return this.childNodes}},
        // 自身の情報
        name: {get() {return this.nodeName }},
        type: {get() {return this.nodeType }},
        value: {get() {return this.nodeValue }},
        */
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
    attrs: {
        get() { return a2o([...Array(this.attributes.length)].map((_,i)=>{const a=this.attributes.item(i);return [a.name, a.value]})) },
        set(v) {
            if (isNU(v)) { [...Object.keys(this.attrs)].map(k=>this.attr[k]=null) } // 全削除
            else { for (let [K,V] of Object.entries(v)) { this.attr[K] = V } } // 各キーに代入
        },
        //set(v) { for (let [K,V] of Object.entries(v)) { this.attr[K] = V } },
        //set(v) { console.log(v);for (let [K,V] of Object.entries(v)) { this.attr[K] = V } },
    },
    datas: {
        //get() { return a2o([...Array(this.attributes.length)].map((_,i)=>this.attributes.item(i)).filter(a=>a.name.startsWith('data-')).map(a=>[a.name, a.value])) },
        get() { return a2o([...Array(this.attributes.length)].map((_,i)=>this.attributes.item(i)).filter(a=>a.name.startsWith('data-')).map(a=>[chain2Camel(a.name.replace(/^data-/,'')), a.value])) },
        set(v) {
            if (isNU(v)) {console.log(this.datas, [...Object.keys(this.datas)]); [...Object.keys(this.datas)].map(k=>this.data[k]=null) } // 全削除
            else { for (let [K,V] of Object.entries(v)) { this.data[K] = V } } // 各キーに代入
        },
    },
    // HTML inline style: HTMLのstyle属性値に書かれた値のみ。しかも値は現在値でなくDOMにセットされた値。（DOM操作）
    // getComputedStyle: 外部CSS等の対象になるCSSプロパティを含める。値は現在値。（CSS操作）
    csss: {
        get() {
            const kvs = []
            for (let kv of this.getAttribute('style').split(';')) {
//                const i = kv.indexOf(':')
                //const [k, v] = [kv.slice(0, i).trim(), kv.slice(i+1).trim()]
                //const [k, v] = [kv.slice(0, i).trim(), this.css[k]] // computed / inline
//                const [k, v] = [, this.css[k]] // computed / inline
//                if (''!==k) {kvs.push([chain2Camel(k),v])}
                const k = kv.split(':')[0].trim()
                if (''!==k) {kvs.push([chain2Camel(k),this.css[k]])}
            }
            return a2o(kvs)
        },
        set(v) {
            for (let [K,V] of Object.entries(v)) { this.css[K] = V }
        },
        /*
        get() {return getComputedStyle(this)},
        set(v) {
            for (let key of this.csss) {

            }
        }
        */
        //get() {return [this.style]},
        //get() {return this.computedStyleMap()},
//        get() {
//            this.computedStyleMap()
//        },
//        set(v) {}
    },
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

Object.defineProperties(Node.prototype, {
    has: { // 指定したノードを子に持っているか
        value: (child)=>0<[...this.childNodes].filter(c=>c===child).length,
    }
})

})();

