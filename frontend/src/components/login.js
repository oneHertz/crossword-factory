import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useGlobalState from '../utils/useGlobalState'

const Login = () => {
    const globalState = useGlobalState()
    const { username, api_token } = globalState.user
    const [wantLogin, setWantLogin] = useState(false)
    const [login, setLogin] = useState(false)
    const [pass, setPass] = useState(false)
    const [errors, setErrors] = React.useState({})

    React.useEffect(()=>{
      (async () => {
        if (username) {
          try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/auth/user/', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Token ' + api_token,
              }
            })
            if (res.status !== 200) {
              throw new Error('not logged in')
            }
          } catch (e) {
            globalState.setUser({})
          }
        }
      })()
    }, [globalState, api_token, username])
  
    React.useEffect(() => {
      if (!wantLogin){
        setErrors({});
      }
    }, [wantLogin])

    const onLogin = async (e) => {
      e.preventDefault()
      const res = await fetch(process.env.REACT_APP_API_URL + '/auth/login', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: login, password: pass})
      })
      if(res.status === 400) {
        const data = await res.json()
        setErrors(data)
      } else {
        setWantLogin(false)
        const json = await res.json()
        globalState.setUser({username: json.username, api_token: json.token})
      }
    }
    const onLogout = async () => {
      globalState.setUser({})
      window.location = "/"
    }
    return (
      <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" href="#">Verbicruciste.fr</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            <ul className="navbar-nav d-flex flex-start">
              {username && (<>
                  <li className="nav-item">
                    <Link className="nav-link" to='/'>Mes Grilles</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/settings/">Paramètres</Link>
                  </li>
                  <li className="nav-item d-flex ms-2">
                    <button onClick={onLogout} className="btn btn-danger btn-sm">Deconnéction</button>
                  </li>
                </>)}
                {!username && (<>
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Index</Link>
                  </li>
                  <li className="nav-item d-flex">
                    <button data-testid="loginBtn" onClick={()=>setWantLogin(true)} className="btn btn-success btn-sm">Connection</button>
                  </li>
                </>
                )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="container-fluid top-page"></div>
      <div>
      <div style={{marginTop: '15px', marginBottom: '40px', position: 'relative', zIndex: 2e3}}>
      {!username && wantLogin && (<div>
        <div className="modal" role="dialog" style={{display: 'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{padding:'35px 50px'}}>
                <h4><i className="fas fa-sign-in-alt"></i>  Connection</h4>
              </div>
              <div className="modal-body" style={{padding:'40px 50px'}}>
                {errors.non_field_errors && errors.non_field_errors.map(e=>
                    <div className="alert alert-danger" role="alert" dangerouslySetInnerHTML={{__html: e}}></div>
                )}
                <form onSubmit={onLogin}>
                  <div className="form-group mb-3">
                    <label htmlFor="username"><i className="fas fa-user"></i> Nom d'utilisateur</label>
                    <input onChange={(e)=>{setLogin(e.target.value)}} type="text" className="form-control" id="username" name="username" placeholder="Nom d'utilisateur"/>
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="password"><i className="fas fa-key"></i> Mot de passe</label>
                    <input onChange={(e)=>{setPass(e.target.value)}} type="password" className="form-control" id="password" name="password" placeholder="Mot de passe"/>
                  </div>
                  <button data-testid="submitLoginBtn" type="submit" className="btn btn-primary btn-block"><i className="fas fa-sign-in-alt"></i>  Entrer</button>
                </form>
              </div>
              <div className="modal-footer" style={{display:'block', justifyContent:'initial'}}>
                <button type="submit" className="btn btn-danger btn-default pull-left" data-dismiss="modal" onClick={()=>setWantLogin(false)}><i className="fas fa-times"></i> Retour</button>
                <div className="float-end">
                  <p>Pas de compte? <Link to='/sign-up' onClick={()=>setWantLogin(false)}>Créer un compte</Link><br/>
                  <Link to='/password-reset' onClick={()=>setWantLogin(false)}>Mot de passe oublié?</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>)
      }
      </div>
      </div>
      </>
    )
  }
  
  export default Login