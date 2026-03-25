import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Users, Send, Shield, Moon, Sun, 
  Play, Pause, SkipBack, SkipForward, X, VolumeX, Volume2,
  Github, Instagram, MessageSquare, Trash2
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

/* Custom easing curve for consistent smooth animations across the app */
const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const;

/* Reusable wrapper to animate elements when they enter the viewport */
const ScrollReveal = ({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, onClick?: React.MouseEventHandler<HTMLDivElement> }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: CUSTOM_EASE }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

/* Text reveal animation applying a blur effect word by word */
const BlurText = ({ text, className = "", as: Component = "div" }: { text: string, className?: string, as?: any }) => {
  const words = text.split(" ");
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.04 } }
      }}
      className={className}
    >
      <Component className="inline-block">
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.25em]"
            variants={{
              hidden: { filter: 'blur(12px)', opacity: 0, y: 40 },
              visible: { 
                filter: 'blur(0px)', 
                opacity: 1, 
                y: 0, 
                transition: { ease: CUSTOM_EASE, duration: 0.8 } 
              }
            }}
          >
            {word}
          </motion.span>
        ))}
      </Component>
    </motion.div>
  );
};

/* Standard typewriter effect for static strings */
const TypewriterText = ({ text, delay = 100 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, delay);
    return () => clearInterval(typingInterval);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

/* Looping typewriter effect that cycles through an array of strings */
const RotatingTypewriter = () => {
  const words = [
    "Computer Engineering Students", 
    "Web Development Learners", 
    "Politeknik Negeri Manado", 
    "Sperta Squad"
  ];
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayedText !== currentWord) {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
      }, 100);
    } else if (isDeleting && displayedText !== "") {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
      }, 50);
    } else if (!isDeleting && displayedText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, wordIndex]);

  return (
    <span>{displayedText}<span className="animate-pulse opacity-70">|</span></span>
  );
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    zIndex: 1
  }),
  center: {
    zIndex: 1,
    x: 0
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%'
  })
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  
  /* Parallax effect values bound to the window scroll position */
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.15]);
  
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAboutVideoMuted, setIsAboutVideoMuted] = useState(true);
  
  const [anonMessage, setAnonMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [musicMinimized, setMusicMinimized] = useState(true);
  const playlistIds = ["sperta", "amelsound", "sigma", "instrumentalxmas"];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackMeta, setTrackMeta] = useState({ title: 'Loading...', artist: '', albumArt: '/images/elaina.webp' });
  const [lyricsData, setLyricsData] = useState<{time: number, text: string}[]>([]);
  const [activeLyric, setActiveLyric] = useState('...');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const teamImages = Array.from({ length: 20 }).map((_, i) => `/images/team${i + 1}.webp?v=${Date.now()}`);
  const [[slot1, dir1], setSlot1State] = useState([0, 0]); 
  const [[slot2, dir2], setSlot2State] = useState([1, 0]); 
  const [[slot3, dir3], setSlot3State] = useState([2, 0]); 

  const nextSlot1 = () => setSlot1State([(slot1 + 1) % teamImages.length, 1]);
  const prevSlot1 = () => setSlot1State([(slot1 - 1 + teamImages.length) % teamImages.length, -1]);
  const nextSlot2 = () => setSlot2State([(slot2 + 1) % teamImages.length, 1]);
  const prevSlot2 = () => setSlot2State([(slot2 - 1 + teamImages.length) % teamImages.length, -1]);
  const nextSlot3 = () => setSlot3State([(slot3 + 1) % teamImages.length, 1]);
  const prevSlot3 = () => setSlot3State([(slot3 - 1 + teamImages.length) % teamImages.length, -1]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  /* Real-time listener for authenticating the admin user */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user); 
    });
    return () => unsubscribeAuth();
  }, []);

  /* Real-time Firestore subscription to fetch anonymous messages */
  useEffect(() => {
    const q = query(collection(db, "pesan_anonim"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, []);

  /* Dynamic music metadata fetcher based on current playlist index */
  useEffect(() => {
    const trackId = playlistIds[currentTrackIndex];
    
    fetch(`/music/${trackId}.json`)
      .then(res => res.json())
      .then(data => {
        if (data.music) {
          setTrackMeta({
            title: data.music.title || trackId,
            artist: data.music.artist || 'Unknown Artist',
            albumArt: `/${data.music.albumArt}` || '/images/elaina.webp'
          });
          setLyricsData(data.music.timeSync || []);
        }
      })
      .catch((err) => {
        console.warn(`Failed to fetch metadata for ${trackId}:`, err);
        setTrackMeta({
          title: trackId.replace(/[-_]/g, ' '),
          artist: 'Sperta Squad',
          albumArt: `/images/${trackId}.webp`
        });
        setLyricsData([]);
      });
      
      setActiveLyric('...');
      setCurrentTime(0);
  }, [currentTrackIndex]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play error:", e));
    }
  }, [currentTrackIndex, isPlaying]);

  /* Syncs lyrics display with the currently playing audio time */
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      if (lyricsData.length > 0) {
        let currentText = '...';
        for (let i = 0; i < lyricsData.length; i++) {
          if (lyricsData[i].time <= time) {
            currentText = lyricsData[i].text;
          } else {
            break;
          }
        }
        setActiveLyric(currentText);
      } else {
        setActiveLyric('Lyrics not available');
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.error("Audio play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlistIds.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlistIds.length) % playlistIds.length);
    setIsPlaying(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  /* Smooth scrolling implementation for navigation links */
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  /* Handles anonymous message submission and secret admin auth commands */
  const handleSendMessage = async () => {
    const text = anonMessage.trim();
    if (!text) return;

    if (text === "/login_admin") {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        alert("Logged in as Admin!");
      } catch (error) {
        alert("Failed to login.");
      }
      setAnonMessage("");
      return;
    }

    if (text === "/logout_admin") {
      try {
        await signOut(auth);
        alert("Logged out successfully!");
      } catch (error) {
        alert("Failed to logout.");
      }
      setAnonMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "pesan_anonim"), {
        text,
        timestamp: serverTimestamp()
      });
      setAnonMessage("");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to send message. Please check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "pesan_anonim", id));
      } catch (error) {
        console.error("Error deleting doc:", error);
        alert("Failed to delete message.");
      }
    }
  };

  /* Dynamic glassmorphism utility classes based on theme */
  const glassPanel = darkMode 
    ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]' 
    : 'bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]';

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#0f0c13] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-black'} font-sans overflow-x-hidden`}>
      
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Abstract background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-40 transition-colors duration-700 ${darkMode ? 'bg-[#474af0]' : 'bg-[#a3a5f0]'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[120px] opacity-40 transition-colors duration-700 ${darkMode ? 'bg-[#9b5cf6]' : 'bg-[#cba5f5]'}`}></div>
      </div>

      <audio 
        ref={audioRef} 
        src={`/music/${playlistIds[currentTrackIndex]}.mp3`} 
        onEnded={playNext}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Navigation Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: CUSTOM_EASE, delay: 0.2 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none pl-4 pr-16 md:px-4"
      >
        <div className={`pointer-events-auto flex items-center ${glassPanel} rounded-full px-4 py-3 md:px-6 md:py-4 shadow-2xl max-w-[65vw] sm:max-w-[70vw] md:max-w-none overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          <div className={`flex items-center gap-6 md:gap-8 text-[10px] md:text-sm tracking-[0.1em] uppercase font-medium whitespace-nowrap ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
            {['Home', 'About', 'Team', 'Anonymous'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleScrollTo(e, item.toLowerCase())}
                className={`hover:text-[#474af0] transition-colors shrink-0 ${activeNav === item.toLowerCase() ? (darkMode ? 'text-white font-bold' : 'text-black font-bold') : ''}`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className={`pointer-events-auto fixed top-6 right-4 lg:right-10 ${glassPanel} p-1.5 md:p-2 rounded-full`}>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-transform hover:scale-110 ${darkMode ? 'text-white' : 'text-black'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </motion.nav>

      {/* Floating Audio Player Widget */}
      <div className={`fixed left-5 bottom-5 z-[2000] transition-all duration-500 ease-in-out ${
          musicMinimized 
            ? 'w-8 h-8 rounded-full bg-transparent border-none' 
            : `w-[340px] rounded-2xl p-3 ${glassPanel}`
        }`}
      >
        <button 
          onClick={() => setMusicMinimized(!musicMinimized)}
          aria-label={musicMinimized ? "Expand music player" : "Minimize music player"}
          className={`absolute flex items-center justify-center rounded-full bg-[#474af0] text-white shadow-lg transition-all duration-500 z-10 ${
            musicMinimized ? 'top-0 left-0 w-8 h-8 hover:scale-110' : 'top-2 right-2 w-8 h-8'
          }`}
        >
          {musicMinimized ? <Play size={14} className="ml-0.5" /> : <X size={16} />}
        </button>

        <div className={`transition-opacity duration-300 ${musicMinimized ? 'opacity-0 pointer-events-none hidden' : 'opacity-100 block'}`}>
          <div className="flex gap-3 items-center mb-2">
            <img 
              src={trackMeta.albumArt} 
              onError={(e) => { e.currentTarget.src = '/images/elaina.webp' }}
              alt="Album" 
              className="w-16 h-16 rounded-xl object-cover shadow-md" 
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`font-bold text-sm truncate capitalize ${darkMode ? 'text-white' : 'text-black'}`}>{trackMeta.title}</span>
              <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-black/60'} truncate`}>{trackMeta.artist}</span>
              <span className="text-[11px] mt-1 text-[#474af0] truncate italic transition-all duration-300">{activeLyric}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-center items-center gap-4">
              <button onClick={playPrev} aria-label="Previous track" className={`p-2 hover:scale-110 transition-transform ${darkMode ? 'text-[#7c84ff]' : 'text-[#474af0]'}`}><SkipBack size={16} /></button>
              <button 
                onClick={togglePlay} 
                aria-label={isPlaying ? "Pause music" : "Play music"}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-[#474af0] to-[#9b5cf6] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(71,74,240,0.4)] hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
              </button>
              <button onClick={playNext} aria-label="Next track" className={`p-2 hover:scale-110 transition-transform ${darkMode ? 'text-[#7c84ff]' : 'text-[#474af0]'}`}><SkipForward size={16} /></button>
            </div>
            <div 
              className={`h-2 rounded-full mt-1 cursor-pointer overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-[#474af0] to-[#9b5cf6] rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">

        {/* Hero Section */}
        <section id="home" className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pb-10">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="/images/img.webp" 
              alt="Sperta Squad Photo" 
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 ${darkMode ? 'bg-black/70' : 'bg-white/50'}`} />
            <div className={`absolute inset-0 bg-gradient-to-t ${darkMode ? 'from-[#0f0c13] via-[#0f0c13]/70' : 'from-[#f0f2f5] via-[#f0f2f5]/70'} to-transparent`} />
          </motion.div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto mt-32 md:mt-40">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: CUSTOM_EASE }}
              className={`rounded-full px-4 py-1.5 mb-8 flex items-center gap-2 ${glassPanel}`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs tracking-[0.25em] uppercase font-medium">Collaborative projects</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Raleway, sans-serif', minHeight: '80px' }}>
              <TypewriterText text="Hi, We're Sperta Squad" delay={100} />
            </h1>
            
            <h3 className="text-2xl md:text-4xl text-[#474af0] font-bold mb-6 h-12" style={{ fontFamily: 'Playfair Display, serif' }}>
              <RotatingTypewriter />
            </h3>
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
              className={`text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-light ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              <p>We are a group of 6 students from Politeknik Negeri Manado, majoring in</p>
              <p>Electro with Computer Engineering study program. Currently, we are still</p>
              <p>learning and exploring the world of web development as beginners.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1 }}
              className={`flex flex-wrap justify-center gap-6 text-sm font-medium mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <p className="flex items-center gap-2">📍 Based in Manado, Indonesia</p>
              <p className="flex items-center gap-2">🎓 Polytechnic State of Manado</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
              className="flex items-center gap-6 mb-[10px] md:mb-[10px]" 
            >
              <p className="font-medium">Follow us:</p>
              <div className="flex gap-4">
                <a href="https://github.com/Chell07" target="_blank" rel="noreferrer" className={`hover:text-[#474af0] transition-colors ${darkMode ? 'text-white' : 'text-black'}`}><Github size={24} /></a>
                <a href="https://discord.gg/qpKcxrxpu8" target="_blank" rel="noreferrer" className={`hover:text-[#474af0] transition-colors ${darkMode ? 'text-white' : 'text-black'}`}><MessageSquare size={24} /></a>
                <a href="https://instagram.com/electrobyte_25" target="_blank" rel="noreferrer" className={`hover:text-[#474af0] transition-colors ${darkMode ? 'text-white' : 'text-black'}`}><Instagram size={24} /></a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quote Section Divider */}
        <section className="relative py-32 md:py-40 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none blur-[120px] ${darkMode ? 'bg-blue-600/20' : 'bg-[#474af0]/10'}`} />
          
          <ScrollReveal className={`w-[1px] h-24 bg-gradient-to-b from-transparent ${darkMode ? 'via-white/50' : 'via-black/50'} to-transparent mb-12`} />
          
          <BlurText 
            as="h2"
            text="The digital world is an endless canvas, and every line of code is a step forward. We are the learners, the architects, and the creators of tomorrow."
            className={`font-heading italic text-4xl md:text-5xl lg:text-6xl max-w-4xl text-balance leading-tight tracking-tight relative z-10 ${darkMode ? 'text-white' : 'text-black'}`}
          />
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-6 md:px-24 max-w-7xl mx-auto">
          <ScrollReveal className={`p-8 md:p-12 rounded-[2.5rem] ${glassPanel}`}>
            <p className="text-sm font-bold tracking-widest text-gray-500 mb-2">ABOUT US</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Learning & Growing<br/>Together</h1>
            <hr className={`w-1/3 mb-12 ${darkMode ? 'border-white/10' : 'border-black/10'}`} />
            
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className={`flex-1 space-y-6 text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>We are Sperta Squad - a group of passionate Computer Engineering students from Politeknik Negeri Manado who are enthusiastic about web development. Our journey began in the classroom and has grown into a collaborative learning experience.</p>
                <p>As beginners in this field, we're exploring the fundamentals of HTML, CSS, and JavaScript together. We believe in the power of teamwork, mutual support, and shared growth as we navigate the exciting world of web technologies.</p>
                <p>When we're not studying or coding, we enjoy discussing new technologies, helping each other with projects, and exploring different approaches to problem-solving. We're committed to continuous learning and building a strong foundation in web development.</p>
              </div>
              
              <div className={`relative w-full max-w-[225px] h-[400px] rounded-3xl overflow-hidden shadow-2xl group flex-shrink-0 mx-auto lg:mx-0 p-2 ${darkMode ? 'bg-white/5' : 'bg-white/40'}`}>
                <video 
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105" 
                  autoPlay 
                  muted={isAboutVideoMuted} 
                  loop 
                  playsInline
                >
                  <source src="/videos/about-video.mp4" type="video/mp4" />
                </video>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAboutVideoMuted(!isAboutVideoMuted);
                  }}
                  aria-label={isAboutVideoMuted ? "Unmute video" : "Mute video"}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm opacity-80 group-hover:opacity-100 transition-all hover:scale-105 shadow-lg border border-white/10"
                >
                  {isAboutVideoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />} 
                  {isAboutVideoMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Team Drag & Drop Section */}
        <section id="team" className="py-24 px-6 md:px-24 max-w-[1200px] mx-auto flex flex-col items-center overflow-hidden">
          <ScrollReveal className="w-full mb-16 text-center">
            <p className="text-sm font-bold tracking-widest text-gray-500 mb-2">OUR TEAM</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Sperta Squad</h1>
            <hr className={`w-16 mx-auto mb-8 ${darkMode ? 'border-white/10' : 'border-black/10'}`} />
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto`}>
              The six members of our squad who are learning and growing together in web development and computer engineering.
            </p>
          </ScrollReveal>

          <div className="w-full flex flex-col gap-6">
            
            <ScrollReveal className="relative w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden group border border-white/10 shadow-2xl">
              <AnimatePresence initial={false} custom={dir1}>
                <motion.img
                  key={slot1} 
                  src={teamImages[slot1]}
                  loading="lazy"
                  custom={dir1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_, { offset }) => {
                    if (offset.x < -50) nextSlot1();
                    else if (offset.x > 50) prevSlot1();
                  }}
                  alt={`Team Member Photo ${slot1 + 1}`}
                  className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-[#02040A]/10 to-transparent opacity-60 pointer-events-none z-10" />

              <div className="absolute bottom-8 left-8 right-8 pointer-events-none z-20">
                 <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-1 drop-shadow-md">Squad Member</p>
                 <h3 className="text-white font-heading italic text-4xl drop-shadow-lg">Photo {slot1 + 1}</h3>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <ScrollReveal className="relative w-full h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden group border border-white/10 shadow-xl">
                 <AnimatePresence initial={false} custom={dir2}>
                   <motion.img
                     key={slot2}
                     src={teamImages[slot2]}
                     loading="lazy"
                     custom={dir2}
                     variants={slideVariants}
                     initial="enter"
                     animate="center"
                     exit="exit"
                     transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
                     drag="x"
                     dragConstraints={{ left: 0, right: 0 }}
                     dragElastic={1}
                     onDragEnd={(_, { offset }) => {
                       if (offset.x < -50) nextSlot2();
                       else if (offset.x > 50) prevSlot2();
                     }}
                     alt={`Team Member Photo ${slot2 + 1}`}
                     className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                   />
                 </AnimatePresence>
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent opacity-60 pointer-events-none z-10" />

                 <div className="absolute bottom-6 left-6 pointer-events-none z-20">
                     <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-1 drop-shadow-md">Squad Member</p>
                    <h3 className="text-white font-heading italic text-2xl drop-shadow-lg">Photo {slot2 + 1}</h3>
                 </div>
              </ScrollReveal>

              <ScrollReveal className="relative w-full h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden group border border-white/10 shadow-xl">
                 <AnimatePresence initial={false} custom={dir3}>
                   <motion.img
                     key={slot3}
                     src={teamImages[slot3]}
                     loading="lazy"
                     custom={dir3}
                     variants={slideVariants}
                     initial="enter"
                     animate="center"
                     exit="exit"
                     transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
                     drag="x"
                     dragConstraints={{ left: 0, right: 0 }}
                     dragElastic={1}
                     onDragEnd={(_, { offset }) => {
                       if (offset.x < -50) nextSlot3();
                       else if (offset.x > 50) prevSlot3();
                     }}
                     alt={`Team Member Photo ${slot3 + 1}`}
                     className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                   />
                 </AnimatePresence>
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent opacity-60 pointer-events-none z-10" />

                 <div className="absolute bottom-6 left-6 pointer-events-none z-20">
                     <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-1 drop-shadow-md">Squad Member</p>
                    <h3 className="text-white font-heading italic text-2xl drop-shadow-lg">Photo {slot3 + 1}</h3>
                 </div>
              </ScrollReveal>

            </div>
          </div>

          <ScrollReveal>
            <p className="text-gray-500 text-sm italic mt-8 animate-pulse text-center">
              ← Swipe photos left or right to mix & match the team →
            </p>
          </ScrollReveal>
        </section>

        {/* Anonymous Chat Form */}
        <section id="anonymous" className="py-24 px-6 md:px-24 max-w-7xl mx-auto flex flex-col items-center">
          <ScrollReveal className="text-center w-full mb-12">
            <p className="text-sm font-bold tracking-widest text-gray-500 mb-2">ANONYMOUS</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Send anonymous chat</h1>
            <hr className={`w-16 mx-auto mb-8 ${darkMode ? 'border-white/10' : 'border-black/10'}`} />
            <p className={`text-lg mb-12 flex flex-col items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Have any feedback, questions, or concerns? Share them here anonymously.</span>
              {isAdmin && (
                <span className="bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30 flex items-center gap-1">
                  <Shield size={14} /> Admin Mode Active
                </span>
              )}
            </p>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-10 w-full">
            <ScrollReveal className={`w-full p-8 rounded-[2rem] flex flex-col ${glassPanel}`}>
              <h3 className="text-xl font-bold mb-6 border-b-2 border-[#474af0] pb-2 inline-block">Write your Message</h3>
              <textarea 
                aria-label="Write your anonymous message"
                value={anonMessage}
                onChange={(e) => setAnonMessage(e.target.value)}
                placeholder="Enter Your Message Here..." 
                className={`w-full flex-1 min-h-[160px] border rounded-xl p-4 font-sans text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#474af0] transition-colors ${darkMode ? 'bg-black/20 border-white/10 text-white focus:bg-black/40' : 'bg-white/50 border-white/40 focus:bg-white/80'}`}
                maxLength={500}
                disabled={isSubmitting}
              ></textarea>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">{anonMessage.length} / 500</span>
                <button 
                  onClick={handleSendMessage}
                  disabled={isSubmitting}
                  className={`bg-[#474af0] hover:bg-[#2c36d9] text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Send size={16} /> {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </ScrollReveal>

            {/* Chat List Box */}
            <ScrollReveal className={`w-full p-8 rounded-[2rem] ${glassPanel}`}>
              <h3 className="text-xl font-bold mb-6 border-b-2 border-[#474af0] pb-2 inline-block">Latest Messages</h3>
              <div className={`w-full h-[350px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-xl p-4 border flex flex-col gap-4 ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white/40 border-white/40'}`}>
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No messages yet. Be the first to say hi!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`p-4 rounded-xl border relative group ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium opacity-60">Anonymous</p>
                        
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            aria-label="Delete message"
                            className="text-red-500 hover:text-red-700 transition-colors p-1 opacity-50 hover:opacity-100"
                            title="Hapus Pesan"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className={`text-base whitespace-pre-wrap ${darkMode ? 'text-white/90' : 'text-black/90'}`}>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer Section */}
        <footer className={`py-12 px-6 lg:px-12 max-w-[1400px] mx-auto mt-20 relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-12 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex flex-col gap-8 max-w-2xl mt-12">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Users className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-black'}`} />
              <span className="font-heading text-2xl tracking-widest uppercase">Sperta Squad</span>
            </div>
            <h2 className="font-heading italic text-5xl md:text-6xl text-balance">Learning and growing together.</h2>
          </div>

          <div className={`flex flex-col md:flex-row justify-between items-center w-full pt-8 border-t text-xs gap-6 ${darkMode ? 'border-white/10 text-white/40' : 'border-black/10 text-black/50'}`}>
            <p>&copy; {new Date().getFullYear()} Sperta Squad - Politeknik Negeri Manado </p>
            
            <div className="flex items-center gap-6">
              <a href="https://github.com/Chell07" target="_blank" rel="noreferrer" className={`hover:text-[#474af0] transition-colors ${darkMode ? 'text-white/60' : 'text-black/60'}`}><Github size={18} /></a>
              <a href="https://discord.gg/qpKcxrxpu8" target="_blank" rel="noreferrer" className={`hover:text-[#474af0] transition-colors ${darkMode ? 'text-white/60' : 'text-black/60'}`}><MessageSquare size={18} /></a>
              <a href="https://instagram.com/electrobyte_25" target="_blank" rel="noreferrer" className={`hover:text-[#474af0] transition-colors ${darkMode ? 'text-white/60' : 'text-black/60'}`}><Instagram size={18} /></a>
              
              <div className={`hidden md:block w-px h-4 ${darkMode ? 'bg-white/20' : 'bg-black/20'}`}></div>
              
              {['Home', 'About', 'Team', 'Anonymous'].map(link => (
                <a 
                  key={link} 
                  href={`#${link.toLowerCase()}`} 
                  onClick={(e) => handleScrollTo(e, link.toLowerCase())}
                  className={`hidden md:block font-heading italic text-lg transition-colors cursor-pointer ${darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>

      {/* Fullscreen Video Modal Layer */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center" 
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-[90%] max-w-3xl" onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors border border-white/20"
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close video"
              >
                <X size={24} />
              </button>
              <div className="p-2 rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-xl">
                <video className="w-full rounded-xl bg-black outline-none" controls autoPlay>
                  <source src="/videos/about-video.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}