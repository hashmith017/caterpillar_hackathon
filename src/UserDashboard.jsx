import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fetchEquipmentData } from './dataService';
import { addEfficiencyScores, detectAnomalies, calculateOperatorScores } from './mlService';

const UserDashboard = () => {
    const [currentRentals, setCurrentRentals] = useState([]);
    const [historyRentals, setHistoryRentals] = useState([]);
    const [overdueCount, setOverdueCount] = useState(0);
    const [anomalies, setAnomalies] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [showCurrentRentals, setShowCurrentRentals] = useState(true);
    const [operatorScore, setOperatorScore] = useState(null);
    const currentUserId = localStorage.getItem('dashboardUsername') || '';
    const chartRef = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            const allData = await fetchEquipmentData();
            const dataWithScores = addEfficiencyScores(allData);
            const filteredData = dataWithScores.filter(item => item['Operator ID'] === currentUserId);

            const current = filteredData.filter(item => !item['Actual Check-In Date']);
            const history = filteredData.filter(item => item['Actual Check-In Date']);

            setCurrentRentals(current);
            setHistoryRentals(history);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const overdue = current.filter(item => {
                if (!item['Planned Check-In Date']) return false;
                const plannedCheckInDate = new Date(item['Planned Check-In Date']);
                return plannedCheckInDate < today;
            });
            setOverdueCount(overdue.length);

            const allOperatorScores = calculateOperatorScores(dataWithScores);
            const userScore = allOperatorScores.find(score => score['Operator ID'] === currentUserId);
            if (userScore) {
                setOperatorScore(userScore['Operator Score']);
            }

            setAnomalies(detectAnomalies(current));
            showNotificationBanner(current);
        };
        loadData();
    }, [currentUserId]);

    useEffect(() => {
        renderCharts(showCurrentRentals ? currentRentals : historyRentals);
    }, [showCurrentRentals, currentRentals, historyRentals]);

    const showNotificationBanner = (data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingReturns = data.filter(item => {
            if (!item['Planned Check-In Date']) return false;
            const checkInDate = new Date(item['Planned Check-In Date']);
            checkInDate.setHours(0, 0, 0, 0);
            const daysUntilReturn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilReturn >= 0 && daysUntilReturn <= 5;
        });

        if (upcomingReturns.length > 0) {
            const message = upcomingReturns.map(item => `Equipment ID: ${item['Equipment ID']} (Type: ${item['Type']}, Returns: ${item['Planned Check-In Date']})`).join(', ');
            setNotification({ show: true, message: `Heads up! The following machines have return dates approaching: ${message}.` });
        } else {
            setNotification({ show: false, message: '' });
        }
    };

    const renderCharts = (data) => {
        const usageBySite = data.reduce((acc, item) => {
            acc[item['Site ID']] = (acc[item['Site ID']] || 0) + 1;
            return acc;
        }, {});
        const siteLabels = Object.keys(usageBySite);
        const siteValues = Object.values(usageBySite);

        if (chartRef.current) {
            if (chartRef.current.chart) {
                chartRef.current.chart.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            chartRef.current.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: siteLabels,
                    datasets: [{
                        label: 'Machines Rented',
                        data: siteValues,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    const label = tooltipItem.label || '';
                                    const value = tooltipItem.raw;
                                    const total = tooltipItem.dataset.data.reduce((sum, current) => sum + current, 0);
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    const renderTableRows = (data, isCurrent) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.map((item, index) => {
            const plannedCheckInDate = new Date(item['Planned Check-In Date']);
            const actualCheckInDate = item['Actual Check-In Date'] ? new Date(item['Actual Check-In Date']) : null;
            let rowStyle = { backgroundColor: 'white' };
            let status = 'On Rent';
            let operatingDays = item['Operating Days'];
            
            if (isCurrent) {
                const daysUntilReturn = Math.ceil((plannedCheckInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilReturn < 0) {
                    rowStyle = { backgroundColor: '#fff5f5' };
                    status = 'Overdue';
                } else if (daysUntilReturn <= 3) {
                    rowStyle = { backgroundColor: '#fffdf0' };
                    status = 'Due Soon';
                }
            } else {
                if (actualCheckInDate > plannedCheckInDate) {
                    rowStyle = { backgroundColor: '#fff5f5' };
                }
            }
            
            return (
                <tr key={index} style={rowStyle}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#1a202c', borderBottom: '1px solid #e2e8f0', borderRadius: '0.5rem 0 0 0.5rem' }}>{item['Equipment ID']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>{item['Type']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>{item['Site ID']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>{item['Check-Out Date']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>{item['Planned Check-In Date']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>{isCurrent ? status : (item['Actual Check-In Date'] || '-')}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0' }}>{operatingDays}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0', borderRadius: '0 0.5rem 0.5rem 0' }}>{item['Efficiency']}</td>
                </tr>
            );
        });
    };

    const renderAnomaliesTable = () => (
      anomalies.length > 0 && (
        <div style={{ ...styles.tableContainer, marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#e53e3e', marginBottom: '1rem' }}>Anomalies Detected 🚨</h2>
          <div style={styles.tableWrapper}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Equipment ID</th>
                  <th style={styles.th}>Anomaly Type</th>
                  <th style={styles.th}>Anomaly Equipment Type</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, index) => (
                  <tr key={index} style={{ backgroundColor: '#fff5f5' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#1a202c' }}>{anomaly['Equipment ID']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#e53e3e' }}>{anomaly['Type']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#1a202c' }}>{anomaly['Equipment Type']}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4a5568' }}>{anomaly['Details']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    );

    const upcomingReturnsCount = currentRentals.filter(item => {
        const today = new Date();
        const plannedCheckInDate = new Date(item['Planned Check-In Date']);
        const daysUntilReturn = Math.ceil((plannedCheckInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilReturn >= 0 && daysUntilReturn <= 5;
    }).length;

    const totalRentedHours = currentRentals.reduce((sum, item) => sum + (parseFloat(item['Engine Hours/Day'] || 0) * parseFloat(item['Operating Days'] || 0)), 0).toFixed(2);
    const totalDowntime = currentRentals.reduce((sum, item) => sum + (parseFloat(item['Idle Hours/Day'] || 0) * parseFloat(item['Operating Days'] || 0)), 0).toFixed(2);
    const averageEfficiency = currentRentals.reduce((sum, item) => sum + parseFloat(item['Efficiency'] || 0), 0) / currentRentals.length;

    const styles = {
        body: { fontFamily: 'Inter, sans-serif' },
        container: { maxWidth: '1024px', margin: 'auto' },
        h1: { fontSize: '2.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', color: '#1a202c' },
        dashboardContent: { padding: '1rem', maxWidth: '1024px', margin: 'auto' },
        h2: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', textAlign: 'center' },
        cardsContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
        card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        cardText: { color: '#a0aec0', fontSize: '1.125rem' },
        cardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#2b6cb0', marginTop: '0.25rem' },
        yellowCardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#d69e2e', marginTop: '0.25rem' },
        redCardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#e53e3e', marginTop: '0.25rem' },
        greenCardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#38a169', marginTop: '0.25rem' },
        tableContainer: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' },
        tableWrapper: { overflowX: 'auto', borderRadius: '0.5rem', border: '1px solid #e2e8f0' },
        tableHeader: { backgroundColor: '#f7fafc' },
        th: { padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#718096', textTransform: 'uppercase' },
        notificationBanner: { backgroundColor: '#fffbeb', borderLeft: '4px solid #f6e05e', color: '#b7791f', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' },
        chartCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
        // New style for the container holding the graph and score card
        chartAndScoreContainer: {
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr', // 60% for chart, 40% for score
            gap: '1.5rem',
            marginTop: '1.5rem',
            marginBottom: '2rem'
        }
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={styles.h1}>Smart Rental Tracking Dashboard 📊</h1>
                {notification.show && (
                    <div style={styles.notificationBanner}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.75rem', fontSize: '1.5rem' }}></i>
                            <div>
                                <p style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Upcoming Returns!</p>
                                <p style={{ fontSize: '0.875rem' }}>{notification.message}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div style={styles.dashboardContent}>
                    <h2 style={styles.h2}>My Rentals 👷</h2>
                    <div style={styles.cardsContainer}>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>My Current Rentals</p>
                                <p style={styles.cardValue}>{currentRentals.length}</p>
                            </div>
                            <i className="fas fa-toolbox" style={{ color: '#90cdf4', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Upcoming Returns (5 Days)</p>
                                <p style={styles.yellowCardValue}>{upcomingReturnsCount}</p>
                            </div>
                            <i className="fas fa-calendar-alt" style={{ color: '#f6e05e', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Overdue</p>
                                <p style={styles.redCardValue}>{overdueCount}</p>
                            </div>
                            <i className="fas fa-exclamation-circle" style={{ color: '#e53e3e', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Total Rented Hours</p>
                                <p style={styles.greenCardValue}>{totalRentedHours}</p>
                            </div>
                            <i className="fas fa-clock" style={{ color: '#38a169', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Total Downtime</p>
                                <p style={styles.redCardValue}>{totalDowntime}</p>
                            </div>
                            <i className="fas fa-pause-circle" style={{ color: '#e53e3e', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Average Efficiency</p>
                                <p style={styles.greenCardValue}>{averageEfficiency.toFixed(2)}%</p>
                            </div>
                            <i className="fas fa-percent" style={{ color: '#38a169', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                    </div>
                    {renderAnomaliesTable()}
                    <div style={styles.tableContainer}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568' }}>{showCurrentRentals ? 'Current Rental Details' : 'Rental History Details'}</h3>
                            <button
                                onClick={() => setShowCurrentRentals(!showCurrentRentals)}
                                style={{
                                    backgroundColor: '#4299e1', color: 'white', fontWeight: 'bold',
                                    padding: '0.5rem 1rem', borderRadius: '0.25rem', outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {showCurrentRentals ? 'Show Rental History' : 'Show Current Rentals'}
                            </button>
                        </div>
                        <div style={styles.tableWrapper}>
                            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                                <thead style={styles.tableHeader}>
                                    <tr>
                                        <th style={styles.th}>Equipment ID</th>
                                        <th style={styles.th}>Type</th>
                                        <th style={styles.th}>Site ID</th>
                                        <th style={styles.th}>Check-Out Date</th>
                                        <th style={styles.th}>Planned Check-In Date</th>
                                        <th style={styles.th}>{showCurrentRentals ? 'Status' : 'Actual Check-In Date'}</th>
                                        <th style={styles.th}>Operating Days</th>
                                        <th style={styles.th}>Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {showCurrentRentals ? renderTableRows(currentRentals, true) : renderTableRows(historyRentals, false)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div style={styles.chartAndScoreContainer}>
                        <div style={styles.chartCard}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568', marginBottom: '1rem' }}>Usage Per Site 📊</h2>
                            <div style={{ position: 'relative', height: '16rem' }}>
                                <canvas ref={chartRef}></canvas>
                            </div>
                        </div>
                         <div style={{...styles.chartCard, display: 'flex', flexDirection: 'column'}}>
                            <div style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                                <p style={{ color: '#a0aec0', fontSize: '1.125rem' }}>My Operator Score</p>
                                <p style={{ ...styles.cardValue, color: '#38a169', marginTop: '0.25rem' }}>
                                    {operatorScore !== null ? `${operatorScore}` : 'N/A'}
                                </p>
                            </div>
                            <i className="fas fa-user-circle" style={{ color: '#38a169', fontSize: '3rem', opacity: '0.3', alignSelf: 'center', marginLeft: 'auto', marginRight: '1rem' }}></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;