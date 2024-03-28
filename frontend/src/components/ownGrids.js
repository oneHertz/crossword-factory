import React, { useEffect, useState } from 'react'
import useGlobalState from '../utils/useGlobalState'
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

function OwnGrids() {
    const globalState = useGlobalState()
    const [list, setList] = useState('')
    const { username, api_token } = globalState.user

    useEffect(()=>{
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
        (async () => (await loadGrids()))()     
    }, [api_token, username])

    return (
        <div className="container main-container">
            <div className="row">
            { !!list.length ? (list.map(((e,idx)=>(
              <div key={e.id} className="col-12 col-sm-6 col-md-3">
                <div className="card mb-3">
                    <div className="card-body">
                        <LazyImage src={
                              process.env.REACT_APP_API_URL +
                              "/grid/" +
                              e.id +
                              "/preview"
                            } class="card-img-top" alt="Aperçu grille"/>
                        <h3 style={{width: '100%'}}>{e.published ? <Link className="stretched-link" to={"/grille/"+e.id}>{e.title}</Link> : e.title}</h3>
                        <div style={{ zIndex: 11 }}><Link to={"/grille/"+e.id+'/modifier'}><button type="button" className="float-right btn btn-primary">Modifier</button></Link></div>
                        <span>{e.width}x{e.height} {e.published && <span className="badge bg-danger">publié</span>}</span><br/>
                        <span>Créée {(new Date(e.creation_date)).toLocaleDateString("fr-FR")}</span><br/>
                        <span>Modifiée {(new Date(e.modification_date)).toLocaleDateString("fr-FR")}</span>
                    </div>
                </div>
              </div>
            )))): <h2>Pas de grilles</h2>
            }
            </div>
        </div>
    )
}

export default OwnGrids