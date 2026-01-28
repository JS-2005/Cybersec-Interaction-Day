"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ParticipantPage() {
    type station = {
        station_name: string,
        station_description: string,
    }

    const supabase = createClient();

    const [all_station, setStation] = useState<GameStation[]>([]);
    const [all_user_score, setAllUserScore] = useState<GameScore[]>([]);
    const [all_user, setAllUser] = useState<User[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [current_name, setCurrentName] = useState<string>("");

    const [isloading, setIsLoading] = useState<boolean>(true);

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

        const loadGame = async () => {

            try {
                // get all game station 
                const fetch_game = await getGameStation();

                // get all user game score
                const score = await getScore();

                // get all user info
                const user = await getUser();

                // get sorted rank
                const current_rank = await getRanking();

                setStation(fetch_game);
                setAllUserScore(score);
                setAllUser(user);

            }
            catch (error) {
                console.error("Error participant page: ", error);
            }
            finally {
                setIsLoading(false);
            }
        };

        loadGame();
    }, [router]);

    // if admin, not insert score, if not, insert score
    const handleGameStation = async (stationID: number) => {

        const checkUserID = all_user.find((au) => au.username === current_name);

        if (checkUserID) {
            if (!isAdmin) {

                const checkExistStation = all_user_score.filter((aus) => aus.station_id === stationID);
                const checkExistUser = checkExistStation.find((ces) => ces.user_id === checkUserID.user_id);

                if (!checkExistUser) {
                    await insertGame(checkUserID?.user_id, stationID);
                    // move to game page
                }
            }
        }
        else {
            console.error("Error fetching user id");
        }

    }

    if (isloading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-5xl font-extrabold text-white">Loading Page . . .</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center px-6 pt-5 pb-5 border-b border-gray-800 flex-col sm:flex-row gap-5">
                <div>
                    <p className="text-3xl font-bold text-white">PARTICIPANT CONSOLE</p>
                </div>
            </div>

            <div className="mt-10 m-5 pb-5 border-b">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {all_station.map((game) => {

                        const match_user = all_user.find((au) => au.username === current_name);
                        const user_score = all_user_score.filter((aus) => aus.user_id === match_user?.user_id);

                        const current_game_score = user_score.find((us) => us.station_id === game.game_id);

                        return (
                            <div key={game.game_id}>
                                <Card className="transition-transform duration-300 ease-in-out hover:scale-[1.02]">
                                    <CardHeader>
                                        <div className="flex justify-between">
                                            <CardTitle className="text-secondary font-bold text-lg">{game.game_name}</CardTitle>
                                            <p className={`p-1 px-2 text-xs ${current_game_score ? "bg-green-900 rounded-md text-green-200 border border-green-300" : "bg-gray-800 rounded-md text-gray-200"}`}>{`${current_game_score ? `SCORE: ${current_game_score.score} / ${game.point}` : `${game.point} PTS`}`}</p>
                                        </div>
                                        <CardDescription>
                                            {game.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <Link href={`/game/${game.game_id}`} onClick={() => handleGameStation(game.game_id)} className="text-primary">
                                        <CardFooter className="flex justify-center border border-primary mx-5 py-1 hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]">
                                            <button>START</button>
                                        </CardFooter>
                                    </Link>
                                </Card>
                            </div>
                        )
                    })}

                </div>
            </div>

            {/* <div className={`${isAdmin ? "hidden" : "flex flex-col justify-center items-center p-5"}`}>
                <div className="bg-gray-900/50 border border-gray-600 px-20 py-10 rounded-2xl">
                    <p className="text-xs text-gray-300">CURRENT STANDING</p>
                    <div className="flex gap-5">
                        <p className="text-5xl font-extrabold text-yellow-500 neon-text">{`#0${display_rank}`}</p>
                        <div>
                            <p className="font-bold text-xl">GLOBAL RANK</p>
                            <p className="text-xs text-gray-500">Keep hacking to climb the leaderboard</p>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    )
}