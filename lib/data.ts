import { UUID } from "crypto";
import { createClient } from "./supabase/client";
import { DB_Admin_Control, DB_Station, DB_User_Info, DB_User_Station } from "./supabase_info";

const supabase = createClient();

export interface GameStation {
    game_id: number,
    game_name: string,
    description: string,
    point: number
}

export interface GameScore {
    score_id: number,
    station_id: number,
    user_id: UUID,
    score: number
}

export interface User {
    user_id: UUID,
    username: string,
    user_email: string,
    role: string
}

export interface AdminAllocation{
    admin_id: UUID,
    station_id: number
}

export interface display_list{
    id: UUID,
    name: string,
    email: string,
    rank: number;
    total_score: number
}

// display at participant page
export const getGameStation = async (): Promise<GameStation[]> => {
    const { data, error} = await supabase
    .from('station')
    .select('id,station_name,station_description,point');

    if (error){
        console.error("Error fetching games:", error);
        return[];
    }

    return (data as DB_Station[]).map(station =>({
        game_id: station.id,
        game_name: station.station_name,
        description: station.station_description,
        point: station.point
    })
    )
}

// get all user
export const getUser = async():Promise<User[]> => {
    const {data, error} = await supabase
    .from('user_info')
    .select('id,user_name,user_email,user_role');

    if(error){
        console.error("Error fetching users: ", error);
        return[];
    }

    return (data as DB_User_Info[]).map(user => ({
        user_id: user.id,
        username: user.user_name,
        user_email: user.user_email,
        role: user.user_role
    }))
}

// check admin's control
export const checkAdminControl = async():Promise<AdminAllocation[]> => {
    const {data, error} = await supabase
    .from('Admin_Control')
    .select('id,admin_id,station_id');

    if (error){
        console.error("Fetch Admin Control Error:", error);
        return [];
    }

    return (data as DB_Admin_Control[]).map(admin_control => ({
        admin_id: admin_control.admin_id,
        station_id: admin_control.station_id
    }));

}

// insert new score for participant
export const insertGame = async(userID:UUID, stationID:number) => {
    const {data:lastID, error:lastIDError} = await supabase
    .from('user_station')
    .select('id')
    .order('id', {ascending: false})
    .limit(1)
    .single();

    if (lastIDError){
        console.error("Error fetching last row: ", lastIDError);
    }

    const newID = lastID?.id + 1;

    const {error:ErrorNewInsert} = await supabase
    .from('user_station')
    .insert([{id: newID, station_id: stationID, user_id: userID, point_assigned: 0 }])

    if (ErrorNewInsert){
        console.error("Inserting New Row Error:", ErrorNewInsert);
    }
}

// update participant score
export const updateUserScore = async(specificScoreID: number, updateMethod:string, currentScore: number) => {

    let newScore = currentScore;

    // add score
    if (updateMethod === "addition" ){
        newScore = newScore + 10;
    }
    else{
        newScore = newScore - 10;
    }

    const {data, error} = await supabase
    .from('user_station')
    .update({point_assigned: newScore})
    .eq('id',specificScoreID)
    .select();

    if(error)
        console.error("Upsert Addition Error: ", error.message, error.details);
}

// get participant score
export const getScore = async():Promise<GameScore[]> =>{
    const {data, error} = await supabase
    .from('user_station')
    .select('id,station_id,user_id,point_assigned')
    .order('id', {ascending: true});

    if(error){
        console.error("Error fetching score: ", error);
        return[];
    }

    return (data as DB_User_Station[]).map(user_station => ({
        score_id: user_station.id,
        station_id: user_station.station_id,
        user_id: user_station.user_id,
        score: user_station.point_assigned
    }))
}

// get current access username
export const getCurrentUserName = () => {
    if (typeof(Storage) != "undefined"){

        const getJsonName = localStorage.getItem("user");
        if (getJsonName){
            const getJsName = JSON.parse(getJsonName);
            return getJsName.username;
        }
        else{
            console.error("Error fetching username from localStorage");
        }
    }
}

// get ranking 
export const getRanking = async():Promise<display_list[]> => {

    const user_info = await getUser();
    const score_info = await getScore();

    const participant = user_info.filter(u => u.role === "participant");

    const participant_score = participant.map((p: User) =>{
        const score = score_info.filter((us: GameScore) => us.user_id === p.user_id);
        const sum_score = score.reduce((acc: number, curr: GameScore) => acc + curr.score, 0);
        return {id: p.user_id, name: p.username, email: p.user_email, total_score: sum_score};
    });

    const sorted_list = participant_score.sort((a,b) => b.total_score - a.total_score);
    const participant_rank_list = sorted_list.map((sl, index) => {
        return {id: sl.id, name: sl.name, email: sl.email , total_score: sl.total_score, rank: index + 1};
    });

    return participant_rank_list;
}