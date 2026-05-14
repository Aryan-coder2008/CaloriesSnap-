import React, { useState, useEffect } from 'react';
import { Home, Camera, Dumbbell, ScrollText, User } from 'lucide-react';
import HomePage from './components/HomePage';
import SnapPage from './components/SnapPage';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import OnboardingPage from './components/OnboardingPage';
import ActivityPage from './components/ActivityPage';
import { Meal, UserProfile, Exercise } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'snap' | 'activity' | 'history' | 'profile'>('home');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ targetCalories: 2000, isOnboarded: false });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMeals = localStorage.getItem('meals');
    if (savedMeals) {
      try {
        setMeals(JSON.parse(savedMeals));
      } catch (e) {}
    }
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      try {
        setExercises(JSON.parse(savedExercises));
      } catch (e) {}
    }
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  const saveMeals = (newMeals: Meal[]) => {
    setMeals(newMeals);
    localStorage.setItem('meals', JSON.stringify(newMeals));
  };

  const saveExercises = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    localStorage.setItem('exercises', JSON.stringify(newExercises));
  };

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('profile', JSON.stringify(newProfile));
  };

  const addMeal = (meal: Meal) => {
    saveMeals([meal, ...meals]);
    setActiveTab('history');
  };

  const addExercises = (newExs: Exercise[]) => {
    saveExercises([...newExs, ...exercises]);
    setActiveTab('history');
  };

  // Get only today's data
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const todaysMeals = meals.filter(m => new Date(m.timestamp).setHours(0,0,0,0) === startOfToday);
  const todaysExercises = exercises.filter(e => new Date(e.timestamp).setHours(0,0,0,0) === startOfToday);

  if (!isLoaded) return null;

  if (!profile.isOnboarded) {
    return <OnboardingPage onComplete={saveProfile} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage meals={todaysMeals} exercises={todaysExercises} profile={profile} />;
      case 'snap':
        return <SnapPage onAddMeal={addMeal} />;
      case 'activity':
        return <ActivityPage profile={profile} onAddExercises={addExercises} />;
      case 'history':
        return <HistoryPage meals={meals} setMeals={saveMeals} exercises={exercises} setExercises={saveExercises} />;
      case 'profile':
        return <ProfilePage profile={profile} setProfile={saveProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex justify-center sm:p-4">
      <div className="w-full max-w-md bg-neutral-50 relative h-screen sm:h-[calc(100vh-2rem)] sm:rounded-[2.5rem] shadow-2xl flex flex-col sm:overflow-hidden sm:ring-8 sm:ring-neutral-800">
        <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
          {renderContent()}
        </main>
        
        <nav className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-neutral-200 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-6 sm:pb-4">
          <NavItem icon={<Home />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<Camera />} label="Snap" isActive={activeTab === 'snap'} onClick={() => setActiveTab('snap')} />
          <NavItem icon={<Dumbbell />} label="Activity" isActive={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
          <NavItem icon={<ScrollText />} label="Diary" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavItem icon={<User />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 ${isActive ? 'text-emerald-600 scale-110 relative' : 'text-neutral-400 hover:text-neutral-600'} transition-all duration-300`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
      {isActive && <div className="absolute -bottom-3 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
    </button>
  );
}
