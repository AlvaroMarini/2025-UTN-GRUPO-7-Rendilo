import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,   // <-- agrega esto
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Mock",
      credentials: { email: {}, password: {} },
      async authorize(creds){
        const users = [
          { id:"stu1", email:"alumno@demo.com",  password:"123", role:"student" },
          { id:"tea1", email:"profe@demo.com",   password:"123", role:"teacher" },
        ] as const;
        const u = users.find(u=>u.email===creds?.email && u.password===creds?.password);
        return u ? { id:u.id, email:u.email, role:u.role } as any : null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).role = (user as any).role;
      return token as any;
    },
    async session({ session, token }) {
      (session as any).role = (token as any).role;
      return session;
    }
  },
  pages: { signIn: "/login" }
};
