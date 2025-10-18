"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";

export default function SupabaseAuthListener() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (pathname.startsWith('/adm')) {
                if (!session) router.replace('/');
            }

            if (
                pathname.startsWith('/auth/login') ||
                pathname.startsWith('/auth/join') ||
                pathname.startsWith('/auth/find')
            ) {
                if (session) router.replace('/');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    return null;
}