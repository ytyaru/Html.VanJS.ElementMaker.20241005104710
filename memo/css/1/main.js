window.addEventListener('DOMContentLoaded', async(e)=>{
    console.log(document.styleSheets)
    const p = document.createElement('p')
    console.log(p)
    console.log(p.getAttribute('dataSomeKey'))
    p.dataset.someKey = 'someValue'
    console.log(p.getAttribute('dataSomeKey'))
    console.log(p.getAttribute('data-some-key'))
    console.log(p.attr['data-some-key'])
    console.log(p.attr.dataSomeKey)
    p.attr.dataSomeKey = 'attrでセットした値'
    console.log(p.attr.dataSomeKey)
    console.log(p.attr['data-some-key'])
    p.data.someKey = 'dataでセットした値'
    console.log(p.data.someKey)
    console.log(p.data['some-key'])

    console.log(p.css.color)
    p.css.color = 'red'
    console.log(p.css.color)
    console.log(p.style.color)
    p.css.__mainColor = 'black'
    console.log(p.css.__mainColor)
    console.log(getComputedStyle(p).getPropertyValue('--main-color'))
    // appendChildしてないと __mainColor = undefined 
    document.body.append(p)
    console.log(p.css.__mainColor) // appendChildすると __mainColor = black

    console.log(p.attr)
    console.log(p.css)
    console.log(p.attr.id)
    console.log(p.css.color)
    p.id = 'some-id'
    console.log(p.attr.id)
//    p.attr.id = 'some-id'
    console.log(p.attr.id)
    console.log(p.id)
});
window.addEventListener('beforeunload', async(e)=>{
    console.log('終了')
});
