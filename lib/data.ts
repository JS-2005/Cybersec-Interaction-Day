"use client"
import { UUID } from "crypto";
import { createClient } from "./supabase/client";
import { DB_Admin_Control, DB_Station, DB_User_Info, DB_User_Station } from "./supabase_info";
import { useEffect } from "react";

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
    score: number,
    start_time: string,
    end_time: string
}

export interface User {
    user_id: UUID,
    username: string,
    user_email: string,
    role: string
}

export interface AdminAllocation {
    admin_id: UUID,
    station_id: number
}

export interface display_list {
    id: UUID,
    name: string,
    email: string,
    rank: number;
    amount_time: string,
    total_score: number
}

// display at participant page
export const getGameStation = async (): Promise<GameStation[]> => {
    const { data, error } = await supabase
        .from('station')
        .select('id,station_name,station_description,point');

    if (error) {
        console.error("Error fetching games:", error);
        return [];
    }

    return (data as DB_Station[]).map(station => ({
        game_id: station.id,
        game_name: station.station_name,
        description: station.station_description,
        point: station.point
    })
    )
}

// get all user
export const getUser = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('user_info')
        .select('id,user_name,user_email,user_role');

    if (error) {
        console.error("Error fetching users: ", error);
        return [];
    }

    return (data as DB_User_Info[]).map(user => ({
        user_id: user.id,
        username: user.user_name,
        user_email: user.user_email,
        role: user.user_role
    }))
}

// check admin's control
export const checkAdminControl = async (): Promise<AdminAllocation[]> => {
    const { data, error } = await supabase
        .from('Admin_Control')
        .select('id,admin_id,station_id');

    if (error) {
        console.error("Fetch Admin Control Error:", error);
        return [];
    }

    return (data as DB_Admin_Control[]).map(admin_control => ({
        admin_id: admin_control.admin_id,
        station_id: admin_control.station_id
    }));

}

// insert new score for participant
export const insertGame = async (userID: UUID, stationID: number) => {
    const { data: lastID, error: lastIDError } = await supabase
        .from('user_station')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (lastIDError) {
        console.error("Error fetching last row: ", lastIDError);
    }

    const newID = lastID?.id + 1;

    const { error: ErrorNewInsert } = await supabase
        .from('user_station')
        .insert([{ id: newID, station_id: stationID, user_id: userID, point_assigned: 0 }])

    if (ErrorNewInsert) {
        console.error("Inserting New Row Error:", ErrorNewInsert);
    }
}

// update participant score
export const updateUserScore = async (specificScoreID: number, updateMethod: string, currentScore: number, specificUpdate: number) => {

    const updatedScoreList = [2, 4, 6, 8, 10];

    let newScore = currentScore;

    // add score
    if (updateMethod === "addition") {
        newScore = newScore + updatedScoreList[specificUpdate - 1];
    }
    else {
        newScore = 0;
    }

    const date = new Date();
    const ISODateTime = date.toISOString();
    const ISOTime = ISODateTime.split("T")[1];

    const { error } = await supabase
        .from('user_station')
        .update({ point_assigned: newScore, end_time: ISOTime })
        .eq('id', specificScoreID);

    if (error)
        console.error("Upsert Addition Error: ", error.message, error.details);
}

// get participant score
export const getScore = async (): Promise<GameScore[]> => {
    const { data, error } = await supabase
        .from('user_station')
        .select('id,station_id,user_id,point_assigned,start_time,end_time')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching score: ", error);
        return [];
    }

    return (data as DB_User_Station[]).map(user_station => ({
        score_id: user_station.id,
        station_id: user_station.station_id,
        user_id: user_station.user_id,
        score: user_station.point_assigned,
        start_time: user_station.start_time,
        end_time: user_station.end_time
    }))
}

// get ranking 
export const getRanking = async (): Promise<display_list[]> => {

    const user_info = await getUser();
    const score_info = await getScore();

    const participant = user_info.filter(u => u.role === "participant");

    const participant_score = participant.map((p: User) => {
        const score = score_info.filter((us: GameScore) => us.user_id === p.user_id);
        const each_game_time = score.map((s: GameScore) => {
            if (!s.start_time || !s.end_time) {
                console.log("Found a BAD ROW for User:", s.user_id);
                console.log("Start: ", s.start_time, "End: ", s.end_time);
                return 0;
            }

            const start = StandardDateParse("2026-01-17", s.start_time);
            const end = StandardDateParse("2026-01-17", s.end_time);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.log(" Date Parse Error: ", s.start_time, s.end_time);
                return 0;
            }

            let diff = end.getTime() - start.getTime();

            if (diff < 0) {
                diff += 24 * 60 * 60 * 1000;
            }

            return diff;
        })

        const total_MS = each_game_time.reduce((acc: number, curr: number) => acc + curr, 0);

        const sum_score = score.reduce((acc: number, curr: GameScore) => acc + curr.score, 0);
        return { id: p.user_id, name: p.username, email: p.user_email, total_score: sum_score, amount_time: total_MS };
    });

    const sorted_list = participant_score.sort((a, b) => {

        if (b.total_score !== a.total_score) {
            return b.total_score - a.total_score;
        }

        return b.amount_time - a.amount_time;
    });

    const participant_rank_list = sorted_list.map((sl, index) => {

        const calHours = Math.floor(sl.amount_time / (60 * 60 * 1000));
        const calMin = Math.floor((sl.amount_time / (60 * 1000)) % 60);
        const calSec = Math.floor((sl.amount_time / 1000) % 60);
        const total_time = `${calHours}h ${calMin}min ${calSec}s`;

        return { id: sl.id, name: sl.name, email: sl.email, total_score: sl.total_score, amount_time: total_time, rank: index + 1 };
    });

    return participant_rank_list;
}

const StandardDateParse = (date: string, time: string): Date => {

    const modifiedTime = time.substring(0, 8);

    return new Date(`${date}T${modifiedTime}`);
}
