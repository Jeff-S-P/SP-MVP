// api/destinations.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const API_KEY = process.env.AIRTABLE_API_KEY;
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
    const formattedData = data.records.map(record => {
      // Handle Airtable attachment format
      let imageUrl = null;
      const attachments = record.fields.Hero_Photo_URL;
      
      if (Array.isArray(attachments) && attachments.length > 0) {
        imageUrl = attachments[0].url;
      }
      
      return {
        id: record.id,
        name: record.fields.Country_Name,
        image: imageUrl,
        description: record.fields.Description,
        tags: record.fields.Best_For || [],
        climate: record.fields.Climate_Primary,
        budget: record.fields.Budget_Tier,
        bookingUrl: record.fields.Booking_URL,
        skyscannerUrl: record.fields.Skyscanner_URL,
      };
    });

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
