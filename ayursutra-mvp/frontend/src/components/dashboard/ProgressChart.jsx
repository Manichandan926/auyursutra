import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const ProgressChart = ({ data, title, color = '#009688' }) => {
    const chartData = useMemo(() => ({
        labels: data.map(d => d.date.split('-').slice(1).join('/')),
        datasets: [
            {
                label: 'Progress (%)',
                data: data.map(d => d.progress),
                borderColor: color,
                backgroundColor: `${color}33`,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: color,
            },
        ],
    }), [data, color]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !!title,
                text: title,
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: '#f0f0f0'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return <Line options={options} data={chartData} />;
};
