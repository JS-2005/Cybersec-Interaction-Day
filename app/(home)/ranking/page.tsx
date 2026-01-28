"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client";

export default function Ranking() {

    type ranking_list = {
        user_name: string;
        user_email: string;
        total_score: number;
        duration: string;
    };

    const supabase = createClient();

    const [rankList, setRankList] = useState<ranking_list[]>([]);

    const router = useRouter();

    useEffect(() => {

        // Check User Claims Whether Expired
        const checkUserClaims = async () => {
            const { data: userClaims } = await supabase.auth.getClaims();
            if (!userClaims) {
                router.replace('/')
            }
        }
        checkUserClaims();

        // Get ranking list with database function
        const getRanking = async () => {
            const { data: rankingData } = await supabase.rpc('get_ranking');
            setRankList(rankingData);
        };
        getRanking();

        // Realtime trigger get ranking list
        const subscription = async () => {
            const channel = supabase
                .channel('ranking_realtime')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'user_station',
                    },
                    (payload) => {
                        getRanking();
                    }
                )
                .subscribe();

            return () => {
                channel.unsubscribe();
            }
        }
        subscription();
    }, [supabase, router]);

    // Display ranking list
    const displayRanking = () => {
        return rankList.map((rank, i) => {
            let rankCSS = "text-white";
            let borderCSS = "border-gray-800";

            // Set Top 3 Ranking Color
            if (i + 1 === 1) { rankCSS = "text-yellow-500"; borderCSS = "border-yellow-500/50" }

            else if (i + 1 === 2) { rankCSS = "text-gray-300"; borderCSS = "border-gray-400/50" }

            else if (i + 1 === 3) { rankCSS = "text-orange-400"; borderCSS = "border-orange-500/50" }

            return (
                <Card key={i + 1} className={`flex flex-row justify-center items-center px-5 mb-5 border-2 ${borderCSS}`}>
                    <div className="w-auto">
                        <p className={`text-4xl ${rankCSS} font-mono font-extrabold`}>{`#${i + 1}`}</p>
                    </div>
                    <div className="w-120 flex justify-between">
                        <div>
                            <p className="text-xl font-bold pb-1">{rank.user_name}</p>
                            <p className="text-xs text-gray-400">{rank.user_email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary pb-1">{rank.total_score}</p>
                            <p className="text-xs text-secondary">TOTAL SCORE</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl border p-3">
                        <p className="font-bold">{rank.duration}</p>
                        <p className="text-xs pt-2 text-secondary">TOTAL TIME</p>
                    </div>
                </Card>
            )
        })
    }

    return (
        <div>
            <div className="flex justify-between items-center px-6 pt-5 pb-5 border-b border-gray-800 flex-col sm:flex-row gap-5">
                <div>
                    <p className="text-3xl font-bold text-white">PARTICIPANT LEADERBOARD</p>
                </div>
            </div>

            <div className="mt-10">
                {displayRanking()}
            </div>
        </div>
    )
}