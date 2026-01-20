"use client"

import { Card } from "@/components/ui/card"
import { display_list, getCurrentUserName, getRanking } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client";

/*
export interface display_list{
    id: UUID,
    name: string,
    email: string,
    rank: number;
    total_score: number
}*/

export default function Ranking() {

    const supabase = createClient();

    const [ranking_list, getRankList] = useState<display_list[]>([]);
    const [current_name, getCurrentName] = useState<string>("");

    const router = useRouter();

    useEffect(() => {

        // Check User Claims Whether Expired
        const checkUserClaims = async () => {
            const { data: userClaims } = await supabase.auth.getClaims();
            if (!userClaims) {
                router.push('/')
            }
        }
        checkUserClaims();

        const determineRank = async () => {

            const participant_rank_list = await getRanking();

            getRankList(participant_rank_list);

        };

        determineRank();
    }, [router]);


    return (
        <div>
            <div className="flex justify-between items-center px-6 pt-5 pb-5 border-b border-gray-800 flex-col sm:flex-row gap-5">
                <div>
                    <p className="text-3xl font-bold text-white">PARTICIPANT LEADERBOARD</p>
                </div>
            </div>

            <div className="mt-10">
                {ranking_list.map((rl) => {

                    let rankCSS = "text-white";
                    let borderCSS = "border-gray-800";

                    if (rl.rank === 1) { rankCSS = "text-yellow-500"; borderCSS = "border-yellow-500/50" }
                    else if (rl.rank === 2) { rankCSS = "text-gray-300"; borderCSS = "border-gray-400/50" }
                    else if (rl.rank === 3) { rankCSS = "text-orange-400"; borderCSS = "border-orange-500/50" }

                    return (
                        <Card key={rl.id} className={`flex flex-row justify-center items-center px-5 mb-5 border-2 ${borderCSS}`}>
                            <div className="w-auto">
                                <p className={`text-4xl ${rankCSS} font-mono font-extrabold`}>{`#0${rl.rank}`}</p>
                            </div>
                            <div className="w-120 flex justify-between">
                                <div>
                                    <p className="text-xl font-bold pb-1">{rl.name}</p>
                                    <p className="text-xs text-gray-400">{rl.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary neon-text pb-1">{rl.total_score}</p>
                                    <p className="text-xs text-secondary">TOTAL SCORE</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 rounded-xl border p-3">
                                <p className="font-bold">{rl.amount_time}</p>
                                <p className="text-xs pt-2 text-secondary">TOTAL TIME</p>
                            </div>
                        </Card>
                    )
                })
                }
            </div>
        </div>
    )
}