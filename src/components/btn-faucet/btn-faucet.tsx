import  { FC, useEffect, useState } from 'react'
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { BlockheightBasedTransactionConfirmationStrategy, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionBlockhashCtor } from '@solana/web3.js';
import { Box, Button, CircularProgress } from '@mui/material';
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMintInstruction, getAssociatedTokenAddress, createInitializeAccountInstruction, getMinimumBalanceForRentExemptAccount, ACCOUNT_SIZE, getMinimumBalanceForRentExemptMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token';


import { track } from "@vercel/analytics/react"
interface BtnFaucetProps {
    walletAddress: string;
    isValid: boolean;
    connection: Connection
    setAlertConfig: Function;
}

const BtnFaucet: FC<BtnFaucetProps> = ({ walletAddress, connection, setAlertConfig, isValid }) => {
    const [loader, setLoader] = useState(false)
    useEffect(() => {

        console.log('rendered')
    })

    const confirmAndFinalize = async (signature: string) => {
        const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash();
        const config: BlockheightBasedTransactionConfirmationStrategy = {
            signature, blockhash, lastValidBlockHeight//.lastValidBlockHeight
        }
        const confim = await connection.confirmTransaction(config, 'finalized');
        console.log(confim)
    }
    const requestAirdrop = async (address: string) => {
        try {
            const signature = await connection.requestAirdrop(
                new PublicKey(address),
                LAMPORTS_PER_SOL
            );

            await confirmAndFinalize(signature);
        } catch (error) {
            setLoader(false);
            console.error(error)
        }
    }
    const handleAirdrop = async () => {
        setLoader(true)
        track('airdrop sol')
        await requestAirdrop(walletAddress)
        setAlertConfig({ open: true, message: 'Airdrop sol to account' });

        setLoader(false)

    }
    const createDemoAccount = () => {
        const keypair = Keypair.generate();
        return keypair;
    };
    const requestNft = async () => {
        try {
            setLoader(true)
            track('airdrop nft')
            // create middleware account
            const feePayer = createDemoAccount()
            // airdrop this account
            setAlertConfig({ open: true, message: 'Airdrop sol to fee payer account' });
            await requestAirdrop(feePayer.publicKey.toBase58())
            setAlertConfig({ open: true, message: 'Creating NFT' });

            // init metaplex instance
            const mx = new Metaplex(connection);
            mx.use(keypairIdentity(feePayer));
            const { nft } = await mx
                .nfts()
                .create({
                    tokenOwner: new PublicKey(walletAddress),
                    isCollection: true,
                    uri: "https://yyuf64d3dxl7pzwpyvwb24vqgztrxci5w3rvubbogt5s2d2m3weq.arweave.net/xihfcHsd1_fmz8VsHXKwNmcbiR2241oELjT7LQ9M3Yk",
                    name: "Avaulto faucet NFT",
                    sellerFeeBasisPoints: 500, // Represents 5.00%.
                })
            console.log(nft)
            setAlertConfig({ open: true, message: 'Airdrop NFT to account' });
            setLoader(false)
        } catch (error) {
            setLoader(false);
            console.error(error)
        }

    }

    const mint = async (feePayer: Keypair, toWallet: PublicKey) => {

        // create a mint account
        let mint = Keypair.generate();
        console.log(`mint: ${mint.publicKey.toBase58()}`);

        let tx = new Transaction();
        tx.add(
            // create account
            SystemProgram.createAccount({
                fromPubkey: feePayer.publicKey,
                newAccountPubkey: mint.publicKey,
                space: MINT_SIZE,
                lamports: await getMinimumBalanceForRentExemptMint(connection),
                programId: TOKEN_PROGRAM_ID,
            }),
            // init mint
            createInitializeMintInstruction(
                mint.publicKey, // mint pubkey
                0, // decimals
                toWallet, // mint authority (an auth to mint token)
                null // freeze authority (we use null first, the auth can let you freeze user's token account)
            )
        );

        return { tx, mint };
    }
    const mintSPL = async () => {
        try {

            setLoader(true)
            track('airdrop spl')
            const feePayer = createDemoAccount()

            // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
            const toWallet = new PublicKey(walletAddress)
            const mintIns = await mint(feePayer, toWallet);
            const mintPubkey = new PublicKey("AjMpnWhqrbFPJTQps4wEPNnGuQPMKUcfqHUqAeEf1WM4");




            let tokenAccount = Keypair.generate();
            console.log(`ramdom token address: ${tokenAccount.publicKey.toBase58()}`);

            const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash();
            const txArgs: TransactionBlockhashCtor = { feePayer: feePayer.publicKey, blockhash, lastValidBlockHeight: lastValidBlockHeight }





            // create account
            const ataIns = SystemProgram.createAccount({
                fromPubkey: feePayer.publicKey,
                newAccountPubkey: tokenAccount.publicKey,
                space: ACCOUNT_SIZE,
                lamports: await getMinimumBalanceForRentExemptAccount(connection),
                programId: TOKEN_PROGRAM_ID,
            })
            // init token account
            const initAtaIns = createInitializeAccountInstruction(tokenAccount.publicKey, mintPubkey, feePayer.publicKey)



            let ata = await getAssociatedTokenAddress(
                mintPubkey, // mint
                feePayer.publicKey, // owner
                false // allow owner off curve
            );
            console.log(`ata: ${ata.toBase58()}`);

            const cata =
                createAssociatedTokenAccountInstruction(
                    feePayer.publicKey, // payer
                    ata, // ata
                    toWallet, // owner
                    mintPubkey // mint

                );

            const ins = [mintIns.tx, ataIns, cata]
            let transaction = new Transaction(txArgs).add(...ins);
            const rawTransaction = transaction.serialize({ requireAllSignatures: false });
            const signature = await connection.sendRawTransaction(rawTransaction);
            await confirmAndFinalize(signature);
            setAlertConfig({ open: true, message: 'Airdrop SPL to account' });
            setLoader(false)
        } catch (error) {
            setLoader(false);
            console.error(error)
        }
    }
    return (
        <>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }} sx={{ m: 4, p: 2, border: '1px dashed grey' }}>
                <Button onClick={handleAirdrop} disabled={!isValid} color={'success'} variant="contained">Get 1 SOL</Button>
                <Button onClick={requestNft} disabled={!isValid} color={'secondary'} variant="contained">Get 1 NFT</Button>
                {/* <Button onClick={mintSPL} disabled={!isValid} color={'primary'} variant="contained">Mint & get SPL</Button> */}
            </Box>
            {loader && <CircularProgress color="secondary" style={{ display: 'flex', margin: '0 auto' }} />}

        </>
    )
}

export default BtnFaucet