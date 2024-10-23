;(function(){
class CssPrefixCase {
    constructor() {
        this._prefixs = 'webkit,moz,ms,o'.split(',')
        for (let key of this._prefixs) { Object.defineProperty(this, `to${key.case.title}`, {value:(s)=>`-${key}-${s.case.chain}`}) }
    }
    is(s) { return this._prefixs.some(p=>s.startsWith(`-${p}-`)) }
    isJ(s) { return s.startsWith(`_`) && s.slice(1).case.isCamel }
    isJt(s) { return s.case.isCamel }
    name(s) { const t=this._prefixs.filter(p=>s.startsWith(`-${p}-`)); return 0<t.length ? t[0] : ''; }
    to(p, s) { return `-${p.case.chain}-${s.case.chain}` }
    //toJs(s) { return this.is(s) ? `_${this.name(s).case.camel}${s.case.camel}` : s.toString() }
    toJs(s) { return this.is(s) ? `_${this.trim(s).case.camel}` : s.toString() }
    toCss(s) { return s.startsWith('_') ? `-${s.slice(1).case.chain}` : s.toString() }
//    toWebkit(s) { return `-webkit-${s.Chain}` }
//    toMoz(s) { return `-moz-${s.Chain}` }
//    toMs(s) { return `-ms-${s.Chain}` }
//    toO(s) { return `-o-${s.Chain}` }
    trim(s){return s.replace(/^\-/,'').replace(/^_/,'') }
}
class CssVarCase {
    is(s){return s.startsWith('--') && s.slice(2).case.isChain }
    isJ(s){return s.startsWith('__') && s.slice(2).case.isCamel }
    isJt(s){return s.case.isCamel }
    to(s){return `--${s.case.chain}` }
    toJs(s){return `__${s.slice(2).case.camel}` }
    toCss(s){return `--${s.slice(2).case.chain}` }
    trim(s){return s.replace(/^\-\-/,'').replace(/^__/,'') }
}
const P = new CssPrefixCase()
const V = new CssVarCase()
class CssCase {
    constructor(s){this._s=s}
    get is() { return this._s.case.isChain || s.P.is(this._s) || s.V.is(this._s) }
    get isP() { return P.is(this._s) }
    get isPj() { return P.isJ(this._s) }
    get isPjt() { return P.isJt(this._s) }
    get isV() { return V.is(this._s) }
    get isVj() { return V.isJ(this._s) }
    get isVjt() { return V.isJt(this._s) }
    get p() { return P.toCss(this._s) }         // -webkit-transition
    get pj() { return P.toJs(this._s) }         // _webkitTransition
    get pjt() { return P.trim(P.toJs(this._s)) }// webkitTransition
    get v() { return V.toCss(this._s) }         // --main-color
    get vj() { return V.toJs(this._s) }         // __mainColor
    get vjt() { return V.trim(V.toJs(this._s)) }// mainColor
}
Object.defineProperty(String.prototype, 'cssCase', {get(){if(!this._cssCase){this._cssCase=new CssCase(this)};return this._cssCase;}})
})();
