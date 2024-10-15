(function() {
String.prototype.capitalize = function(str) { return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase() }
class _StringPrefixCase {
    constructor() {
        this._cases = {
            'chain':    {name:'chain', delimiter:'-', method:'toLowerCase', target:'all'},   // -...-my-name
            'snake':    {name:'snake', delimiter:'_', method:'toLowerCase', target:'all'},   // _..._my_name
            'camel':    {name:'camel', delimiter:'',  method:'capitalize',  target:'word2'}, // _..._myName
            'pascal':   {name:'pascal', delimiter:'',  method:'capitalize',  target:'word'}, // _..._MyName
            'constant': {name:'constant', delimiter:'_', method:'toUpperCase', target:'all'},// _..._MY_NAME
//            'title':    {name:'title', delimiter:' ', method:'capitalize',  target:'all'},   // My name
        }
    }
    get(s) { const m=s.match(/^[_\-]+/); return m[0] ?? '' }
    has(s) { return /^[_\-]+/.test(s) }
    len(s) { return this.get(s).length; }
    //len(s) { return this.has(s) ? this.get(s)[0].length : 0; }
    trim(s) { return this.#splitPS(s)[1] }
    split(s) { return this.#splitPS(s) }
    //get len(s) { const m=s.match(/^[_\-]+/); return 0===m.length ? 0 : m[0].length; }
    
    //get allNames() { return [...Object.keys(this._cases),'low','up'] }
    get allNames() { return [...Object.keys(this._cases)] }
    getNames(s) { return this.allNames.map(n=>[n,this[`is${n.capitalize()}`](s)]).filter(([n,r])=>r).map(([n,r])=>n) }
    getName(str) {
        const patterns = this.allNames.map(n=>[n,this[`is${n.capitalize()}`](str)]).filter(([n,r])=>r)
        return 0===patterns.length ? '' : patterns[0][0]
    }
    isSomeCase(str) { return this.allNames.map(n=>this[`is${n.capitalize()}`](str)).some(b=>b) }
    isChain(str) {return /^[\-]+[a-z][a-z0-9]{0,}(\-[a-z0-9]+){0,}$/.test(str)}
    //isSnake(str) {return /^[a-z][a-z0-9_]+$/g.test(str)}
    isSnake(str) {return /^_+[a-z][a-z0-9]{0,}(_[a-z0-9]+){0,}$/.test(str)}
    //isCamel(str) {return /^[a-z][a-zA-Z0-9]+$/g.test(str)}
    isCamel(str) {return /^_+[a-z][a-z0-9]{0,}([A-Z][a-z0-9]+){0,}$/g.test(str)}
    //isPascal(str) {return /^[A-Z][a-zA-Z0-9]+$/g.test(str)}
    isPascal(str) {return /^_+[A-Z][a-z0-9]{0,}([A-Z][a-z0-9]+){0,}$/g.test(str)}
    //isConstant(str) {return /^[A-Z_][A-Z0-9_]+$/g.test(str)}
    isConstant(str) {return /^_+[A-Z][A-Z_]{0,}(_[A-Z0-9]){0,}$/g.test(str)}

    // prefix付は判定不能: _A_B, _myNm, __myNm, _MyNm, -webkit-color, --main-color
    // chainP1: -webkit-transition
    // chainP2: --main-color
    // chainPN: -...-main-color
    // constantP1: _NUM_A
    // camelPS1: _myNm    camel + prefix(snakeの記号1つ)
    // camelPS2: __myNm    camel + prefix(snakeの記号1つ)
    // pascalPS1: _MyNm    camel + prefix(snakeの記号1つ)
    // pascalPS2: __MyNm    camel + prefix(snakeの記号1つ)
    // これらを他のケースと相互変換することも困難
    // 特にcamel/pascalはprefixを表現できない。_のように別ケースの記号が必須
    // prefix付なら同じくprefix付にしか変換不能
    // chainPN -> snakeP, containtP, camelP, pascalP
    // String.case[chain/snake/camel/pascal/constant/title/low/up]
    // String.pCase[chain/snake/camel/pascal/constant/title/low/up]
    // 他にも a.b.c, a/b/c, a,b,c,  a|b|c のようなケースもありうる。でもこれはケースではなく区切なので別件。

//    isTitle(str) {return (str.includes(' ') && /^[A-Z]+$/g.test(str[0]))}
//    isLow(str){return /^[_\-]+/.test(str) && /[a-z]+/.test(str) && str===str.toLowerCase()}
//    isUp(str){return /^[_\-]+/.test(str) && /[A-Z]+/.test(str) && str===str.toUpperCase()}
    getType(str) {
        if (this.isChain(str)) { return this._cases.chain }
        else if (this.isConstant(str)) { return this._cases.constant } // upper snake
        else if (this.isPascal(str)) { return this._cases.pascal }     // upper camel
        else if (this.isSnake(str)) { return this._cases.snake }
        else if (this.isCamel(str)) { return this._cases.camel }
//        else if (this.isTitle(str)) { return this._cases.title }
        else { return null }
    }
    toChain(str) {return this.to(str, this._cases.chain).toString()}
    toSnake(str) {return this.to(str, this._cases.snake).toString()}
    toCamel(str) {return this.to(str, this._cases.camel).toString()}
    toPascal(str) {return this.to(str, this._cases.pascal).toString()}
    toConstant(str) {return this.to(str, this._cases.constant).toString()}
//    toTitle(str) {return this.to(str, this._cases.title).toString()}
    toLow(str){return str.toLowerCase()}
    toUp(str){return str.toUpperCase()}
    to(str, to) {
        const from = this.getType(str)
        if (!to) { throw new Error(`出力ケースは次のいずれかであるべきです。${this.Names.join(',')}`) }
        if (!from) {
            if (1===str.length && 'constant,pascal,title'.split(',').some(c=>c===to.name)) { return str.toUpperCase() }
            return str
        }
        if (from===to) { return str }
        const [p, s] = this.#splitPS(str)
        const P = this.#changePrefix(p,from,to)
        return P + this.#join(this.#split(s, from), to)
        //return this.#join(this.#split(str, from), to)
    }
    #changePrefix(p,from,to) {
        if ('chain'===from.name && 'chain'!==to.name) {return p.replace(/\-/g, '_')}
        else if ('chain'!==from.name && 'chain'===to.name) {return p.replace(/_/g, '-')}
        else {return p}
    }
    #splitPS(s) { for (let d of ['-','_']) { let ps = this.#_splitPS(s, d); if (ps) { return ps }; }; return ['',s] }
    #_splitPS(s, d) {
        let i=0;
        for (;i<s.length; i++) {if (d!==s[i]) {break}}
        if (0<i) {return [s.slice(0,i), s.slice(i)]}
    }
    #split(str, from) { return (1===from.delimiter.length) ? str.split(from.delimiter) : str.split(/(?=[A-Z])/) }
    #join(words, to) {
        if ('all' === to.target) { return words.join(to.delimiter)[to.method]() }
        else if ('word'===to.target) { return words.map(w=>w[to.method]()).join(to.delimiter) }
        else if ('word2'===to.target) { return [words[0].toLowerCase(), ...words.slice(1).map(w=>w[to.method]())].join(to.delimiter) }
        else { throw new Error('引数to(Case)のtargetはall,word,word2のいずれかであるべきです。') }
    }
}
const SC = new _StringPrefixCase();
class PrefixCase {
    constructor(s){this._s=s.toString();}
    get allNames() {return SC.allNames}
    get names() {return SC.getNames(this._s)}
    get name() {return SC.getName(this._s)}

    get list() {return SC.split(this._s)}
    get prefix() {return SC.get(this._s)}
    get main() {return SC.trim(this._s)}
    get hasP() {return SC.has(this._s)}
    get lenP() {return SC.len(this._s)}

    get chain() {return SC.toChain(this._s)}
    get snake() {return SC.toSnake(this._s)}
    get camel() {return SC.toCamel(this._s)}
    get pascal() {return SC.toPascal(this._s)}
    get constant() {return SC.toConstant(this._s)}
    // prefix無しtrim
    get chainT() {return SC.trim(SC.toChain(this._s))}
    get snakeT() {return SC.trim(SC.toSnake(this._s))}
    get camelT() {return SC.trim(SC.toCamel(this._s))}
    get pascalT() {return SC.trim(SC.toPascal(this._s))}
    get constantT() {return SC.trim(SC.toConstant(this._s))}

//    get title() {return SC.toTitle(this._s)}
//    get low() {return SC.toLow(this._s)}
//    get up() {return SC.toUp(this._s)}
    get isSome() {return SC.isSomeCase(this._s)}
    get isChain() {return SC.isChain(this._s)}
    get isSnake() {return SC.isSnake(this._s)}
    get isCamel() {return SC.isCamel(this._s)}
    get isPascal() {return SC.isPascal(this._s)}
    get isConstant() {return SC.isConstant(this._s)}
//    get isTitle() {return SC.isTitle(this._s)}
//    get isLow() {return SC.isLow(this._s)}
//    get isUp() {return SC.isUp(this._s)}
}
Object.defineProperty(String.prototype, 'pCase', {get(){
  if(!this._pCase){this._pCase=new PrefixCase(this)}
  return this._pCase
}});
})()
