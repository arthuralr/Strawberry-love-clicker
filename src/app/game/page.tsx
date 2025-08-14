
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';

const STAGES = [
  { id: 1, name: "Plantar a Semente", baseClicks: 10, emoji: "🌱", emojiSize: "text-7xl" },
  { id: 2, name: "Morango Verde", baseClicks: 15, emoji: "🍓", emojiSize: "text-7xl" },
  { id: 3, name: "Morango Maduro", baseClicks: 20, emoji: "🍓", emojiSize: "text-8xl" },
];

function GameSkeleton() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-background font-body p-4">
            <Card className="w-full max-w-md animate-pulse">
                <CardHeader className="text-center pb-4">
                    <div className="h-10 bg-muted rounded w-3/4 mx-auto"></div>
                    <div className="h-7 bg-muted rounded w-1/2 mx-auto mt-2"></div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8 pt-4">
                    <div className="h-7 bg-muted rounded w-2/3 mx-auto"></div>
                    <div className="w-48 h-48 rounded-full bg-muted"></div>
                    <div className="w-full text-center space-y-2">
                        <div className="h-4 bg-muted rounded-full"></div>
                        <div className="h-5 bg-muted rounded w-1/3 mx-auto"></div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function GamePage() {
  const [stock, setStock] = useState(0);
  const [stage, setStage] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string}[]>([]);
  const [orbitingStrawberries, setOrbitingStrawberries] = useState<number[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/');
    } else {
      setUsername(storedUsername);
      setIsClient(true);
    }
  }, [router]);

  useEffect(() => {
    if (username) {
      const userRef = ref(db, 'users/' + username);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStock(data.stock || 0);
          setStage(data.stage || 1);
          setClicks(data.clicks || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [username]);

  useEffect(() => {
    if (username && isClient) {
      const userRef = ref(db, 'users/' + username);
      // We only want to write if the local state is ahead of the database
      // This check is simplistic and can be improved with versioning or timestamps
      get(userRef).then(snapshot => {
        const dbData = snapshot.val();
        if (!dbData || dbData.stock !== stock || dbData.stage !== stage || dbData.clicks !== clicks) {
           set(ref(db, 'users/' + username + '/'), {
            // we have to spread the password to not overwrite it
            ...(dbData || {}),
            stock,
            stage,
            clicks
          });
        }
      })
    }
  }, [stock, stage, clicks, username, isClient]);


  useEffect(() => {
    if (stock > 0) {
      setOrbitingStrawberries(Array.from({ length: Math.min(stock, 20) }, (_, i) => i)); // Limite de 20 para não sobrecarregar
    } else {
      setOrbitingStrawberries([]);
    }
  }, [stock]);

  const currentStageInfo = useMemo(() => STAGES[stage - 1] || STAGES[0], [stage]);
  const difficultyMultiplier = useMemo(() => Math.pow(2, stock), [stock]);
  
  const clicksNeeded = useMemo(() => {
    return (currentStageInfo.baseClicks || 10) * difficultyMultiplier;
  }, [currentStageInfo, difficultyMultiplier]);
  
  const progressPercentage = useMemo(() => {
    if (clicksNeeded === 0) return 0;
    return (clicks / clicksNeeded) * 100;
  }, [clicks, clicksNeeded]);

  useEffect(() => {
    if (isClient && clicksNeeded > 0 && clicks >= clicksNeeded) {
      if (stage < STAGES.length) {
        setStage(prev => prev + 1);
        setClicks(0);
      } else {
        setStock(prev => prev + 1);
        setStage(1);
        setClicks(0);
        const newEmojis = Array.from({length: 5}, (_, i) => ({id: Date.now() + i, emoji: '💖'}));
        setFloatingEmojis(prev => [...prev, ...newEmojis]);
      }
    }
  }, [clicks, clicksNeeded, stage, isClient]);

  const handleMainClick = () => {
    setClicks(prev => prev + 1);
    setAnimate(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    router.push('/');
  };

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 150);
      return () => clearTimeout(timer);
    }
  }, [animate]);
  
  if (!isClient || !username) {
    return <GameSkeleton />;
  }

  const { emoji, emojiSize } = currentStageInfo;
  const emojiColorClass = stage === 2 ? 'grayscale' : 'grayscale-0';

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-background font-body p-4 transition-colors duration-500 overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FBCFE8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}>
      
      {orbitingStrawberries.map((index) => (
        <div
          key={`orbit-${index}`}
          className="absolute text-4xl animate-orbit"
          style={{
            animationDelay: `${index * -0.75}s`,
            transformOrigin: 'center center'
          }}
        >
          🍓
        </div>
      ))}


      {floatingEmojis.map(item => (
        <div
          key={item.id}
          className="absolute text-2xl animate-fade-out-up"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 20 + 70}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
          onAnimationEnd={() => setFloatingEmojis(prev => prev.filter(e => e.id !== item.id))}
        >
          {item.emoji}
        </div>
      ))}
      
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20 bg-card/90 backdrop-blur-sm animate-fade-in-down z-10">
        <CardHeader className="text-center pb-4 relative">
          <CardTitle className="text-5xl font-headline font-bold text-primary tracking-tight" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            Fábrica de Morango do Amor
          </CardTitle>
           <Button onClick={handleLogout} variant="ghost" className="absolute top-4 right-4 text-xs">Sair</Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 pt-4">
          <div className="w-full space-y-2 text-center">
              <p className="text-lg font-semibold text-foreground">Etapa Atual: {currentStageInfo.name}</p>
              <p className="text-base text-foreground">Morangos do Amor Prontos: <span className="font-bold text-primary">{stock}</span></p>
          </div>

          <Button
            onClick={handleMainClick}
            variant="outline"
            className={`w-48 h-48 rounded-full bg-background hover:bg-accent/20 border-4 border-primary/20 shadow-lg transition-all duration-150 ease-in-out hover:shadow-primary/20 active:scale-105 ${animate ? 'scale-110 border-primary/50' : 'scale-100'}`}
            aria-label={`Clicar para progredir na etapa: ${currentStageInfo.name}`}
          >
            <span className={`${emojiSize} transition-all duration-300 ${animate ? 'animate-thump' : ''} ${emojiColorClass}`}>{emoji}</span>
          </Button>

          <div className="w-full text-center space-y-2">
             <Progress value={progressPercentage} className="h-4" />
             <p className="text-sm font-medium text-muted-foreground tabular-nums">
                Progresso: {new Intl.NumberFormat('pt-BR').format(clicks)} / {new Intl.NumberFormat('pt-BR').format(clicksNeeded)} cliques
             </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

