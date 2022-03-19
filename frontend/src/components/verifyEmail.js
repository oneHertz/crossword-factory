import React from 'react'
import Swal from 'sweetalert2'

const VerifyEmail = ({match}) => {
    const [verified, setVerified] = React.useState(false)
    const [errors, setErrors] = React.useState({})

    const [email, setEmail] = React.useState()
    const [sent, setSent] = React.useState()

    React.useEffect(()=>{
        (async () => {
            if(match.params.key) {
                const res = await fetch(process.env.REACT_APP_API_URL + '/auth/registration/verify-email/', {
                    method: 'POST',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({key: match.params.key})
                })
                if (res.status === 200) {
                    setVerified(true)
                    await Swal.fire({
                      title: 'Succés!',
                      text: 'Email Verifié!',
                      icon: 'success',
                      confirmButtonText: 'OK'
                    });
                    window.location = '/'
                } else if (res.status === 400) {
                    setErrors(await res.json())
                } else if (res.status === 404) {
                    setErrors({key: 'Clef non trouvé.'})
                }
            }
        })()
    }, [match])

    const onSubmitResend = async (e) => {
        e.preventDefault()
        await fetch(process.env.REACT_APP_API_URL+'/auth/registration/resend-verification/', {
          method: 'POST',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({email})
        })
        setSent(true)
      }

    return (
      <div className="container main-container">
        {!verified && !sent && (
            <>
            { errors.key && (
            <div className="alert alert-danger" role="alert">
                {errors.key}
            </div>
            )}
            <h3>Reenvoyer email de vérification</h3>
            <form onSubmit={onSubmitResend}>
            <div className={"form-group"}>
                <label htmlFor="email"><i className="fas fa-at"></i> Email</label>
                <input onChange={(e)=>{setEmail(e.target.value)}} type="email" className={"form-control"} id="email" name="email" placeholder="Email"/>
            </div>
            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i> Re-envoyer</button>
        </form>
            </>)}
        {sent && (
        <div className="alert alert-success" role="alert">
            Succés! Nous vous avons envoyez un message élécronique de vérification!
        </div>)}
      </div>
    )
}

export default VerifyEmail