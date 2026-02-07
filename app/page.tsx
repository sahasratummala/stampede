import { fetchAllEvents } from '@/lib/scraper';
import EventCalendar from '@/components/EventCalendar';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let scrapedEvents = [];
  try {
    scrapedEvents = await fetchAllEvents();
  } catch (error) {
    console.error("Scraper Error:", error);
    scrapedEvents = [];
  }

  // Manual events to add
  const manualEvents = [
    // February 2026
    {
      id: 'lalaland-feb14',
      title: 'La La Land in Concert',
      date: '2026-02-14',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/la-la-land-in-concert-2026-bass-concert-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1755187454/LaLaLand_Event_Hero_1920x853/LaLaLand_Event_Hero_1920x853.png?_i=AA'
    },
    {
      id: 'mnozil-brass-feb27',
      title: 'Mnozil Brass: Strau$$',
      date: '2026-02-27',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/mnozil-brass-2026-bates-recital-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1748900830/MnozilBrass_Event_Hero_1920x853/MnozilBrass_Event_Hero_1920x853.png?_i=AA'
    },
    {
      id: 'balourdet-feb27',
      title: 'Balourdet Quartet',
      date: '2026-02-27',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/balourdet-quartet-2026-kfma-studio-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1749074351/BalourdetQuartet_Event_Hero_1920x853/BalourdetQuartet_Event_Hero_1920x853.png?_i=AA'
    },
    {
      id: 'harry-potter-feb28',
      title: 'Harry Potter and the Prisoner of Azkaban™ in Concert',
      date: '2026-02-28',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/harry-potter-and-the-prisoner-of-azkaban-in-concert-2026-bass-concert-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1741639783/HP3_AUSTIN_VENUE_1920x853_Event-Page-Slider_2SHOW/HP3_AUSTIN_VENUE_1920x853_Event-Page-Slider_2SHOW.png?_i=AA'
    },
    {
      id: 'balourdet-feb28',
      title: 'Balourdet Quartet',
      date: '2026-02-28',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/balourdet-quartet-2026-first-unitarian-church-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1749074351/BalourdetQuartet_Event_Hero_1920x853/BalourdetQuartet_Event_Hero_1920x853.png?_i=AA'
    },
    // March 2026
    {
      id: 'puscifer-mar24',
      title: 'Puscifer - The Normal Isn\'t Tour',
      date: '2026-03-24',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/puscifer-2026-bass-concert-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1760735862/Puscifer_Event_Hero_1920x853/Puscifer_Event_Hero_1920x853.png?_i=AA'
    },
    // April 2026
    {
      id: 'lang-lang-apr4',
      title: 'An Evening with Lang Lang',
      date: '2026-04-04',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/lang-lang-2026-bass-concert-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1763135590/LangLang_Event_Hero_1920x853-3/LangLang_Event_Hero_1920x853-3.png?_i=AA'
    },
    // May 2026
    {
      id: 'rhiannon-giddens-may2',
      title: 'Rhiannon Giddens',
      date: '2026-05-02',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/rhiannon-giddens-2026-bass-concert-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1756828934/RhiannonGiddens_Event_Hero_1920x853-1/RhiannonGiddens_Event_Hero_1920x853-1.png?_i=AA'
    },
    // June 2026
    {
      id: 'lotr-jun12',
      title: 'The Lord of the Rings: The Fellowship of the Ring in Concert',
      date: '2026-06-12',
      venue: 'Texas Performing Arts',
      link: 'https://texasperformingarts.org/event/lotr-fotr-2026-bass-concert-hall-austin-texas/',
      image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1762383104/LOTR_Event_Hero_1920x853-1/LOTR_Event_Hero_1920x853-1.png?_i=AA'
    }
  ];

  // Filter out Widespread Panic 2-day ticket event and combine with manual events
  const filteredScrapedEvents = scrapedEvents.filter(event =>
    !event.title.includes('Widespread Panic: 2 Day Ticket')
  );

  // Combine scraped and manual events
  const allEvents = [...filteredScrapedEvents, ...manualEvents];

  return (
    <div className="min-h-screen font-sans bg-background selection:bg-accent selection:text-white transition-colors duration-300">
      <EventCalendar initialEvents={allEvents} />
    </div>
  );
}