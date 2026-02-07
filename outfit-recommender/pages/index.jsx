import Head from 'next/head'; // <--- This is the new import you need
import OutfitRecommender from '../components/outfit-recommender';

export default function Home() {
  const testEvent = {
    artist: "Taylor Swift",
    genre: "pop",
    venue: "Moody Center"
  };
  
  const testArtistInfo = {
    name: "Taylor Swift",
    genre: "pop"
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>Hook 'Em Style</title>
        {/* This single line will turn on all the colors and styling instantly */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <h1 className="text-3xl font-bold text-center mb-8 hidden">
        Outfit Recommender Test
      </h1>
      
      {/* I removed the 'Test' header above so your beautiful UI takes center stage */}
      <OutfitRecommender 
        event={testEvent}
        artistInfo={testArtistInfo}
      />
    </div>
  );
}