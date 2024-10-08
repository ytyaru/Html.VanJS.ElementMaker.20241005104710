window.addEventListener('DOMContentLoaded', async(e)=>{
    console.log(document.styleSheets)
    const p = document.createElement('p')
    console.log(p)
    console.log(p.getAttribute('dataSomeKey'))   // null
    p.dataset.someKey = 'someValue'
    console.log(p.getAttribute('dataSomeKey'))   // null
    console.log(p.getAttribute('data-some-key')) // someValue
    console.log(p.attr['data-some-key'])         // someValue
    console.log(p.attr.dataSomeKey)              // someValue
    p.attr.dataSomeKey = 'attrでセットした値'
    console.log(p.attr.dataSomeKey)
    console.log(p.attr['data-some-key'])
    p.data.someKey = 'dataでセットした値'
    console.log(p.data.someKey)                  // someValue
    console.log(p.data['some-key'])              // someValue

    //console.log(p.css.color)
    console.log(p.style)
    console.log(p.style.color)
    //p.css.color = 'red'
    p.style.color = 'red'
    //console.log(p.css.color)
    console.log(p.style.color)
    //p.css.__mainColor = 'black'
    p.cp.mainColor = 'black'
    //console.log(p.css.__mainColor)
    console.log(p.cp.mainColor)
    console.log(getComputedStyle(p).getPropertyValue('--main-color'))
    console.log(p.style['--main-color']) // 取得できない
    // appendChildしてないと __mainColor = undefined 
    document.body.append(p)
    //console.log(p.css.__mainColor) // appendChildすると __mainColor = black
    console.log(p.cp.mainColor) // appendChildすると __mainColor = black
    console.log(p.style) // appendChildすると __mainColor = black
    console.log(p.style['--main-color']) // 取得できない
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.style.setProperty('--main-color', 'gray')
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.style['--main-color']='yellow'
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.cp.mainColor = 'green'
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる
    p.cp.mainColor = null
    console.log(getComputedStyle(p).getPropertyValue('--main-color')) // 取得できる

    console.log(p.class.v)
    console.log(p.class.l)
    p.class.v = 'A BC'
    console.log(p.class.v)
    console.log(p.class.l)
    p.class.l.add('DEF')
    console.log(p.class.v)
    console.log(p.class.l)
    console.log(p.className)
    console.log(p.classList)
    console.log(p.class.l.contains('BC'))
    console.log(p.class.l.contains('AC'))

    console.log(p.attrs)
    console.log(p.datas)
    console.log(p.styles)
    console.log(p.cps)

    p.attr.tabindex = 0
    p.data.myKey = 'x'
    p.style.backgroundColor = 'green'
    p.cp.customProp1 = 'cp1'
    p.cp.customProp2 = 'cp2'

    console.log(p.attrs)
    console.log(p.datas)
    console.log(p.styles)
    console.log(p.cps)

    p.attrs = {
        ...p.attrs,
        newAttr: 'newValue',
        dataNewKey: 'dataNewValue',
    }
    console.log(p.attrs)
    p.datas = {
        key1: 'value',
        myKey: 'MyVal',
    }
    console.log(p.datas)
    p.styles = null
    console.log(p.styles)
    p.styles = {
        color: '#000',
        backgroundColor: '#fff',
    }
    console.log(p.styles)
    p.cps = {
        myKey1: 'myVal1',
        myKey2: 'myVal2',
    }
    console.log(p.cps)
    console.log(p.styles)
    console.log(p.attr.style)

    console.log(p.classs, p.class.v)
    p.classs = ['XX', 'Y', 'ZZZ']
    console.log(p.classs, p.class.v)
    p.classs = 'AB CDE FGH'
    console.log(p.classs, p.class.v)

    console.log(Node.ELEMENT_NODE)
    


//    console.log(p.E.next)
//    console.log(p.N.next)
    console.log(p.E.firstChild)
    console.log(p.N.firstChild)
    p.append('someText')
    console.log(p.E.firstChild) // null        テキストノードはノードであってエレメントではない
    console.log(p.N.firstChild) // "someText"  テキストノードはノードであってエレメントではない
    p.append(document.createElement('span'))
    console.log(p.E.firstChild) // <span>
    console.log(p.N.firstChild) // "someText"
    console.log(p.firstChild)
    console.log(p.childNodes)

    console.log(
        p.processChildrenByType({
            element: (n,i,gi)=>`${i}番目のノード。${gi}番目の要素。value:${n.value}`,
            text: ()=>`${i}番目のノード。${gi}番目のテキストノード。value:${n.value}`,
        })
    )
    /*
    console.log([...p.computedStyleMap().entries()])
    console.log([...p.computedStyleMap().keys()])
    console.log([...p.computedStyleMap().keys()].filter(k=>k.startsWith('--')))
    console.log([...p.computedStyleMap().entries()].filter(([k,v])=>k.startsWith('--')))
    console.log([...p.computedStyleMap().entries()].filter(([k,v])=>k.startsWith('--')).map(kv=>[kv[0], kv[1].toString()]))
    */
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
