"use client"

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

export default function CybersecNav({children}: {children:ReactNode}){

    const [login_opt, setLogin] = useState<boolean>(true);
    const [participant_opt, setParticipant] = useState<boolean>(true);
    const [admin_opt, setAdmin] = useState<boolean>(true);
    const [ranking_opt, setRanking] = useState<boolean>(true);

    const pathname = usePathname();

    const buttonList = [
        {
            name: "Login",
            directTo: "/login",
            visible: login_opt
        },
        {
            name: "Participant",
            directTo : "/participant",
            visible: participant_opt
        },
        {
            name: "Admin",
            directTo: "/admin",
            visible: admin_opt
        },
        {
            name: "Ranking",
            directTo: "/ranking",
            visible: ranking_opt
        }
    ]

    useEffect(() => {
        const checkAvailability = () =>{
            if (typeof(Storage) != "undefined"){
                
                const information = localStorage.getItem("user");

                if (information){
                    const js_info = JSON.parse(information);

                    if (js_info.userRole === "participant"){
                        setLogin(false);
                        setParticipant(true);
                        setAdmin(false);
                        setRanking(true);
                    }
                    else{
                        setLogin(false);
                        setParticipant(true);
                        setAdmin(true);
                        setRanking(true);
                    }
                }
                else{
                    setLogin(true);
                    setParticipant(false);
                    setAdmin(false);
                    setRanking(false);
                }
            }
        }

        checkAvailability();
    });

    return (
        <div>
            <div className="fixed top-0 left-0 right-0 z-50 border-2 backdrop-blur-md px-8">
                <NavigationMenu className="p-5">
                    <div className="flex justify-between items-center flex-col sm:flex-row">
                        <NavigationMenuList>
                            <NavigationMenuItem className="text-2xl font-extrabold text-primary neon-text">CYBERSEC
                                <span className="text-secondary">GAME</span></NavigationMenuItem>
                        </NavigationMenuList>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                { buttonList.map((button) => {
                                    const isActive = pathname === button.directTo;
                                    const isHome = pathname === "/home";

                                    return (
                                    <NavigationMenuLink key={button.name} className={`p-3 ${isActive ? "text-primary border-b-2 border-primary rounded-xl":"text-gray-300 hover:text-white"
                                    } ${button.visible ? "":"hidden"} ${isHome? "hidden":""}`} asChild>
                                        <Link href={button.directTo}>{button.name}</Link>
                                    </NavigationMenuLink>
                                )
                                })}
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </div>
                </NavigationMenu>
            </div>

            <main className="flex flex-col pt-20 px-7">
                {children}
            </main>
        </div>
    )
}