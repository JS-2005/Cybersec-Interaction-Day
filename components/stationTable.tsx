"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function StationTable({ stationID, isStationAdmin }: { stationID: number, isStationAdmin: boolean }) {

    type userStation = {
        id: number;
        user_id: string;
        user_info: { user_name: string };
        point_assigned: number;
    }

    const supabase = createClient();
    const [userStationList, setUserStationList] = useState<userStation[]>([]); // Use for retrieve direct supabase data
    const [modifyPoint, setModifyPoint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {

        // Get user station list
        const getUserStationList = async () => {
            const { data: userStationData } = await supabase.from('user_station').select("id, user_id, user_info(user_name), point_assigned").eq("station_id", stationID).order("point_assigned", { ascending: false });
            setUserStationList(userStationData ?? []);
        }
        getUserStationList();

        // Realtime trigger get all station
        const subscription = supabase
            .channel('user_station_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_station',
                },
                (payload) => {
                    getUserStationList();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        }

    }, [supabase]);

    // Handle Modify
    const handleModify = () => {
        setModifyPoint(true);
    }

    // Handle Cancel
    const handleCancel = () => {
        formRef.current?.reset();
        setModifyPoint(false);
    }

    // Handle Save
    const handleSave = async (event: any) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.target);
        for (const key of formData.keys()) {
            const { error } = await supabase
                .from('user_station')
                .update({ point_assigned: formData.get(key) })
                .eq('id', key);

            if (error) {
                window.alert(error.message);
            }
        }
        setIsLoading(false);
        setModifyPoint(false);

    }

    return (
        <Card>
            <form ref={formRef} onSubmit={handleSave}>
                <CardHeader>
                    <CardTitle className="text-center font-bold text-2xl">STATION {stationID}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>User Name</TableHead>
                                <TableHead>Point Assigned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                userStationList.map((userStation) => (
                                    <TableRow key={userStation.id.toString()}>
                                        <TableCell>{userStation.user_id}</TableCell>
                                        <TableCell>{userStation.user_info.user_name}</TableCell>
                                        <TableCell>
                                            <Input type="number" min={0} step={1} defaultValue={userStation.point_assigned.toString()} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" name={userStation.id.toString()} readOnly={modifyPoint ? false : true} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className={isStationAdmin ? "flex justify-center mt-2" : "hidden"}>
                    {modifyPoint ?
                        <div className="w-fit flex gap-2 justify-center">
                            <Button type="submit" className="w-fit" disabled={isLoading}> {isLoading ? "Updating..." : "Save Changes"}</Button>
                            <Button variant="outline" className="w-fit" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
                        </div>
                        : <Button className="w-fit bg-secondary hover:bg-secondary/80" onClick={handleModify}>Modify Point</Button>}
                </CardFooter>
            </form>
        </Card>
    )
}