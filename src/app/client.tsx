"use client"
import base64url from "base64url";
import {
    account,
    fundPubkey,
    fundSigner,
    native,
    server,
} from "./lib/common";
import { type Signer } from "passkey-kit";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { isAllowed, requestAccess } from "@stellar/freighter-api";

export default function Client() {

    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [hasPermission, setHasPermission] = useState(false)
    const [publicKey, setPublicKey] = useState<string>()

    const contractId = useRef<string>('')
    const keyId = useRef<string>('')
    const balance = useRef<string | undefined>(undefined)
    const signers = useRef<Signer[]>([])


    const handleLogin = async () => {
        try {
            const accessObj = await requestAccess();
            console.log(accessObj.address)
        } catch (e) {
            console.log(e)
        }
    }

    const handleConnection = async () => {
        try {
            const response = await fetch(`/api/user/${contractId.current}`, { method: 'GET', headers: { 'content-type': 'application/json' } })
            const json = await response.json()
            if (response.status === 404) {
                handleLogin()
                return toast('Please connect your wallet before join the lotteries.')
            }

            if (response.status !== 200) {
                return toast.error('An unexcepted error occurred please try again.')
            }

            const data = json as AuthProps
            setPublicKey(data.publicKey)
            toast.success('Hi, Welcome back! 🎉🚀')

        } catch (e) {
            console.log(e)
        }
    }

    const getWalletBalance = async () => {
        const { result } = await native.balance({ id: contractId.current });

        balance.current = result.toString();
        console.log(balance);
    }

    const getWalletSigners = async () => {
        signers.current = await server.getSigners(contractId.current);
    }

    const fundWallet = async () => {
        const { built, ...transfer } = await native.transfer({
            to: contractId.current,
            from: fundPubkey,
            amount: BigInt(100 * 10_000_000),
        });

        await transfer.signAuthEntries({
            address: fundPubkey,
            signAuthEntry: fundSigner.signAuthEntry,
        });

        const res = await server.send(built!);

        console.log(res);

        await getWalletBalance();
    }

    const connect = async (keyId_?: string) => {
        try {
            const { keyId: kid, contractId: cid } = await account.connectWallet(
                {
                    keyId: keyId_,
                    getContractId: (keyId) => server.getContractId({ keyId }),
                },
            );

            keyId.current = base64url(kid);
            localStorage.setItem("sp:keyId", keyId.current);

            contractId.current = cid
            handleConnection()

            setIsConnected(true)

            await getWalletBalance();
            await getWalletSigners();
        } catch (err) {
            console.error(err);
            // alert(err.message)
        }
    }

    const handleRegister = async () => {
        const user = prompt("Give this passkey a name");
        if (!user) return;

        try {
            const {
                keyId: kid,
                contractId: cid,
                signedTx,
            } = await account.createWallet("Super Peach", user);

            const res = await server.send(signedTx);

            console.log(res);

            keyId.current = base64url(kid);
            localStorage.setItem("sp:keyId", keyId.current);
            contractId.current = cid
            console.log("register", cid);
            handleConnection()

            setIsConnected(true)

            await getWalletSigners();
            await fundWallet();

        } catch (err) {
            console.error(err);
        }

    }

    const reset = () => {
        localStorage.removeItem("sp:keyId");
        location.reload();
    }

    const handleAllowApp = async () => {
        const isAppAllowed = await isAllowed();
        setHasPermission(isAppAllowed.isAllowed)
    }

    useEffect(() => {
        handleAllowApp()
    }, [])

    if (!publicKey || !hasPermission) {
        return <div>
            <p>Welcome!, Please connect your wallet first.</p>
            <button onClick={handleLogin}>connect</button>
        </div>
    }

    return <div>
        <Toaster />
        <button onClick={handleRegister}>register</button>
        <button onClick={() => connect()}>Sign In</button>
        <button onClick={reset}>reset</button>
        {isConnected && <>
            <button onClick={fundWallet}>Add Funds</button>
            <button onClick={getWalletBalance}>Get Balance</button>
        </>}
    </div>
}