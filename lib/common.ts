import { PasskeyKit, PasskeyServer, SACClient } from "passkey-kit";
import { Account, Keypair, StrKey } from "@stellar/stellar-sdk/minimal"
import { Buffer } from "buffer";
import { basicNodeSigner } from "@stellar/stellar-sdk/minimal/contract";
import { Server } from "@stellar/stellar-sdk/minimal/rpc";
export const rpc = new Server(process.env.NEXT_PUBLIC_rpcUrl!);

export const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32))
export const mockSource = new Account(mockPubkey, '0')

export const fundKeypair = new Promise<Keypair>(async (resolve) => {
    const now = new Date();

    now.setMinutes(0, 0, 0);

    const nowData = new TextEncoder().encode(now.getTime().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', nowData);
    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer))
    const publicKey = keypair.publicKey()

    rpc.getAccount(publicKey)
        .catch(() => rpc.requestAirdrop(publicKey))
        .catch(() => { })

    resolve(keypair)
})
export const fundPubkey = (await fundKeypair).publicKey()

export const fundSigner = basicNodeSigner(await fundKeypair, process.env.NEXT_PUBLIC_networkPassphrase!)


export const account = new PasskeyKit({
    rpcUrl: process.env.NEXT_PUBLIC_rpcUrl!,
    networkPassphrase: process.env.NEXT_PUBLIC_networkPassphrase!,
    walletWasmHash: process.env.NEXT_PUBLIC_walletWasmHash!,
});
export const server = new PasskeyServer({
    rpcUrl: process.env.NEXT_PUBLIC_rpcUrl,
    launchtubeUrl: process.env.NEXT_PUBLIC_launchtubeUrl,
    launchtubeJwt: process.env.NEXT_PUBLIC_launchtubeJwt,
    mercuryProjectName: process.env.NEXT_PUBLIC_mercuryProjectName,
    mercuryUrl: process.env.NEXT_PUBLIC_mercuryUrl,
    mercuryJwt: process.env.NEXT_PUBLIC_mercuryJwt,
});

export const sac = new SACClient({
    rpcUrl: process.env.NEXT_PUBLIC_rpcUrl!,
    networkPassphrase: process.env.NEXT_PUBLIC_networkPassphrase!,
});
export const native = sac.getSACClient(process.env.NEXT_PUBLIC_nativeContractId!)