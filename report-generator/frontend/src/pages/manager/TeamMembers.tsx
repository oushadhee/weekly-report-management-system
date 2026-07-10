import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import Layout from '../../components/Layout';

const TeamMembers: React.FC = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/members`);
            setMembers(response.data.members);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h1>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {members.map((member: any) => (
                            <div key={member._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600">
                                        {member.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {member.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeamMembers;