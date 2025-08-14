"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Carrot, Sparkles } from 'lucide-react';

const STAGES = [
  { id: 1, name: "Plantar e Cultivar o Morango", baseClicks: 10, Icon: Leaf, iconClassName: "text-secondary-foreground" },
  { id: 2, name: "Adicionar a Cobertura Base", baseClicks: 15, Icon: Carrot, iconClassName: "text-primary" },
  { id: 3, name: "Adicionar a Cobertura Vermelha Final", baseClicks: 20, Icon: Sparkles, iconClassName: "text-accent" },
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

export default function Home() {
  const [stock, setStock] = useState(0);
  const [stage, setStage] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentStageInfo = useMemo(() => STAGES[stage - 1], [stage]);
  const difficultyMultiplier = useMemo(() => Math.pow(2, stock), [stock]);
  
  const clicksNeeded = useMemo(() => {
    return currentStageInfo.baseClicks * difficultyMultiplier;
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
      }
    }
  }, [clicks, clicksNeeded, stage, isClient]);

  const handleMainClick = () => {
    setClicks(prev => prev + 1);
    setAnimate(true);
  };

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 150);
      return () => clearTimeout(timer);
    }
  }, [animate]);
  
  if (!isClient) {
    return <GameSkeleton />;
  }

  const { Icon, iconClassName } = currentStageInfo;

  return (
    <main className="flex items-center justify-center min-h-screen bg-background font-body p-4 transition-colors duration-500">
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/10 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-4xl font-headline font-bold text-primary tracking-tight">
            Fábrica de Morango do Amor
          </CardTitle>
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
            <Icon className={`w-24 h-24 transition-colors duration-300 ${iconClassName}`} />
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
