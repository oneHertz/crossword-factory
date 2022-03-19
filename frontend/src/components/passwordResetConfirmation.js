import React from 'react'
import useGlobalState from '../utils/useGlobalState'
import Swal from 'sweetalert2'

import {useParams} from "react-router-dom";

const Register = () => {
    const globalState = useGlobalState()
    const { username } = globalState.user
    const [pass, setPass] = React.useState()
    const [pass2, setPass2] = React.useState()
    const [errors, setErrors] = React.useState({})
    let { key } = useParams();
    React.useEffect(()=>{
        if (username) {
          window.location = '/'
        }
    }, [username])
  
    const onSubmit = async (e) => {
      e.preventDefault()
      const [uid, token] = key.split(':')
      const res = await fetch(process.env.REACT_APP_API_URL+'/auth/password/reset/confirm/', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({new_password1: pass, new_password2: pass2, uid, token})
      })
      if(res.status === 400) {
        const data = await res.json()
        setErrors(data)
      } else if (res.status === 200) {
        await Swal.fire({
          title: 'Succés!',
          text: 'Mot de passe reinitialisé!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        window.location = '/'
      }
    }
    return (
      <div className="container main-container">
          <h1><i className="fas fa-key"></i> Reinitialiser mot de passe</h1><hr/>
            {errors.token && (
                <div className="alert alert-danger" role="alert">
                    Clef invalide.
                </div>
            )}
            <form onSubmit={onSubmit}>
            <div className="form-group">
                <label htmlFor="password"><i className="fas fa-key"></i> Nouveau mot de passe</label>
                <input onChange={(e)=>{setPass(e.target.value)}} type="password" className={"form-control" + (errors.new_password1 ? ' is-invalid' : '')} id="password" name="password" placeholder="Nouveau mot de passe"/>
                {errors.new_password1 && (<div className="invalid-feedback">
                    {errors.new_password1}
                </div>)}
            </div>
            <div className="form-group">
                <label htmlFor="passwordRepeat"><i className="fas fa-key"></i> Confirmation du nouveau mot de passe</label>
                <input onChange={(e)=>{setPass2(e.target.value)}} type="password" className={"form-control" + (errors.new_password2 ? ' is-invalid' : '')} id="passwordRepeat" name="passwordRepeat" placeholder="Confirmation du nouveau mot de passe"/>
                {errors.new_password2 && (<div className="invalid-feedback">
                    {errors.new_password2}
                </div>)}
            </div>
            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i> Reinitialiser mot de passe</button>
        </form>
      </div>
    )
  }
  
  export default Register