/*
Element.prototype.attr = function(){
    return new Proxy(this, {get(t,k){t.getAttribute(k)}, set(t,k,v){t.setAttribute(k.Chain,v)}})
}
Element.prototype.css = function(){
    return new Proxy(this, {
        get(t,k){getComputedStyle(this).getPropertyValue(k.Chain)},  // 先頭_は--に置換してCSS Property名にする
        set(t,k,v){this.style.setProperty(k,v)}
    })
}
*/
;(function(){
function isLower(v){return v===v.toLowerCase()}
function isUpper(v){return v===v.toUpperCase()}
// 全部小文字[a-z]の場合、区別不能（chain,snake,camelすべて真である）
function isChain(v){return v.includes('-') || isLower(v)}
function isSnake(v){return v.includes('_') || isLower(v)}
function isCamel(v){return !v.includes('-') && !v.includes('_')}
function capitalize(v) { return v[0].toUpperCase() + v.slice(1).toLowerCase() }
function camel2Chain(v) { return v.replace(/_/g,'-').replace(/([A-Z0-9]+)/g, (match, p1)=>`-${p1.toLowerCase()}`) }
//function chain2Camel(v) { return v.replace(/^[\-]/g,'_').replace(/\-([a-z0-9]+)/g, (match, p1)=>`${capitalize(p1)}`)
function chain2Camel(v) { return v.replace(/^([\-]+)/g,(_,p)=>'_'.repeat(p.length)).replace(/\-([a-z0-9]+)/g,(_,p)=>`${capitalize(p)}`) }
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
function key(k) { return isChain(k) ? k : camel2Chain(k) } // el['chain-case'] = 'v' / el.camelCase = 'v'
function prop(k) { return isCamel(k) ? k : chain2Camel(k) } // css['writing-mode'] = 'v' / css.writingMode = 'v'
Object.defineProperties(Element.prototype, {
    attr: {
        //get() { return new Proxy(this, {get(t,k){t.getAttribute(k)}, set(t,k,v){t.setAttribute(k.Chain,v)}}) },
        get() { return new Proxy(this, {
            get(t,k){return t.getAttribute(key(k))}, 
            set(t,k,v){t.setAttribute(key(k),v)} // 
//            get(t,k){console.log(t,k,t.getAttribute(k),camel2Chain(k),key(k));return t.getAttribute(key(k))}, 
//            get(t,k){console.log(t,k,t.getAttribute(k),camel2Chain(k));return t.getAttribute(k)}, 
//            set(t,k,v){t.setAttribute(camel2Chain(k),v)} // 
            //get(t,k){console.log(t,k,t.getAttribute(k),camel2Chain(k));return t.getAttribute(k)}, 
            //set(t,k,v){t.setAttribute(k.Chain,v)} // 
        }) },
    },
    data: {
        get() { return new Proxy(this, {
            get(t,k){return t.getAttribute(`data-${key(k)}`)}, 
            set(t,k,v){t.setAttribute(`data-${key(k)}`,v)}
        }) },
    },
    css: {
        get() { return new Proxy(this, {
            get(t,k){const v=getComputedStyle(t).getPropertyValue(key(k)); console.log(v, t.style, prop(k), key(k), v ? v : t.style[key(k)]);return v ? v : t.style[key(k)]},
            //get(t,k){const v=getComputedStyle(t).getPropertyValue(key(k)); console.log(v, t.style, prop(k), v ? v : t.style[prop(k)]);return v ? v : t.style[prop(k)]},
            set(t,k,v){console.log(t,key(k),v);t.style.setProperty(key(k),v)}
            //get(t,k){return getComputedStyle(t).getPropertyValue(key(k)) ?? t.style[prop(k)]},
//            get(t,k){return getComputedStyle(t).getPropertyValue(k.Chain)},  // kの先頭_は--に置換してCSS Property名にする
//            set(t,k,v){t.style.setProperty(k,v)}
//            get(t,k){return getComputedStyle(t).getPropertyValue(k.Chain)},  // kの先頭_は--に置換してCSS Property名にする
//            set(t,k,v){t.style.setProperty(k,v)}
        })},
    }
})
})();

