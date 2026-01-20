"use client"

import FirstGame from "@/components/games/game1"
import SecondGame from "@/components/games/game2";
import ThirdGame from "@/components/games/game3";
import FourthGame from "@/components/games/game4";
import FifthGame from "@/components/games/game5";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use } from "react";

export default function DirectGame({params}: {params: Promise<{id:string}>}){

    const unwrapGameID = use(params);
    const gameID = parseInt(unwrapGameID.id);

    const renderPage = () => {
        switch(gameID){
            case 1:
                return <FirstGame/>
            case 2:
                return <SecondGame/>
            case 3:
                return <ThirdGame/>
            case 4:
                return <FourthGame/>
            case 5:
                return <FifthGame/>
            default:
                return (
                    <div>
                        <p className="text-red-500 text-5xl">Error: Game {gameID} not Found</p>
                    </div>
                )
        }
    }

    return(
        <div>
            <div className="pt-5">
                <Link href="/participant">
                    <Button className="my-3 bg-gray-800 text-white text-lg hover:bg-gray-900">Back</Button>
                </Link>
            </div>

            <div>
                {renderPage()}
            </div>
        </div>
    )
}