import base64url from "base64url";
import { account, server } from "../lib/common";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const usePasskey = () => {
  const [contractId, setContractId] = useState<string>("");
  const contractIdRef = useRef<string>("");

  const keyId = useRef<string>("");

  const connect = async (keyId_?: string) => {
    try {
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
      // alert(err.message)
    }
  };

  const handleRegister = async () => {
    const user = prompt("Give this passkey a name");
    if (!user) return;

    try {
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
      console.error(err);
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
  };
};

export default usePasskey;
