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
    addRoot: (...children)=>{
        const frag = document.createDocumentFragment();
        for (let child of children.flat(Infinity)) { frag.append(child) }
        ml.root.append(frag)
    },
    add: (parent, ...children)=>{
        const frag = document.createDocumentFragment();
        for (let child of children.flat(Infinity)) { frag.append(child) }
        parent.append(frag)
    },
    insRootFirstChild: (el)=>ml.root.insertAdjacentElement('afterbegin', el),
    insRootLastChild: (el)=>ml.root.insertAdjacentElement('beforeend', el),
    insBefore: (parent,el)=>parent.insertAdjacentElement('beforebegin', el),
    insAfter: (parent,el)=>parent.insertAdjacentElement('afterend', el),
    insFirstChild: (parent,el)=>parent.insertAdjacentElement('afterbegin', el),
    insLastChild: (parent,el)=>parent.insertAdjacentElement('beforeend', el),
//    insRF(e)=>ml.root.insertAdjacentElement('afterbegin', el),
//    insRL(e)=>ml.root.insertAdjacentElement('beforeend', el),
//    insB:(p,e)=>p.insertAdjacentElement('beforebegin', e),
//    insA:(p,e)=>p.insertAdjacentElement('afterend', e),
//    insF:(p,e)=>p.insertAdjacentElement('afterbegin', e),
//    insL:(p,e)=>p.insertAdjacentElement('beforeend', e),

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
})();
