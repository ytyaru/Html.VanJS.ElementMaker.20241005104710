window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p, a} = ml.tags
    ml.add(document.body, h1('見出し'), p('本文', a({href:'https://www.google.co.jp/'}, 'google')))
    const {svg, circle, rect} = ml.tags('http://www.w3.org/2000/svg')
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
//    console.log(ml.get('a').attr.get)
//    console.log(ml.get('a').attr.get('href'))
    console.log(ml.get('a').attr.href)
    console.log(ml.get('circle').attr)
//    console.log(ml.get('circle').attr.get('cx'))
    console.log(ml.get('circle').attr.cx)

    // ml.tags で生成した要素は attr,css,on があるが、それ以外の方法で生成した要素には無い。
//    console.log(document.querySelector('a').attr.get('href'))
    console.log(document.querySelector('a').attr.href)
//    const code = document.createElement('code')
//    console.log(code.attr.get('href')) // TypeError: Cannot read property 'get' of undefined
    
    console.log(ml.attrs)
//    console.log(ml.css)
    console.log(ml.cps)
    console.log(ml.on)
//    console.log(ml.attr.get(ml.get('circle'), 'r'))
    console.log(ml.get('circle').attr.r)
    //ml.attr.set(ml.get('circle'), 'r', 5)
    ml.get('circle').attr.r = 5
//    console.log(ml.attr.get(ml.get('circle'), 'r'))
    console.log(ml.get('circle').attr.r)

    //ml.css.set(ml.get('h1'), 'color', 'green')
    ml.get('h1').style.color = 'green'
    //console.log(ml.css.get(ml.get('h1'), 'color'))
    console.log(ml.get('h1').style.color)

    console.log(ml.get('circle'))
    console.log(ml.get('circle').events)

    function onClick(e){console.log('click:', e)}
    //ml.on(ml.get('circle'), 'click', (e)=>{console.log('click:', e)})
    ml.on(ml.get('circle'), 'click', onClick)
    ml.on(window, 'click', ()=>ml.off(ml.get('circle'), 'click', onClick))


    ml.add(document.body, svg({
        xmlns:'http://www.w3.org/2000/svg',
        width: 100,
        height: 100,
        viewBox: '0 0 10 10',
        fill:'green',
    },
        rect({width:8, height:6, rx:2}),
    ))
    console.log(ml.get('rect'))
    console.log(ml.get('rect').constructor)
    console.log(ml.get('rect').attr)
    //console.log(ml.get('rect').attr.get('width'))
    console.log(ml.get('rect').attr.width)
    

});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

