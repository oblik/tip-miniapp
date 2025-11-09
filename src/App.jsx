import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import './App.css';

export default function App() {
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [tips, setTips] = useState([]);
    const [message, setMessage] = useState('');
    const [totalTips, setTotalTips] = useState(0);
    const [tokens, setTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);

    const funMessages = [
        "Thanks for your support 🚀",
        "💥 Tip sent!",
        "You're awesome! 😎",
        "Boom 💫 Tip completed!",
        "Tip successfully received!"
    ];

    const usdButtons = [1, 2, 5, 10];

    useEffect(() => {
        async function fetchTokens() {
            await sdk.actions.ready();
            try {
                const balances = await sdk.wallet.getTokenBalances();
                setTokens(balances);
                if (balances.length > 0) setSelectedToken(balances[0]);
            } catch (err) {
                console.error('Failed to fetch token balances:', err);
            }
        }
        fetchTokens();
    }, []);

    function toTokenUnits(amount, decimals) {
        return BigInt(amount * Math.pow(10, decimals)).toString();
    }

    async function sendTip(selectedAmount) {
        if (!selectedToken) {
            alert('Please select a token!');
            return;
        }

        const tipAmount = selectedAmount ?? amount;

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            alert("Invalid address!");
            return;
        }
        if (!tipAmount || isNaN(Number(tipAmount)) || Number(tipAmount) <= 0) {
            alert("Invalid amount!");
            return;
        }

        try {
            await sdk.actions.ready();

            await sdk.actions.sendToken({
                recipientAddress: address,
                token: selectedToken.tokenAddress,
                amount: toTokenUnits(Number(tipAmount), selectedToken.decimals)
            });

            const msg = funMessages[Math.floor(Math.random() * funMessages.length)];
            setMessage(msg);
            setTips([{ address, amount: tipAmount, token: selectedToken.symbol, msg }, ...tips]);
            setTotalTips(prev => prev + Number(tipAmount));

            setAddress('');
            setAmount('');
            setTimeout(() => setMessage(''), 2500);

        } catch (err) {
            console.error(err);
            alert('Error sending tip: ' + err.message);
        }
    }

    return (
        <div className="app">
            <div className="counter">💰 Total tips sent: {totalTips} tokens</div>

            <div className="tip-card">
                <h1>Tip Fun</h1>
                <p className="subtitle">Send a quick and fun token tip</p>

                {/* Token buttons */}
                <div className="token-buttons">
                    {tokens.map(token => (
                        <button
                            key={token.tokenAddress}
                            className={selectedToken?.tokenAddress === token.tokenAddress ? 'selected' : ''}
                            onClick={() => setSelectedToken(token)}
                        >
                            {token.symbol} ({(Number(token.balance) / Math.pow(10, token.decimals)).toFixed(4)})
                        </button>
                    ))}
                </div>

                <div className="form">
                    <input
                        type="text"
                        placeholder="Recipient address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />

                    <div className="quick-buttons">
                        {usdButtons.map((usd) => (
                            <button key={usd} onClick={() => sendTip(usd)}>
                                ${usd} ≈ {usd} {selectedToken?.symbol}
                            </button>
                        ))}
                    </div>

                    <input
                        type="number"
                        placeholder="Custom amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    <button class="Send_Tip" onClick={() => sendTip()}>Send Tip</button>
                </div>

                {message && <div className="funMessage">{message}</div>}
            </div>

            <div className="history">
                <h2>Recent Tips</h2>
                {tips.map((tip, i) => (
                    <div key={i} className="tipLine">
                        <span className="tipAmount">{tip.amount} {tip.token}</span> → <span className="tipAddress">{tip.address}</span>
                        <span className="tipMsg">{tip.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
