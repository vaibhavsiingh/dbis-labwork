import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {

    // TODO: Use useState to manage:
    // 1. User balances
    // 2. Friend list
    const [balances, setBalances] = useState([]);
    const [friends, setFriends] = useState([]);

    // TODO: Use useState to manage settle-up form inputs
    // 1. User to settle with
    // 2. Settlement amount
    const [settleTo, setSettleTo] = useState('');
    const [settleAmount, setSettleAmount] = useState('');

    // TODO: Implement fetchData function
    // - Fetch balances using GET /balances
    // - Fetch friends using GET /friends
    // - Include credentials in API calls
    // - Update respective state variables
    // - Handle failure cases
    const fetchData = () => {
        // Implement logic here
        fetch('http://localhost:4000/balances', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch balances');
            }
            return response.json();
        })
        .then(data => {
            setBalances(data || []);            
        })
        .catch(error => {
            console.error('Error fetching balances:', error);
        });


        fetch('http://localhost:4000/friends', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch friends');
            }
            return response.json();
        })
        .then(data => {
            setFriends(data || []);
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
    };

    // TODO: Fetch dashboard data on component mount
    useEffect(() => {
        // Call fetchData here
        fetchData();
    }, []);

    // TODO: Implement handleSettleUp function
    // - Prevent default form submission
    // - Validate settleTo and settleAmount
    // - Call POST /settle API with:
    //   { to_user, amount }
    // - Refresh balances on success
    // - Show appropriate success/error messages
    const handleSettleUp = async (toUser, amount) => {
        if (!toUser || !amount) {
            alert('Invalid settlement data');
            return;
        }

        if (amount <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/settle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    to_user: toUser,
                    amount: amount
                })
            });

            if (!response.ok) {
                throw new Error('Failed to settle up');
            }

            alert('Settlement successful!');
            fetchData();
        } catch (error) {
            console.error('Error settling up:', error);
            alert('Failed to settle up. Please try again.');
        }
    };


    return (
        <>
            <div className="dashboard-container">   
                <h1>Dashboard</h1>
                Hello, {user}
                <div className="balances-section">
                    <h2>Your Balances</h2>
                    {balances.length > 0 ? (
                        <ul className="balances-list">
                            {console.log(balances)}
                            {balances.map((balance, index) => (
                                <li key={index} className={balance.amount > 0 ? 'owed-to-you' : balance.amount < 0 ? 'you-owe' : 'settled'}>
                                    <span className="friend-name">{balance.username} </span>                                    
                                    <span className="balance-amount">
                                        {balance.amount > 0 
                                            ? `owes you $${Math.abs(balance.amount).toFixed(2)}`
                                            : balance.amount < 0 
                                            ? `you owe $${Math.abs(balance.amount).toFixed(2)}`
                                            : 'settled up'}
                                    </span>
                                    {balance.amount < 0 && (
                                        <button 
                                            className="settle-button"
                                            onClick={() => handleSettleUp(balance.other_user_id, Math.abs(balance.amount))}
                                        >
                                            Settle Up
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No balances to display</p>
                    )}
                </div>

                <div className="quick-links">
                    <h2>Quick Links</h2>
                    <div className="links-container">
                        <Link to="/groups" className="link-button">View Groups</Link>
                        <Link to="/friends" className="link-button">Manage Friends</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
