window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p, a} = ml.tags
    ml.add(document.body, h1('見出し'), p('本文', a({href:'https://www.google.co.jp/'}, 'google')))
    const {svg, circle} = ml.tags('http://www.w3.org/2000/svg')
    ml.add(document.body, svg({
        xmlns:'http://www.w3.org/2000/svg',
        width: 100,
        height: 100,
        viewBox: "0 0 10 10",
    },
        circle({cx:5, cy:5, r:5}),
    ))

    console.log(ml.root)
    console.log(ml.get())
    console.log(ml.get('circle'))
    console.log(ml.gets('circle'))
    ml.set(ml.get('circle'), circle({cx:5, cy:5, r:3, fill:'red'}))


    console.log(ml.get('a').textContent)
    console.log(ml.get('a').attr)
    console.log(ml.get('a').attr.get)
    console.log(ml.get('a').attr.get('href'))
    console.log(ml.get('circle').attr)
    console.log(ml.get('circle').attr.get('cx'))

    // ml.tags で生成した要素は attr,css,on があるが、それ以外の方法で生成した要素には無い。
    console.log(document.querySelector('a').attr.get('href'))
//    const code = document.createElement('code')
//    console.log(code.attr.get('href')) // TypeError: Cannot read property 'get' of undefined
    
    console.log(ml.css)
    console.log(ml.attr)
    console.log(ml.on)
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

