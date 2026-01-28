"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StationTable } from "@/components/stationTable";

type UpdateRule = {
    id: number;
    numAllow: number;
}

type UpdateConfig = UpdateRule[];

const NumUpdateAllowed = [
    { id: 1, numAllow: 5 },
    { id: 2, numAllow: 5 },
    { id: 3, numAllow: 5 },
    { id: 4, numAllow: 5 },
    { id: 5, numAllow: 5 },
];

export default function AdminPage() {

    type station = {
        id: number;
        station_name: string;
        admin_id: string;
    }

    const supabase = createClient();
    const [stationList, setStationList] = useState<station[]>([]);

    const router = useRouter();

    useEffect(() => {

        // Check User Claims Whether Expired
        const checkUserClaims = async () => {
            const { data: userClaims } = await supabase.auth.getClaims();
            if (!userClaims) {
                router.replace('/')
            }

            // Redirect user to profile if not admin
            const { data: user_info } = await supabase.from("user_info").select("user_role").eq("id", userClaims?.claims.sub).single();
            if (user_info?.user_role !== "admin") {
                router.replace('/home/profile')
            }
        }
        checkUserClaims();

        // Get all station
        const getStation = async () => {
            const { data: stationData } = await supabase.from('station').select("id, station_name, admin_id");
            setStationList(stationData ?? []);
        }
        getStation();


    }, [supabase]);

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center px-6 pt-5 pb-5 border-b border-gray-800 flex-col sm:flex-row gap-5">
                <div>
                    <p className="text-3xl font-bold text-white">ADMINISTRATION CONSOLE</p>
                </div>
            </div>

            <div className="mt-2">
                <Tabs defaultValue="1">
                    <TabsList>
                        {
                            stationList.map((station) => (
                                <TabsTrigger key={station.id} value={station.id.toString()}>{station.station_name}</TabsTrigger>

                            ))
                        }
                    </TabsList>
                    {
                        stationList.map((station) => (
                            <TabsContent key={station.id} value={station.id.toString()}>
                                <StationTable stationID={station.id} isStationAdmin={true} />
                            </TabsContent>
                        ))
                    }
                </Tabs>
            </div>


        </div>
    )
}