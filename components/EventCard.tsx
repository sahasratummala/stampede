import { Card } from '@/components/ui/card';
import { Event } from '@/lib/serpapi';
import Link from 'next/link';
import Image from 'next/image';

export default function EventCard({ event }: { event: Event }) {
    const dateObj = new Date(event.date);
    const isValidDate = !isNaN(dateObj.getTime());

    const month = isValidDate ? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
    const day = isValidDate ? dateObj.getDate() : '';

    return (
        <Link href={event.link} target="_blank" rel="noopener noreferrer">
            <Card className="group overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-ut-orange to-ut-orange-dark overflow-hidden">
                    {event.image ? (
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-5xl font-black opacity-20">🎵</span>
                        </div>
                    )}

                    {/* Date Badge - Partiful style */}
                    {isValidDate && (
                        <div className="absolute top-3 left-3 bg-white rounded-lg shadow-lg px-3 py-2 text-center">
                            <div className="text-xs font-bold text-ut-orange">{month}</div>
                            <div className="text-2xl font-black text-ut-black leading-none">{day}</div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-lg text-ut-black mb-1 line-clamp-2 group-hover:text-ut-orange transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{event.venue}</p>
                </div>
            </Card>
        </Link>
    );
}