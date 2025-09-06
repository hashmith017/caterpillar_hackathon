const mlModel = {
  
  weights: {
    engineHours: 0.5,
    idleHours: -0.8,
    fuelUsage: -0.2,
    bias: 50, 
  },


  predict: (data) => {
    const score = (
      mlModel.weights.engineHours * parseFloat(data['Engine Hours/Day'] || 0) +
      mlModel.weights.idleHours * parseFloat(data['Idle Hours/Day'] || 0) +
      mlModel.weights.fuelUsage * parseFloat(data['Fuel Usage/Day (Liters)'] || 0) +
      mlModel.weights.bias
    );

    // Clamp the score between 0 and 100
    return Math.max(0, Math.min(100, score)).toFixed(2);
  },
};

export const addEfficiencyScores = (equipmentData) => {
  return equipmentData.map(item => ({
    ...item,
    'Efficiency': mlModel.predict(item),
  }));
};

export const calculateOperatorScores = (equipmentData) => {
  const operatorData = {};
  const today = new Date();

  equipmentData.forEach(item => {
    const operatorId = item['Operator ID'];
    if (operatorId && operatorId !== 'NULL') {
      if (!operatorData[operatorId]) {
        operatorData[operatorId] = {
          rentals: [],
          totalEngineHours: 0,
          totalIdleHours: 0,
          overdueCount: 0
        };
      }
      operatorData[operatorId].rentals.push(item);
      operatorData[operatorId].totalEngineHours += parseFloat(item['Engine Hours/Day'] || 0);
      operatorData[operatorId].totalIdleHours += parseFloat(item['Idle Hours/Day'] || 0);

      const plannedCheckInDate = new Date(item['Planned Check-In Date']);
      if (!item['Actual Check-In Date'] && plannedCheckInDate < today) {
        operatorData[operatorId].overdueCount++;
      }
    }
  });

  const operatorScores = Object.keys(operatorData).map(operatorId => {
    const data = operatorData[operatorId];
    const avgEngineHours = data.totalEngineHours / data.rentals.length;
    const avgIdleHours = data.totalIdleHours / data.rentals.length;
    
   
    const score = (
      (avgEngineHours * 5) - (avgIdleHours * 2) - (data.overdueCount * 10) + 50
    );

    return {
      'Operator ID': operatorId,
      'Number of Rentals': data.rentals.length,
      'Average Engine Hours': avgEngineHours.toFixed(2),
      'Average Idle Hours': avgIdleHours.toFixed(2),
      'Overdue Rentals': data.overdueCount,
      'Operator Score': Math.max(0, Math.min(100, score)).toFixed(2)
    };
  });

  return operatorScores;
};

export const demandForecasting = (equipmentData) => {
  const demandPatterns = {};
  equipmentData.forEach(item => {
    const siteId = item['Site ID'];
    const type = item['Type'];
    if (siteId && type) {
      if (!demandPatterns[siteId]) {
        demandPatterns[siteId] = {};
      }
      demandPatterns[siteId][type] = (demandPatterns[siteId][type] || 0) + 1;
    }
  });

  const forecasts = Object.keys(demandPatterns).map(siteId => {
    const types = demandPatterns[siteId];
    const mostDemandedType = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
    return {
      'Site ID': siteId,
      'Most Demanded Type': mostDemandedType,
      'Confidence': ((types[mostDemandedType] / Object.values(types).reduce((a,b)=>a+b, 0)) * 100).toFixed(2) + '%'
    };
  });

  return forecasts;
};

export const detectAnomalies = (equipmentData) => {
  const anomalies = [];
  const idleThreshold = 5;
  const fuelUsageRatioThreshold = 6;

  equipmentData.forEach(item => {
    const isRented = !item['Actual Check-In Date'];
    const hasLongIdleHours = parseFloat(item['Idle Hours/Day']) > idleThreshold;
    const isUnassigned = !item['Site ID'] || item['Site ID'] === 'NULL';
    const fuelUsage = parseFloat(item['Fuel Usage/Day (Liters)'] || 0);
    const engineHours = parseFloat(item['Engine Hours/Day'] || 0);
    const hasHighFuelUsage = engineHours > 0 && (fuelUsage / engineHours) > fuelUsageRatioThreshold;

    const operatorId = item['Operator ID'] && item['Operator ID'] !== 'NULL' ? item['Operator ID'] : 'N/A';

    if (isRented && hasLongIdleHours) {
      anomalies.push({
        'Equipment ID': item['Equipment ID'],
        'Equipment Type': item['Type'],
        'Operator ID': operatorId, 
        'Type': 'High Idle Hours',
        'Details': `Idle time is ${item['Idle Hours/Day']} hours/day, exceeding the threshold of ${idleThreshold}.`
      });
    }

    if (isRented && isUnassigned) {
      anomalies.push({
        'Equipment ID': item['Equipment ID'],
        'Equipment Type': item['Type'],
        'Operator ID': operatorId, 
        'Type': 'Unassigned Equipment',
        'Details': `This equipment has been checked out but is not assigned to a site.`
      });
    }
    
    if (isRented && hasHighFuelUsage) {
      anomalies.push({
        'Equipment ID': item['Equipment ID'],
        'Equipment Type': item['Type'],
        'Operator ID': operatorId, 
        'Type': 'High Fuel Usage',
        'Details': `Fuel usage is ${fuelUsage.toFixed(2)} L/day for only ${engineHours.toFixed(2)} engine hours. Ratio exceeds ${fuelUsageRatioThreshold} L/hr.`
      });
    }
  });

  return anomalies;
};