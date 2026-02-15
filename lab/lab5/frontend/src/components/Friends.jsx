import React, { useEffect, useState } from 'react';

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
            <div className="friends-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <h1>Friends</h1>
                
                {/* Search Section */}
                <div className="search-section" style={{ marginBottom: '30px' }}>
                    <h2>Search Users</h2>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                flex: 1, 
                                padding: '10px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px' 
                            }}
                        />
                        <button 
                            type="submit"
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Search
                        </button>
                    </form>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h3>Search Results:</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {searchResults.map(user => (
                                    <li 
                                        key={user.user_id} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            padding: '10px',
                                            border: '1px solid #eee',
                                            marginBottom: '5px',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <span>{user.username}</span>
                                        <button
                                            onClick={() => addFriend(user.user_id)}
                                            style={{
                                                padding: '5px 15px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Add Friend
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Friends List Section */}
                <div className="friends-list-section">
                    <h2>Your Friends</h2>
                    {friends.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                            No friends yet. Search and add friends above!
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {friends.map(friend => (
                                <li 
                                    key={friend.id}
                                    style={{
                                        padding: '15px',
                                        border: '1px solid #ddd',
                                        marginBottom: '10px',
                                        borderRadius: '4px'                        
                                    }}
                                >
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
