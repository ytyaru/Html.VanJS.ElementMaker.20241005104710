;(function(){
window.ml = {
    // createElement[NS]()（XML名前空間）
    ns {,
        html: null,
        svg: 'http://www.w3.org/2000/svg',
        rss: null,
        atom: 'http://purl.org/atom/ns#',
        math: null,
        opml: null,
        xml: null,
        xsd: null,
        openSearch: null,
        musicXml: null,
        voiceXml: null,
        x3d: null,
        xform: null,
        xul: null,
    }
    // 要素取得（querySelector[All]()）
    root: document.querySelector(':root'),
    get: (q,e)=>document.querySelector(q, e ?? ml.root),
    gets:()=>document.querySelectorAll(q, e ?? ml.root),
    getx:()=>,
    // イベント（widow.[add/remove]EventListener('DOMContentLoaded'/'beforeunload')）
    on:()=>{},
    off:()=>{},
    // el.[add/remove]EventListener(evNm, fn, opt)
    listen:()=>{}
    unlisten:()=>{}
    // 動的挿入・取得<script>,<style>,<meta>,<rdf>,json-ld,microdata,microformats,<head>
    js: null,
    css: null,
    meta: null,
    ld: null,
}



//el.xpath
//el.getx()
//el.getxs()
//el.setx()
//el.delx()
class XPath {
    constructor() {}
    getPath(el) {
        if(el && el.parentNode) {
            var xpath = this.getPath(el.parentNode) + '/' + el.tagName;
            var s = [];
            for(var i=0; i<el.parentNode.childNodes.length; i++) {
                var e = el.parentNode.childNodes[i];
                if(e.tagName == el.tagName) {s.push(e)}
            }
            if(1 < s.length) {
                for(var i=0; i<s.length; i++) {
                    if(s[i] === el) {
                    xpath += '[' + (i+1) + ']';
                    break;
                }
            }
        }
        return xpath.toLowerCase();
        } else {return ''}
    }
    getEl(xpath){
        const a = this.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        if (a.snapshotLength > 0) { return a.snapshotItem(0); }
    }
    getEls(xpath){
        const a = this.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        return [...Array(a.snapshotLength)].map((_,i)=>a.snapshotItem(i))
    }
    delEls(xpath){
        const a = this.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).parentNode.removeChild(a.snapshotItem(i))} 
    }
    replaceEls(xpath, ...newEls){
        const a = this.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        for (var i=0 ; i<a.snapshotLength; i++) {a.snapshotItem(i).replaceWith(...newEls)}
    }
}

})();
