(function() {
String.prototype.capitalize = function(str) { return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase() }
//String.prototype.decapitalize = function(str) { return this.charAt(0).toLowerCase() + this.slice(1) }
class _StringPrefixCase {
    constructor() {
        this._cases = {
            'chain':    {name:'chain', delimiter:'-', method:'toLowerCase', target:'all'},   // my-name
            'snake':    {name:'snake', delimiter:'_', method:'toLowerCase', target:'all'},   // my_name
            'camel':    {name:'camel', delimiter:'',  method:'capitalize',  target:'word2'}, // myName
            'pascal':   {name:'pascal', delimiter:'',  method:'capitalize',  target:'word'}, // MyName
            'constant': {name:'constant', delimiter:'_', method:'toUpperCase', target:'all'},// MY_NAME
//            'title':    {name:'title', delimiter:' ', method:'capitalize',  target:'all'},   // My name
        }
    }
    
    get allNames() { return [...Object.keys(this._cases),'low','up'] }
    getNames(s) { return this.allNames.map(n=>{console.log(s, n, `is${n.capitalize()}`, this[`is${n.capitalize()}`](s));return [n,this[`is${n.capitalize()}`](s)]}).filter(([n,r])=>r).map(([n,r])=>n) }
    getName(str) {
        const patterns = this.Names.map(n=>[n,this[`is${n.capitalize()}`](str)]).filter(([n,s])=>s===str)
        return 0===patterns.length ? '' : patterns[0][0]
    }
//    isSomeCase(str) { return ['Chain','Snake','Camel','Pascal','Constant','Title'].map(m=>this[`is${m}`](str)).some(b=>b) }
    isSomeCase(str) { return this.Names.map(n=>this[`is${n.capitalize()}`](str)).some(b=>b) }
    //isChain(str) {return /^[a-z][a-z0-9\-]+$/g.test(str)}
    //isChain(str) {return /[a-z][a-z0-9]{0,}(\-[a-z0-9]+){0,}/.test(str)}
    isChain(str) {return /^[\-]+[a-z][a-z0-9]{0,}(\-[a-z0-9]+){0,}$/.test(str)}
    //isSnake(str) {return /^[a-z][a-z0-9_]+$/g.test(str)}
    isSnake(str) {return /^_+[a-z][a-z0-9]{0,}(_[a-z0-9]+){0,}$/.test(str)}
    //isCamel(str) {return /^[a-z][a-zA-Z0-9]+$/g.test(str)}
    isCamel(str) {return /^_+[a-z][a-z0-9]{0,}([A-Z][a-z0-9]*){0,}$/g.test(str)}
    //isPascal(str) {return /^[A-Z][a-zA-Z0-9]+$/g.test(str)}
    isPascal(str) {return /^_+[A-Z][a-z0-9]{0,}([A-Z][a-z0-9]*){0,}$/g.test(str)}
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
    isLow(str){return str===str.toLowerCase()}
    isUp(str){return str===str.toUpperCase()}
    getType(str) {
        if (this.isChain(str)) { return this._cases.chain }
        else if (this.isConstant(str)) { return this._cases.constant } // upper snake
        else if (this.isPascal(str)) { return this._cases.pascal }     // upper camel
        else if (this.isSnake(str)) { return this._cases.snake }
        else if (this.isCamel(str)) { return this._cases.camel }
//        else if (this.isTitle(str)) { return this._cases.title }
        else { return null }
    }
    getName(str) {
        if (this.isChain(str)) { return 'chain' }
        else if (this.isConstant(str)) { return 'constant' } // upper snake
        else if (this.isPascal(str)) { return 'pascal' }     // upper camel
        else if (this.isSnake(str)) { return 'snake' }
        else if (this.isCamel(str)) { return 'camel' }
//        else if (this.isTitle(str)) { return 'title' }
        else { return '' }
    }
    toChain(str) {return this.to(str, this._cases.chain).toString()}
    toSnake(str) {return this.to(str, this._cases.snake).toString()}
    toCamel(str) {return this.to(str, this._cases.camel).toString()}
    toPascal(str) {return this.to(str, this._cases.pascal).toString()}
    toConstant(str) {return this.to(str, this._cases.constant).toString()}
    toTitle(str) {return this.to(str, this._cases.title).toString()}
    toLow(str){return str.toLowerCase()}
    toUp(str){return str.toUpperCase()}
    to(str, to) {
        const from = this.getType(str)
        if (!to) { throw new Error(`出力ケースは次のいずれかであるべきです。${this.Names.join(',')}`) }
        if (!from) {
            if (1===str.length && 'constant,pascal,title'.split(',').some(c=>c===to.name)) { return str.toUpperCase() }
            return str
        }
        console.log(str, from, to)
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
const SC = new _StringPrefixCase();
class Case {
    constructor(s){this._s=s.toString();}
    get allNames() {return SC.allNames}
    get names() {return SC.getNames(this._s)}
    get name() {return SC.getName(this._s)}
    get chain() {return SC.toChain(this._s)}
    get snake() {return SC.toSnake(this._s)}
    get camel() {return SC.toCamel(this._s)}
    get pascal() {return SC.toPascal(this._s)}
    get constant() {return SC.toConstant(this._s)}
    get title() {return SC.toTitle(this._s)}
    get low() {return SC.toLow(this._s)}
    get up() {return SC.toUp(this._s)}
    get isSome() {return SC.isSomeCase(this._s)}
    get isChain() {return SC.isChain(this._s)}
    get isSnake() {return SC.isSnake(this._s)}
    get isCamel() {return SC.isCamel(this._s)}
    get isPascal() {return SC.isPascal(this._s)}
    get isConstant() {return SC.isConstant(this._s)}
    get isTitle() {return SC.isTitle(this._s)}
    get isLow() {return SC.isLow(this._s)}
    get isUp() {return SC.isUp(this._s)}
}
Object.defineProperty(String.prototype, 'case', {get(){
  if(!this._case){this._case=new Case(this)}
  return this._case
}});
console.log('my-name'.case.isChain)
console.log('myName'.case.chain)
console.assert('my-name'==='myName'.case.chain)

/*
//Object.defineProperty(String.prototype, 'case', {get(){return new Case(this)}}
window.StringPrefixCase = new _StringPrefixCase()
String.prototype.caseNames = function() { return StringPrefixCase.Names }
String.prototype.caseName = function() { return StringPrefixCase.getName(this) }
String.prototype.isSomeCase = function() { return StringPrefixCase.isSomeCase(this) }
Object.defineProperties(String.prototype, {
    Chain: { get(){return StringPrefixCase.toChain(this)} });
    Snake: { get(){return StringPrefixCase.toSnake(this)} });
    Camel: { get(){return StringPrefixCase.toCamel(this)} });
    Pascal: { get(){return StringPrefixCase.toPascal(this)} });
    Constant: { get(){return StringPrefixCase.toConstant(this)} });
    Title: { get(){return StringPrefixCase.toTitle(this)} });
    IsChain: { get(){return StringPrefixCase.isChain(this)} });
    IsSnake: { get(){return StringPrefixCase.isSnake(this)} });
    IsCamel: { get(){return StringPrefixCase.isCamel(this)} });
    IsPascal: { get(){return StringPrefixCase.isPascal(this)} });
    IsConstant: { get(){return StringPrefixCase.isConstant(this)} });
    IsTitle: { get(){return StringPrefixCase.isTitle(this)} });
});
*/
/*
String.prototype.isChain = function() { return StringPrefixCase.isChain(this) }
String.prototype.isConstant = function() { return StringPrefixCase.isConstant(this) }
String.prototype.isPascal = function() { return StringPrefixCase.isPascal(this) }
String.prototype.isSnake = function() { return StringPrefixCase.isSnake(this) }
String.prototype.isCamel = function() { return StringPrefixCase.isCamel(this) }
String.prototype.isTitle = function() { return StringPrefixCase.isTitle(this) }
String.prototype.toChain = function() { return StringPrefixCase.toChain(this) }
String.prototype.toConstant = function() { return StringPrefixCase.toConstant(this) }
String.prototype.toPascal = function() { return StringPrefixCase.toPascal(this) }
String.prototype.toSnake = function() { return StringPrefixCase.toSnake(this) }
String.prototype.toCamel = function() { return StringPrefixCase.toCamel(this) }
String.prototype.toTitle = function() { return StringPrefixCase.toTitle(this) }

Object.defineProperty(String.prototype, 'Chain', { get: function(){return StringPrefixCase.toChain(this)} });
Object.defineProperty(String.prototype, 'Snake', { get: function(){return StringPrefixCase.toSnake(this)} });
Object.defineProperty(String.prototype, 'Camel', { get: function(){return StringPrefixCase.toCamel(this)} });
Object.defineProperty(String.prototype, 'Pascal', { get: function(){return StringPrefixCase.toPascal(this)} });
Object.defineProperty(String.prototype, 'Constant', { get: function(){return StringPrefixCase.toConstant(this)} });
Object.defineProperty(String.prototype, 'Title', { get: function(){return StringPrefixCase.toTitle(this)} });
Object.defineProperty(String.prototype, 'IsChain', { get: function(){return StringPrefixCase.isChain(this)} });
Object.defineProperty(String.prototype, 'IsSnake', { get: function(){return StringPrefixCase.isSnake(this)} });
Object.defineProperty(String.prototype, 'IsCamel', { get: function(){return StringPrefixCase.isCamel(this)} });
Object.defineProperty(String.prototype, 'IsPascal', { get: function(){return StringPrefixCase.isPascal(this)} });
Object.defineProperty(String.prototype, 'IsConstant', { get: function(){return StringPrefixCase.isConstant(this)} });
Object.defineProperty(String.prototype, 'IsTitle', { get: function(){return StringPrefixCase.isTitle(this)} });

Object.defineProperty(String.prototype, 'Chain', { get(){return StringPrefixCase.toChain(this)} });
Object.defineProperty(String.prototype, 'Snake', { get(){return StringPrefixCase.toSnake(this)} });
Object.defineProperty(String.prototype, 'Camel', { get(){return StringPrefixCase.toCamel(this)} });
Object.defineProperty(String.prototype, 'Pascal', { get(){return StringPrefixCase.toPascal(this)} });
Object.defineProperty(String.prototype, 'Constant', { get(){return StringPrefixCase.toConstant(this)} });
Object.defineProperty(String.prototype, 'Title', { get(){return StringPrefixCase.toTitle(this)} });
Object.defineProperty(String.prototype, 'IsChain', { get(){return StringPrefixCase.isChain(this)} });
Object.defineProperty(String.prototype, 'IsSnake', { get(){return StringPrefixCase.isSnake(this)} });
Object.defineProperty(String.prototype, 'IsCamel', { get(){return StringPrefixCase.isCamel(this)} });
Object.defineProperty(String.prototype, 'IsPascal', { get(){return StringPrefixCase.isPascal(this)} });
Object.defineProperty(String.prototype, 'IsConstant', { get(){return StringPrefixCase.isConstant(this)} });
Object.defineProperty(String.prototype, 'IsTitle', { get(){return StringPrefixCase.isTitle(this)} });
*/
















/*
Object.defineProperty(String.prototype, 'case', {get(){
  if(!this._case){this._case=new new StringPrefixCase(this)}
  return this._case
});

class _StringPrefixCase {
    constructor(str) {
        this._str = str
        this._cases = {
            'chain':    {name:'chain', delimiter:'-', method:'toLowerCase', target:'all'},
            'snake':    {name:'snake', delimiter:'_', method:'toLowerCase', target:'all'},
            'camel':    {name:'camel', delimiter:'',  method:'capitalize',  target:'word2'},
            'pascal':   {name:'pascal', delimiter:'',  method:'capitalize',  target:'word'},
            'constant': {name:'constant', delimiter:'_', method:'toUpperCase', target:'all'},
            'title':    {name:'title', delimiter:' ', method:'capitalize',  target:'all'},
        }
    }
    get Names() { return Object.keys(this._cases) }
//    isSomeCase(str) { return ['Chain','Snake','Camel','Pascal','Constant','Title'].map(m=>this[`is${m}`](str)).some(b=>b) }
    isSomeCase(str) { return this.Names.map(n=>this[`is${n.Title}`](str)).some(b=>b) }
    isChain(str) {return /^[a-z][a-z0-9\-]+$/g.test(str)}
    isSnake(str) {return /^[a-z][a-z0-9_]+$/g.test(str)}
    isCamel(str) {return /^[a-z][a-zA-Z0-9]+$/g.test(str)}
    isPascal(str) {return /^[A-Z][a-zA-Z0-9]+$/g.test(str)}
    isConstant(str) {return /^[A-Z_][A-Z0-9_]+$/g.test(str)}
    isTitle(str) {return (str.includes(' ') && /^[A-Z]+$/g.test(str[0]))}
    getType(str) {
        if (this.isChain(str)) { return this._cases.chain }
        else if (this.isConstant(str)) { return this._cases.constant } // upper snake
        else if (this.isPascal(str)) { return this._cases.pascal }     // upper camel
        else if (this.isSnake(str)) { return this._cases.snake }
        else if (this.isCamel(str)) { return this._cases.camel }
        else if (this.isTitle(str)) { return this._cases.title }
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
    toChain(str) {return this.to(str, this._cases.chain).toString()}
    toSnake(str) {return this.to(str, this._cases.snake).toString()}
    toCamel(str) {return this.to(str, this._cases.camel).toString()}
    toPascal(str) {return this.to(str, this._cases.pascal).toString()}
    toConstant(str) {return this.to(str, this._cases.constant).toString()}
    toTitle(str) {return this.to(str, this._cases.title).toString()}
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




String.prototype.case = function() {
    if(!this._case){this._case=new _StringPrefixCase()}
    return this._case
    return StringPrefixCase.Names
}
class Case {
    constructor(s){this._s=s}
    get chain() {return StringPrefixCase.toChain(this._s)}
    get snake() {return StringPrefixCase.toSnake(this._s)}
    get camel() {return StringPrefixCase.toCamel(this._s)}
    get pascal() {return StringPrefixCase.toPascal(this._s)}
    get constant() {return StringPrefixCase.toConstant(this._s)}
    get isChain() {return StringPrefixCase.isChain(this._s)}
    get isSnake() {return StringPrefixCase.isSnake(this._s)}
    get isCamel() {return StringPrefixCase.isCamel(this._s)}
    get isPascal() {return StringPrefixCase.isPascal(this._s)}
    get isConstant() {return StringPrefixCase.isConstant(this._s)}
    get isTitle() {return StringPrefixCase.isTitle(this._s)}
}
Object.defineProperty(String.prototype, 'case', {get(){return new Case(this)}}

Object.defineProperty(String.prototype, 'case', {
    get(){
        return new Proxy(this, {
            get() {

            }
        })
    }
})
Object.defineProperties(String.prototype, {
    Chain: { get(){return StringPrefixCase.toChain(this)} });
    Snake: { get(){return StringPrefixCase.toSnake(this)} });
    Camel: { get(){return StringPrefixCase.toCamel(this)} });
    Pascal: { get(){return StringPrefixCase.toPascal(this)} });
    Constant: { get(){return StringPrefixCase.toConstant(this)} });
    Title: { get(){return StringPrefixCase.toTitle(this)} });
    IsChain: { get(){return StringPrefixCase.isChain(this)} });
    IsSnake: { get(){return StringPrefixCase.isSnake(this)} });
    IsCamel: { get(){return StringPrefixCase.isCamel(this)} });
    IsPascal: { get(){return StringPrefixCase.isPascal(this)} });
    IsConstant: { get(){return StringPrefixCase.isConstant(this)} });
    IsTitle: { get(){return StringPrefixCase.isTitle(this)} });



    'IsTitle', { get: function(){return StringPrefixCase.isTitle(this)} }
)};
*/
})()
