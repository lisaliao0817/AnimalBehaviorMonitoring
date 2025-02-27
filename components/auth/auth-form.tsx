'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from './login-form';
import SignupForm from './signup-form';

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <Card className="w-full">
      <CardHeader>
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-xs text-muted-foreground">
          {activeTab === 'login'
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
            className="text-primary underline underline-offset-4 hover:text-primary/90"
          >
            {activeTab === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
} 