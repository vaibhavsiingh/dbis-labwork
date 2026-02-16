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
        <div className="create-group-container">
            <div className="create-group-top">
                <Link to="/groups" className="link-button">Back to Groups</Link>
            </div>

            <div className="create-group-header">
                <h1>Create Group</h1>
                <p className="muted">Pick a name and add friends to get started.</p>
            </div>

            <form onSubmit={handleCreateGroup} className="create-group-form">
                <div className="field">
                    <label htmlFor="group-name">Group Name</label>
                    <input
                        id="group-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Trip to Goa"
                    />
                </div>

                <div className="field">
                    <h2>Select Members</h2>
                    {friends.length === 0 ? (
                        <p className="muted">
                            You have no friends yet. <Link to="/friends">Add friends</Link> to create a group.
                        </p>
                    ) : (
                        <div className="member-list">
                            {friends.map(friend => (
                                <label key={friend.user_id} className="member-item">
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

                <div className="form-actions">
                    <button type="submit" className="link-button success">
                        Create Group
                    </button>
                    <button type="button" onClick={() => navigate('/groups')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateGroup;
