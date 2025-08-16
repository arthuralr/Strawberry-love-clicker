
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Crown, Star, Medal } from 'lucide-react';

interface User {
  username: string;
  stock: number;
  createdAt?: string;
}

function RankingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-8"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-6 w-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-24"></div>
            </div>
             <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
       <div className="h-10 bg-muted rounded w-24 mx-auto mt-8"></div>
    </div>
  );
}

export default function RankingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const usersRef = query(ref(db, 'users'), orderByChild('stock'));
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList: User[] = Object.keys(data).map(key => ({
          username: key,
          stock: data[key].stock || 0,
          createdAt: data[key].createdAt
        }));
        // Firebase RTDB ordena em ordem crescente, então revertemos para ter o maior primeiro
        setUsers(userList.sort((a, b) => b.stock - a.stock));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Star className="w-6 h-6 text-yellow-700" />;
      default:
        return <span className="text-lg font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  const getGameTime = (createdAt?: string) => {
    if (!createdAt) {
      return "Usuário Beta";
    }
    const creationDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - creationDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
       const diffMinutes = Math.floor(diffMs / (1000 * 60));
       return `${diffMinutes}m`;
    }
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background font-body p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FBCFE8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}>
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline font-bold text-primary" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            Ranking Mundial de Morangos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <RankingSkeleton />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tempo de Jogo</TableHead>
                    <TableHead className="text-right">Morangos Prontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.username} className={index < 3 ? 'font-bold' : ''}>
                      <TableCell className="flex items-center justify-center h-14">{getRankIcon(index)}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{getGameTime(user.createdAt)}</TableCell>
                      <TableCell className="text-right text-lg">{new Intl.NumberFormat('pt-BR').format(user.stock)} 🍓</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-center mt-8">
                <Button onClick={() => router.push('/game')}>Voltar ao Jogo</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
