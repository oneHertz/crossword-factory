import React, { useEffect, useState } from 'react'
import useGlobalState from '../utils/useGlobalState'
import { Link } from "react-router-dom";
const pkg = require('../../package.json')


function OwnGrids() {
    const globalState = useGlobalState()
    const [list, setList] = useState('')
    const { username, api_token } = globalState.user

    const loadGrids = async () => {
        try {
            const r = await fetch(process.env.REACT_APP_API_URL+'/user/'+username,{
                method: 'GET',
                credentials: 'omit',
                headers: {
                    'Authorization': 'Token ' + api_token,
                    'Content-Type': 'application/json'
                }
            })
            const list = await r.json()
            setList(list.crosswords_grids)
        } catch(e) {
            window.location = '/'
        }
    }

    useEffect(()=>{
        (async () => (await loadGrids()))()     
    }, [])

    return (
        <div className="container main-container">
            { !!list.length ? (list.map((e=>(
                <><div style={{width: '100%'}}>
                    <h3 style={{width: '100%'}}>{e.published ? <Link to={"/grille/"+e.id}>{e.title}</Link> : e.title} <Link to={"/grille/"+e.id+'/modifier'}><button className="float-right btn btn-primary">Modifier</button></Link></h3>
                    <span>{e.width}x{e.height} {e.published && <span className="badge bg-danger">publié</span>}</span><br/>
                    <span>Créée {(new Date(e.creation_date)).toLocaleDateString("fr-FR")}</span><br/>
                    <span>Modifiée {(new Date(e.modification_date)).toLocaleDateString("fr-FR")}</span>
                </div>
                <hr/>
                </>
            )))): <h2>Pas de grilles</h2>
            }
        </div>
    )
}

export default OwnGrids