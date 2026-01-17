"use client"

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminAllocation, checkAdminControl, GameScore, GameStation, getCurrentUserName, getGameStation, getScore, getUser, updateUserScore, User } from "@/lib/data";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UpdateRule = {
    id:number;
    numAllow:number;
}

type UpdateConfig = UpdateRule[];

const NumUpdateAllowed = [
    {id: 1, numAllow: 5},
    {id: 2, numAllow: 5},
    {id: 3, numAllow: 5},
    {id: 4, numAllow: 5},
    {id: 5, numAllow: 5},
];

//type UpdatedScoreList = [];

export default function AdminPage(){

    const [all_user_info, getUserInfo] = useState<User[]>([]);
    const [game_station, getGame] = useState<GameStation[]>([]);
    const [score_info, getScoreInfo] = useState<GameScore[]>([]);
    const [admin_list, getAdminList] = useState<AdminAllocation[]>([]);
    const [display_game, getDisplayGame] = useState<GameStation | null>(null);
    const [participant_list, getParticipantList] = useState<GameScore[]>([])
    const [current_name, getCurrentName] = useState<string>("");
    
    const [selectedID, getSelectedID] = useState<number>(1);
    const [updateAllow, getUpdateAllow] = useState<UpdateConfig>(NumUpdateAllowed);
    const [disableList, getDisableList] = useState<number[]>([]);
    //const [displayAddScore, getDisplayAddScore] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    //const disableList = [];

    useEffect(() => {

        const storageExist = localStorage.getItem('user');
        if(!storageExist){
            router.push('/');
            return;
        }

        const loadGame = async () =>{

            try{
                // get all user information
                const get_user_info = await getUser();

                // all game station
                const game_info = await getGameStation();

                // get all game score
                const game_score_info = await getScore();

                // get all admin control list
                const admin_control = await checkAdminControl();

                getUserInfo(get_user_info);
                getGame(game_info);
                getScoreInfo(game_score_info);
                getAdminList(admin_control);


                // default game station 1 
                if (game_info.length > 0){
                    const first_game = game_info.find((gi) => gi.game_id === 1);
                    getDisplayGame(first_game || null);
                }


                // default game station list 1
                if(game_score_info.length > 0){
                    const gameScore1 = game_score_info.filter((gsi) => gsi.station_id === 1);
                    getParticipantList(gameScore1);

                }

                const getName = getCurrentUserName();
                getCurrentName(getName);
            }
            catch(error){
                console.error("Error admin page: ", error);
            }
            finally{
                setIsLoading(false);
            }

        };
        loadGame();

    }, [router]);

    const handleNavigation = async(gameID:number) => {
        if(gameID){
            getSelectedID(gameID);

            // get specific selected game
            const specific_game = game_station.find((gs: GameStation) => gs.game_id === gameID);
            getDisplayGame(specific_game || null);

            // get specific selected score list
            const specific_score_list = score_info.filter((si) => si.station_id === gameID);
            getParticipantList(specific_score_list);
        }
    }

    const handleUserScore = async(scoreID: number, stationID: number, updateMethod:string, currentScore: number) =>{

        try{
            const existingScore = game_station.find((gs) => gs.game_id === stationID);
            const specificUpdateAllow = updateAllow.find((ua) => ua.id === stationID);

            if(existingScore && specificUpdateAllow){
                if(updateMethod === "addition" && specificUpdateAllow?.numAllow > 0){
                    if(currentScore < existingScore.point){

                        // add score id into list
                        getDisableList((pre) => [...pre, scoreID]);

                        await updateUserScore(scoreID, updateMethod, currentScore, specificUpdateAllow.numAllow);
                        const updatedList = await getScore();
                        getScoreInfo(updatedList);
                        const specific_updatedList = updatedList.filter((ul) => ul.station_id === stationID);
                        getParticipantList(specific_updatedList);

                        const deductUpdate = updateAllow.map((ua) => {
                            if(ua.id === stationID){
                                return {id:ua.id, numAllow: ua.numAllow-1}
                            }
                            else{
                                return {id:ua.id, numAllow: ua.numAllow}
                            }
                        })
                        getUpdateAllow(deductUpdate);
                    }
                }
                else if(updateMethod === "subtraction" && specificUpdateAllow?.numAllow < 5){
                    if(currentScore >= 0){

                        // delete score id into list
                        const remainID = disableList.filter((dl) => dl !== scoreID);
                        getDisableList(remainID);

                        await updateUserScore(scoreID, updateMethod, currentScore, specificUpdateAllow.numAllow);
                        const updatedList = await getScore();
                        getScoreInfo(updatedList);
                        const specific_updatedList = updatedList.filter((ul) => ul.station_id === stationID);
                        getParticipantList(specific_updatedList);

                        const AddUpdate = updateAllow.map((ua) => {
                            if(ua.id === stationID){
                                return {id:ua.id, numAllow: ua.numAllow+1}
                            }
                            else{
                                return {id:ua.id, numAllow: ua.numAllow}
                            }
                        })
                        getUpdateAllow(AddUpdate);
                    }
                }
            }

        }catch{
            console.error("Updating Error");
        }
    }

    if(isLoading){
        return(
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-5xl font-extrabold text-white">Loading Page . . .</p>
            </div>
        )
    }

    return(
        <div className="flex flex-col">
            <div className="flex justify-between items-center px-6 pt-5 pb-5 border-b border-red-800 flex-col sm:flex-row gap-5">
                <div>
                    <p className="font-bold text-4xl neon-text text-red-600">ADMINISTRATION CONSOLE</p>
                    <p className="text-sm text-red-400">WARNING: AUTHORIZED ACCESS ONLY</p>
                </div>

                <Link href="/home">
                    <div className="border border-secondary p-2 rounded-lg transition-transform duration-300 hover:scale-[1.02]">
                        <p className="">{current_name}</p>
                    </div>
                </Link>
            </div>

            <div>
                <NavigationMenu className="border-b-2">
                    <NavigationMenuList className="flex gap-5 p-5 pb-3 flex-wrap">
                        {game_station.map((game) =>(
                            <NavigationMenuItem key={game.game_id} className={`px-5 py-2 text-gray-400 ${selectedID === game.game_id? `bg-red-900/25 border-b-2 border-red-500 text-red-500`:`hover:text-white hover:bg-gray-900`}`} onClick={() => handleNavigation(game.game_id)}>
                                {game.game_name}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="mt-5 p-5 border-2 border-gray-400 rounded-xl">
                <p className="text-2xl font-bold">{`Game ${display_game?.game_name}`}</p>
                <div className="flex justify-between text-xs text-gray-400">
                    <p>Classified Mission</p>
                    <p className="bg-gray-900 p-1">MAX SCORE: 100</p>
                </div>
                <Table className="mt-5">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-400">
                                PARTICIPANT
                            </TableHead>
                            <TableHead className="text-gray-400">
                                SCORE
                            </TableHead>
                            <TableHead className="text-gray-400">
                                ACTIONS
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participant_list.map((pl) => {

                            const AddScore = updateAllow.find((ua) => ua.id === pl.station_id);
                            const displayAddScore = AddScore? (AddScore.numAllow * 2):0;

                            const Name_Email = all_user_info.find((aui) => pl.user_id === aui.user_id);

                            const checkStationAdmin = admin_list.filter((al) => al.station_id === pl.station_id);

                            const checkAdminName = checkStationAdmin.map((csa) => {
                                const getStationAdmin = all_user_info.find((aui) => aui.user_id === csa.admin_id);
                                return getStationAdmin?.username;
                            })

                            let canControl = false;

                            // check for assigned admin
                            for (let i = 0; i<checkAdminName.length; i++){

                                if(checkAdminName[i] === current_name){
                                    canControl = true;
                                }
                            }

                            // check can add ?
                            let canAddControl = true;
                            const isUpdated = disableList.find((dl) => dl === pl.score_id);
                            if (isUpdated)
                                canAddControl = false;

                            // check can delete ?
                            let canDelControl = false;
                            const isDeleted = disableList.find((dl) => dl === pl.score_id);
                            if (isDeleted)
                                canDelControl = true;

                            return (
                                <TableRow key={pl.score_id}>
                                    <TableCell>
                                        <p className="text-lg font-bold">{Name_Email?.username}</p>
                                        <p className="text-xs text-gray-500">{Name_Email?.user_email}</p>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        <span className="font-bold text-lg text-green-500">{pl.score}</span>/100
                                    </TableCell>
                                    <TableCell className="flex gap-5">
                                        <div>
                                            <Button className="px-3 py-1 bg-black border border-red-500 text-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] hover:bg-black disabled:cursor-not-allowed" disabled={!canControl? true:!canDelControl} onClick={() => handleUserScore(pl.score_id, pl.station_id, "subtraction", pl.score)}>Reset</Button>
                                        </div>
                                        <div>
                                            <Button className="px-3 py-1 bg-black border border-green-500 text-green-500 hover:shadow-[0_0_15px_rgba(0,255,0,0.5)] hover:bg-black disabled:cursor-not-allowed" disabled={!canControl? true:!canAddControl} onClick={() => handleUserScore(pl.score_id, pl.station_id, "addition", pl.score)}>{`+${displayAddScore}`}</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}