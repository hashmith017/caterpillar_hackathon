import Papa from 'papaparse';
import dataUrl from './data/equipment_data.csv';

export const fetchEquipmentData = async () => {
  return new Promise((resolve, reject) => {
    Papa.parse(dataUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.data) {
          resolve(results.data);
        } else {
          reject(new Error('Failed to parse CSV data.'));
        }
      },
      error: function(err) {
        reject(err);
      }
    });
  });
};