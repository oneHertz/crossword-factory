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
            <title>Mots croisés</title>
        </Helmet>

        <div className="container main-container">
            <div style={{textAlign:'center'}} >
            {username && <><hr/>
            <Link to="/nouvelle-grille"><button className="btn btn-primary"><i className="fas fa-plus"></i> Creer une nouvelle grille</button></Link><> </>
            <Link to='/mes-grilles/'><button className="btn btn-primary"><i className="fas fa-link"></i> Vos grilles</button></Link><br/><br/>
            <Link to='/settings/'><button className="btn btn-primary"><i className="fas fa-link"></i> Mon compte</button></Link>
            </>}
            {!username && <><hr/>
                <span>Connectez vous pour créer de nouvelles grilles ou voir vos grilles sauvegardées sur le site.</span>
            </>}
            <hr/>
            {/*<LatestRoutes/>*/}
            </div>
        </div>
    </>)
}

export default Home