
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { ref, get, set } from "firebase/database";

export default function LoginPage() {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    const userRef = ref(db, 'users/' + loginUsername);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === loginPassword) {
        toast({ title: "Sucesso!", description: "Login realizado com sucesso." });
        localStorage.setItem('username', loginUsername);
        router.push('/');
      } else {
        toast({ title: "Erro de Login", description: "Senha incorreta.", variant: "destructive" });
      }
    } else {
      toast({ title: "Erro de Login", description: "Usuário não encontrado.", variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    const userRef = ref(db, 'users/' + signupUsername);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      toast({ title: "Erro de Cadastro", description: "Este nome de usuário já existe.", variant: "destructive" });
    } else {
      await set(userRef, {
        password: signupPassword,
        stock: 0,
        stage: 1,
        clicks: 0
      });
      toast({ title: "Sucesso!", description: "Conta criada com sucesso. Faça o login." });
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background font-body p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FBCFE8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}>
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline font-bold text-primary" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            Bem-vindo ao Strawberry Love Clicker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <Input
                  type="text"
                  placeholder="Nome de usuário"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="bg-background/80"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                   className="bg-background/80"
                />
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-4">
                <Input
                  type="text"
                  placeholder="Escolha um nome de usuário"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="bg-background/80"
                />
                <Input
                  type="password"
                  placeholder="Crie uma senha"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="bg-background/80"
                />
                <Button type="submit" className="w-full">Criar Conta</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
