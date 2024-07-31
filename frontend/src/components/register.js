import React from 'react'
import useGlobalState from '../utils/useGlobalState'

const Register = () => {
    const globalState = useGlobalState()
    const { username } = globalState.user
    const [login, setLogin] = React.useState()
    const [email, setEmail] = React.useState()
    const [registered, setRegistered] = React.useState()
    const [firstName, setFirstName] = React.useState()
    const [lastName, setLastName] = React.useState()
    const [pass, setPass] = React.useState()
    const [pass2, setPass2] = React.useState()
    const [errors, setErrors] = React.useState({})
  
    React.useEffect(()=>{
        if (username) {
            window.location = '/'
        }
    }, [username])
  
    const onRegister = async (e) => {
      e.preventDefault()
      const res = await fetch(process.env.REACT_APP_API_URL+'/auth/registration/', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, username: login, first_name: firstName, last_name: lastName, password1: pass, password2: pass2})
      })
      if(res.status === 400) {
        const data = await res.json()
        setErrors(data)
      } else if ([200, 201].includes(res.status)) {
        setRegistered(true)
      }
    }
    return (
      <div className="container main-container">
        { !registered && <><h1><i className="fas fa-user-plus"></i> Creation de compte</h1><hr/>
            {errors.non_field_errors && errors.non_field_errors.map(e=>
                <div className="alert alert-danger" role="alert">
                    {e}
                </div>
            )}
            <form onSubmit={onRegister}>
            <div className="form-group mb-3">
                <label htmlFor="username"><i className="fas fa-user"></i> Nom d'utilisateur</label>
                <input onChange={(e)=>{setLogin(e.target.value)}} type="text" className={"form-control" + (errors.username ? ' is-invalid' : '')} id="username" name="username" placeholder="Nom d'utilisateur" required/>
                {errors.username && (<div className="invalid-feedback">
                    {errors.username}
                </div>)}
            </div>
            <div className="form-group mb-3">
                <label htmlFor="email"><i className="fas fa-at"></i> Adresse Electronique</label>
                <input onChange={(e)=>{setEmail(e.target.value)}} type="email" className={"form-control" + (errors.email ? ' is-invalid' : '')} id="email" name="email" placeholder="Adresse Electronique" required/>
                {errors.email && (<div className="invalid-feedback">
                    {errors.email}
                </div>)}
            </div>
            <div className="form-group mb-3">
                <label htmlFor="firstName"><i className="fas fa-user"></i> Prénom</label>
                <input onChange={(e)=>{setFirstName(e.target.value)}} type="text" className={"form-control" + (errors.first_name ? ' is-invalid' : '')} id="firstName" name="firstName" placeholder="Prénom" required/>
                {errors.first_name && (<div className="invalid-feedback">
                    {errors.first_name}
                </div>)}
            </div>
            <div className="form-group mb-3">
                <label htmlFor="lastName"><i className="fas fa-user"></i> Nom de famille</label>
                <input onChange={(e)=>{setLastName(e.target.value)}} type="text" className={"form-control" + (errors.last_name ? ' is-invalid' : '')} id="lastName" name="lastName" placeholder="Nom de famille" required/>
                {errors.last_name && (<div className="invalid-feedback">
                    {errors.last_name}
                </div>)}
            </div>
            <div className="form-group mb-3">
                <label htmlFor="password"><i className="fas fa-key"></i> Mot de passe</label>
                <input onChange={(e)=>{setPass(e.target.value)}} type="password" className={"form-control" + (errors.password1 ? ' is-invalid' : '')} id="password" name="password" placeholder="Mot de passe"/>
                {errors.password1 && (<div className="invalid-feedback">
                    {errors.password1}
                </div>)}
            </div>
            <div className="form-group mb-3">
                <label htmlFor="passwordRepeat"><i className="fas fa-key"></i> Confirmation du mot de passe</label>
                <input onChange={(e)=>{setPass2(e.target.value)}} type="password" className={"form-control" + (errors.password2 ? ' is-invalid' : '')} id="passwordRepeat" name="passwordRepeat" placeholder="Confirmation du mot de passe"/>
                {errors.password2 && (<div className="invalid-feedback">
                    {errors.password2}
                </div>)}
            </div>
            <div className="form-group form-check mb-3">
                <input type="checkbox" className="form-check-input" id="acceptTos" required/>
                <label className="form-check-label" for="acceptTos">J'accepte les termes et conditions du service.</label>
            </div>
            <button type="submit" className="btn btn-primary"><i className="fas fa-user-plus"></i> Créer le compte</button>
        </form></>}
        {registered && (
            <div className="alert alert-success" role="alert">
            Succés! On vous a envoyé un message éléctronique de confirmation!
            </div>)
        }
      </div>
    )
  }
  
  export default Register