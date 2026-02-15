import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Groups() {

    // TODO: Use useState to manage group list
    const [groups, setGroups] = useState([]);

    const navigate = useNavigate();

    // TODO: Implement fetchData function
    // - Call GET /groups API
    // - Include credentials
    // - Update groups state
    // - Handle error cases
    const fetchData = () => {
        fetch('http://localhost:4000/groups', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            return response.json();
        })
        .then(data => {
            setGroups(data || []);
        })
        .catch(error => {
            console.error('Error fetching groups:', error);
            setGroups([]);
        });
    };

    // TODO: Fetch group list on component mount
    useEffect(() => {
        // Call fetchData here
        fetchData();
    }, []);

    return (
        <div className="groups-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Groups</h1>
                <Link
                    to="/groups/create"
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        textDecoration: 'none'
                    }}
                >
                    Create New Group
                </Link>
            </div>

            {groups.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No groups yet. Create one to get started.</p>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {groups.map(group => (
                        <div
                            key={group.group_id}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/group/${group.group_id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/group/${group.group_id}`);
                                }
                            }}
                            style={{
                                padding: '14px 16px',
                                border: '1px solid #eee',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: '#fff'
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>{group.name}</div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Group ID: {group.group_id}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Groups;
