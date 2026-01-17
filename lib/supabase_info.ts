import { UUID } from "crypto"

export interface DB_Station {
    id: number,
    station_name: string,
    station_description: string,
    point: number,
}

export interface DB_User_Station {
    id: number,
    station_id: number,
    user_id: UUID,
    point_assigned: number,
    start_time: string,
    end_time: string
}

export interface DB_User_Info {
    id: UUID,
    user_name: string,
    user_email: string,
    user_role: string
}

export interface DB_Role {
    role_name: string
}

export interface DB_Admin_Control {
    id: number,
    admin_id: UUID,
    station_id: number
}