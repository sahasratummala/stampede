"use client";

import BuddyFinder from "./BuddyFinder";
import { UserProvider } from "../../components/UserContent";

export default function CrowdConnectPage() {
  return (
    <UserProvider>
      <BuddyFinder />
    </UserProvider>
  );
}

// export default function CrowdConnectPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Your Crowd Connect content goes here */}
//       <div className="max-w-7xl mx-auto px-6 py-12">
//         <h1 className="text-4xl font-bold text-burnt-orange mb-8">
//           Moody Students - UT Austin
//         </h1>
//         {/* Add your crowd connect functionality here */}
//       </div>
//     </div>
//   );
// }