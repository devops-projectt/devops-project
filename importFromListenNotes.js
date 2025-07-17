// importFromListenNotes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import Podcast from './server/models/Podcast.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI
const LISTEN_NOTES_API_KEY = process.env.LISTEN_NOTES_API_KEY;


const SEARCH_URL = 'https://listen-api.listennotes.com/api/v2/search';

// Specify your keywords/moods here:
const KEYWORDS = [
  'sad',
  'surprised',
  'confident',
  'thoughtful',
  'happy',
  'angry',
  'calm',
  'tired'
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log('Using MongoDB URI:', MONGODB_URI);
    console.log('Connected to DB:', mongoose.connection.name);
    // If this is not "moodcast", check your .env and connection string!
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

async function fetchPodcastsByKeyword(keyword, offset = 0) {
  const params = new URLSearchParams({
    q: keyword,
    type: 'podcast',
    offset: offset,
    len_min: 10,
    len_max: 300,
    sort_by_date: 0,
    only_in: 'title,description',
    language: 'English',
    safe_mode: 1,
  });

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      'X-ListenAPI-Key': LISTEN_NOTES_API_KEY,
    },
  });

  if (res.status === 429) {
    throw new Error('Rate limit exceeded (HTTP 429). Please try again later.');
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch podcasts for "${keyword}" (offset ${offset}): ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.results || [];
}

async function importPodcasts() {
  await connectDB();
  let totalImported = 0;
  let totalProcessed = 0;

  for (const keyword of KEYWORDS) {
    console.log(`\n🔍 Fetching podcasts for keyword: "${keyword}"`);
    let podcasts = [];
    let offset = 0;
    let page = 0;
    const pageSize = 10;
    const maxPages = 5; // Fetch up to 50 podcasts per keyword
    let keepFetching = true;

    while (keepFetching && page < maxPages) {
      let pageResults = [];
      try {
        pageResults = await fetchPodcastsByKeyword(keyword, offset);
      } catch (err) {
        if (err.message.includes('Rate limit')) {
          console.error(`⏳ Rate limit hit while fetching "${keyword}" (offset ${offset}). Stopping further requests for this keyword.`);
          break;
        } else {
          console.error(err.message);
          break;
        }
      }
      if (pageResults.length === 0) {
        keepFetching = false;
      } else {
        podcasts.push(...pageResults);
        offset += pageSize;
        page++;
      }
    }

    for (const p of podcasts) {
      totalProcessed++;
      const podcastId = p.id;
      // Fetch episodes for this podcast
      let episodes = [];
      try {
        const epRes = await fetch(`https://listen-api.listennotes.com/api/v2/podcasts/${podcastId}?sort=recent_first`, {
          headers: { 'X-ListenAPI-Key': LISTEN_NOTES_API_KEY },
        });
        if (epRes.ok) {
          const epData = await epRes.json();
          episodes = (epData.episodes || []).slice(0, 5).map(ep => ({
            id: ep.id,
            title: ep.title,
            description: ep.description,
            audio: ep.audio,
            pub_date_ms: ep.pub_date_ms,
            listenotes_url: ep.listennotes_url,
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch episodes for podcast ${podcastId}:`, err.message);
      }
      const podcastData = {
        podcastId,
        title: p.title_original,
        description: p.description_original,
        image: p.image,
        publisher: p.publisher_original,
        language: p.language,
        total_episodes: p.total_episodes,
        listenotes_url: p.listennotes_url,
        genres: p.genre_ids,
        lastFetched: new Date(),
        episodes,
      };

      try {
        // Accumulate keywords for each podcast
        await Podcast.findOneAndUpdate(
          { podcastId },
          {
            $set: podcastData,
            $addToSet: { keywords: keyword }
          },
          { upsert: true, new: true }
        );
        totalImported++;
      } catch (err) {
        console.error(`❌ Error saving podcast "${podcastData.title}":`, err.message);
      }
    }
    console.log(`✅ Processed ${podcasts.length} podcasts for "${keyword}"`);
  }

  // Debug: count and print podcasts in the DB
  const count = await Podcast.countDocuments();
  console.log('Total podcasts in DB:', count);
  const first = await Podcast.findOne();
  console.log('Sample podcast document:', first);

  console.log(`\n🎉 Import complete! Processed: ${totalProcessed}, Imported/Updated: ${totalImported}`);
  mongoose.disconnect();
}

importPodcasts().catch(err => {
  console.error('❌ Script error:', err);
  mongoose.disconnect();
});

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}