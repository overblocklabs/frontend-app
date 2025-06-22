import { isAllowed, requestAccess } from "@stellar/freighter-api";
import { useState } from "react";
import toast from "react-hot-toast";

const useWallet = () => {

    const [isWalletLoading, setWalletLoading] = useState(false)
    const [isWalletError, setWalletError] = useState(false)

    const [publicKey, setPublicKey] = useState('')
    const [hasPermission, setHasPermission] = useState(false)

    const handleAllowApp = async () => {
        const isAppAllowed = await isAllowed();
        setHasPermission(isAppAllowed.isAllowed)
    }

    const handleSignup = async (contractId: string) => {
        try {
            setWalletLoading(true)
            const accessObj = await requestAccess();
            await fetch(`/api/user/sign-up`, { method: 'POST', body: JSON.stringify({ contract: contractId, publicKey: accessObj.address }), headers: { 'content-type': 'application/json' } })
            setPublicKey(accessObj.address)
            toast.success('Hi, Welcome back! 🎉🚀')
        } catch (e) {
            setWalletError(true)
            console.error(e)
            return toast.error('An unexcepted error occurred please try again.')
        }finally {
            setWalletLoading(false)
        }
    }

    const handleLogin = async (contractId: string) => {
        setWalletLoading(true)
        const response = await fetch(`/api/user/${contractId}`, { method: 'GET', headers: { 'content-type': 'application/json' } })
        if (response.status === 404) {
            handleSignup(contractId)
            return
        }
        
        if (response.status !== 200) {
            setWalletError(false)
            return toast.error('An unexcepted error occurred please try again.')
        }
        
        const json = await response.json()
        const data = json as AuthProps
        setPublicKey(data.publicKey)
        toast.success('Hi, Welcome back! 🎉🚀')
        setWalletLoading(false)
    }

    return {
        handleLogin,
        handleSignup,
        publicKey,
        hasPermission,
        handleAllowApp,
        isWalletLoading,
        isWalletError
    }
}

export default useWallet