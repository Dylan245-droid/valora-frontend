// import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import type { PurchaseRequest } from '../../types/request';
import { format, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsChartsProps {
    requests: PurchaseRequest[];
}

const COLORS = {
    PENDING: '#f59e0b',   // Amber 500
    PROCESSING: '#3b82f6', // Blue 500
    APPROVED: '#10b981',   // Emerald 500
    REJECTED: '#ef4444',   // Rose 500
    DRAFT: '#9ca3af',      // Gray 400
};

export function StatusDistributionChart({ requests }: AnalyticsChartsProps) {
    const data = [
        { name: 'En Attente', value: requests.filter(r => r.status === 'PENDING').length, color: COLORS.PENDING },
        { name: 'En Traitement', value: requests.filter(r => r.status === 'PROCESSING').length, color: COLORS.PROCESSING },
        { name: 'Approuvées', value: requests.filter(r => r.status === 'APPROVED').length, color: COLORS.APPROVED },
        { name: 'Rejetées', value: requests.filter(r => r.status === 'REJECTED').length, color: COLORS.REJECTED },
    ].filter(d => d.value > 0);

    if (data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Aucune donnée disponible</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DailyActivityChart({ requests }: AnalyticsChartsProps) {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i);
        return {
            date: d,
            label: format(d, 'dd/MM', { locale: fr }),
            fullLabel: format(d, 'eeee dd MMMM', { locale: fr }),
            count: 0
        };
    });

    requests.forEach(req => {
        const reqDate = new Date(req.createdAt);
        const dayStat = last7Days.find(d => isSameDay(d.date, reqDate));
        if (dayStat) {
            dayStat.count++;
        }
    });

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                    <XAxis 
                        dataKey="label" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis 
                        allowDecimals={false} 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
