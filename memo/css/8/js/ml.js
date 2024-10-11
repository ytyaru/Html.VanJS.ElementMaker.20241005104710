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
    root: null,
    get: ()=>{},
    gets:()=>{},
    getx:()=>{},
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
