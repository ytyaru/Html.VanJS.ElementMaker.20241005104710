window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    /*
    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        h1(a({href:`https://github.com/${author}/Html.VanJS.ElementMaker.20241005104710/`}, 'ElementMaker')),
        p('SGML系の要素を動的生成するJSライブラリ。'),
//        p('A JS library that dynamically generates SGML elements.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())
    */
    const {h1, p, a} = ml.tags
    //document.body.append(h1('見出し'), p('本文', a({href:'https://www.google.co.jp/'}, 'google')))
    ml.add(document.body, h1('見出し'), p('本文', a({href:'https://www.google.co.jp/'}, 'google')))
    const {svg, circle} = ml.tags('http://www.w3.org/2000/svg')
    //document.body.append(svg({
    ml.add(document.body, svg({
        xmlns:'http://www.w3.org/2000/svg',
        width: 100,
        height: 100,
        viewBox: "0 0 10 10",
    },
        circle({cx:5, cy:5, r:5}),
    ))

    console.log(ml.get('circle'))
    console.log(ml.gets('circle'))
    ml.set(ml.get('circle'), circle({cx:5, cy:5, r:3, fill:'red'}))
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

