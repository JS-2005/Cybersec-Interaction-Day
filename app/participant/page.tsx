"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GameScore, GameStation, getCurrentUserName, getGameStation, getRanking, getScore, getUser, insertGame, User } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserPage(){

    const [all_station, setStation] = useState<GameStation[]>([]);
    const [all_user_score, getAllUserScore] = useState<GameScore[]>([]);
    const [all_user, getAllUser] = useState<User[]>([]);
    const [display_rank, getDisplayRank] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [current_name, getCurrentName] = useState<string>("");

    const [isloading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {

        const storageExist = localStorage.getItem("user");
        if (!storageExist){
            router.push('/');
            return;
        }

        const loadGame = async() => {

            try{
                // get all game station 
                const fetch_game = await getGameStation();

                // get all user game score
                const score = await getScore();

                // get all user info
                const user = await getUser();

                // get sorted rank
                const current_rank = await getRanking();

                setStation(fetch_game);
                getAllUserScore(score);
                getAllUser(user);

                // get user name
                const getName = getCurrentUserName();
                getCurrentName(getName);

                // is Admin ?
                if(typeof(Storage) != "undefined"){
                    const localInfo = localStorage.getItem("user");
                    const JsLocalInfo = JSON.parse(localInfo || "");

                    if(JsLocalInfo.userRole === "admin"){
                        setIsAdmin(true);
                    }
                }

                // check user rank
                const specific_rank = current_rank.find((cr) => cr.name === getName);
                getDisplayRank(specific_rank?.rank || null);
            }
            catch(error){
                console.error("Error participant page: ", error);
            }
            finally{
                setIsLoading(false);
            }
        };

        loadGame();
    }, [router]);

    // if admin, not insert score, if not, insert score
    const handleGameStation = async(stationID:number) => {

        const checkUserID = all_user.find((au) => au.username === current_name);

        if (checkUserID){
            if (!isAdmin){

                const checkExistStation = all_user_score.filter((aus) => aus.station_id === stationID);
                const checkExistUser = checkExistStation.find((ces) => ces.user_id === checkUserID.user_id);

                if (!checkExistUser){
                    await insertGame(checkUserID?.user_id, stationID);
                    // move to game page
                }
            }
        }
        else{
            console.error("Error fetching user id");
        }

    }

    if(isloading){
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-5xl font-extrabold text-white">Loading Page . . .</p>
            </div>
        )
    }

    return(
        <div className="flex flex-col">
            <div className="flex justify-between items-center px-10 pt-5 flex-col sm:flex-row gap-5">
                <div>
                    <p className="font-bold text-4xl neon-text">User Page</p>
                    <p className="text-gray-400">{`Welcome, ${current_name} `}</p>
                </div>

                <Link href="/home">
                    <div className="border border-secondary p-2 rounded-lg transition-transform duration-300 hover:scale-[1.02]">
                        <p className="">{current_name}</p>
                    </div>
                </Link>
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
                                            <p className={`p-1 px-2 text-xs ${current_game_score? "bg-green-900 rounded-md text-green-200 border border-green-300":"bg-gray-800 rounded-md text-gray-200"}`}>{`${current_game_score? `SCORE: ${current_game_score.score} / ${game.point}`:`${game.point} PTS`}`}</p>
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

            <div className={`${isAdmin? "hidden":"flex flex-col justify-center items-center p-5"}`}>
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
            </div>
        </div>
    )
}