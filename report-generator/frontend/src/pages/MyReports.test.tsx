import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MyReports from './MyReports';
import { useAuth } from '../context/AuthContext';

jest.mock('axios');
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

jest.mock('../components/Layout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('MyReports', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            user: {
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'team_member',
            },
        });

        (axios.get as jest.Mock).mockResolvedValue({
            data: {
                reports: [
                    {
                        _id: 'report-1',
                        weekStart: '2026-07-06T00:00:00.000Z',
                        weekEnd: '2026-07-12T00:00:00.000Z',
                        project: { _id: 'project-1', name: 'Alpha', color: '#549E7E' },
                        tasksCompleted: ['Completed task'],
                        tasksPlanned: ['Planned task'],
                        blockers: [],
                        hoursWorked: 8,
                        notes: 'Note',
                        status: 'late',
                        createdAt: '2026-07-01T00:00:00.000Z',
                    },
                ],
            },
        });
    });

    it('shows edit and delete actions for late reports', async () => {
        render(
            <MemoryRouter>
                <MyReports />
            </MemoryRouter>
        );

        expect(await screen.findByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });
});
