import base64url from "base64url";
import { account, server } from "../lib/common";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { nanoid } from 'nanoid'

const usePasskey = () => {

  const [isPassKeyLoading, setPasskeyLoading] = useState(false)
  const [isPassKeyError, setIsPassKeyError] = useState(false)

  const [contractId, setContractId] = useState<string>("");
  const contractIdRef = useRef<string>("");

  const keyId = useRef<string>("");

  const connect = async (keyId_?: string) => {
    try {
      setPasskeyLoading(true)
      const { keyId: kid, contractId: cid } = await account.connectWallet({
        keyId: keyId_,
        getContractId: (keyId) => server.getContractId({ keyId }),
      });

      keyId.current = base64url(kid);
      localStorage.setItem("sp:keyId", keyId.current);

      contractIdRef.current = cid;
      setContractId(cid);
      // handleConnection()
    } catch (err) {
      console.error(err);
      toast.error("Couldn't connect your wallet please try again.");
      setIsPassKeyError(true)
      // alert(err.message)
    }finally {
      setPasskeyLoading(false)
    }
  };

  const handleRegister = async () => {

    const user = nanoid(10)
    try {
      setPasskeyLoading(true)
      const {
        keyId: kid,
        contractId: cid,
        signedTx,
      } = await account.createWallet("Super Peach", user);

      await server.send(signedTx);

      keyId.current = base64url(kid);
      localStorage.setItem("sp:keyId", keyId.current);
      contractIdRef.current = cid;
      setContractId(cid);
    } catch (err) {
      setIsPassKeyError(true)
      console.error(err);
    }finally {
      setPasskeyLoading(false)
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sp:keyId");
    location.reload();
  };

  return {
    handleRegister,
    handleLogout,
    connect,
    contractId,
    isPassKeyLoading,
    isPassKeyError
  };
};

export default usePasskey;
