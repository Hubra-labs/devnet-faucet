import { PublicKey } from '@solana/web3.js';
import { FC, useEffect } from 'react';
import { TextField } from '@mui/material';

interface WalletInputProps {
    address: string;
    setAddress: Function;
    setIsValid: Function;
    isValid?: boolean;
}

const WalletInput: FC<WalletInputProps> = ({ address, setAddress, setIsValid, isValid }) => {
    const validateSolanaAddress = (addrs: string) => {
        try {
            const publicKey = new PublicKey(addrs);
            return PublicKey.isOnCurve(publicKey.toBytes());
        } catch (err) {
            return false;
        }
    };

    useEffect(() => {
        if (address) setIsValid(validateSolanaAddress(address));
    }, [address]);

    const hasError = !!address && isValid === false;

    return (
        <TextField
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Paste your Solana wallet address"
            fullWidth
            variant="outlined"
            color="primary"
            error={hasError}
            helperText={hasError ? 'Invalid Solana address' : ' '}
            FormHelperTextProps={{ sx: { mx: 1 } }}
        />
    );
};

export default WalletInput;
