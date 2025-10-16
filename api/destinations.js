// api/destinations.js
// This function acts as a proxy between your frontend and Airtable
// It solves the CORS issue by making the request server-side

export default async function handler(req, res) {
  // Set CORS headers to allow requests from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Your Airtable credentials
    const BASE_ID = 'applFAILmzMgqfien';
    const API_KEY = 'patjUYAP4vzUi4497.f493dfe45f0fda133def50e634dd7e6ddbd5581bab464929c0f48af9e0e84974';
    const TABLE_NAME = 'Countries';

    // Fetch from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={Status}='Published'`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Format the data for the frontend
    const formattedData = data.records.map(record => ({
      id: record.id,
      name: record.fields.Country_Name,
      image: record.fields.Hero_Photo_URL,
      description: record.fields.Description,
      tags: record.fields.Best_For || [],
      climate: record.fields.Climate_Primary,
      budget: record.fields.Budget_Tier,
      bookingUrl: record.fields.Booking_URL,
      skyscannerUrl: record.fields.Skyscanner_URL,
    }));

    // Return the formatted data
    res.status(200).json(formattedData);

  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    res.status(500).json({
      error: 'Failed to fetch destinations',
      message: error.message,
    });
  }
}
