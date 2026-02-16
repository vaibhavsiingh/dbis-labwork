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
        <div className="groups-container">
            <div className="groups-top">
                <Link to="/" className="link-button">Back to Dashboard</Link>
                <div className="groups-actions">
                    <Link
                        to="/groups/create"
                        className="link-button primary"
                    >
                        Create New Group
                    </Link>
                </div>
            </div>

            <div className="groups-header">
                <h1>Groups</h1>
                <p className="muted">Pick a group to view expenses and balances.</p>
            </div>

            {groups.length === 0 ? (
                <p className="muted">No groups yet. Create one to get started.</p>
            ) : (
                <div className="groups-list">
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
                            className="group-card"
                        >
                            <div className="group-name">{group.name}</div>
                            <div className="group-meta">Group ID: {group.group_id}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Groups;
