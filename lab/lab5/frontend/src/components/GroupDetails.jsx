import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function GroupDetails({ user }) {

    // TODO: Extract group ID from route params
    const { id } = useParams();

    // TODO: Use useState to manage:
    // 1. Group details
    // 2. Group members
    // 3. Expense list
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [waitingText, setWaitingText] = useState("Loading group details...");

    // TODO: Add Expense form state
    // - Description
    // - Amount
    // - Paid-by user ID
    // - Users to split with
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitWith, setSplitWith] = useState([]);

    // TODO: Settle Up form state
    // - User to settle with
    // // - Settlement amount
    // const [settleTo, setSettleTo] = useState('');
    // const [settleAmount, setSettleAmount] = useState('');

    // TODO: Fetch group data on component mount or when id changes
    useEffect(() => {
        // TODO: Implement fetchData function
        // - Fetch group details using GET /groups/:id
        // - Fetch expenses using GET /groups/:id/expenses
        // - Update group, members, and expenses state
        // - Set default paidBy to current user if applicable
        const fetchData = async () => {
            // Implement logic here
            try {
                const groupRes = await fetch(`http://localhost:4000/groups/${id}`, {
                    credentials: 'include'
                });
                const groupData = await groupRes.json();
                if (!groupRes.ok) {
                    setGroup(null);
                    setMembers([]);
                    setWaitingText(groupData?.message || 'Group not found');
                    return;
                }

                setGroup(groupData?.group || null);
                setMembers(groupData.members || []);

                const expensesRes = await fetch(`http://localhost:4000/groups/${id}/expenses`, {
                    credentials: 'include'
                });
                const expensesData = await expensesRes.json();
                if (!expensesRes.ok) {
                    setWaitingText(expensesData?.message || 'Failed to load expenses');
                    setExpenses([]);
                    return;
                }
                setExpenses(expensesData);

                if (user && !paidBy) {
                    setPaidBy(user.user_id);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                setWaitingText('Group not found');
            }
        };
        
        // Call fetchData here
        fetchData();
    }, [id, user, paidBy]);

    // TODO: Implement handleAddExpense function
    // - Validate form inputs
    // - Calculate split amounts
    // - Call POST /expenses API
    // - Reset form and refresh data on success
    const handleAddExpense = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!description.trim() || !amount || !paidBy || splitWith.length === 0) {
            alert('Please fill in all fields and select at least one person to split with');
            return;
        }

        const expenseAmount = parseFloat(amount);
        if (expenseAmount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        // Calculate split amounts
        const shareAmount = expenseAmount / splitWith.length;
        const splits = splitWith.map(uid => ({
            user_id: uid,
            share_amount: shareAmount
        }));

        try {
            const response = await fetch('http://localhost:4000/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    group_id: group.group_id,
                    description,
                    amount: expenseAmount,
                    paid_by: paidBy,
                    splits
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add expense');
            }

            // Reset form
            setDescription('');
            setAmount('');
            setPaidBy(user?.user_id || '');
            setSplitWith([]);

            // Refresh expenses
            const expensesRes = await fetch(`http://localhost:4000/groups/${id}/expenses`, {
                credentials: 'include'
            });
            const expensesData = await expensesRes.json();
            setExpenses(expensesData);

            alert('Expense added successfully');
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense');
        }
    };

    // TODO: Implement handleSettleUp function
    // - Validate settlement inputs
    // - Call POST /settle API
    // - Show success or error messages
    // const handleSettleUp = async (e) => {
    //     e.preventDefault();

    //     // Validate inputs
    //     if (!settleTo || !settleAmount) {
    //         alert('Please select a user and enter an amount');
    //         return;
    //     }

    //     const amount = parseFloat(settleAmount);
    //     if (amount <= 0) {
    //         alert('Amount must be greater than 0');
    //         return;
    //     }

    //     try {
    //         const response = await fetch('http://localhost:4000/settle', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({
    //                 to_user: parseInt(settleTo),
    //                 amount: amount
    //             })
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to settle up');
    //         }

    //         // Reset form
    //         setSettleTo('');
    //         setSettleAmount('');

    //         alert('Settled up successfully');
    //     } catch (error) {
    //         console.error('Error settling up:', error);
    //         alert('Error settling up');
    //     }
    // };

    // TODO: Implement toggleSplitMember function
    // - Add/remove user ID from splitWith list
    const toggleSplitMember = (uid) => {
        setSplitWith(prevSplitWith =>
            prevSplitWith.includes(uid)
                ? prevSplitWith.filter(id => id !== uid)
                : [...prevSplitWith, uid]
        );
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {!group ? (
                <p>{waitingText} </p>
            ) : (
                <>
                    <h1>{group.group_name}</h1>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <h2>Add Expense</h2>
                        <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                            <input
                                type="text"
                                placeholder="Description (e.g., Dinner, Taxi)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                step="0.01"
                            />
                            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                                <option value="">Select who paid</option>
                                {members.map(member => (
                                    <option key={member.user_id} value={member.user_id}>
                                        {member.username}
                                    </option>
                                ))}
                            </select>
                            <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                                <p>Split with:</p>
                                {members.map(member => (
                                    <label key={member.user_id} style={{ display: 'block', marginBottom: '5px' }}>
                                        <input
                                            type="checkbox"
                                            checked={splitWith.includes(member.user_id)}
                                            onChange={() => toggleSplitMember(member.user_id)}
                                        />
                                        {member.username}
                                    </label>
                                ))}
                            </div>
                            <button type="submit">Add Expense</button>
                        </form>
                    </div>

                    <div>
                        <h2>Expense History</h2>
                        {expenses.length === 0 ? (
                            <p>No expenses yet</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Description</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Amount</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Paid By</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...expenses].reverse().map(expense => (
                                        <tr key={expense.expense_id} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '10px' }}>{expense.description}</td>
                                            <td style={{ padding: '10px' }}>${parseFloat(expense.amount).toFixed(2)}</td>
                                            <td style={{ padding: '10px' }}>{expense.paid_by_name}</td>
                                            <td style={{ padding: '10px' }}>{new Date(expense.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default GroupDetails;
