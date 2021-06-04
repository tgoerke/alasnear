import React, { useState, useEffect } from 'react';
import * as nearAPI from 'near-api-js';
import { get, set, del } from '../utils/storage';
import { generateSeedPhrase } from 'near-seed-phrase';
import { 
	contractName,
	createAccessKeyAccount,
	postJson,
	postSignedJson
} from '../utils/near-utils';

const LOCAL_KEYS = '__LOCAL_KEYS';

const {
	KeyPair,
	utils: { PublicKey, format: { formatNearAmount } }
} = nearAPI;

export const Keys = ({ update }) => {
    const [name, setName] = useState('kn00t.testnet')
    const [eventName, setEventName] = useState('Please send a guitar to me!')
    const [implicitAccountId, setImplicitAccountId] = useState('')
    const [state, setState] = useState()
    const [fundState, setFundState] = useState()

    const handleCreateAccount = async () => {
        const result = await postJson({
            url: 'http://localhost:3000/create-account',
            data: {
                name, eventName
            }
        })

        if (result && result.success) {
            setImplicitAccountId(result.implicitAccountId)
        }
    }

    const handleCheckAccount = async (accountId, callback) => {

        const result = await postJson({
            url: 'http://localhost:3000/check-account',
            data: {
                accountId
            }
        })
        if (result && result.success) {
            callback(result.state || { amount: '0'})
        }
    }
    
    const handleDeposit = async () => {
        const result = await postJson({
            url: 'http://localhost:3000/deposit-account',
            data: {
                name, eventName
            }
        })

        if (result && result.success) {
            console.log(result)
            handleCheckAccount(implicitAccountId, setState)
            handleCheckAccount(contractName, setFundState)
        }
    }

	return <>
		<h3>Request an Open Guitar</h3>
        <input placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <br />
        <input placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        <br />
        <button onClick={() => handleCreateAccount()}>Request Shipping</button>
        <p>Please provide your wallet address and request shipping. Get in contact with us using the contact form.</p>
        <br />
        <br />
        <h3>Deposit Address</h3>

        <p>{implicitAccountId}</p>
        <p>Balance: 100</p>
        <br />
        <button onClick={() => handleCheckAccount(implicitAccountId, setState)}>Check Payment</button>
        <p>We created a deposit address for you. Send the requested amount to the deposit address and check payment. Please wait before you Approve Shipping.</p>
        
        <h3>Approve Shipping</h3>
        <br />
        <button onClick={() => handleDeposit()}>Approve Shipping</button>
        <p>After you approved shipping the deposit amount is send to the Alas Fund. Your Open Guitar is on its way to you.</p>

        <h3>Alas Funds Raised</h3>
        <p>{contractName}</p>
        <p>Balance: { fundState ? formatNearAmount(fundState.amount, 2) : '0'}</p>
        <br />
        <button onClick={() => handleCheckAccount(contractName, setFundState)}>Refresh Funds</button>
        <p>You can see the collected funds and (later) who contributed them.</p>
	</>;
};

