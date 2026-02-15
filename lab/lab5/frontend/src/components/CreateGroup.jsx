import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CreateGroup() {

    // TODO: Use useState to manage:
    // 1. Group name
    // 2. Friend list
    // 3. Selected friends
    const [name, setName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const navigate = useNavigate();

    // TODO: Fetch the friend list of the logged-in user
    // - Call GET /friends API
    // - Include credentials
    // - Store the response in friends state
    // - Handle error cases
    useEffect(() => {
        // Implement logic here
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
            setFriends([]);
        });
    }, []);

    // TODO: Implement handleCreateGroup function
    // - Prevent default form submission
    // - Validate group name
    // - Call POST /groups API with:
    //   { name, member_ids }
    // - Navigate to /groups on success
    const handleCreateGroup = async (e) => {
        // Implement logic here
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter a group name');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: name.trim(),
                    member_ids: selectedFriends
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create group');
            }

            navigate('/groups');
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group. Please try again.');
        }
    };

    // TODO: Implement toggleFriend function
    // - Add/remove friend ID from selectedFriends array
    const toggleFriend = (id) => {
        // Implement logic here
        setSelectedFriends(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(friendId => friendId !== id)
                : [...prevSelected, id]
        );
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Create Group</h1>
                <Link to="/groups" style={{ textDecoration: 'none', color: '#007bff' }}>Back to Groups</Link>
            </div>

            <form onSubmit={handleCreateGroup}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="group-name" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                        Group Name
                    </label>
                    <input
                        id="group-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Trip to Goa"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ marginBottom: '10px' }}>Select Members</h2>
                    {friends.length === 0 ? (
                        <p style={{ color: '#666' }}>
                            You have no friends yet. <Link to="/friends">Add friends</Link> to create a group.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {friends.map(friend => (
                                <label
                                    key={friend.user_id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 10px',
                                        border: '1px solid #eee',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFriends.includes(friend.user_id)}
                                        onChange={() => toggleFriend(friend.user_id)}
                                    />
                                    <span>{friend.username || friend.name || `User ${friend.user_id}`}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Create Group
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/groups')}
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateGroup;
