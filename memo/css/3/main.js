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
    console.log(p.style['--main-color']) // 取得できない
    // appendChildしてないと __mainColor = undefined 
    document.body.append(p)
    console.log(p.css.__mainColor) // appendChildすると __mainColor = black
    console.log(p.style) // appendChildすると __mainColor = black
    console.log(p.style['--main-color']) // 取得できない
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.style.setProperty('--main-color', 'gray')
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.style['--main-color']='yellow'
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.cssv.mainColor = 'green'
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.cssv.mainColor = null
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    /*
    console.log(p.attrs)
    p.attrs = {
        ...p.attrs,
        dataAnyKey: 'any',
        id: 'someID',
    }
    console.log(p.attrs)
    // 属性をキーごと削除
    p.attr.id = null
    p.attr.dataAnyKey = null
    console.log(p.attrs)
//    p.attrs = null
//    console.log(p.attrs)
    // data属性 一括生成・削除
    console.log(p.datas)
    p.datas = {
        k1Key: 'K1',
        k2Key: 'K2',
    }
    console.log(p.datas)
    p.datas = null
    console.log(p.datas)

    // 属性 一括削除
    console.log(p.attrs)
    p.attrs = null
    console.log(p.attrs)

    
    p.css.color = 'red'
    p.css.backgroundColor = 'blue'
    console.log(getComputedStyle(p))
    console.log([...Object.keys(getComputedStyle(p))].filter(k=>!Number.isNaN(parseInt(k))))
    console.log([...Object.keys(getComputedStyle(p))].filter(k=>Number.isNaN(parseInt(k))))
    console.log(p.style)
    console.log(p.getAttribute('style'))
    console.log(p.css)
    console.log(p.csss)
    console.log(p.getAttribute('style'))
    p.csss = {
        writingMode: 'vertical-rl',
        textOrientation: 'upright',
    }
    console.log(p.csss)
    console.log(p.getAttribute('style'))


    console.log(p.class)
    */
    /*
    console.log([...p.csss.keys()])
    console.log(p.csss.get('color'))
    console.log(p.csss.get('color').toString())
    p.csss.get('color').value = 'blue'
    console.log(p.csss.get('color').toString())
    console.log([...p.csss.entries()])
    */
    /*
    console.log(p.attr)
    console.log(p.css)
    console.log(p.attr.id)
    console.log(p.css.color)
    p.id = 'some-id'
    console.log(p.attr.id)
//    p.attr.id = 'some-id'
    console.log(p.attr.id)
    console.log(p.id)
    */
});
window.addEventListener('beforeunload', async(e)=>{
    console.log('終了')
});
