import React from 'react'
import { Route } from 'react-router'
import { shadowParent } from './components'

export default function relationRoute({
    type, singular, plural, 
    ItemView, ItemWrapper,
    SetView,  SetWrapper
}){
    function singularProps({items, singularId, ...props}){
        let [value = undefined] = items.filter(item => item._id == `${singular}/${singularId}`)
        return { value, ...props }
    }

    let pluralComponent = shadowParent({ 
        child: SetWrapper,
        props: {type, plural, singular, singularProps, ItemView: SetView}
    })

    let singularComponent = shadowParent({
        child: ItemWrapper,
        props: {type, singular, plural, Template: ItemView}
    })
    return {
        path: plural,
        route: (
            <Route path={`${plural}`} component={pluralComponent}>
                <Route path={`/${singular}/:singularId`} component={singularComponent}/>
            </Route>
        )
    }
}
