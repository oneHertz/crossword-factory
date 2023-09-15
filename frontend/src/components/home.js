import React from 'react'
import { Link } from 'react-router-dom'
import useGlobalState from '../utils/useGlobalState.js'
//import LatestRoutes from './LatestRoutes'
import {Helmet} from 'react-helmet'

const Home = () => {
    const globalState = useGlobalState()
    const { username } = globalState.user
    return (<>
        <Helmet>
            <title>Mots croisés | Verbicruciste.fr</title>
        </Helmet>

        <div className="container main-container">
            <div style={{textAlign:'center'}} >
            {username && <>
            <Link to="/nouvelle-grille"><button className="btn btn-primary mb-3"><i className="fas fa-plus"></i> + Creer une nouvelle grille</button></Link><br/>
            </>}
            {!username && <><hr/>
                <span>Connectez vous pour créer de nouvelles grilles ou voir vos grilles sauvegardées sur le site.</span>
            </>}
            {/*<LatestRoutes/>*/}
            </div>
        </div>
    </>)
}

export default Home