import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fetchEquipmentData } from './dataService';
import { addEfficiencyScores, calculateOperatorScores, demandForecasting, detectAnomalies } from './mlService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A custom marker icon to show the number of machines
const createCustomIcon = (count) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#0078A8;color:white;font-weight:bold;border-radius:50%;width:30px;height:30px;display:flex;justify-content:center;align-items:center;">${count}</div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
};

const mapboxToken = 'YOUR_MAPBOX_TOKEN_HERE';
mapboxgl.accessToken = mapboxToken;

// Random locations in South India for demonstration purposes
const siteLocations = {
    'S001': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    'S002': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
    'S003': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore' },
    'S004': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli' },
    'S005': { lat: 11.6643, lng: 78.1488, name: 'Salem' },
    'S006': { lat: 8.7642, lng: 78.1348, name: 'Thoothukudi' },
    'S007': { lat: 11.9416, lng: 79.8083, name: 'Puducherry' },
    'S008': { lat: 10.0886, lng: 78.1257, name: 'Madurai' },
    'S009': { lat: 15.3946, lng: 75.1221, name: 'Hubli' },
    'S010': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' }
};

const ProviderDashboard = () => {
    const [allEquipmentData, setAllEquipmentData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [operatorScores, setOperatorScores] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showCurrentRentals, setShowCurrentRentals] = useState(true);
    const [showEquipmentView, setShowEquipmentView] = useState(true);
    const [monthlyEfficiencyData, setMonthlyEfficiencyData] = useState({});
    const [forecastData, setForecastData] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const chartRef1 = useRef(null);
    const chartRef2 = useRef(null);
    const chartRef3 = useRef(null);

    // Initial data fetch and ML calculations
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchEquipmentData();
            const dataWithScores = addEfficiencyScores(data);
            setAllEquipmentData(dataWithScores);
            setFilteredData(dataWithScores);
            
            const scores = calculateOperatorScores(data);
            setOperatorScores(scores);
            
            // Calculate monthly efficiency
            const monthlyData = calculateMonthlyEfficiency(dataWithScores);
            setMonthlyEfficiencyData(monthlyData);

            // Run forecasting and anomaly detection
            setForecastData(demandForecasting(data));
            setAnomalies(detectAnomalies(data));
        };
        loadData();
    }, []);

    const calculateMonthlyEfficiency = (data) => {
      const monthlyData = {};
      data.forEach(item => {
        const date = new Date(item['Check-Out Date']);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = { totalEfficiency: 0, count: 0 };
        }
        monthlyData[month].totalEfficiency += parseFloat(item['Efficiency'] || 0);
        monthlyData[month].count++;
      });
      const result = {};
      Object.keys(monthlyData).sort((a,b) => new Date(a) - new Date(b)).forEach(month => {
        result[month] = (monthlyData[month].totalEfficiency / monthlyData[month].count).toFixed(2);
      });
      return result;
    };

    // Filter and sort data whenever dependencies change
    useEffect(() => {
        let processedData = [...allEquipmentData];
        if (searchQuery) {
            processedData = processedData.filter(item =>
                item['Equipment ID']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item['Type']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item['Site ID']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item['Operator ID']?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedType) {
            processedData = processedData.filter(item => item['Type'] === selectedType);
        }
        if (selectedSiteId) {
            processedData = processedData.filter(item => item['Site ID'] === selectedSiteId);
        }
        setFilteredData(processedData);
        renderCharts(processedData);
    }, [allEquipmentData, searchQuery, selectedType, selectedSiteId]);

    useEffect(() => {
      if (sortColumn) {
        if (showEquipmentView) {
          const sortedEquipment = [...filteredData].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            if (sortColumn.includes('Date') || sortColumn === 'Efficiency') {
              valA = new Date(valA);
              valB = new Date(valB);
            } else if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
              valA = parseFloat(valA);
              valB = parseFloat(valB);
            } else {
              valA = String(valA || '').toLowerCase();
              valB = String(valB || '').toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
          setFilteredData(sortedEquipment);
        } else {
          const sortedOperators = [...operatorScores].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
              valA = parseFloat(valA);
              valB = parseFloat(valB);
            } else {
              valA = String(valA || '').toLowerCase();
              valB = String(valB || '').toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
          setOperatorScores(sortedOperators);
        }
      }
    }, [sortColumn, sortDirection]);

    const renderCharts = (data) => {
        const usageByType = data.reduce((acc, item) => {
            acc[item['Type']] = (acc[item['Type']] || 0) + 1;
            return acc;
        }, {});
        const usageLabels = Object.keys(usageByType);
        const usageValues = Object.values(usageByType);

        const idleCategories = { 'Low (0-2h)': 0, 'Medium (2-4h)': 0, 'High (>4h)': 0 };
        data.forEach(item => {
            const idle = parseFloat(item['Idle Hours/Day'] || 0);
            if (idle <= 2) { idleCategories['Low (0-2h)']++; }
            else if (idle <= 4) { idleCategories['Medium (2-4h)']++; }
            else { idleCategories['High (>4h)']++; }
        });
        const idleLabels = Object.keys(idleCategories);
        const idleValues = Object.values(idleCategories);

        // Chart 1: Usage by Type (Bar Chart)
        if (chartRef1.current) {
            if (chartRef1.current.chart) {
                chartRef1.current.chart.destroy();
            }
            const ctx1 = chartRef1.current.getContext('2d');
            chartRef1.current.chart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: usageLabels,
                    datasets: [{
                        label: 'Number of Machines',
                        data: usageValues,
                        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
                        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                        borderWidth: 1,
                    }],
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: {} } },
            });
        }

        // Chart 2: Idle Hours Distribution (Pie Chart)
        if (chartRef2.current) {
            if (chartRef2.current.chart) {
                chartRef2.current.chart.destroy();
            }
            const ctx2 = chartRef2.current.getContext('2d');
            chartRef2.current.chart = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: idleLabels,
                    datasets: [{
                        data: idleValues,
                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                        borderWidth: 1,
                    }],
                },
                options: { responsive: true, maintainAspectRatio: false },
            });
        }

        // Chart 3: Monthly Efficiency (Line Chart)
        if (chartRef3.current) {
            if (chartRef3.current.chart) {
                chartRef3.current.chart.destroy();
            }
            const ctx3 = chartRef3.current.getContext('2d');
            chartRef3.current.chart = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: Object.keys(monthlyEfficiencyData),
                    datasets: [{
                        label: 'Average Efficiency (%)',
                        data: Object.values(monthlyEfficiencyData),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Efficiency (%)' }
                        },
                        x: {
                            title: { display: true, text: 'Month' }
                        }
                    }
                }
            });
        }
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (column) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
        }
        return 'fa-sort';
    };

    const currentRentals = filteredData.filter(item => !item['Actual Check-In Date']);
    const overdueRentals = currentRentals.filter(item => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const plannedCheckInDate = new Date(item['Planned Check-In Date']);
        return plannedCheckInDate < today;
    }).length;
    
    const availableEquipment = {};
    const equipmentTypes = [...new Set(allEquipmentData.map(item => item['Type']))];
    equipmentTypes.forEach(type => {
        const rentedOfType = allEquipmentData.filter(item => item['Type'] === type && !item['Actual Check-In Date']).length;
        availableEquipment[type] = 100 - rentedOfType;
    });

    const styles = {
        body: { fontFamily: 'Inter, sans-serif' },
        container: { maxWidth: '1024px', margin: 'auto' },
        h1: { fontSize: '2.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', color: '#1a202c' },
        dashboardContent: { padding: '1rem', maxWidth: '1024px', margin: 'auto' },
        cardsContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
        card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        cardText: { color: '#a0aec0', fontSize: '1.125rem' },
        cardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#2b6cb0', marginTop: '0.25rem' },
        redCardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#e53e3e', marginTop: '0.25rem' },
        greenCardValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#38a169', marginTop: '0.25rem' },
        filtersContainer: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' },
        filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
        input: { padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '0.5rem', transition: '0.2s' },
        select: { padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '0.5rem', transition: '0.2s' },
        tableContainer: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' },
        tableWrapper: { overflowX: 'auto', borderRadius: '0.5rem', border: '1px solid #e2e8f0' },
        tableHeader: { backgroundColor: '#f7fafc' },
        th: { padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#718096', textTransform: 'uppercase' },
        chartsContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
        chartCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    };

    const renderEquipmentTable = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568' }}>{showCurrentRentals ? 'Current Rentals 🏗' : 'Rental History 📚'}</h2>
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
                            {['Equipment ID', 'Type', 'Site ID', 'Check-Out Date', 'Planned Check-In Date', showCurrentRentals ? 'Status' : 'Actual Check-In Date', 'Engine Hours/Day', 'Idle Hours/Day', 'Operating Days', 'Fuel Usage/Day (Liters)', 'Efficiency', 'Operator ID'].map(header => (
                                <th
                                    key={header}
                                    onClick={() => handleSort(header)}
                                    style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#718096', textTransform: 'uppercase', cursor: 'pointer' }}
                                >
                                    {header} <i className={`fas ${getSortIcon(header)}`} style={{ marginLeft: '0.25rem' }}></i>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(showCurrentRentals ? filteredData.filter(item => !item['Actual Check-In Date']) : filteredData.filter(item => item['Actual Check-In Date'])).map((item, index) => {
                            const plannedCheckInDate = new Date(item['Planned Check-In Date']);
                            const actualCheckInDate = item['Actual Check-In Date'] ? new Date(item['Actual Check-In Date']) : null;
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            let rowStyle = { backgroundColor: 'white' };
                            let status = 'On Rent';
                            
                            if (showCurrentRentals) {
                                const daysUntilReturn = Math.ceil((plannedCheckInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                if (daysUntilReturn < 0) {
                                    rowStyle = { backgroundColor: '#fff5f5' };
                                    status = 'Overdue';
                                } else if (daysUntilReturn <= 3) {
                                    rowStyle = { backgroundColor: '#fffdf0' };
                                    status = 'Due Soon';
                                }
                            } else {
                                if (actualCheckInDate && actualCheckInDate > plannedCheckInDate) {
                                    rowStyle = { backgroundColor: '#fff5f5' };
                                }
                            }

                            const idleHoursStyle = parseFloat(item['Idle Hours/Day']) > 4 ? { backgroundColor: '#fed7d7', fontWeight: '600', color: '#9b2c2c' } : {};
                            
                            return (
                                <tr key={index} style={rowStyle}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#1a202c' }}>{item['Equipment ID']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Type']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Site ID']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Check-Out Date']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Planned Check-In Date']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>
                                        {showCurrentRentals ? status : (item['Actual Check-In Date'] || '-')}
                                    </td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Engine Hours/Day']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568', ...idleHoursStyle }}>{item['Idle Hours/Day']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Operating Days']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Fuel Usage/Day (Liters)']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Efficiency']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Operator ID']}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderOperatorScoresTable = () => (
        <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568' }}>Operator Performance 🧑‍🔧</h2>
            <div style={styles.tableWrapper}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            {['Operator ID', 'Number of Rentals', 'Average Engine Hours', 'Average Idle Hours', 'Overdue Rentals', 'Operator Score'].map(header => (
                                <th
                                    key={header}
                                    onClick={() => handleSort(header)}
                                    style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#718096', textTransform: 'uppercase', cursor: 'pointer' }}
                                >
                                    {header} <i className={`fas ${getSortIcon(header)}`} style={{ marginLeft: '0.25rem' }}></i>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {operatorScores.map((item, index) => {
                            const score = parseFloat(item['Operator Score']);
                            let scoreColor = '#e53e3e'; // Red
                            if (score > 80) {
                                scoreColor = '#38a169'; // Green
                            } else if (score > 50) {
                                scoreColor = '#d69e2e'; // Orange
                            }
                            return (
                                <tr key={index} style={{ backgroundColor: 'white' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#1a202c' }}>{item['Operator ID']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Number of Rentals']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Average Engine Hours']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Average Idle Hours']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{item['Overdue Rentals']}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: 'bold', color: scoreColor }}>
                                        {item['Operator Score']}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );

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
                  <th style={styles.th}>Operator ID</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, index) => (
                  <tr key={index} style={{ backgroundColor: '#fff5f5' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#1a202c' }}>{anomaly['Equipment ID']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#e53e3e' }}>{anomaly['Type']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#1a202c' }}>{anomaly['Equipment Type']}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#1a202c' }}>{anomaly['Operator ID']}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4a5568' }}>{anomaly['Details']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    );
    
    const renderForecastTable = () => (
      <>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568', marginBottom: '1rem' }}>Demand Forecast 🔮</h2>
        <div style={styles.tableWrapper}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Site ID</th>
                <th style={styles.th}>Most Demanded Type</th>
                <th style={styles.th}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((forecast, index) => (
                <tr key={index} style={{ backgroundColor: 'white' }}>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#1a202c' }}>{forecast['Site ID']}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{forecast['Most Demanded Type']}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#4a5568' }}>{forecast['Confidence']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );

    const mapMarkers = Object.values(allEquipmentData.reduce((acc, item) => {
      const siteId = item['Site ID'];
      if (siteId && siteLocations[siteId]) {
        if (!acc[siteId]) {
          acc[siteId] = { ...siteLocations[siteId], count: 0 };
        }
        acc[siteId].count++;
      }
      return acc;
    }, {}));


    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={styles.h1}>Smart Rental Tracking Dashboard 📊</h1>
                <div style={styles.dashboardContent}>
                    <div style={styles.cardsContainer}>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Total Rented Machines</p>
                                <p style={styles.cardValue}>{currentRentals.length}</p>
                            </div>
                            <i className="fas fa-truck-moving" style={{ color: '#90cdf4', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Overdue Rentals</p>
                                <p style={styles.redCardValue}>{overdueRentals}</p>
                            </div>
                            <i className="fas fa-exclamation-triangle" style={{ color: '#e53e3e', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                        <div style={styles.card}>
                            <div>
                                <p style={styles.cardText}>Available Equipment</p>
                                <ul style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    {Object.entries(availableEquipment).map(([type, count]) => (
                                        <li key={type}>{type}: {count}</li>
                                    ))}
                                </ul>
                            </div>
                            <i className="fas fa-warehouse" style={{ color: '#4299e1', fontSize: '3rem', opacity: '0.3' }}></i>
                        </div>
                    </div>
                    <div style={styles.filtersContainer}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568', marginBottom: '1rem' }}>Filter & Search 🔎</h2>
                        <div style={styles.filtersGrid}>
                            <input
                                type="text"
                                placeholder="Search by Equipment ID, Type, Site ID, or Operator ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.input}
                            />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                style={styles.select}
                            >
                                <option value="">All Types</option>
                                {[...new Set(allEquipmentData.map(item => item['Type']))].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={selectedSiteId}
                                onChange={(e) => setSelectedSiteId(e.target.value)}
                                style={styles.select}
                            >
                                <option value="">All Site IDs</option>
                                {[...new Set(allEquipmentData.map(item => item['Site ID']))].map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={styles.tableContainer}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568' }}>{showEquipmentView ? 'Equipment Details' : 'Operator Performance'}</h2>
                            <button
                                onClick={() => setShowEquipmentView(!showEquipmentView)}
                                style={{
                                    backgroundColor: '#2b6cb0', color: 'white', fontWeight: 'bold',
                                    padding: '0.5rem 1rem', borderRadius: '0.25rem', outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {showEquipmentView ? 'Show Operator Scores' : 'Show Equipment View'}
                            </button>
                        </div>
                        {showEquipmentView ? renderEquipmentTable() : renderOperatorScoresTable()}
                    </div>
                    <div style={styles.chartsContainer}>
                        <div style={styles.chartCard}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568', marginBottom: '1rem' }}>Monthly Efficiency Trend 📈</h2>
                            <div style={{ position: 'relative', height: '16rem' }}>
                                <canvas ref={chartRef3}></canvas>
                            </div>
                        </div>
                        <div style={styles.chartCard}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568', marginBottom: '1rem' }}>Idle Hours Distribution 📉</h2>
                            <div style={{ position: 'relative', height: '16rem' }}>
                                <canvas ref={chartRef2}></canvas>
                            </div>
                        </div>
                        <div style={styles.chartCard}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4a5568', marginBottom: '1rem' }}>Equipment Locations 🗺️</h2>
                            <div style={{ height: '16rem', width: '100%' }}>
                                <MapContainer center={[12.9716, 77.5946]} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
                                    <TileLayer
                                        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
                                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    {mapMarkers.map((site) => (
                                        <Marker key={site.siteId} position={[site.lat, site.lng]} icon={createCustomIcon(site.count)}>
                                            <Popup>
                                                <strong>{site.name}</strong><br />
                                                Site ID: {site.siteId}<br />
                                                Machines: {site.count}
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{...styles.chartCard, marginTop: '1.5rem'}}>
                      {renderAnomaliesTable()}
                    </div>

                    <div style={{...styles.chartCard, marginTop: '1.5rem'}}>
                      {renderForecastTable()}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;