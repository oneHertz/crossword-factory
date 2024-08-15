import React from 'react'
import PasswordChange from './passwordChange'
import UserSettings from './userSettings'
import EmailsList from './emailsList'
import useGlobalState from '../utils/useGlobalState'

const Settings = ({history}) => {
    const globalState = useGlobalState()
    const { username } = globalState.user
    
    React.useEffect(()=>{
        if (!username) {
            history.push('/')
        }
    }, [username, history])

    return (
        <div className="container main-container">
         <h1><i className="fas fa-user-cog"></i> Mon Compte</h1>
         <hr/>
         <UserSettings/>
         <hr/>
         <PasswordChange/>
         <hr/>
         <EmailsList/>
        </div>
    )
}

export default Settings