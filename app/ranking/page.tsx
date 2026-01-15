"use client"

import { Card } from "@/components/ui/card"
import { getCurrentUserName, getRanking } from "@/lib/data";
import { UUID } from "crypto";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export interface display_list{
    id: UUID,
    name: string,
    email: string,
    rank: number;
    total_score: number
}

export default function Ranking(){

    const [ranking_list, getRankList] = useState<display_list[]>([]);
    const [current_name, getCurrentName] = useState<string>("");

    const router = useRouter();

    useEffect(() =>{

        const storageExist = localStorage.getItem("user");
        if (!storageExist){
            router.push("/");
            return;
        }

        const determineRank = async () => {

            const participant_rank_list = await getRanking();

            getRankList(participant_rank_list);

            // get current access username
           const getName = getCurrentUserName();
           getCurrentName(getName);

        };
        
        determineRank();
    }, [router]);


    return (
        <div>
            <div className="flex justify-between items-center px-6 pt-5 pb-5 border-b border-gray-800 flex-col sm:flex-row gap-5">
                <div>
                    <p className="text-3xl font-bold text-secondary neon-text">PARTICIPANT LEADERBOARD</p>
                    <p className="mt-2 text-gray-400">Elite Hackers Ranking</p>
                </div>

                <Link href="/home">
                    <div className="border border-secondary p-2 rounded-lg transition-transform duration-300 hover:scale-[1.02]">
                        <p className="">{current_name}</p>
                    </div>
                </Link>
            </div>

            <div className="mt-10">
                {ranking_list.map((rl) => {
                    
                    let rankCSS = "text-white";
                    let borderCSS = "border-gray-800";

                    if(rl.rank === 1){rankCSS = "text-yellow-500"; borderCSS = "border-yellow-500/50"}
                    else if (rl.rank === 2){rankCSS = "text-gray-300"; borderCSS = "border-gray-400/50"}
                    else if (rl.rank === 3){rankCSS = "text-orange-400"; borderCSS = "border-orange-500/50"}

                    return (
                        <Card key={rl.id} className={`flex flex-row justify-center items-center px-5 mb-5 border-2 ${borderCSS}`}>
                            <div className="w-auto">
                                <p className={`text-4xl ${rankCSS} font-mono font-extrabold`}>{`#0${rl.rank}`}</p>
                            </div>
                            <div className="w-175 flex justify-between">
                                <div>
                                    <p className="text-xl font-bold pb-1">{rl.name}</p>
                                    <p className="text-xs text-gray-400">{rl.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary neon-text pb-1">{rl.total_score}</p>
                                    <p className="text-xs text-secondary">TOTAL SCORE</p>
                                </div>
                            </div>
                        </Card>
                    )
                })
                }
            </div>
        </div>
    )
}