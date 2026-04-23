import React, { FC, useEffect, useState } from 'react'
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { BlockheightBasedTransactionConfirmationStrategy, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionBlockhashCtor, TransactionInstruction } from '@solana/web3.js';
import { Button, CircularProgress, Stack } from '@mui/material';
import { MINT_SIZE, TOKEN_PROGRAM_ID, createTransferCheckedInstruction, createInitializeMintInstruction, createMint, getOrCreateAssociatedTokenAccount, createTransferInstruction, getAssociatedTokenAddress, createInitializeAccountInstruction, getMinimumBalanceForRentExemptAccount, ACCOUNT_SIZE, getMinimumBalanceForRentExemptMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

import Plausible from 'plausible-tracker'
const { trackEvent } = Plausible();
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
        const signature = await connection.requestAirdrop(
            new PublicKey(address),
            LAMPORTS_PER_SOL
        );

        await confirmAndFinalize(signature);
    }
    const handleAirdrop = async () => {
        setLoader(true)
        trackEvent('airdrop sol')
        try {
            await requestAirdrop(walletAddress)
            setAlertConfig({ open: true, message: 'Airdrop sol to account', severity: 'success' });
        } catch (error) {
            console.error(error)
            setAlertConfig({ open: true, message: 'Airdrop failed', severity: 'error' });
        } finally {
            setLoader(false)
        }
    }
    const createDemoAccount = () => {
        const keypair = Keypair.generate();
        return keypair;
    };
    const requestNft = async () => {
        try {
            setLoader(true)
            trackEvent('airdrop nft')
            // create middleware account
            const feePayer = createDemoAccount()
            // airdrop this account
            setAlertConfig({ open: true, message: 'Airdrop sol to fee payer account', severity: 'success' });
            await requestAirdrop(feePayer.publicKey.toBase58())
            setAlertConfig({ open: true, message: 'Creating NFT', severity: 'success' });

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
            setAlertConfig({ open: true, message: 'Airdrop NFT to account', severity: 'success' });
            setLoader(false)
        } catch (error) {
            setLoader(false);
            console.error(error)
            setAlertConfig({ open: true, message: 'NFT airdrop failed', severity: 'error' });
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
            trackEvent('airdrop spl')
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
            setAlertConfig({ open: true, message: 'Airdrop SPL to account', severity: 'success' });
            setLoader(false)
        } catch (error) {
            setLoader(false);
            console.error(error)
            setAlertConfig({ open: true, message: 'SPL airdrop failed', severity: 'error' });
        }
    }
    return (
        <Stack spacing={2} alignItems="center">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <Button
                    onClick={handleAirdrop}
                    disabled={!isValid || loader}
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                >
                    Get 1 SOL
                </Button>
                <Button
                    onClick={requestNft}
                    disabled={!isValid || loader}
                    color="secondary"
                    variant="contained"
                    size="large"
                    fullWidth
                >
                    Get 1 NFT
                </Button>
            </Stack>
            {loader && <CircularProgress color="primary" size={28} thickness={4} />}
        </Stack>
    )
}

export default BtnFaucet