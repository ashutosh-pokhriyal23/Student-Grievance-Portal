import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { getSpaces } from '../api/complaints';
import StudentNavbar from '../components/StudentNavbar';
import SpaceCard from '../components/SpaceCard';
import SpaceDrawer from '../components/SpaceDrawer';
import {
  LayoutGrid,
  Search,
  Building2,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Home,
  Trophy,
  Theater,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const MOCK_SPACES = useMemo(() => [
    { id: 'd1', name: 'ASD (APPLIED SCIENCE DEPARTMENT)', type: 'department', open_complaints: 0 },
    { id: 'd2', name: 'CSE', type: 'department', open_complaints: 0 },
    { id: 'd3', name: 'ECE', type: 'department', open_complaints: 0 },
    { id: 'd4', name: 'EE', type: 'department', open_complaints: 0 },
    { id: 'd5', name: 'CIVIL', type: 'department', open_complaints: 0 },
    { id: 'd6', name: 'MECHANICAL', type: 'department', open_complaints: 0 },
    { id: 'd7', name: 'CHEMICAL', type: 'department', open_complaints: 0 },
    { id: 'd8', name: 'BIOTECHNOLOGY', type: 'department', open_complaints: 0 },
    { id: 'f1', name: 'Library', type: 'facility', open_complaints: 0 },
    { id: 'f2', name: 'Competency Building Centre', type: 'facility', open_complaints: 0 },
    { id: 'c1', name: 'Training and Placement Cell', type: 'career', open_complaints: 0 },
    { id: 'a1', name: 'Administration Block', type: 'administrative', open_complaints: 0 },
    { id: 'h1', name: 'GOMUKH', type: 'hostel', open_complaints: 0 },
    { id: 'h2', name: 'NANDA DEVI HOSTEL (NDH)', type: 'hostel', open_complaints: 0 },
    { id: 'h3', name: 'ARAWALI', type: 'hostel', open_complaints: 0 },
    { id: 'h4', name: 'KAILASH', type: 'hostel', open_complaints: 0 },
    { id: 'h5', name: 'NEW BOYS HOSTEL (NBH)', type: 'hostel', open_complaints: 0 },
    { id: 'h6', name: 'Vindhyachal', type: 'hostel', open_complaints: 0 },
    { id: 'h7', name: 'YAMUNOTRI', type: 'hostel', open_complaints: 0 },
    { id: 'h8', name: 'GANGOTRI', type: 'hostel', open_complaints: 0 },
    { id: 's1', name: 'Sports Dept', type: 'sports', open_complaints: 0 },
    { id: 's2', name: 'Gym', type: 'sports', open_complaints: 0 },
    { id: 'e1', name: 'Multipurpose Theatre', type: 'cultural', open_complaints: 0 },
  ], []);

  const [spaces, setSpaces] = useState(MOCK_SPACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  const CATEGORIES = [
    {
      id: "department",
      label: "Departments",
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "facility",
      label: "Academic Facilities",
      icon: BookOpen,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      id: "career",
      label: "Career & Dev",
      icon: Briefcase,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "administrative",
      label: "Administrative",
      icon: ShieldCheck,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    {
      id: "hostel",
      label: "Hostels",
      icon: Home,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      id: "sports",
      label: "Sports & Fitness",
      icon: Trophy,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "cultural",
      label: "Cultural & Events",
      icon: Theater,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const fetchSpaces = useCallback(async () => {
    try {
      const response = await getSpaces();
      // API returns { success: true, data: [...] }
      const spaceData = response.data || response; 
      const finalSpaces = Array.isArray(spaceData) ? spaceData : (Array.isArray(response) ? response : []);
      
      if (finalSpaces.length > 0) {
        setSpaces(finalSpaces);
      } else {
        setSpaces(MOCK_SPACES);
      }
    } catch (err) {
      console.error('[Dashboard] Failed to load spaces:', err.message);
      setSpaces(MOCK_SPACES);
    }
  }, [MOCK_SPACES]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchSpaces();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchSpaces]);

  const filteredSpaces = spaces.filter((space) => {
    const matchesFilter = activeFilter === 'all' || space.type === activeFilter;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-background">
      <StudentNavbar />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent-dept/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-40 left-0 w-64 h-64 bg-accent-hostel/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-primary tracking-tight mb-8 leading-[0.9]">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-dept to-blue-600">Grievance</span> Portal
          </h1>
          <p className="mt-6 text-secondary text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Your voice is the catalyst for change. Raise issues, track resolutions, and help us build a better campus experience.
          </p>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="sticky top-24 z-30 mb-20 space-y-4 max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-gray-100 p-2.5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-xl">
            
            {/* Scrollable Tabs Wrapper */}
            <div className="relative flex-1 w-full overflow-hidden group">
              <div 
                ref={scrollRef}
                className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 px-1 mask-linear-right"
              >
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 transform ${
                    activeFilter === 'all'
                      ? 'bg-primary text-white  scale-105'
                      : 'bg-gray-50/50 text-secondary hover:bg-white hover:text-primary border border-transparent hover:border-gray-100'
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 transform ${
                      activeFilter === cat.id
                        ? 'bg-primary text-white  scale-105'
                        : 'bg-gray-50/50 text-secondary hover:bg-white hover:text-primary border border-transparent hover:border-gray-100'
                    }`}
                  >
                    <cat.icon size={14} className={activeFilter === cat.id ? 'text-white' : cat.color} />
                    <span>{cat.label}</span>
                  </button>
                ))}
                {/* Padding at the end to ensure the fade doesn't hide the last item completely */}
                <div className="min-w-[40px] h-1" />
              </div>
              
              {/* Scroll Indicators */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/90 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300 flex items-center justify-end pr-2 text-secondary/30">
                <ChevronRight size={20} className="animate-bounce-x" />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
              <input
                type="text"
                placeholder="Find a department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-gray-100 focus:ring-4 focus:ring-accent-dept/5 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-center md:hidden">
             <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest flex items-center bg-gray-50 px-3 py-1 rounded-full">
                Slide to explore categories <ChevronRight size={10} className="ml-1" />
             </span>
          </div>
        </div>

        {/* Space Sections */}
        {CATEGORIES.map((cat) => {
          const items = filteredSpaces.filter(s => s.type === cat.id);
          if (items.length === 0) return null;

          return (
            <section key={cat.id} className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <div className="flex items-center space-x-5 mb-12">
                <div className={`p-4 rounded-[24px] ${cat.bg} ${cat.color} shadow-sm`}>
                  <cat.icon size={32}  />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-primary tracking-tight leading-none">{cat.label}</h2>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.bg.replace('/10', '')} animate-pulse`} />
                    <p className="text-xs font-black text-secondary uppercase tracking-[0.2em] opacity-50">
                      {items.length} Tracking {items.length === 1 ? 'Unit' : 'Units'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {items.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    onClick={() => {
                      setSelectedSpace(space);
                      setIsDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {filteredSpaces.length === 0 && (
          <div className="text-center py-40 flex flex-col items-center">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-secondary/20 mb-8 border-2 border-dashed border-gray-100">
                <Search size={48} />
             </div>
             <h3 className="text-2xl font-black text-primary tracking-tight">No results found</h3>
             <p className="text-secondary font-bold mt-2 max-w-sm mx-auto leading-relaxed">
               We couldn't find any unit matching "{searchQuery}". Try a different branch, hostel, or category.
             </p>
             <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="mt-8 text-sm font-black text-accent-dept underline underline-offset-8 hover:opacity-70 transition-opacity uppercase tracking-widest"
              >
                Clear all filters
              </button>
          </div>
        )}
      </div>

      {/* Space Drawer */}
      <SpaceDrawer
        isOpen={isDrawerOpen}
        space={selectedSpace}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedSpace(null);
        }}
        onIssueCreated={() => {
          // Refresh spaces or handle new issue creation
        }}
      />
    </div>
  );
};

export default Dashboard;
