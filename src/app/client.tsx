"use client"
import { useEffect } from "react";
import useWallet from "../../hooks/useWallet.hook";
import usePasskey from "../../hooks/passkey.hook";

export default function Client() {

    const { hasPermission, publicKey, handleAllowApp, handleLogin } = useWallet()
    const { handleLogout, handleRegister, connect, contractId } = usePasskey()

    useEffect(() => {
        if(!contractId){
            return
        }
        handleLogin(contractId)
    }, [contractId])

    useEffect(() => {
        handleAllowApp()
    }, [])


    if (!publicKey || !hasPermission) {
        return <div>
            <p>Welcome!, Please connect your wallet first.</p>
            <button onClick={() => connect()}>Sign In</button>
            <button onClick={() => handleRegister()}>Sign Up</button>
        </div>
    }

    return <div>
        {publicKey}
        <button onClick={handleLogout}>logout</button>
    </div>
}