/**
 * Netlify serverless function: proxy to Football-Data.org for Real Madrid matches.
 * Set env var FOOTBALL_DATA_API_KEY in Netlify (Site settings → Environment variables).
 * Frontend calls /.netlify/functions/rm-matches?season=2025 (season optional).
 */

const REAL_MADRID_TEAM_ID = 86;
const API_BASE = 'https://api.football-data.org/v4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'FOOTBALL_DATA_API_KEY not set. Add it in Netlify → Site settings → Environment variables.',
      }),
    };
  }

  const season = event.queryStringParameters?.season || new Date().getFullYear();
  const url = `${API_BASE}/teams/${REAL_MADRID_TEAM_ID}/matches?limit=80&season=${season}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': apiKey },
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: corsHeaders,
        body: JSON.stringify(data || { error: res.statusText }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Upstream request failed' }),
    };
  }
};
