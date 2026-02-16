import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Friends() {

    // TODO: Use useState to manage:
    // 1. Friend list
    // 2. Search query
    // 3. Search results
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // TODO: Implement fetchFriends function
    // - Call GET /friends API
    // - Include credentials
    // - Update friends state
    const fetchFriends = () => {
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
        });
    };

    // TODO: Fetch friend list on component mount
    useEffect(() => {
        // Call fetchFriends here
        fetchFriends();
    }, []);

    // TODO: Implement handleSearch function
    // - Prevent default form submission
    // - Call GET /users/search?q=<query>
    // - Update searchResults state
    const handleSearch = async (e) => {
        // Implement logic here
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/users/search?q=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to search users');
            }

            const data = await response.json();
            setSearchResults(data || []);            
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        }
    };

    // TODO: Implement addFriend function
    // - Call POST /friends/add API with friend_id
    // - Clear search input and results on success
    // - Refresh friend list
    const addFriend = async (friendId) => {
        try {
            const response = await fetch('http://localhost:4000/friends/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ friend_id: friendId })
            });

            if (!response.ok) {
                throw new Error('Failed to add friend');
            }

            setSearchQuery('');
            setSearchResults([]);
            fetchFriends();
        } catch (error) {
            console.error('Error adding friend:', error);
        }
        // Implement logic here

    };

    // TODO: (Optional) Implement settle-up logic per friend
    // - This can redirect to dashboard or open a modal
    // const handleSettle = async (friendId, amount, currency) => {
    //     // Optional implementation
        
    // };

    return (
        <>
            {/*
              TODO: Implement JSX for Friends page
              - Section to display current friends
              - Section to search users by username
              - Add Friend button for search results
              - Show empty-state message when no friends exist
            */}
            <div className="friends-container">
                <div className="friends-top">
                    <Link to="/" className="link-button">Back to Dashboard</Link>
                </div>

                <div className="friends-header">
                    <h1>Friends</h1>
                    <p className="muted">Search and add people to split expenses.</p>
                </div>
                
                {/* Search Section */}
                <div className="search-section">
                    <h2>Search Users</h2>
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="link-button primary">
                            Search
                        </button>
                    </form>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h3>Search Results:</h3>
                            <ul className="result-list">
                                {searchResults.map(user => {
                                    const isFriend = friends.some(friend => friend.user_id === user.user_id);
                                    return (
                                        <li key={user.user_id} className="result-item">
                                            <span>{user.username}</span>
                                            {isFriend ? (
                                                <span className="tag">Already Added</span>
                                            ) : (
                                                <button
                                                    onClick={() => addFriend(user.user_id)}
                                                    className="link-button success"
                                                >
                                                    Add Friend
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                                    {/* Friends List Section */}
                <div className="friends-list-section">
                    <h2>Your Friends</h2>
                    {friends.length === 0 ? (
                        <p className="muted">
                            No friends yet. Search and add friends above!
                        </p>
                    ) : (
                        <ul className="friends-list">
                            {friends.map(friend => (
                                <li key={friend.user_id} className="friend-item">
                                    <strong>{friend.username}</strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

export default Friends;
