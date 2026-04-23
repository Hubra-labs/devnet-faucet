import { Alert, AlertColor, Container, Paper, Snackbar, Stack } from '@mui/material';

import { Connection } from '@solana/web3.js';
import { FC, useState } from 'react';
import BtnFaucet from './components/btn-faucet/btn-faucet';
import WalletInput from './components/wallet-input/wallet-input';
import logo from './assets/hubra-logo.png';

import { Analytics } from "@vercel/analytics/react"

require('./App.css');
const App: FC = () => {
    const [address, setAddress] = useState<any>("");
    const connection = new Connection("https://truda-rbrotf-fast-devnet.helius-rpc.com");

    const [alertConfig, setAlertConfig] = useState<{ open: boolean; message: string | null; severity: AlertColor }>({ open: false, message: null, severity: 'success' });
    const [isValid, setIsValid] = useState<boolean | any>();

    return (
        <div className="App">
            <Container maxWidth="sm">
                <div className="brand">
                    <img src={logo} alt="Hubra" className="brand-logo" />
                    <h1 className="brand-title">SOL ALL-IN Devnet Faucet</h1>
                    <p className="brand-tagline">by Hubra</p>
                </div>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        mt: 3,
                        bgcolor: 'rgba(16, 22, 46, 0.72)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 3,
                        backdropFilter: 'blur(14px)',
                        boxShadow: '0 24px 60px rgba(5, 8, 24, 0.55)',
                    }}
                >
                    <Stack spacing={2.5}>
                        <WalletInput address={address} setAddress={setAddress} setIsValid={setIsValid} isValid={isValid} />
                        <BtnFaucet walletAddress={address} isValid={isValid} connection={connection} setAlertConfig={setAlertConfig} />
                    </Stack>
                </Paper>
                <Snackbar
                    open={alertConfig.open}
                    autoHideDuration={6000}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    onClose={() => setAlertConfig({ open: false, message: null, severity: 'success' })}
                >
                    <Alert severity={alertConfig.severity} variant="filled" sx={{ width: '100%' }}>
                        {alertConfig.message}
                    </Alert>
                </Snackbar>
            </Container>
      <span id="love">built with Love by <a href="https://www.hubra.app" target="_blank" rel="noreferrer">
        <span id="logo">Hubra</span>
</a>
      </span>
      <Analytics />
        </div>
    );
};
export default App;



