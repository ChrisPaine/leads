# YouTube API Setup Instructions

To enable YouTube engagement metrics (views, likes, comments) in your search results, you need to set up the YouTube Data API v3.

## Steps to Get a YouTube API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict the API Key (Recommended)**
   - Click on the created API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3" from the list
   - Save the changes

6. **Add the API Key to Your Supabase Project**
   - Go to your Supabase project dashboard
   - Navigate to "Project Settings" > "Edge Functions" > "Secrets"
   - Add a new secret:
     - Name: `YOUTUBE_API_KEY`
     - Value: Your API key from step 4
   - Save the secret

7. **Deploy the Updated Function**
   - Run the deployment script:
     ```bash
     npx supabase functions deploy serp-search
     ```
   - Or use the batch file:
     ```bash
     deploy-functions.bat
     ```

## API Quota Information

- The YouTube Data API v3 has a default quota of 10,000 units per day
- Each video statistics request costs approximately 1 unit
- This means you can fetch stats for ~10,000 videos per day for free
- If you need more quota, you can request an increase in the Google Cloud Console

## How It Works

Once the API key is configured:

1. When users search for YouTube content, the system will:
   - First get search results from SerpAPI (Google search)
   - Extract the YouTube video IDs from the URLs
   - Make API calls to YouTube Data API v3 to fetch real engagement metrics
   - Display accurate views, likes, and comment counts

2. If the API key is not configured or the API call fails:
   - The system will fall back to text extraction from search snippets
   - Results may not include engagement metrics

## Testing

After setup, test by:
1. Perform a search with YouTube as one of the platforms
2. Check the Supabase function logs to see if YouTube API calls are successful
3. Verify that view counts, likes, and comments appear in search results

## Troubleshooting

- **"API key not valid" error**: Check that the API key is correctly copied and the YouTube Data API v3 is enabled
- **"Quota exceeded" error**: You've hit the daily quota limit. Wait 24 hours or request a quota increase
- **No metrics showing**: Check Supabase function logs to see if there are any API errors
